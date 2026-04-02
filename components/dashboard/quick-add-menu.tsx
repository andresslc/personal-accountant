"use client"

import { type FormEvent, useState, useRef, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  Camera,
  CreditCard,
  Loader2,
  Mic,
  MicOff,
  Plus,
  Square,
  TrendingUp,
  Upload,
  Wallet,
  X,
} from "lucide-react"
import { MultimodalConfirmation } from "./multimodal-confirmation"
import type { MultimodalParseResult } from "@/lib/ai/multimodal-types"

type QuickAddMenuProps = {
  onAddTransaction?: () => void
  onCreateBudget?: () => void
  onAddDebt?: () => void
  budgetHref?: string
  debtHref?: string
}

async function compressImage(file: File, maxWidth = 1600, quality = 0.8): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement("canvas")
      const ratio = Math.min(maxWidth / img.width, maxWidth / img.height, 1)
      canvas.width = img.width * ratio
      canvas.height = img.height * ratio
      const ctx = canvas.getContext("2d")
      if (!ctx) return reject(new Error("Canvas context failed"))
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error("Compression failed"))),
        "image/jpeg",
        quality
      )
    }
    img.onerror = reject
    img.src = URL.createObjectURL(file)
  })
}

export function QuickAddMenu({
  onAddTransaction,
  onCreateBudget,
  onAddDebt,
  budgetHref = "/dashboard/budget?create=true",
  debtHref = "/dashboard/debts?create=true",
}: QuickAddMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [quickPrompt, setQuickPrompt] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingLabel, setProcessingLabel] = useState("")
  const [parseResult, setParseResult] = useState<MultimodalParseResult | null>(null)
  const [parseError, setParseError] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [micError, setMicError] = useState<string | null>(null)

  const router = useRouter()
  const imageInputRef = useRef<HTMLInputElement>(null)
  const audioInputRef = useRef<HTMLInputElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const resetState = useCallback(() => {
    setQuickPrompt("")
    setIsProcessing(false)
    setProcessingLabel("")
    setParseResult(null)
    setParseError(null)
    setPreviewUrl(null)
    setIsRecording(false)
    setRecordingTime(0)
    setMicError(null)
    audioChunksRef.current = []
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (mediaRecorderRef.current?.state === "recording") {
        mediaRecorderRef.current.stop()
      }
    }
  }, [])

  const handleAction = (callback?: () => void, href?: string) => {
    setIsOpen(false)
    resetState()
    if (callback) {
      callback()
      return
    }
    if (href) {
      router.push(href)
    }
  }

  const sendToApi = async (formData: FormData) => {
    setIsProcessing(true)
    setParseError(null)
    setParseResult(null)

    try {
      const res = await fetch("/api/parse-multimodal", {
        method: "POST",
        body: formData,
      })
      const data = await res.json()

      if (!res.ok || !data.success) {
        setParseError(data.error ?? "Failed to parse input.")
        return
      }

      setParseResult({ intent: data.intent, data: data.data } as MultimodalParseResult)
    } catch {
      setParseError("Network error. Please try again.")
    } finally {
      setIsProcessing(false)
      setProcessingLabel("")
    }
  }

  const handlePromptSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const text = quickPrompt.trim()
    if (!text) return

    setProcessingLabel("Analyzing text...")
    const formData = new FormData()
    formData.append("type", "text")
    formData.append("text", text)
    await sendToApi(formData)
  }

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setPreviewUrl(URL.createObjectURL(file))
    setProcessingLabel("Analyzing image...")

    try {
      const compressed = await compressImage(file)
      const formData = new FormData()
      formData.append("type", "image")
      formData.append("file", compressed, "photo.jpg")
      await sendToApi(formData)
    } catch {
      setParseError("Failed to process image.")
      setIsProcessing(false)
    }

    if (imageInputRef.current) imageInputRef.current.value = ""
  }

  const handleAudioFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setProcessingLabel("Transcribing audio...")
    const formData = new FormData()
    formData.append("type", "audio")
    formData.append("file", file)
    await sendToApi(formData)

    if (audioInputRef.current) audioInputRef.current.value = ""
  }

  const startRecording = async () => {
    setMicError(null)

    if (navigator.permissions) {
      try {
        const status = await navigator.permissions.query({ name: "microphone" as PermissionName })
        if (status.state === "denied") {
          setMicError("Microphone is blocked. Please enable it in your browser's site settings and reload the page.")
          return
        }
      } catch {
        // Permissions API not supported for microphone in some browsers — continue
      }
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : "audio/mp4"

      const recorder = new MediaRecorder(stream, { mimeType })
      mediaRecorderRef.current = recorder
      audioChunksRef.current = []

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data)
      }

      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop())
        if (timerRef.current) {
          clearInterval(timerRef.current)
          timerRef.current = null
        }
        setIsRecording(false)

        const blob = new Blob(audioChunksRef.current, { type: mimeType })
        if (blob.size === 0) {
          setParseError("No audio recorded.")
          return
        }

        setProcessingLabel("Transcribing audio...")
        const ext = mimeType.includes("webm") ? "webm" : "m4a"
        const formData = new FormData()
        formData.append("type", "audio")
        formData.append("file", blob, `recording.${ext}`)
        await sendToApi(formData)
      }

      recorder.start()
      setIsRecording(true)
      setRecordingTime(0)
      timerRef.current = setInterval(() => setRecordingTime((t) => t + 1), 1000)
    } catch (err) {
      if (err instanceof DOMException && err.name === "NotAllowedError") {
        setMicError("Microphone access denied. Please allow microphone in your browser's site settings and reload the page.")
      } else {
        setMicError("Could not access microphone. Please check your device settings.")
      }
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop()
    }
  }

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, "0")}`
  }

  const handleConfirm = () => {
    if (!parseResult) return

    switch (parseResult.intent) {
      case "transaction":
        handleAction(onAddTransaction)
        break
      case "budget":
        handleAction(onCreateBudget, budgetHref)
        break
      case "debt":
        handleAction(onAddDebt, debtHref)
        break
    }
  }

  const handleOpenChange = (nextOpen: boolean) => {
    setIsOpen(nextOpen)
    if (!nextOpen) resetState()
  }

  if (parseResult) {
    return (
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          <Button className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground">
            <Plus className="w-4 h-4" />
            Quick Add
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Review & Confirm</DialogTitle>
            <DialogDescription>AI parsed your input. Please review before saving.</DialogDescription>
          </DialogHeader>
          <MultimodalConfirmation
            result={parseResult}
            onConfirm={handleConfirm}
            onTryAgain={() => {
              setParseResult(null)
              setPreviewUrl(null)
            }}
          />
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground">
          <Plus className="w-4 h-4" />
          Quick Add
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New</DialogTitle>
          <DialogDescription>Choose what you want to add to your finances.</DialogDescription>
        </DialogHeader>

        {/* Text input */}
        <form onSubmit={handlePromptSubmit} className="space-y-3 py-2">
          <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
            <p className="text-sm font-semibold text-foreground mb-2">Type what you want to create</p>
            <div className="flex gap-2">
              <Input
                value={quickPrompt}
                onChange={(e) => setQuickPrompt(e.target.value)}
                placeholder="e.g. I spent 50k on groceries yesterday"
                className="h-10 bg-background"
                disabled={isProcessing || isRecording}
              />
              <Button type="submit" disabled={!quickPrompt.trim() || isProcessing || isRecording}>
                {isProcessing && processingLabel.includes("text") ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Go"
                )}
              </Button>
            </div>
          </div>
        </form>

        {/* Photo + Audio buttons */}
        <div className="grid grid-cols-2 gap-3">
          {/* Photo upload */}
          <div className="space-y-2">
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleImageSelect}
            />
            <Button
              variant="outline"
              className="w-full gap-2 h-auto py-3"
              onClick={() => imageInputRef.current?.click()}
              disabled={isProcessing || isRecording}
            >
              <Camera className="w-4 h-4" />
              <span className="text-sm">Upload Photo</span>
            </Button>
            {previewUrl && (
              <div className="relative rounded-md overflow-hidden border border-border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={previewUrl} alt="Preview" className="w-full h-24 object-cover" />
                <button
                  type="button"
                  onClick={() => setPreviewUrl(null)}
                  className="absolute top-1 right-1 bg-black/50 rounded-full p-0.5"
                >
                  <X className="w-3 h-3 text-white" />
                </button>
              </div>
            )}
          </div>

          {/* Audio */}
          <div className="space-y-2">
            <input
              ref={audioInputRef}
              type="file"
              accept="audio/*"
              className="hidden"
              onChange={handleAudioFileSelect}
            />

            {isRecording ? (
              <Button
                variant="destructive"
                className="w-full gap-2 h-auto py-3"
                onClick={stopRecording}
              >
                <Square className="w-4 h-4" />
                <span className="text-sm">Stop {formatTime(recordingTime)}</span>
              </Button>
            ) : (
              <div className="flex gap-1.5">
                <Button
                  variant="outline"
                  className="flex-1 gap-2 h-auto py-3"
                  onClick={startRecording}
                  disabled={isProcessing}
                >
                  <Mic className="w-4 h-4" />
                  <span className="text-sm">Record</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto py-3 px-3"
                  onClick={() => audioInputRef.current?.click()}
                  disabled={isProcessing || isRecording}
                  title="Upload audio file"
                >
                  <Upload className="w-4 h-4" />
                </Button>
              </div>
            )}

            {isRecording && (
              <div className="flex items-center gap-2 px-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                </span>
                <span className="text-xs text-red-500">Recording...</span>
              </div>
            )}
          </div>
        </div>

        {micError && (
          <div className="flex items-center gap-2 rounded-md border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-500">
            <MicOff className="w-4 h-4 shrink-0" />
            {micError}
          </div>
        )}

        {isProcessing && (
          <div className="flex items-center justify-center gap-2 py-3">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
            <span className="text-sm text-muted-foreground">{processingLabel}</span>
          </div>
        )}

        {parseError && (
          <div className="rounded-md border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-500">
            {parseError}
          </div>
        )}

        {/* Manual action cards */}
        {!isProcessing && (
          <div className="space-y-3 pt-1">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Or add manually</p>

            <button
              type="button"
              onClick={() => handleAction(onAddTransaction)}
              className="w-full rounded-lg border border-border p-4 text-left hover:bg-muted transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-md bg-primary/10 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Add Transaction</p>
                  <p className="text-xs text-foreground/70">Track income, expenses, or debt payments.</p>
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleAction(onCreateBudget, budgetHref)}
              className="w-full rounded-lg border border-border p-4 text-left hover:bg-muted transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-md bg-primary/10 flex items-center justify-center">
                  <Wallet className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Create Budget</p>
                  <p className="text-xs text-foreground/70">Open quick form or jump to full budget page.</p>
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleAction(onAddDebt, debtHref)}
              className="w-full rounded-lg border border-border p-4 text-left hover:bg-muted transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-md bg-primary/10 flex items-center justify-center">
                  <CreditCard className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Add Debt</p>
                  <p className="text-xs text-foreground/70">Create a liability with payment and APR details.</p>
                </div>
              </div>
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
