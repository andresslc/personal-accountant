import { z } from "zod"

export const SpendingForecastSchema = z.object({
  category: z.string(),
  predictedNextMonth: z.number(),
  lowerBound: z.number(),
  upperBound: z.number(),
  trend: z.enum(["rising", "falling", "stable"]),
  changePercent: z.number(),
  confidence: z.number().min(0).max(1),
  dataPointsUsed: z.number(),
})

export const BudgetAdherenceProjectionSchema = z.object({
  category: z.string(),
  budgetLimit: z.number(),
  spentSoFar: z.number(),
  projectedEndOfMonth: z.number(),
  status: z.enum(["on-track", "at-risk", "over-budget"]),
  safeDailyBudget: z.number(),
  daysRemaining: z.number(),
  percentUsed: z.number(),
})

export const DebtScheduleEntrySchema = z.object({
  month: z.number(),
  payment: z.number(),
  principal: z.number(),
  interest: z.number(),
  remainingBalance: z.number(),
})

export const DebtPayoffDetailSchema = z.object({
  name: z.string(),
  currentBalance: z.number(),
  apr: z.number(),
  minPayment: z.number(),
  payoffMonths: z.number(),
  totalInterest: z.number(),
  schedule: z.array(DebtScheduleEntrySchema),
})

export const DebtPayoffPlanSchema = z.object({
  strategy: z.enum(["avalanche", "snowball"]),
  totalDebt: z.number(),
  totalMinPayments: z.number(),
  payoffMonths: z.number(),
  totalInterestPaid: z.number(),
  debts: z.array(DebtPayoffDetailSchema),
})

export const DebtPayoffComparisonSchema = z.object({
  avalanche: DebtPayoffPlanSchema,
  snowball: DebtPayoffPlanSchema,
  interestSaved: z.number(),
  monthsSaved: z.number(),
  recommendedStrategy: z.enum(["avalanche", "snowball"]),
})

export const SavingsProjectionSchema = z.object({
  monthlyAvgSavings: z.number(),
  savingsRate: z.number(),
  trend: z.enum(["rising", "falling", "stable"]),
  projections: z.object({
    threeMonths: z.number(),
    sixMonths: z.number(),
    twelveMonths: z.number(),
  }),
  recentMonths: z.array(
    z.object({
      month: z.string(),
      income: z.number(),
      expenses: z.number(),
      savings: z.number(),
    })
  ),
})

export const SpendingAnomalySchema = z.object({
  date: z.string(),
  description: z.string(),
  amount: z.number(),
  category: z.string(),
  categoryAvg: z.number(),
  zScore: z.number(),
  explanation: z.string(),
})

export const CategoryDiagnosisSchema = z.object({
  category: z.string(),
  currentMonthSpend: z.number(),
  historicalAvg: z.number(),
  changePercent: z.number(),
  budgetLimit: z.number().nullable(),
  budgetUtilization: z.number().nullable(),
  status: z.enum(["within-norm", "elevated", "significantly-over"]),
  suggestion: z.string(),
})

export const SpendingDiagnosisSchema = z.object({
  topCategories: z.array(CategoryDiagnosisSchema),
  totalCurrentSpend: z.number(),
  totalHistoricalAvg: z.number(),
  potentialMonthlySavings: z.number(),
  anomalies: z.array(SpendingAnomalySchema),
})

export const PredictionMetadataSchema = z.object({
  generatedAt: z.string(),
  dataMonths: z.number(),
  isLimitedData: z.boolean(),
})

export const PredictionResponseSchema = z.object({
  spendingForecasts: z.array(SpendingForecastSchema).optional(),
  budgetAdherence: z.array(BudgetAdherenceProjectionSchema).optional(),
  debtPayoff: DebtPayoffComparisonSchema.optional(),
  savingsProjection: SavingsProjectionSchema.optional(),
  anomalies: z.array(SpendingAnomalySchema).optional(),
  spendingDiagnosis: SpendingDiagnosisSchema.optional(),
  metadata: PredictionMetadataSchema,
})

export type SpendingForecast = z.infer<typeof SpendingForecastSchema>
export type BudgetAdherenceProjection = z.infer<typeof BudgetAdherenceProjectionSchema>
export type DebtScheduleEntry = z.infer<typeof DebtScheduleEntrySchema>
export type DebtPayoffDetail = z.infer<typeof DebtPayoffDetailSchema>
export type DebtPayoffPlan = z.infer<typeof DebtPayoffPlanSchema>
export type DebtPayoffComparison = z.infer<typeof DebtPayoffComparisonSchema>
export type SavingsProjection = z.infer<typeof SavingsProjectionSchema>
export type SpendingAnomaly = z.infer<typeof SpendingAnomalySchema>
export type CategoryDiagnosis = z.infer<typeof CategoryDiagnosisSchema>
export type SpendingDiagnosis = z.infer<typeof SpendingDiagnosisSchema>
export type PredictionMetadata = z.infer<typeof PredictionMetadataSchema>
export type PredictionResponse = z.infer<typeof PredictionResponseSchema>
