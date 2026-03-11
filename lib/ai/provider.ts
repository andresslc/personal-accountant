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

export type VisionInput = {
  systemPrompt: string
  userPrompt: string
  imageBase64: string
  mimeType: string
}

export interface AIProvider {
  parse(text: string): Promise<ParsedTransaction>
  generateStructured<TSchema extends ZodTypeAny>(
    input: StructuredPromptInput<TSchema>
  ): Promise<ReturnType<TSchema["parse"]>>
  generateStructuredWithImage<TSchema extends ZodTypeAny>(
    input: StructuredPromptInput<TSchema> & { imageBase64: string; mimeType: string }
  ): Promise<ReturnType<TSchema["parse"]>>
  parseImage(imageBase64: string, mimeType: string): Promise<ParsedTransaction>
  transcribeAudio(audioBuffer: Buffer, mimeType: string): Promise<string>
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

  async generateStructuredWithImage<TSchema extends ZodTypeAny>(
    input: StructuredPromptInput<TSchema> & { imageBase64: string; mimeType: string }
  ): Promise<ReturnType<TSchema["parse"]>> {
    const response = await this.client.chat.completions.create({
      model: this.modelName,
      temperature: 0.1,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: input.systemPrompt },
        {
          role: "user",
          content: [
            { type: "text", text: input.userPrompt },
            {
              type: "image_url",
              image_url: { url: `data:${input.mimeType};base64,${input.imageBase64}` },
            },
          ],
        },
      ],
    })

    const content = response.choices[0].message.content
    if (!content) throw new Error("Empty response from OpenAI")

    const parsed = JSON.parse(content)
    return input.schema.parse(parsed)
  }

  async parseImage(imageBase64: string, mimeType: string): Promise<ParsedTransaction> {
    return this.generateStructuredWithImage({
      systemPrompt: buildSystemPrompt(),
      userPrompt: "Extract the transaction details from this receipt or screenshot.",
      imageBase64,
      mimeType,
      schema: ParsedTransactionSchema,
    })
  }

  async transcribeAudio(audioBuffer: Buffer, mimeType: string): Promise<string> {
    const ext = mimeType.split("/")[1]?.replace("mpeg", "mp3").replace("webm", "webm") || "webm"
    const uint8 = new Uint8Array(audioBuffer)
    const file = new File([uint8], `audio.${ext}`, { type: mimeType })

    const transcription = await this.client.audio.transcriptions.create({
      model: "whisper-1",
      file,
    })

    return transcription.text
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

  async generateStructuredWithImage<TSchema extends ZodTypeAny>(
    input: StructuredPromptInput<TSchema> & { imageBase64: string; mimeType: string }
  ): Promise<ReturnType<TSchema["parse"]>> {
    const model = this.client.getGenerativeModel({
      model: this.modelName,
      generationConfig: {
        temperature: 0.1,
        responseMimeType: "application/json",
      },
    })

    const result = await model.generateContent([
      `${input.systemPrompt}\n\n${input.userPrompt}`,
      { inlineData: { mimeType: input.mimeType, data: input.imageBase64 } },
    ])
    const content = result.response.text()

    const parsed = JSON.parse(content)
    return input.schema.parse(parsed)
  }

  async parseImage(imageBase64: string, mimeType: string): Promise<ParsedTransaction> {
    return this.generateStructuredWithImage({
      systemPrompt: buildSystemPrompt(),
      userPrompt: "Extract the transaction details from this receipt or screenshot.",
      imageBase64,
      mimeType,
      schema: ParsedTransactionSchema,
    })
  }

  async transcribeAudio(audioBuffer: Buffer, mimeType: string): Promise<string> {
    const model = this.client.getGenerativeModel({ model: this.modelName })

    const result = await model.generateContent([
      "Transcribe this audio exactly. Return only the transcription text, no formatting or extra text.",
      { inlineData: { mimeType, data: audioBuffer.toString("base64") } },
    ])

    return result.response.text()
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
  const provider = (process.env.AI_PROVIDER ?? "gemini").toLowerCase()
  const hasOpenAIKey = Boolean(process.env.OPENAI_API_KEY)
  const hasGeminiKey = Boolean(process.env.GEMINI_API_KEY)

  switch (provider) {
    case "openai":
      if (hasOpenAIKey) {
        return new OpenAIProvider()
      }
      if (hasGeminiKey) {
        return new GeminiProvider()
      }
      throw new Error("OPENAI_API_KEY is not set and no GEMINI_API_KEY fallback is available")
    case "gemini":
    default:
      if (hasGeminiKey) {
        return new GeminiProvider()
      }
      if (hasOpenAIKey) {
        return new OpenAIProvider()
      }
      throw new Error("GEMINI_API_KEY is not set and no OPENAI_API_KEY fallback is available")
  }
}
