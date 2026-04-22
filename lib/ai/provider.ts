import OpenAI from "openai"
import { wrapOpenAI } from "langsmith/wrappers"
import { traceable } from "langsmith/traceable"
import { GoogleGenerativeAI } from "@google/generative-ai"
import type { ZodTypeAny } from "zod"
import { ParsedTransactionSchema, type ParsedTransaction } from "./types"
import { buildSystemPrompt } from "./prompt"

// When LANGSMITH_TRACING=true and LANGSMITH_API_KEY is set, wrapOpenAI routes
// every OpenAI call through LangSmith so traces show up in the configured
// project. Without those env vars it's a no-op — zero runtime cost.
const LANGSMITH_ENABLED =
  process.env.LANGSMITH_TRACING === "true" && Boolean(process.env.LANGSMITH_API_KEY)

const WHISPER_TRANSCRIPTION_PROMPT =
  "Personal finance assistant. User speaks Spanish or English about transactions, budgets, debts, expenses, income, COP, pesos, tarjeta de crédito, gastos, ingresos, presupuesto."

const GEMINI_TRANSCRIPTION_PROMPT =
  "Return ONLY the verbatim transcription of the speech in this audio. Do not guess, do not paraphrase, do not add punctuation beyond what is clearly spoken. If the audio contains no speech or is silent or is noise only, return the exact string 'NO_SPEECH' and nothing else."

const HALLUCINATION_PHRASES: Set<string> = new Set([
  "thanks for watching",
  "thank you for watching",
  "please subscribe",
  "subscribe to the channel",
  "you",
  "",
  "...",
  "-",
  "bye",
  "gracias por ver el video",
  "gracias por ver",
  "suscribete",
  "suscribanse",
  "subtitulos realizados por la comunidad de amara.org",
  "subtítulos realizados por la comunidad de amara.org",
  "amara.org",
  "thanks",
  "thank you",
  "music",
  "[music]",
  "[música]",
  "applause",
  "[applause]",
  "no_speech",
])

function normalizeForHallucinationCheck(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/^[\s.,!?¡¿"'()\-–—…]+|[\s.,!?¡¿"'()\-–—…]+$/g, "")
}

export function filterWhisperHallucinations(text: string): string {
  if (!text) return ""
  const trimmed = text.trim()
  if (trimmed.length < 2) return ""
  const normalized = normalizeForHallucinationCheck(trimmed)
  if (HALLUCINATION_PHRASES.has(normalized)) return ""
  return trimmed
}

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

export type ChatStreamChunk =
  | { type: "text"; content: string }
  | { type: "tool_call"; id: string; name: string; arguments: string }
  | { type: "tool_call_delta"; id: string; arguments: string }
  | { type: "done" }

export type ChatToolDef = {
  type: "function"
  function: {
    name: string
    description: string
    parameters: Record<string, unknown>
  }
}

export type ChatMessageInput = {
  role: "system" | "user" | "assistant" | "tool"
  content: string
  tool_call_id?: string
  tool_calls?: Array<{ id: string; type: "function"; function: { name: string; arguments: string } }>
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
  streamChatWithTools(
    messages: ChatMessageInput[],
    tools: ChatToolDef[]
  ): Promise<AsyncIterable<ChatStreamChunk>>
  streamText(systemPrompt: string, userPrompt: string): Promise<AsyncIterable<string>>
  getProviderName(): string
  getModelName(): string
}

class OpenAIProvider implements AIProvider {
  private client: OpenAI
  private modelName = "gpt-4o-mini"

  constructor() {
    const raw = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    this.client = LANGSMITH_ENABLED ? wrapOpenAI(raw) : raw
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
    const baseMime = mimeType.split(";")[0]
    const ext = baseMime.split("/")[1]?.replace("mpeg", "mp3") || "webm"
    const uint8 = new Uint8Array(audioBuffer)
    const file = new File([uint8], `audio.${ext}`, { type: baseMime })

    const transcription = await this.client.audio.transcriptions.create({
      model: "whisper-1",
      file,
      temperature: 0,
      prompt: WHISPER_TRANSCRIPTION_PROMPT,
    })

    return filterWhisperHallucinations(transcription.text)
  }

  async *_streamChatWithTools(
    messages: ChatMessageInput[],
    tools: ChatToolDef[]
  ): AsyncIterable<ChatStreamChunk> {
    const openaiMessages = messages.map((m) => {
      if (m.role === "tool") {
        return { role: "tool" as const, content: m.content, tool_call_id: m.tool_call_id! }
      }
      if (m.role === "assistant" && m.tool_calls) {
        return { role: "assistant" as const, content: m.content || null, tool_calls: m.tool_calls }
      }
      return { role: m.role as "system" | "user" | "assistant", content: m.content }
    })

    const stream = await this.client.chat.completions.create({
      model: "gpt-4o-mini",
      stream: true,
      messages: openaiMessages,
      tools: tools.length > 0 ? tools : undefined,
    })

    const toolCalls = new Map<number, { id: string; name: string; arguments: string }>()

    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta
      if (!delta) continue

      if (delta.content) {
        yield { type: "text", content: delta.content }
      }

      if (delta.tool_calls) {
        for (const tc of delta.tool_calls) {
          const idx = tc.index
          if (tc.id) {
            toolCalls.set(idx, { id: tc.id, name: tc.function?.name ?? "", arguments: "" })
            yield { type: "tool_call", id: tc.id, name: tc.function?.name ?? "", arguments: "" }
          }
          if (tc.function?.arguments) {
            const existing = toolCalls.get(idx)
            if (existing) {
              existing.arguments += tc.function.arguments
              yield { type: "tool_call_delta", id: existing.id, arguments: tc.function.arguments }
            }
          }
        }
      }

      if (chunk.choices[0]?.finish_reason) {
        yield { type: "done" }
      }
    }
  }

  async streamChatWithTools(
    messages: ChatMessageInput[],
    tools: ChatToolDef[]
  ): Promise<AsyncIterable<ChatStreamChunk>> {
    return this._streamChatWithTools(messages, tools)
  }

  async *_streamText(systemPrompt: string, userPrompt: string): AsyncIterable<string> {
    const stream = await this.client.chat.completions.create({
      model: "gpt-4o-mini",
      stream: true,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    })

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content
      if (content) yield content
    }
  }

  async streamText(systemPrompt: string, userPrompt: string): Promise<AsyncIterable<string>> {
    return this._streamText(systemPrompt, userPrompt)
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
  private modelName = "gemini-2.5-flash"

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
    const baseMime = mimeType.split(";")[0]

    const result = await model.generateContent([
      GEMINI_TRANSCRIPTION_PROMPT,
      { inlineData: { mimeType: baseMime, data: audioBuffer.toString("base64") } },
    ])

    const raw = result.response.text().trim()
    const normalized = raw.toLowerCase().replace(/^[\s.,!?¡¿"'()\-–—…]+|[\s.,!?¡¿"'()\-–—…]+$/g, "")
    if (normalized === "no_speech") return ""
    return filterWhisperHallucinations(raw)
  }

  async *_streamChatWithTools(
    messages: ChatMessageInput[],
    tools: ChatToolDef[]
  ): AsyncIterable<ChatStreamChunk> {
    const model = this.client.getGenerativeModel({
      model: this.modelName,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      tools: tools.length > 0
        ? [{
            functionDeclarations: tools.map((t) => ({
              name: t.function.name,
              description: t.function.description,
              parameters: t.function.parameters,
            })),
          }] as any
        : undefined,
    })

    const systemMsg = messages.find((m) => m.role === "system")
    const chatMessages = messages.filter((m) => m.role !== "system")

    const history = chatMessages.slice(0, -1).map((m) => ({
      role: m.role === "assistant" ? ("model" as const) : ("user" as const),
      parts: [{ text: m.content }],
    }))

    const lastMsg = chatMessages[chatMessages.length - 1]
    const chat = model.startChat({
      history,
      ...(systemMsg ? { systemInstruction: { role: "user" as const, parts: [{ text: systemMsg.content }] } } : {}),
    })

    // `sendMessageStream` doesn't go through LangChain, so wrap the call with
    // `traceable` so LangSmith still captures the span when tracing is on.
    const sendMessage = LANGSMITH_ENABLED
      ? traceable(
          (input: string) => chat.sendMessageStream(input),
          { name: "gemini.chat.sendMessageStream", run_type: "llm" }
        )
      : (input: string) => chat.sendMessageStream(input)

    const result = await sendMessage(lastMsg?.content ?? "")

    for await (const chunk of result.stream) {
      const text = chunk.text()
      if (text) {
        yield { type: "text", content: text }
      }

      const calls = chunk.functionCalls()
      if (calls) {
        for (const call of calls) {
          const callId = `call_${Date.now()}_${call.name}`
          yield {
            type: "tool_call",
            id: callId,
            name: call.name,
            arguments: JSON.stringify(call.args),
          }
        }
      }
    }

    yield { type: "done" }
  }

  async streamChatWithTools(
    messages: ChatMessageInput[],
    tools: ChatToolDef[]
  ): Promise<AsyncIterable<ChatStreamChunk>> {
    return this._streamChatWithTools(messages, tools)
  }

  async *_streamText(systemPrompt: string, userPrompt: string): AsyncIterable<string> {
    const model = this.client.getGenerativeModel({ model: this.modelName })
    const result = await model.generateContentStream(`${systemPrompt}\n\n${userPrompt}`)

    for await (const chunk of result.stream) {
      const text = chunk.text()
      if (text) yield text
    }
  }

  async streamText(systemPrompt: string, userPrompt: string): Promise<AsyncIterable<string>> {
    return this._streamText(systemPrompt, userPrompt)
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

export function hasAIProvider(): boolean {
  return Boolean(process.env.OPENAI_API_KEY) || Boolean(process.env.GEMINI_API_KEY)
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
