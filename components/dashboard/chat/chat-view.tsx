"use client"

import { useState, useCallback, useRef } from "react"
import { MessageList } from "./message-list"
import { ChatInput } from "./chat-input"
import { ChatWelcome } from "./chat-welcome"
import type { ChatMessage, StreamEvent, ActionEvent } from "@/lib/ai/chat/types"

export function ChatView() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamingContent, setStreamingContent] = useState("")
  const abortRef = useRef<AbortController | null>(null)

  const processSSEStream = useCallback(
    async (
      response: Response,
      userMsgId: string,
      transcription?: string
    ) => {
      const reader = response.body?.getReader()
      if (!reader) return

      const decoder = new TextDecoder()
      let buffer = ""
      let fullContent = ""
      let lastAction: ActionEvent | undefined

      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split("\n")
          buffer = lines.pop() || ""

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue
            const jsonStr = line.slice(6).trim()
            if (!jsonStr) continue

            let event: StreamEvent
            try {
              event = JSON.parse(jsonStr)
            } catch {
              continue
            }

            switch (event.type) {
              case "text":
                fullContent += event.content
                setStreamingContent(fullContent)
                break
              case "action":
                lastAction = event as ActionEvent
                break
              case "transcription":
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === userMsgId
                      ? { ...m, transcription: event.type === "transcription" ? event.text : undefined }
                      : m
                  )
                )
                break
              case "error":
                fullContent += `\n\n*Error: ${event.message}*`
                setStreamingContent(fullContent)
                break
              case "done":
                break
            }
          }
        }
      } finally {
        reader.releaseLock()
      }

      if (fullContent) {
        const assistantMsg: ChatMessage = {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: fullContent,
          timestamp: Date.now(),
          action: lastAction,
        }
        setMessages((prev) => [...prev, assistantMsg])
      }

      setStreamingContent("")
      setIsStreaming(false)
    },
    []
  )

  const sendMessage = useCallback(
    async (
      body: BodyInit,
      headers: Record<string, string>,
      userMsg: ChatMessage
    ) => {
      setMessages((prev) => [...prev, userMsg])
      setIsStreaming(true)
      setStreamingContent("")

      abortRef.current = new AbortController()

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers,
          body,
          signal: abortRef.current.signal,
        })

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }

        await processSSEStream(response, userMsg.id)
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          const errorMsg: ChatMessage = {
            id: `error-${Date.now()}`,
            role: "assistant",
            content: "Sorry, something went wrong. Please try again.",
            timestamp: Date.now(),
          }
          setMessages((prev) => [...prev, errorMsg])
        }
        setIsStreaming(false)
        setStreamingContent("")
      }
    },
    [processSSEStream]
  )

  const handleSendText = useCallback(
    (text: string) => {
      const userMsg: ChatMessage = {
        id: `user-${Date.now()}`,
        role: "user",
        content: text,
        timestamp: Date.now(),
      }

      const allMessages = [
        ...messages.map((m) => ({ role: m.role, content: m.content })),
        { role: "user" as const, content: text },
      ]

      const body = JSON.stringify({ messages: allMessages })
      sendMessage(body, { "Content-Type": "application/json" }, userMsg)
    },
    [messages, sendMessage]
  )

  const handleSendAudio = useCallback(
    (blob: Blob) => {
      const userMsg: ChatMessage = {
        id: `user-${Date.now()}`,
        role: "user",
        content: "🎤 Voice message",
        timestamp: Date.now(),
      }

      const formData = new FormData()
      formData.append("audio", blob, "audio.webm")
      formData.append(
        "messages",
        JSON.stringify(messages.map((m) => ({ role: m.role, content: m.content })))
      )

      sendMessage(formData, {}, userMsg)
    },
    [messages, sendMessage]
  )

  const handleSendImage = useCallback(
    (file: File, caption: string) => {
      const userMsg: ChatMessage = {
        id: `user-${Date.now()}`,
        role: "user",
        content: caption || "📷 Image attached",
        timestamp: Date.now(),
      }

      const formData = new FormData()
      formData.append("image", file)
      formData.append("text", caption)
      formData.append(
        "messages",
        JSON.stringify(messages.map((m) => ({ role: m.role, content: m.content })))
      )

      sendMessage(formData, {}, userMsg)
    },
    [messages, sendMessage]
  )

  const handleSelectPrompt = useCallback(
    (prompt: string) => {
      handleSendText(prompt)
    },
    [handleSendText]
  )

  const isEmpty = messages.length === 0 && !isStreaming

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {isEmpty ? (
        <ChatWelcome onSelectPrompt={handleSelectPrompt} />
      ) : (
        <MessageList
          messages={messages}
          isStreaming={isStreaming}
          streamingContent={streamingContent}
        />
      )}

      <ChatInput
        onSendText={handleSendText}
        onSendAudio={handleSendAudio}
        onSendImage={handleSendImage}
        disabled={isStreaming}
      />
    </div>
  )
}
