import { Bot, User } from "lucide-react"
import { ActionCard } from "./action-card"
import { ChatMarkdown } from "./chat-markdown"
import type { ChatMessage } from "@/lib/ai/chat/types"

interface MessageBubbleProps {
  message: ChatMessage
  isStreaming?: boolean
}

export function MessageBubble({ message, isStreaming }: MessageBubbleProps) {
  const isUser = message.role === "user"

  return (
    <div
      className={`flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-200 ${
        isUser ? "justify-end" : "justify-start"
      }`}
    >
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
          className={`px-4 py-3 rounded-2xl text-sm leading-relaxed break-words [overflow-wrap:anywhere] ${
            isUser
              ? "bg-primary text-primary-foreground rounded-br-md"
              : "bg-muted text-foreground rounded-bl-lg"
          }`}
        >
          <ChatMarkdown
            content={message.content}
            tone={isUser ? "user" : "assistant"}
          />
          {isStreaming && (
            <span
              aria-hidden
              className="inline-block w-1.5 h-3.5 ml-0.5 -mb-0.5 bg-current opacity-70 animate-pulse align-middle"
            />
          )}
        </div>

        {message.actions && message.actions.length > 0 && (
          <div className="space-y-2">
            {message.actions.map((a, i) => (
              <ActionCard
                key={`${a.action.kind}-${i}`}
                kind={a.action.kind}
                data={a.action.data}
              />
            ))}
          </div>
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
