import { Annotation, StateGraph, START, END } from "@langchain/langgraph"
import { getAIProvider } from "./provider"
import {
  MultimodalParseResultSchema,
  type MultimodalParseResult,
} from "./multimodal-types"
import {
  buildMultimodalSystemPrompt,
  buildImageIntentPrompt,
} from "./multimodal-prompt"

const MultimodalState = Annotation.Root({
  inputType: Annotation<"text" | "image" | "audio">,
  rawText: Annotation<string | undefined>,
  imageBase64: Annotation<string | undefined>,
  imageMimeType: Annotation<string | undefined>,
  audioBuffer: Annotation<Buffer | undefined>,
  audioMimeType: Annotation<string | undefined>,
  transcribedText: Annotation<string | undefined>,
  result: Annotation<MultimodalParseResult | undefined>,
  error: Annotation<string | undefined>,
})

type MultimodalStateType = typeof MultimodalState.State

async function transcribeNode(
  state: MultimodalStateType
): Promise<Partial<MultimodalStateType>> {
  const provider = getAIProvider()

  if (!state.audioBuffer || !state.audioMimeType) {
    return { error: "No audio data provided" }
  }

  try {
    const text = await provider.transcribeAudio(state.audioBuffer, state.audioMimeType)
    return { transcribedText: text }
  } catch (err) {
    return { error: `Audio transcription failed: ${err instanceof Error ? err.message : "Unknown error"}` }
  }
}

async function classifyAndExtractNode(
  state: MultimodalStateType
): Promise<Partial<MultimodalStateType>> {
  const provider = getAIProvider()
  const text = state.transcribedText ?? state.rawText

  if (!text) {
    return { error: "No text to classify" }
  }

  try {
    const result = await provider.generateStructured({
      systemPrompt: buildMultimodalSystemPrompt(),
      userPrompt: text,
      schema: MultimodalParseResultSchema,
    })
    return { result }
  } catch (err) {
    return { error: `Intent classification failed: ${err instanceof Error ? err.message : "Unknown error"}` }
  }
}

async function extractFromImageNode(
  state: MultimodalStateType
): Promise<Partial<MultimodalStateType>> {
  const provider = getAIProvider()

  if (!state.imageBase64 || !state.imageMimeType) {
    return { error: "No image data provided" }
  }

  try {
    const result = await provider.generateStructuredWithImage({
      systemPrompt: buildImageIntentPrompt(),
      userPrompt: "Analyze the image and extract the financial data. Return JSON with intent and data.",
      imageBase64: state.imageBase64,
      mimeType: state.imageMimeType,
      schema: MultimodalParseResultSchema,
    })
    return { result }
  } catch (err) {
    return { error: `Image extraction failed: ${err instanceof Error ? err.message : "Unknown error"}` }
  }
}

function routeByInputType(state: MultimodalStateType): string {
  switch (state.inputType) {
    case "audio":
      return "transcribe"
    case "image":
      return "extractFromImage"
    case "text":
    default:
      return "classifyAndExtract"
  }
}

const graph = new StateGraph(MultimodalState)
  .addNode("transcribe", transcribeNode)
  .addNode("classifyAndExtract", classifyAndExtractNode)
  .addNode("extractFromImage", extractFromImageNode)
  .addConditionalEdges(START, routeByInputType, {
    transcribe: "transcribe",
    extractFromImage: "extractFromImage",
    classifyAndExtract: "classifyAndExtract",
  })
  .addEdge("transcribe", "classifyAndExtract")
  .addEdge("classifyAndExtract", END)
  .addEdge("extractFromImage", END)

const compiledGraph = graph.compile()

export type MultimodalInput = {
  type: "text" | "image" | "audio"
  text?: string
  imageBase64?: string
  imageMimeType?: string
  audioBuffer?: Buffer
  audioMimeType?: string
}

export async function runMultimodalGraph(
  input: MultimodalInput
): Promise<MultimodalParseResult> {
  const result = await compiledGraph.invoke({
    inputType: input.type,
    rawText: input.text,
    imageBase64: input.imageBase64,
    imageMimeType: input.imageMimeType,
    audioBuffer: input.audioBuffer,
    audioMimeType: input.audioMimeType,
    transcribedText: undefined,
    result: undefined,
    error: undefined,
  })

  if (result.error) {
    throw new Error(result.error)
  }

  if (!result.result) {
    throw new Error("No result produced by the multimodal pipeline")
  }

  return result.result
}
