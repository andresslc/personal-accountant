"use client"

import { useState, useRef, useCallback, type KeyboardEvent } from "react"
import { Send, Mic, MicOff, ImageIcon, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ChatInputProps {
  onSendText: (text: string) => void
  onSendAudio: (blob: Blob) => void
  onSendImage: (file: File, caption: string) => void
  disabled: boolean
}

export function ChatInput({
  onSendText,
  onSendAudio,
  onSendImage,
  disabled,
}: ChatInputProps) {
  const [text, setText] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

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
    e.target.style.height = "auto"
    e.target.style.height = `${Math.min(e.target.scrollHeight, 160)}px`
  }

  const [micError, setMicError] = useState<string | null>(null)

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
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mimeType = MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : "audio/mp4"
      const recorder = new MediaRecorder(stream, { mimeType })

      chunksRef.current = []
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }
      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop())
        const blob = new Blob(chunksRef.current, { type: mimeType })
        if (blob.size > 0) {
          onSendAudio(blob)
        }
        setIsRecording(false)
        setRecordingTime(0)
        if (timerRef.current) clearInterval(timerRef.current)
      }

      recorder.start()
      mediaRecorderRef.current = recorder
      setIsRecording(true)
      setRecordingTime(0)
      timerRef.current = setInterval(() => {
        setRecordingTime((t) => t + 1)
      }, 1000)
    } catch {
      setMicError("Microphone access denied. Allow it in your browser's site settings and reload.")
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop()
    }
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
            onClick={startRecording}
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
