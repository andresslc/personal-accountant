"use client"

import { useState } from "react"
import { Bot, Loader2, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import type { FinanceAnalysisType, FinanceInsightsData } from "@/lib/ai/finance-types"

type AnalysisOption = {
  value: FinanceAnalysisType
  label: string
}

const ANALYSIS_OPTIONS: AnalysisOption[] = [
  { value: "overview", label: "Overall Financial Overview" },
  { value: "spending_diagnosis", label: "Spending Diagnosis" },
  { value: "budget_recommendation", label: "Budget Recommendations" },
  { value: "debt_strategy", label: "Debt Strategy" },
  { value: "report_summary", label: "Report Summary" },
  { value: "anomaly_detection", label: "Anomaly Detection" },
]

type AIInsightsDialogProps = {
  endpoint: string
  title?: string
  description?: string
  triggerLabel?: string
  defaultAnalysisType?: FinanceAnalysisType
  lockAnalysisType?: boolean
}

type AIResponse = {
  success: true
  data: FinanceInsightsData
  meta: {
    provider: string
    model: string
    latency_ms: number
    input_chars?: number
    output_chars?: number
  }
}

type AIErrorResponse = {
  success: false
  error: {
    code: string
    message: string
    retryable: boolean
  }
}

export function AIInsightsDialog({
  endpoint,
  title = "Ask AI",
  description = "Generate insights based on your financial data.",
  triggerLabel = "Ask AI",
  defaultAnalysisType = "overview",
  lockAnalysisType = false,
}: AIInsightsDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [prompt, setPrompt] = useState("")
  const [analysisType, setAnalysisType] = useState<FinanceAnalysisType>(defaultAnalysisType)
  const [fromDate, setFromDate] = useState("")
  const [toDate, setToDate] = useState("")
  const [response, setResponse] = useState<AIResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const currentAnalysisType = lockAnalysisType ? defaultAnalysisType : analysisType

  const submitInsights = async () => {
    setIsLoading(true)
    setError(null)
    setResponse(null)

    try {
      const payload: {
        analysis_type: FinanceAnalysisType
        prompt?: string
        time_range?: { from: string; to: string }
      } = {
        analysis_type: currentAnalysisType,
      }

      if (prompt.trim()) {
        payload.prompt = prompt.trim()
      }

      if (fromDate && toDate) {
        payload.time_range = { from: fromDate, to: toDate }
      }

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = (await res.json()) as AIResponse | AIErrorResponse

      if (!res.ok || !data.success) {
        const message = "error" in data ? data.error.message : "Could not generate insights."
        setError(message)
        return
      }

      setResponse(data)
    } catch {
      setError("Network error while requesting insights.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpenChange = (nextOpen: boolean) => {
    setIsOpen(nextOpen)
    if (!nextOpen) {
      setError(null)
      setResponse(null)
      setPrompt("")
      setFromDate("")
      setToDate("")
      setAnalysisType(defaultAnalysisType)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 bg-transparent">
          <Bot className="w-4 h-4" />
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!lockAnalysisType && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">Analysis Type</p>
              <Select value={analysisType} onValueChange={(value) => setAnalysisType(value as FinanceAnalysisType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ANALYSIS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">What should AI focus on?</p>
            <Textarea
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              placeholder="e.g. Where am I overspending and what should I fix first?"
              className="min-h-24"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">From</p>
              <Input type="date" value={fromDate} onChange={(event) => setFromDate(event.target.value)} />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">To</p>
              <Input type="date" value={toDate} onChange={(event) => setToDate(event.target.value)} />
            </div>
          </div>

          <Button
            onClick={submitInsights}
            disabled={isLoading}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating Insights...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Insights
              </>
            )}
          </Button>

          {error && (
            <div className="rounded-md border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-500">
              {error}
            </div>
          )}

          {response && (
            <div className="space-y-4 rounded-lg border border-border bg-muted/30 p-4">
              <div>
                <p className="text-sm font-semibold text-foreground">Summary</p>
                <p className="text-sm text-foreground/80 mt-1">{response.data.summary}</p>
              </div>

              <div>
                <p className="text-sm font-semibold text-foreground mb-2">Insights</p>
                <div className="space-y-2">
                  {response.data.insights.map((item, index) => (
                    <div key={`${item.title}-${index}`} className="rounded-md border border-border p-3 bg-background">
                      <p className="text-sm font-medium text-foreground">{item.title}</p>
                      <p className="text-xs text-foreground/70 mt-1">{item.detail}</p>
                    </div>
                  ))}
                </div>
              </div>

              {response.data.risks.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-foreground mb-2">Risks</p>
                  <div className="space-y-2">
                    {response.data.risks.map((item, index) => (
                      <div
                        key={`${item.title}-${index}`}
                        className="rounded-md border border-amber-500/30 bg-amber-500/10 p-3"
                      >
                        <p className="text-sm font-medium text-foreground">{item.title}</p>
                        <p className="text-xs text-foreground/80 mt-1">{item.detail}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <p className="text-sm font-semibold text-foreground mb-2">Recommended Actions</p>
                <div className="space-y-2">
                  {response.data.recommended_actions.map((item, index) => (
                    <div key={`${item.action}-${index}`} className="rounded-md border border-border p-3 bg-background">
                      <p className="text-sm font-medium text-foreground">{item.action}</p>
                      <p className="text-xs text-foreground/70 mt-1">{item.reason}</p>
                      <p className="text-xs text-primary mt-1">Impact: {item.estimated_impact}</p>
                    </div>
                  ))}
                </div>
              </div>

              <p className="text-xs text-foreground/60">
                Confidence: {(response.data.confidence * 100).toFixed(0)}% • Provider: {response.meta.provider}/
                {response.meta.model} • {response.meta.latency_ms}ms
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
