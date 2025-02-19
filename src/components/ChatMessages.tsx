'use client'

import { useEffect, useRef } from 'react'
import { Loader2 } from 'lucide-react'
import ReactMarkdown from 'react-markdown'

interface Message {
  role: 'user' | 'assistant' | 'system' | 'thinking'
  content: string
}

interface ChatMessagesProps {
  messages: Message[]
}

export function ChatMessages({ messages }: ChatMessagesProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className="h-full overflow-y-auto px-4">
      <div className="space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`
              ${message.role === 'user' 
                ? 'ml-auto bg-blue-500 text-white' 
                : message.role === 'thinking'
                ? 'bg-gray-100 italic'
                : 'bg-gray-100'
              }
              ${message.role !== 'thinking' ? 'max-w-[80%]' : 'w-full'}
              p-3 rounded-lg
            `}
          >
            {message.role === 'thinking' ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{message.content}</span>
              </div>
            ) : (
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <ReactMarkdown>
                  {message.content}
                </ReactMarkdown>
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
    </div>
  )
} 