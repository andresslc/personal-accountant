"use client"

import { useState, useRef, useCallback, useEffect, type KeyboardEvent } from "react"
import { Send, Mic, MicOff, ImageIcon, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ChatInputProps {
  onSendText: (text: string) => void
  onSendAudio: (blob: Blob) => void
  onSendImage: (file: File, caption: string) => void
  disabled: boolean
}

const METER_BARS = 5
const METER_THRESHOLDS = [0.05, 0.15, 0.3, 0.5, 0.7]
const SILENCE_PEAK_THRESHOLD = 0.04
const MIN_RECORDING_SECONDS = 1

export function ChatInput({
  onSendText,
  onSendAudio,
  onSendImage,
  disabled,
}: ChatInputProps) {
  const [text, setText] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [micError, setMicError] = useState<string | null>(null)
  const [meterLevel, setMeterLevel] = useState(0)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null)
  const analyserBufferRef = useRef<Uint8Array | null>(null)
  const rafIdRef = useRef<number | null>(null)
  const smoothedLevelRef = useRef(0)
  const maxPeakRef = useRef(0)
  const recordingTimeRef = useRef(0)

  const handleSend = useCallback(() => {
    const trimmed = text.trim()
    if (!trimmed || disabled) return
    onSendText(trimmed)
    setText("")
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
    }
  }, [text, disabled, onSendText])

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value)
    if (micError) setMicError(null)
    e.target.style.height = "auto"
    e.target.style.height = `${Math.min(e.target.scrollHeight, 160)}px`
  }

  const teardownAudioGraph = useCallback(() => {
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current)
      rafIdRef.current = null
    }
    if (sourceNodeRef.current) {
      try {
        sourceNodeRef.current.disconnect()
      } catch {
        // ignore
      }
      sourceNodeRef.current = null
    }
    if (analyserRef.current) {
      try {
        analyserRef.current.disconnect()
      } catch {
        // ignore
      }
      analyserRef.current = null
    }
    if (audioContextRef.current) {
      const ctx = audioContextRef.current
      audioContextRef.current = null
      if (ctx.state !== "closed") {
        ctx.close().catch(() => {})
      }
    }
    analyserBufferRef.current = null
    smoothedLevelRef.current = 0
  }, [])

  const cleanupRecording = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    teardownAudioGraph()
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
    mediaRecorderRef.current = null
    setIsRecording(false)
    setRecordingTime(0)
    setMeterLevel(0)
    recordingTimeRef.current = 0
    maxPeakRef.current = 0
  }, [teardownAudioGraph])

  const startMeterLoop = useCallback(() => {
    const tick = () => {
      const analyser = analyserRef.current
      const buffer = analyserBufferRef.current
      if (!analyser || !buffer) return
      analyser.getByteTimeDomainData(buffer)
      let peak = 0
      for (let i = 0; i < buffer.length; i++) {
        const deviation = Math.abs(buffer[i] - 128)
        if (deviation > peak) peak = deviation
      }
      const normalized = Math.min(1, peak / 128)
      if (normalized > maxPeakRef.current) {
        maxPeakRef.current = normalized
      }
      const smoothing = normalized > smoothedLevelRef.current ? 0.5 : 0.15
      smoothedLevelRef.current =
        smoothedLevelRef.current + (normalized - smoothedLevelRef.current) * smoothing
      setMeterLevel(smoothedLevelRef.current)
      rafIdRef.current = requestAnimationFrame(tick)
    }
    rafIdRef.current = requestAnimationFrame(tick)
  }, [])

  const startRecording = async () => {
    setMicError(null)

    if (navigator.permissions) {
      try {
        const status = await navigator.permissions.query({ name: "microphone" as PermissionName })
        if (status.state === "denied") {
          setMicError("Microphone is blocked. Enable it in your browser's site settings and reload.")
          return
        }
      } catch {
        // Permissions API not supported for microphone in some browsers
      }
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          channelCount: 1,
        },
      })
      streamRef.current = stream

      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      const audioContext = new AudioCtx()
      audioContextRef.current = audioContext
      const source = audioContext.createMediaStreamSource(stream)
      sourceNodeRef.current = source
      const analyser = audioContext.createAnalyser()
      analyser.fftSize = 1024
      analyser.smoothingTimeConstant = 0.3
      analyserRef.current = analyser
      source.connect(analyser)
      analyserBufferRef.current = new Uint8Array(analyser.fftSize)

      await new Promise((r) => setTimeout(r, 100))

      const mimeType = MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : "audio/mp4"
      const recorder = new MediaRecorder(stream, { mimeType })

      chunksRef.current = []
      maxPeakRef.current = 0
      recordingTimeRef.current = 0

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType })
        const elapsed = recordingTimeRef.current
        const peak = maxPeakRef.current

        cleanupRecording()

        if (elapsed < MIN_RECORDING_SECONDS) {
          setMicError("Recording too short. Hold the mic button a bit longer.")
          return
        }
        if (peak < SILENCE_PEAK_THRESHOLD) {
          setMicError("We couldn't hear you. Check your microphone, move closer, and try again.")
          return
        }
        if (blob.size > 0) {
          onSendAudio(blob)
        }
      }

      recorder.start(250)
      mediaRecorderRef.current = recorder
      setIsRecording(true)
      setRecordingTime(0)
      recordingTimeRef.current = 0
      startMeterLoop()
      timerRef.current = setInterval(() => {
        setRecordingTime((t) => {
          const next = t + 1
          recordingTimeRef.current = next
          return next
        })
      }, 1000)
    } catch {
      cleanupRecording()
      setMicError("Microphone access denied. Allow it in your browser's site settings and reload.")
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop()
    } else {
      cleanupRecording()
    }
  }

  const handleMicClick = () => {
    if (micError) setMicError(null)
    startRecording()
  }

  const handleImageClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      onSendImage(file, text.trim())
      setText("")
    }
    e.target.value = ""
  }

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, "0")}`
  }

  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current?.state === "recording") {
        try {
          mediaRecorderRef.current.stop()
        } catch {
          // ignore
        }
      }
      cleanupRecording()
    }
  }, [cleanupRecording])

  const meterPercent = Math.round(meterLevel * 100)

  return (
    <div className="border-t border-border bg-card p-4">
      {micError && (
        <p className="text-xs text-destructive text-center mb-2 max-w-3xl mx-auto">{micError}</p>
      )}
      <div className="flex items-end gap-2 max-w-3xl mx-auto">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="shrink-0 h-10 w-10"
          onClick={handleImageClick}
          disabled={disabled || isRecording}
        >
          <ImageIcon className="w-5 h-5" />
        </Button>

        {isRecording ? (
          <div className="flex-1 flex items-center gap-3 px-4 py-2.5 rounded-xl border border-red-500/50 bg-red-500/5">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-sm text-red-500 font-medium">
              Recording {formatTime(recordingTime)}
            </span>
            <div
              role="meter"
              aria-label="Microphone input level"
              aria-valuenow={meterPercent}
              aria-valuemin={0}
              aria-valuemax={100}
              className="flex items-end gap-0.5 h-6"
            >
              {Array.from({ length: METER_BARS }).map((_, i) => {
                const active = meterLevel >= METER_THRESHOLDS[i]
                const heights = ["h-1", "h-2", "h-3", "h-4", "h-6"]
                return (
                  <div
                    key={i}
                    className={`w-0.5 rounded-sm transition-all duration-75 ${heights[i]} ${
                      active ? "bg-red-500" : "bg-red-500/20"
                    }`}
                  />
                )
              })}
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="ml-auto shrink-0 h-8 w-8 text-red-500 hover:text-red-600"
              onClick={stopRecording}
            >
              <MicOff className="w-5 h-5" />
            </Button>
          </div>
        ) : (
          <textarea
            ref={textareaRef}
            value={text}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your finances..."
            disabled={disabled}
            rows={1}
            className="flex-1 resize-none rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 max-h-40"
          />
        )}

        {!isRecording && !text.trim() && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="shrink-0 h-10 w-10"
            onClick={handleMicClick}
            disabled={disabled}
          >
            <Mic className="w-5 h-5" />
          </Button>
        )}

        {!isRecording && text.trim() && (
          <Button
            type="button"
            size="icon"
            className="shrink-0 h-10 w-10"
            onClick={handleSend}
            disabled={disabled}
          >
            {disabled ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </Button>
        )}
      </div>
    </div>
  )
}
