"use client"

import ReactMarkdown, { type Components } from "react-markdown"
import remarkGfm from "remark-gfm"
import { cn } from "@/lib/utils"

interface ChatMarkdownProps {
  content: string
  tone: "user" | "assistant"
}

interface TonePalette {
  link: string
  inlineCodeBg: string
  preBg: string
  blockquoteBorder: string
  tableBorder: string
  tableBorderSoft: string
  hr: string
}

const palettes: Record<"user" | "assistant", TonePalette> = {
  assistant: {
    link: "text-primary",
    inlineCodeBg: "bg-background/60",
    preBg: "bg-background border border-border",
    blockquoteBorder: "border-border",
    tableBorder: "border-border",
    tableBorderSoft: "border-border/50",
    hr: "border-border",
  },
  user: {
    link: "text-primary-foreground",
    inlineCodeBg: "bg-primary-foreground/15",
    preBg: "bg-primary-foreground/10",
    blockquoteBorder: "border-primary-foreground/40",
    tableBorder: "border-primary-foreground/30",
    tableBorderSoft: "border-primary-foreground/20",
    hr: "border-primary-foreground/30",
  },
}

const isBlockCode = (
  className: string | undefined,
  children: React.ReactNode,
): boolean => {
  if (className && /(^|\s)language-/.test(className)) return true
  if (typeof children === "string" && children.includes("\n")) return true
  if (Array.isArray(children)) {
    return children.some(
      (child) => typeof child === "string" && child.includes("\n"),
    )
  }
  return false
}

export const ChatMarkdown = ({ content, tone }: ChatMarkdownProps) => {
  const palette = palettes[tone]

  const components: Components = {
    p: ({ children }) => (
      <p className="leading-relaxed mb-3 last:mb-0">{children}</p>
    ),
    h1: ({ children }) => (
      <h1 className="text-lg font-semibold mt-4 mb-2 first:mt-0">{children}</h1>
    ),
    h2: ({ children }) => (
      <h2 className="text-base font-semibold mt-4 mb-2 first:mt-0">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-sm font-semibold mt-3 mb-1.5 first:mt-0">
        {children}
      </h3>
    ),
    h4: ({ children }) => (
      <h4 className="text-sm font-semibold mt-3 mb-1 first:mt-0">{children}</h4>
    ),
    ul: ({ children }) => (
      <ul className="list-disc pl-5 my-2 space-y-1">{children}</ul>
    ),
    ol: ({ children }) => (
      <ol className="list-decimal pl-5 my-2 space-y-1">{children}</ol>
    ),
    li: ({ children }) => <li className="leading-relaxed">{children}</li>,
    strong: ({ children }) => (
      <strong className="font-semibold">{children}</strong>
    ),
    em: ({ children }) => <em className="italic">{children}</em>,
    a: ({ children, href }) => (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          "underline underline-offset-2 hover:opacity-80 transition-opacity",
          palette.link,
        )}
      >
        {children}
      </a>
    ),
    blockquote: ({ children }) => (
      <blockquote
        className={cn(
          "border-l-2 pl-3 my-2 italic opacity-80",
          palette.blockquoteBorder,
        )}
      >
        {children}
      </blockquote>
    ),
    code: ({ className, children, ...props }) => {
      if (isBlockCode(className, children)) {
        return (
          <code className={cn("font-mono", className)} {...props}>
            {children}
          </code>
        )
      }
      return (
        <code
          className={cn(
            "px-1.5 py-0.5 rounded text-[0.85em] font-mono",
            palette.inlineCodeBg,
          )}
          {...props}
        >
          {children}
        </code>
      )
    },
    pre: ({ children }) => (
      <pre
        className={cn(
          "my-3 rounded-lg overflow-x-auto text-xs p-3 font-mono",
          palette.preBg,
        )}
      >
        {children}
      </pre>
    ),
    table: ({ children }) => (
      <div className="my-3 overflow-x-auto">
        <table className="w-full text-xs border-collapse">{children}</table>
      </div>
    ),
    thead: ({ children }) => (
      <thead className={cn("border-b", palette.tableBorder)}>{children}</thead>
    ),
    th: ({ children }) => (
      <th className="text-left font-semibold px-2 py-1">{children}</th>
    ),
    td: ({ children }) => (
      <td className={cn("px-2 py-1 border-b", palette.tableBorderSoft)}>
        {children}
      </td>
    ),
    hr: () => <hr className={cn("my-4", palette.hr)} />,
    img: ({ src, alt }) => (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt={alt ?? ""} className="rounded-lg max-w-full my-2" />
    ),
  }

  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
      {content}
    </ReactMarkdown>
  )
}
