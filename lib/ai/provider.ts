import OpenAI from "openai"
import { GoogleGenerativeAI } from "@google/generative-ai"
import type { ZodTypeAny } from "zod"
import { ParsedTransactionSchema, type ParsedTransaction } from "./types"
import { buildSystemPrompt } from "./prompt"

type StructuredPromptInput<TSchema extends ZodTypeAny> = {
  systemPrompt: string
  userPrompt: string
  schema: TSchema
}

export interface AIProvider {
  parse(text: string): Promise<ParsedTransaction>
  generateStructured<TSchema extends ZodTypeAny>(
    input: StructuredPromptInput<TSchema>
  ): Promise<ReturnType<TSchema["parse"]>>
  getProviderName(): string
  getModelName(): string
}

class OpenAIProvider implements AIProvider {
  private client: OpenAI
  private modelName = "gpt-4o-mini"

  constructor() {
    this.client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  }

  async generateStructured<TSchema extends ZodTypeAny>(
    input: StructuredPromptInput<TSchema>
  ): Promise<ReturnType<TSchema["parse"]>> {
    const response = await this.client.chat.completions.create({
      model: this.modelName,
      temperature: 0.1,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: input.systemPrompt },
        { role: "user", content: input.userPrompt },
      ],
    })

    const content = response.choices[0].message.content
    if (!content) throw new Error("Empty response from OpenAI")

    const parsed = JSON.parse(content)
    return input.schema.parse(parsed)
  }

  async parse(text: string): Promise<ParsedTransaction> {
    return this.generateStructured({
      systemPrompt: buildSystemPrompt(),
      userPrompt: text,
      schema: ParsedTransactionSchema,
    })
  }

  getProviderName(): string {
    return "openai"
  }

  getModelName(): string {
    return this.modelName
  }
}

class GeminiProvider implements AIProvider {
  private client: GoogleGenerativeAI
  private modelName = "gemini-1.5-flash"

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) throw new Error("GEMINI_API_KEY is not set")
    this.client = new GoogleGenerativeAI(apiKey)
  }

  async generateStructured<TSchema extends ZodTypeAny>(
    input: StructuredPromptInput<TSchema>
  ): Promise<ReturnType<TSchema["parse"]>> {
    const model = this.client.getGenerativeModel({
      model: this.modelName,
      generationConfig: {
        temperature: 0.1,
        responseMimeType: "application/json",
      },
    })

    const prompt = `${input.systemPrompt}\n\nUser input: ${input.userPrompt}`
    const result = await model.generateContent(prompt)
    const content = result.response.text()

    const parsed = JSON.parse(content)
    return input.schema.parse(parsed)
  }

  async parse(text: string): Promise<ParsedTransaction> {
    return this.generateStructured({
      systemPrompt: buildSystemPrompt(),
      userPrompt: text,
      schema: ParsedTransactionSchema,
    })
  }

  getProviderName(): string {
    return "gemini"
  }

  getModelName(): string {
    return this.modelName
  }
}

export function getAIProvider(): AIProvider {
  const provider = process.env.AI_PROVIDER ?? "openai"

  switch (provider) {
    case "gemini":
      return new GeminiProvider()
    case "openai":
    default:
      return new OpenAIProvider()
  }
}
