// Mock debts/liabilities data
import { CreditCard, Car, DollarSign, type LucideIcon } from "lucide-react"

export interface Liability {
  id: number
  name: string
  type: 'credit-card' | 'car' | 'student' | 'personal' | 'mortgage'
  currentBalance: number
  originalBalance: number
  minPayment: number
  apr: number
  dueDay: number
  icon: LucideIcon
}

export const liabilitiesData: Liability[] = [
  {
    id: 1,
    name: "Chase Sapphire",
    type: "credit-card",
    currentBalance: 8500,
    originalBalance: 10000,
    minPayment: 250,
    apr: 24.99,
    dueDay: 15,
    icon: CreditCard,
  },
  {
    id: 2,
    name: "Auto Loan",
    type: "car",
    currentBalance: 12000,
    originalBalance: 20000,
    minPayment: 350,
    apr: 5.2,
    dueDay: 10,
    icon: Car,
  },
  {
    id: 3,
    name: "Student Loans",
    type: "student",
    currentBalance: 22000,
    originalBalance: 30000,
    minPayment: 280,
    apr: 4.5,
    dueDay: 20,
    icon: CreditCard,
  },
  {
    id: 4,
    name: "Personal Loan",
    type: "personal",
    currentBalance: 5000,
    originalBalance: 8000,
    minPayment: 200,
    apr: 9.8,
    dueDay: 5,
    icon: DollarSign,
  },
]

export interface PayoffTimelinePoint {
  month: string
  balance: number
}

export const payoffTimelineData: PayoffTimelinePoint[] = [
  { month: "Jan", balance: 47500 },
  { month: "Feb", balance: 46200 },
  { month: "Mar", balance: 44800 },
  { month: "Apr", balance: 43100 },
  { month: "May", balance: 41500 },
  { month: "Jun", balance: 39800 },
  { month: "Jul", balance: 38100 },
  { month: "Aug", balance: 36200 },
  { month: "Sep", balance: 34500 },
  { month: "Oct", balance: 32600 },
  { month: "Nov", balance: 30800 },
  { month: "Dec", balance: 28500 },
]

// Helper functions
export const getTotalDebt = (liabilities: Liability[] = liabilitiesData): number => {
  return liabilities.reduce((sum, liability) => sum + liability.currentBalance, 0)
}

export const getWeightedAverageApr = (liabilities: Liability[] = liabilitiesData): string => {
  const totalDebt = getTotalDebt(liabilities)
  if (totalDebt === 0) return "0.00"
  const weightedSum = liabilities.reduce((sum, liability) => sum + liability.apr * liability.currentBalance, 0)
  return (weightedSum / totalDebt).toFixed(2)
}

export const getProgressPercent = (current: number, original: number): number => {
  return ((original - current) / original) * 100
}

export const getProgressColor = (percentage: number): string => {
  if (percentage < 20) return "bg-red-500"
  if (percentage < 50) return "bg-amber-500"
  return "bg-green-500"
}

export const estimatedDebtFreeDate = "June 2026"

