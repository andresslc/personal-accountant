"use client"

import { useMemo, useState } from "react"
import { usePathname } from "next/navigation"
import { Loader2, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import type {
  FinanceAnalysisType,
  FinanceInsightsData,
  FinancePage,
} from "@/lib/ai/finance-types"

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

type AIRecommendationsDialogProps = {
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

const pathToFinancePage = (pathname: string): FinancePage => {
  if (pathname.includes("/dashboard/transactions")) return "transactions"
  if (pathname.includes("/dashboard/budget")) return "budgets"
  if (pathname.includes("/dashboard/debts")) return "debts"
  if (pathname.includes("/dashboard/reports")) return "reports"
  return "dashboard"
}

function CardBasedResults({ data }: { data: FinanceInsightsData }) {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-semibold text-foreground">Summary</p>
        <p className="text-sm text-foreground/80 mt-1">{data.summary}</p>
      </div>

      <div>
        <p className="text-sm font-semibold text-foreground mb-2">Insights</p>
        <div className="space-y-2">
          {data.insights.map((item, index) => (
            <div key={`${item.title}-${index}`} className="rounded-md border border-border p-3 bg-background">
              <p className="text-sm font-medium text-foreground">{item.title}</p>
              <p className="text-xs text-foreground/70 mt-1">{item.detail}</p>
            </div>
          ))}
        </div>
      </div>

      {data.risks.length > 0 && (
        <div>
          <p className="text-sm font-semibold text-foreground mb-2">Risks</p>
          <div className="space-y-2">
            {data.risks.map((item, index) => (
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
          {data.recommended_actions.map((item, index) => (
            <div key={`${item.action}-${index}`} className="rounded-md border border-border p-3 bg-background">
              <p className="text-sm font-medium text-foreground">{item.action}</p>
              <p className="text-xs text-foreground/70 mt-1">{item.reason}</p>
              <p className="text-xs text-primary mt-1">Impact: {item.estimated_impact}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function NarrativeReport({ data }: { data: FinanceInsightsData }) {
  return (
    <div className="space-y-4">
      <div className="prose prose-sm max-w-none dark:prose-invert">
        <div className="whitespace-pre-wrap text-sm text-foreground/80 leading-relaxed">
          {data.summary}
        </div>
      </div>

      {data.recommended_actions.length > 0 && (
        <div>
          <p className="text-sm font-semibold text-foreground mb-2">Key Recommendations</p>
          <ol className="list-decimal list-inside space-y-2">
            {data.recommended_actions.map((item, index) => (
              <li key={`${item.action}-${index}`} className="text-sm text-foreground/80">
                <span className="font-medium text-foreground">{item.action}</span>
                {" — "}{item.reason}
                <span className="text-primary ml-1">(Impact: {item.estimated_impact})</span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  )
}

export function AIRecommendationsDialog({
  endpoint,
  title = "AI Recommendations",
  description = "Get personalized financial recommendations based on your data.",
  triggerLabel = "AI Recommendations",
  defaultAnalysisType = "overview",
  lockAnalysisType = false,
}: AIRecommendationsDialogProps) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [prompt, setPrompt] = useState("")
  const [analysisType, setAnalysisType] = useState<FinanceAnalysisType>(defaultAnalysisType)
  const [fromDate, setFromDate] = useState("")
  const [toDate, setToDate] = useState("")
  const [response, setResponse] = useState<AIResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const currentPage = useMemo(() => pathToFinancePage(pathname), [pathname])

  const currentAnalysisType = lockAnalysisType ? defaultAnalysisType : analysisType
  const isReportSummary = currentAnalysisType === "report_summary"

  const submitInsights = async () => {
    setIsLoading(true)
    setError(null)
    setResponse(null)

    try {
      const payload: {
        analysis_type: FinanceAnalysisType
        prompt?: string
        user_message?: string
        current_page: FinancePage
        time_range?: { from: string; to: string }
      } = {
        analysis_type: currentAnalysisType,
        current_page: currentPage,
      }

      if (prompt.trim()) {
        payload.prompt = prompt.trim()
        payload.user_message = prompt.trim()
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
        const message = "error" in data ? data.error.message : "Could not generate recommendations."
        setError(message)
        return
      }

      setResponse(data)

      const memoryRes = await fetch("/api/ai/memory-update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          current_page: currentPage,
          user_message: payload.user_message ?? "User requested AI recommendations.",
          recommendation_summary: data.data.summary,
        }),
      })
      await memoryRes.json()
    } catch {
      setError("Network error while requesting recommendations.")
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
          <Sparkles className="w-4 h-4" />
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
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
                Analyzing your data...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Get Recommendations
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
              {isReportSummary ? (
                <Tabs defaultValue="narrative">
                  <TabsList className="mb-3">
                    <TabsTrigger value="narrative">Report</TabsTrigger>
                    <TabsTrigger value="cards">Details</TabsTrigger>
                  </TabsList>
                  <TabsContent value="narrative">
                    <NarrativeReport data={response.data} />
                  </TabsContent>
                  <TabsContent value="cards">
                    <CardBasedResults data={response.data} />
                  </TabsContent>
                </Tabs>
              ) : (
                <CardBasedResults data={response.data} />
              )}

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

/** @deprecated Use AIRecommendationsDialog instead */
export const AIInsightsDialog = AIRecommendationsDialog
