'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Card } from './ui/card'
import { Button } from './ui/button'
import { useState, useRef, useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { Textarea } from './ui/textarea'
import { ChatMessages } from './ChatMessages'

interface Message {
  role: 'user' | 'assistant' | 'system' | 'thinking'
  content: string
}

const MAX_MESSAGES = 10 // Adjust based on your needs
const SYSTEM_MESSAGE: Message = {
  role: 'system',
  content: 'I am an AI assistant that helps you analyze and search through your saved content. I maintain context throughout our conversation.'
}

export default function CreateContent() {
  const [messages, setMessages] = useState<Message[]>([SYSTEM_MESSAGE])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const chatContainerRef = useRef<HTMLDivElement>(null)

  const editor = useEditor({
    extensions: [StarterKit],
    content: '<p>Start writing here...</p>',
  })

  const getWindowedMessages = (newMessage: Message) => {
    // Always include system message and last MAX_MESSAGES
    const relevantMessages = messages
      .filter(m => m.role !== 'thinking' && m.role !== 'system')
      .slice(-MAX_MESSAGES)
    
    return [
      SYSTEM_MESSAGE,
      ...relevantMessages,
      newMessage
    ]
  }

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = { role: 'user', content: input }
    
    // Add user message to history
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    // Add thinking message
    setMessages(prev => [...prev, { 
      role: 'thinking', 
      content: 'Searching through your content database...' 
    }])

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: getWindowedMessages(userMessage)
        }),
      })
      
      const data = await response.json()
      
      // Remove thinking message and add AI response
      setMessages(prev => [
        ...prev.filter(m => m.role !== 'thinking'),
        { role: 'assistant', content: data.message }
      ])
    } catch (error) {
      console.error('Chat error:', error)
      setMessages(prev => [
        ...prev.filter(m => m.role !== 'thinking'),
        { role: 'assistant', content: 'Sorry, I encountered an error.' }
      ])
    } finally {
      setIsLoading(false)
    }
  }

  // Scroll to bottom when messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [messages])

  return (
    <div className="grid grid-cols-2 gap-4 h-[calc(100vh-8rem)]">
      {/* Editor Section - Static */}
      <Card className="p-4 overflow-hidden">
        <h2 className="text-xl font-bold mb-4">Editor</h2>
        <div className="prose max-w-none h-[calc(100%-4rem)]">
          <EditorContent 
            editor={editor} 
            className="min-h-full border p-4 rounded"
          />
        </div>
      </Card>

      {/* AI Chat Section - Fixed Height */}
      <Card className="h-full">
        <div className="flex flex-col h-full">
          <h2 className="text-xl font-bold p-4">AI Assistant</h2>
          
          {/* Messages Container - Scrollable */}
          <div className="flex-1 min-h-0"> {/* min-h-0 is crucial for nested flex scroll */}
            <ChatMessages messages={messages} />
          </div>

          {/* Input Area - Fixed at bottom */}
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    if (!isLoading) handleSendMessage()
                  }
                }}
                placeholder="Ask me anything about your content... (Shift+Enter for new line)"
                className="flex-1 min-h-[2.5rem] max-h-[8rem] resize-none"
                disabled={isLoading}
              />
              <Button 
                onClick={handleSendMessage} 
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Send'
                )}
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
} 