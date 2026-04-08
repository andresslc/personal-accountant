"use client"

import { useEffect, useRef } from "react"
import { MessageBubble } from "./message-bubble"
import { TypingIndicator } from "./typing-indicator"
import type { ActionEvent, ChatMessage } from "@/lib/ai/chat/types"

interface MessageListProps {
  messages: ChatMessage[]
  isStreaming: boolean
  streamingContent: string
  streamingActions?: ActionEvent[]
}

export function MessageList({
  messages,
  isStreaming,
  streamingContent,
  streamingActions,
}: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, streamingContent, streamingActions])

  return (
    <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-6 space-y-5">
      {messages.map((msg) => (
        <MessageBubble key={msg.id} message={msg} />
      ))}

      {isStreaming && (streamingContent || (streamingActions && streamingActions.length > 0)) && (
        <MessageBubble
          message={{
            id: "streaming",
            role: "assistant",
            content: streamingContent,
            timestamp: Date.now(),
            actions: streamingActions && streamingActions.length > 0 ? streamingActions : undefined,
          }}
          isStreaming={Boolean(streamingContent)}
        />
      )}

      {isStreaming && !streamingContent && (!streamingActions || streamingActions.length === 0) && (
        <TypingIndicator />
      )}

      <div ref={bottomRef} />
    </div>
  )
}
