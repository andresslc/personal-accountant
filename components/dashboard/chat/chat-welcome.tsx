"use client"

import { Bot, ArrowRight } from "lucide-react"

const suggestedPrompts = [
  "What did I spend most on this month?",
  "Create a budget for groceries",
  "How can I pay off my debts faster?",
  "Add a transaction: I spent 100k on dinner",
  "Predict my expenses for next month",
  "Give me a payment plan for my credit card",
]

interface ChatWelcomeProps {
  onSelectPrompt: (prompt: string) => void
}

export function ChatWelcome({ onSelectPrompt }: ChatWelcomeProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full px-4 py-12">
      <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
        <Bot className="w-8 h-8 text-primary" />
      </div>

      <h2 className="text-2xl font-bold text-foreground mb-2">FinFlow AI</h2>
      <p className="text-muted-foreground text-center max-w-md mb-8">
        Your personal financial assistant. Ask me about your finances, create
        transactions, get debt strategies, or predict your expenses.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
        {suggestedPrompts.map((prompt) => (
          <button
            key={prompt}
            onClick={() => onSelectPrompt(prompt)}
            className="flex items-center gap-2 px-4 py-3 rounded-xl border border-border bg-card hover:bg-muted transition-colors text-left text-sm group"
          >
            <span className="flex-1 text-foreground/80">{prompt}</span>
            <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
          </button>
        ))}
      </div>
    </div>
  )
}
