import { z } from "zod"
import type { SupabaseClient } from "@supabase/supabase-js"
import type { ChatToolDef } from "@/lib/ai/provider"
import {
  createTransaction,
  createBudgetItem,
  createDebt,
  deleteTransaction,
  updateTransaction,
  deleteDebt,
  updateDebt,
  getTransactions,
  getBudgets,
  getDebts,
  getSummaryCards,
  type LiabilityUpdate,
} from "@/lib/data/dashboard-data"
import { categories } from "@/lib/mocks/categories"
import type { ActionEvent } from "./types"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySupabaseClient = SupabaseClient<any, any, any>

const CreateTransactionParams = z.object({
  description: z.string(),
  amount: z.number().positive(),
  type: z.enum(["income", "expense", "debt-payment"]),
  category_id: z.string(),
  date: z.string(),
  method: z
    .enum(["Credit Card", "Bank Transfer", "Cash", "Debit Card"])
    .nullable()
    .optional(),
  liability_id: z.number().nullable().optional().default(null),
})

const CreateBudgetParams = z.object({
  category_id: z.string(),
  budget_limit: z.number().positive(),
  month_year: z.string(),
  recurring: z.boolean().optional().default(false),
})

const CreateDebtParams = z.object({
  name: z.string(),
  type: z.enum(["credit-card", "car", "student", "personal", "mortgage"]),
  current_balance: z.number().positive(),
  original_balance: z.number().positive(),
  min_payment: z.number().positive(),
  apr: z.number().min(0).max(100),
  due_day: z.number().min(1).max(31).nullable().optional().default(null),
})

const GetTransactionsParams = z.object({
  limit: z.number().optional().default(10),
  type: z.enum(["income", "expense", "debt-payment"]).optional(),
  category: z.string().optional(),
})

const DeleteTransactionParams = z.object({
  id: z.number(),
})

const UpdateTransactionParams = z.object({
  id: z.number(),
  description: z.string().optional(),
  amount: z.number().positive().optional(),
  type: z.enum(["income", "expense", "debt-payment"]).optional(),
  category_id: z.string().optional(),
  date: z.string().optional(),
})

const DeleteDebtParams = z.object({
  id: z.number(),
})

const UpdateDebtParams = z.object({
  id: z.number(),
  name: z.string().optional(),
  type: z.enum(["credit-card", "car", "student", "personal", "mortgage"]).optional(),
  current_balance: z.number().positive().optional(),
  original_balance: z.number().positive().optional(),
  min_payment: z.number().positive().optional(),
  apr: z.number().min(0).max(100).optional(),
  due_day: z.number().min(1).max(31).nullable().optional(),
})

const RouteToSubAgentParams = z.object({
  agent: z.enum(["debt_agent", "advisory_agent", "prediction_agent"]),
  task_description: z.string(),
})

export const toolDefinitions: ChatToolDef[] = [
  {
    type: "function",
    function: {
      name: "create_transaction",
      description: "Create a new financial transaction (expense, income, or debt payment). Amount should always be positive.",
      parameters: {
        type: "object",
        properties: {
          description: { type: "string", description: "Description of the transaction" },
          amount: { type: "number", description: "Positive amount in COP" },
          type: { type: "string", enum: ["income", "expense", "debt-payment"] },
          category_id: { type: "string", description: "Category ID (e.g. groceries, rent, salary, utilities, entertainment, shopping, healthcare, transportation, freelance, other)" },
          date: { type: "string", description: "Date in YYYY-MM-DD format" },
          method: {
            type: "string",
            enum: ["Credit Card", "Bank Transfer", "Cash", "Debit Card"],
            description: "Payment method. Must be one of the enum values. Omit if unknown.",
          },
          liability_id: { type: "number", description: "Liability ID for debt payments", nullable: true },
        },
        required: ["description", "amount", "type", "category_id", "date"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "create_budget",
      description: "Create a monthly budget limit for a spending category",
      parameters: {
        type: "object",
        properties: {
          category_id: { type: "string", description: "Category ID" },
          budget_limit: { type: "number", description: "Monthly spending limit in COP" },
          month_year: { type: "string", description: "First day of month in YYYY-MM-DD format (e.g. 2026-03-01)" },
          recurring: { type: "boolean", description: "Whether the budget repeats monthly", default: false },
        },
        required: ["category_id", "budget_limit", "month_year"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "create_debt",
      description: "Add a new debt/liability (credit card, loan, mortgage, etc.)",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string", description: "Name of the debt" },
          type: { type: "string", enum: ["credit-card", "car", "student", "personal", "mortgage"] },
          current_balance: { type: "number", description: "Current balance owed in COP" },
          original_balance: { type: "number", description: "Original balance in COP" },
          min_payment: { type: "number", description: "Minimum monthly payment in COP" },
          apr: { type: "number", description: "Annual percentage rate (0-100)" },
          due_day: { type: "number", description: "Day of month payment is due (1-31)", nullable: true },
        },
        required: ["name", "type", "current_balance", "original_balance", "min_payment", "apr"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_transactions",
      description: "Fetch recent transactions with optional filters",
      parameters: {
        type: "object",
        properties: {
          limit: { type: "number", description: "Number of transactions to return", default: 10 },
          type: { type: "string", enum: ["income", "expense", "debt-payment"], description: "Filter by transaction type" },
          category: { type: "string", description: "Filter by category name" },
        },
        required: [],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_budgets",
      description: "Get all budgets with spending progress for the current period",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function",
    function: {
      name: "get_debts",
      description: "Get all debts/liabilities with balances and payment info",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function",
    function: {
      name: "get_financial_summary",
      description: "Get overall financial summary: total balance, income, expenses, savings",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function",
    function: {
      name: "get_categories",
      description: "Get available transaction categories",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function",
    function: {
      name: "delete_transaction",
      description: "Delete a transaction by its ID",
      parameters: {
        type: "object",
        properties: {
          id: { type: "number", description: "Transaction ID to delete" },
        },
        required: ["id"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "update_transaction",
      description: "Update fields on an existing transaction",
      parameters: {
        type: "object",
        properties: {
          id: { type: "number", description: "Transaction ID to update" },
          description: { type: "string" },
          amount: { type: "number" },
          type: { type: "string", enum: ["income", "expense", "debt-payment"] },
          category_id: { type: "string" },
          date: { type: "string" },
        },
        required: ["id"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "delete_debt",
      description: "Delete a debt/liability by its ID. Use this when the user says a previously created debt was wrong, a mistake, or should be removed — do NOT create a new debt to replace it without first deleting the wrong one. The most recent debt_created action event in this conversation contains the ID you need.",
      parameters: {
        type: "object",
        properties: {
          id: { type: "number", description: "Liability ID to delete" },
        },
        required: ["id"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "update_debt",
      description: "Update fields on an existing debt/liability. Use this when the user corrects a previously created debt (e.g. 'no, the APR was 24%', 'el saldo era 2 millones, no 3', 'I made a mistake on the minimum payment') instead of creating a new debt. Only include the fields the user wants changed. The most recent debt_created action event in this conversation contains the ID you need.",
      parameters: {
        type: "object",
        properties: {
          id: { type: "number", description: "Liability ID to update" },
          name: { type: "string" },
          type: { type: "string", enum: ["credit-card", "car", "student", "personal", "mortgage"] },
          current_balance: { type: "number", description: "Current balance owed in COP" },
          original_balance: { type: "number", description: "Original balance in COP" },
          min_payment: { type: "number", description: "Minimum monthly payment in COP" },
          apr: { type: "number", description: "Annual percentage rate (0-100)" },
          due_day: { type: "number", description: "Day of month payment is due (1-31)", nullable: true },
        },
        required: ["id"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "route_to_sub_agent",
      description: "Route complex financial tasks to specialized sub-agents. Use this for: debt payment plans/strategies/payoff calculations (debt_agent), financial advice/goal analysis/spending coaching (advisory_agent), expense/income forecasting/budget projections (prediction_agent).",
      parameters: {
        type: "object",
        properties: {
          agent: {
            type: "string",
            enum: ["debt_agent", "advisory_agent", "prediction_agent"],
            description: "Which sub-agent to use",
          },
          task_description: {
            type: "string",
            description: "Detailed description of the task for the sub-agent",
          },
        },
        required: ["agent", "task_description"],
      },
    },
  },
]

export type ToolResult = {
  content: string
  action?: ActionEvent
}

export async function executeTool(
  name: string,
  args: Record<string, unknown>,
  userId: string,
  client?: AnySupabaseClient
): Promise<ToolResult> {
  switch (name) {
    case "create_transaction": {
      const parsed = CreateTransactionParams.safeParse(args)
      if (!parsed.success) {
        const issues = parsed.error.issues
          .map((i) => `${i.path.join(".")}: ${i.message}`)
          .join("; ")
        return { content: `Invalid transaction parameters: ${issues}. Please ask the user for the correct values and try again.` }
      }
      const params = parsed.data
      const result = await createTransaction(
        {
          description: params.description,
          amount: params.amount,
          type: params.type,
          category_id: params.category_id,
          date: params.date,
          method: params.method ?? null,
          liability_id: params.liability_id ?? null,
        },
        userId,
        client
      )
      if (!result) return { content: "Failed to create transaction. There may be a database connection issue. Please try again." }
      return {
        content: `Transaction created successfully (ID: ${result.id}). ${params.type}: ${params.description} - $${params.amount.toLocaleString()} COP on ${params.date}.`,
        action: {
          type: "action",
          action: {
            kind: "transaction_created",
            data: { id: result.id, ...params },
          },
        },
      }
    }

    case "create_budget": {
      const parsed = CreateBudgetParams.safeParse(args)
      if (!parsed.success) {
        const issues = parsed.error.issues
          .map((i) => `${i.path.join(".")}: ${i.message}`)
          .join("; ")
        return { content: `Invalid budget parameters: ${issues}. Please ask the user for the correct values and try again.` }
      }
      const params = parsed.data
      const result = await createBudgetItem(
        {
          category_id: params.category_id,
          budget_limit: params.budget_limit,
          month_year: params.month_year,
          recurring: params.recurring,
        },
        userId,
        client
      )
      if (!result) return { content: "Failed to create budget. There may be a database connection issue. Please try again." }
      return {
        content: `Budget created (ID: ${result.id}). Category: ${params.category_id}, Limit: $${params.budget_limit.toLocaleString()} COP, Month: ${params.month_year}.`,
        action: {
          type: "action",
          action: {
            kind: "budget_created",
            data: { id: result.id, ...params },
          },
        },
      }
    }

    case "create_debt": {
      const parsed = CreateDebtParams.safeParse(args)
      if (!parsed.success) {
        const issues = parsed.error.issues
          .map((i) => `${i.path.join(".")}: ${i.message}`)
          .join("; ")
        return { content: `Invalid debt parameters: ${issues}. Please ask the user for the correct values and try again.` }
      }
      const params = parsed.data
      const result = await createDebt(
        {
          name: params.name,
          type: params.type,
          current_balance: params.current_balance,
          original_balance: params.original_balance,
          min_payment: params.min_payment,
          apr: params.apr,
          due_day: params.due_day ?? null,
        },
        userId,
        client
      )
      if (!result) return { content: "Failed to create debt. There may be a database connection issue. Please try again." }
      return {
        content: `Debt added (ID: ${result.id}). ${params.name}: $${params.current_balance.toLocaleString()} COP at ${params.apr}% APR.`,
        action: {
          type: "action",
          action: {
            kind: "debt_created",
            data: { id: result.id, ...params },
          },
        },
      }
    }

    case "get_transactions": {
      const params = GetTransactionsParams.parse(args)
      const all = await getTransactions()
      let filtered = all
      if (params.type) {
        filtered = filtered.filter((t) =>
          params.type === "income" ? t.amount > 0 : t.amount < 0
        )
      }
      if (params.category) {
        filtered = filtered.filter(
          (t) => t.category.toLowerCase() === params.category!.toLowerCase()
        )
      }
      const limited = filtered.slice(0, params.limit)
      const summary = limited
        .map((t) => `- ${t.date}: ${t.description} (${t.category}) $${Math.abs(t.amount).toLocaleString()} COP [${t.amount > 0 ? "income" : "expense"}]`)
        .join("\n")
      return { content: `Found ${limited.length} transactions:\n${summary}` }
    }

    case "get_budgets": {
      const budgets = await getBudgets()
      const summary = budgets
        .map((b) => `- ${b.category}: Limit $${b.limit.toLocaleString()} COP, Spent $${b.spent.toLocaleString()} COP, Remaining $${(b.limit - b.spent).toLocaleString()} COP`)
        .join("\n")
      return { content: budgets.length > 0 ? `Current budgets:\n${summary}` : "No budgets set up yet." }
    }

    case "get_debts": {
      const debts = await getDebts()
      const summary = debts
        .map((d) => `- ${d.name} (${d.type}): Balance $${d.currentBalance.toLocaleString()} COP, Min payment $${d.minPayment.toLocaleString()} COP, APR ${d.apr}%`)
        .join("\n")
      return { content: debts.length > 0 ? `Current debts:\n${summary}` : "No debts tracked." }
    }

    case "get_financial_summary": {
      const cards = await getSummaryCards()
      const summary = cards.map((c) => `${c.title}: ${c.value}`).join("\n")
      return { content: `Financial summary:\n${summary}` }
    }

    case "get_categories": {
      const list = categories
        .map((c) => `- ${c.id}: ${c.name} (${c.type})`)
        .join("\n")
      return { content: `Available categories:\n${list}` }
    }

    case "delete_transaction": {
      const params = DeleteTransactionParams.parse(args)
      const success = await deleteTransaction(params.id, userId, client)
      if (!success) return { content: `Failed to delete transaction ${params.id}.` }
      return {
        content: `Transaction ${params.id} deleted successfully.`,
        action: {
          type: "action",
          action: {
            kind: "transaction_deleted",
            data: { id: params.id },
          },
        },
      }
    }

    case "update_transaction": {
      const params = UpdateTransactionParams.parse(args)
      const { id, ...updates } = params
      const success = await updateTransaction(id, userId, updates, client)
      if (!success) return { content: `Failed to update transaction ${id}.` }
      return {
        content: `Transaction ${id} updated successfully.`,
        action: {
          type: "action",
          action: {
            kind: "transaction_updated",
            data: { id, ...updates },
          },
        },
      }
    }

    case "delete_debt": {
      const parsed = DeleteDebtParams.safeParse(args)
      if (!parsed.success) {
        const issues = parsed.error.issues
          .map((i) => `${i.path.join(".")}: ${i.message}`)
          .join("; ")
        return { content: `Invalid delete_debt parameters: ${issues}. Please ask the user for the correct values and try again.` }
      }
      const success = await deleteDebt(parsed.data.id, userId, client)
      if (!success) return { content: `Failed to delete debt ${parsed.data.id}. There may be a database connection issue or the debt may not exist.` }
      return {
        content: `Debt ${parsed.data.id} deleted successfully.`,
        action: {
          type: "action",
          action: {
            kind: "debt_deleted",
            data: { id: parsed.data.id },
          },
        },
      }
    }

    case "update_debt": {
      const parsed = UpdateDebtParams.safeParse(args)
      if (!parsed.success) {
        const issues = parsed.error.issues
          .map((i) => `${i.path.join(".")}: ${i.message}`)
          .join("; ")
        return { content: `Invalid update_debt parameters: ${issues}. Please ask the user for the correct values and try again.` }
      }
      const { id, ...rest } = parsed.data
      const updates: LiabilityUpdate = rest
      const success = await updateDebt(id, userId, updates, client)
      if (!success) return { content: `Failed to update debt ${id}. There may be a database connection issue or the debt may not exist.` }
      return {
        content: `Debt ${id} updated successfully.`,
        action: {
          type: "action",
          action: {
            kind: "debt_updated",
            data: { id, ...updates },
          },
        },
      }
    }

    default:
      return { content: `Unknown tool: ${name}` }
  }
}
