// Categories and their associated icons/colors
import { 
  CreditCard, 
  Utensils, 
  Zap, 
  ShoppingCart, 
  Pill, 
  Home, 
  Film, 
  Car, 
  DollarSign,
  Briefcase,
  type LucideIcon
} from "lucide-react"

export interface Category {
  id: string
  name: string
  icon: LucideIcon
  color: string
  type: 'income' | 'expense' | 'both'
}

export const categories: Category[] = [
  { id: 'groceries', name: 'Groceries', icon: Utensils, color: 'bg-orange-500/10 text-orange-600', type: 'expense' },
  { id: 'rent', name: 'Rent', icon: Home, color: 'bg-blue-500/10 text-blue-600', type: 'expense' },
  { id: 'utilities', name: 'Utilities', icon: Zap, color: 'bg-yellow-500/10 text-yellow-600', type: 'expense' },
  { id: 'entertainment', name: 'Entertainment', icon: Film, color: 'bg-purple-500/10 text-purple-600', type: 'expense' },
  { id: 'shopping', name: 'Shopping', icon: ShoppingCart, color: 'bg-pink-500/10 text-pink-600', type: 'expense' },
  { id: 'healthcare', name: 'Healthcare', icon: Pill, color: 'bg-red-500/10 text-red-600', type: 'expense' },
  { id: 'transport', name: 'Transportation', icon: Car, color: 'bg-cyan-500/10 text-cyan-600', type: 'expense' },
  { id: 'salary', name: 'Salary', icon: CreditCard, color: 'bg-green-500/10 text-green-600', type: 'income' },
  { id: 'freelance', name: 'Freelance', icon: Briefcase, color: 'bg-emerald-500/10 text-emerald-600', type: 'income' },
  { id: 'other', name: 'Other', icon: DollarSign, color: 'bg-gray-500/10 text-gray-600', type: 'both' },
]

export const getCategoryByName = (name: string): Category | undefined => {
  return categories.find(cat => cat.name.toLowerCase() === name.toLowerCase())
}

export const getCategoryById = (id: string): Category | undefined => {
  return categories.find(cat => cat.id === id)
}

export const expenseCategories = categories.filter(cat => cat.type === 'expense' || cat.type === 'both')
export const incomeCategories = categories.filter(cat => cat.type === 'income' || cat.type === 'both')

