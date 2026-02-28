import OpenAI from "openai"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { ParsedTransactionSchema, type ParsedTransaction } from "./types"
import { buildSystemPrompt } from "./prompt"

export interface AIProvider {
  parse(text: string): Promise<ParsedTransaction>
}

class OpenAIProvider implements AIProvider {
  private client: OpenAI

  constructor() {
    this.client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  }

  async parse(text: string): Promise<ParsedTransaction> {
    const response = await this.client.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.1,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: buildSystemPrompt() },
        { role: "user", content: text },
      ],
    })

    const content = response.choices[0].message.content
    if (!content) throw new Error("Empty response from OpenAI")

    const parsed = JSON.parse(content)
    return ParsedTransactionSchema.parse(parsed)
  }
}

class GeminiProvider implements AIProvider {
  private client: GoogleGenerativeAI

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) throw new Error("GEMINI_API_KEY is not set")
    this.client = new GoogleGenerativeAI(apiKey)
  }

  async parse(text: string): Promise<ParsedTransaction> {
    const model = this.client.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: 0.1,
        responseMimeType: "application/json",
      },
    })

    const prompt = `${buildSystemPrompt()}\n\nUser input: ${text}`
    const result = await model.generateContent(prompt)
    const content = result.response.text()

    const parsed = JSON.parse(content)
    return ParsedTransactionSchema.parse(parsed)
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
