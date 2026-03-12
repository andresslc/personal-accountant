"use client"

import { Bot, User } from "lucide-react"
import { ActionCard } from "./action-card"
import type { ChatMessage } from "@/lib/ai/chat/types"

interface MessageBubbleProps {
  message: ChatMessage
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user"

  return (
    <div className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-1">
          <Bot className="w-4 h-4 text-primary" />
        </div>
      )}

      <div className={`max-w-[80%] min-w-0 ${isUser ? "order-first" : ""}`}>
        {message.transcription && (
          <div className="text-xs text-muted-foreground mb-1 italic">
            Heard: &quot;{message.transcription}&quot;
          </div>
        )}

        <div
          className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap break-words [overflow-wrap:anywhere] ${
            isUser
              ? "bg-primary text-primary-foreground rounded-br-md"
              : "bg-muted text-foreground rounded-bl-md"
          }`}
        >
          {message.content}
        </div>

        {message.action && (
          <ActionCard
            kind={message.action.action.kind}
            data={message.action.action.data}
          />
        )}
      </div>

      {isUser && (
        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0 mt-1">
          <User className="w-4 h-4 text-muted-foreground" />
        </div>
      )}
    </div>
  )
}
