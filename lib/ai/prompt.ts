import { categories } from "@/lib/mocks/categories"
import { liabilitiesData } from "@/lib/mocks/debts"

export function buildSystemPrompt(): string {
  const today = new Date().toISOString().split("T")[0]

  const categoryList = categories
    .map((c) => `- id: "${c.id}", name: "${c.name}", type: ${c.type}`)
    .join("\n")

  const liabilityList = liabilitiesData
    .map((l) => `- id: ${l.id}, name: "${l.name}", type: ${l.type}`)
    .join("\n")

  return `You are a financial transaction parser. Your job is to extract structured transaction data from natural language input in Spanish or English.

Today's date: ${today}
Default currency: COP (Colombian Pesos).

Available categories:
${categoryList}

Available liabilities (debts):
${liabilityList}

Rules:
1. Parse the user's text and return a JSON object with these fields:
   - description (string): A clean, short description of the transaction
   - amount (number): The amount in COP. Always a positive number. If the user says "k" or "mil", multiply by 1,000. If they say "millones" or "palos", multiply by 1,000,000.
   - type ("expense" | "income" | "debt-payment"): Determine from context. Payments toward liabilities are "debt-payment".
   - category_id (string): Best matching category ID from the list above. Use "other" if uncertain.
   - date (string): In YYYY-MM-DD format. Use today if not specified. Handle relative dates like "ayer" (yesterday), "el lunes" (last Monday), "anteayer", etc.
   - method (string): Payment method if mentioned (e.g., "cash", "card", "transfer", "nequi", "daviplata"). Default to "other".
   - liability_id (number | null): If type is "debt-payment", match the liability by name. Otherwise null.
   - confidence (number 0-1): How confident you are in the parsing. Use lower values when you had to guess significantly.

2. Respond ONLY with a valid JSON object. No markdown, no explanation, no wrapping.
3. If the input is ambiguous, make your best guess and lower the confidence score.
4. When parsing debt payments, look for keywords like "pagué", "abono", "pago de tarjeta", "paid", "payment toward", etc.`
}
