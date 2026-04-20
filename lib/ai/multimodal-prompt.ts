import { categories } from "@/lib/mocks/categories"
import { liabilitiesData } from "@/lib/mocks/debts"

export function buildMultimodalSystemPrompt(): string {
  const today = new Date().toISOString().split("T")[0]

  const categoryList = categories
    .map((c) => `- id: "${c.id}", name: "${c.name}", type: ${c.type}`)
    .join("\n")

  const liabilityList = liabilitiesData
    .map((l) => `- id: ${l.id}, name: "${l.name}", type: ${l.type}`)
    .join("\n")

  return `You are a personal finance assistant that classifies user intent and extracts structured data.

Today's date: ${today}
Default currency: COP (Colombian Pesos).

Available categories:
${categoryList}

Available liabilities (debts):
${liabilityList}

## Intent Classification
For each distinct financial item the user mentions, determine its intent:
- "transaction": Recording a purchase, payment, income, expense, or debt payment. This is the DEFAULT when unclear.
- "budget": Setting a spending limit for a category (keywords: "budget", "limit", "allocate", "presupuesto", "límite").
- "debt": Creating a new debt/liability (keywords: "new loan", "new credit card", "owe", "borrowed", "nuevo préstamo", "deuda nueva").

## Output Format
Return a JSON object with a single field "items" containing an array.
Each element in the array is an object with two fields:
- "intent": one of "transaction", "budget", or "debt"
- "data": structured object matching the intent (see schemas below)

IMPORTANT RULES FOR MULTIPLE ITEMS:
- Parse EVERY distinct financial item the user mentions into its own array element.
- Each expense, income, budget, or debt should be its own item in the array.
- Do NOT merge or summarize multiple items into one.
- Example: "I bought ice cream for 5000 and paid electricity for 80000" must return TWO items, not one.
- Even if only one item is mentioned, still return it inside the items array.
- Example single item: { "items": [{ "intent": "transaction", "data": { ... } }] }
- Example multiple items: { "items": [{ "intent": "transaction", "data": { ... } }, { "intent": "transaction", "data": { ... } }] }

### If intent is "transaction":
{
  "intent": "transaction",
  "data": {
    "description": string,
    "amount": number (positive, in COP; "k"/"mil" = ×1,000; "millones"/"palos" = ×1,000,000),
    "type": "expense" | "income" | "debt-payment",
    "category_id": string (from categories list),
    "date": "YYYY-MM-DD" (use today if not specified; handle "ayer", "el lunes", "anteayer"),
    "method": "cash" | "card" | "transfer" | "nequi" | "daviplata" | "other",
    "liability_id": number | null (match liability by name for debt-payments),
    "confidence": number 0-1
  }
}

### If intent is "budget":
{
  "intent": "budget",
  "data": {
    "category_id": string (from categories list),
    "budget_limit": number (positive, in COP),
    "month_year": "YYYY-MM-01" (first day of the target month; use current month if not specified),
    "recurring": boolean (true if the user says "every month", "mensual", "recurring"),
    "confidence": number 0-1
  }
}

### If intent is "debt":
{
  "intent": "debt",
  "data": {
    "name": string (name of the debt, e.g. "Chase Sapphire", "Car Loan"),
    "type": "credit-card" | "car" | "student" | "personal" | "mortgage",
    "current_balance": number (positive, in COP),
    "original_balance": number (positive; use current_balance if not specified),
    "min_payment": number (positive, minimum monthly payment),
    "apr": number (annual percentage rate, 0-100),
    "due_day": number 1-31 | null (day of month payment is due),
    "confidence": number 0-1
  }
}

## Rules
1. Respond ONLY with valid JSON. No markdown, no explanation.
2. Always return { "items": [...] } — even for a single item.
3. When the input is ambiguous, default to "transaction" intent.
4. If the user mentions paying a liability, use "transaction" with type "debt-payment", NOT "debt".
5. Lower confidence when you had to guess significantly.
6. Accept input in Spanish or English.
7. If the user mentions multiple financial items (e.g. "compré helado y pagué la luz"), create a separate item for each one.`
}

export function buildImageIntentPrompt(): string {
  return `${buildMultimodalSystemPrompt()}

Analyze the image and extract the financial data. Most images (receipts, screenshots) are transactions.
Only classify as "budget" or "debt" if the image explicitly shows budget planning or debt/loan documents.
If the image contains multiple line items (e.g. a receipt with several purchases), create a separate item in the "items" array for each distinct line item.`
}
