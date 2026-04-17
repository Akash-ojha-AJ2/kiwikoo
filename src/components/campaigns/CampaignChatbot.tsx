'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, MessageSquare } from 'lucide-react'
import { toast } from '@/lib/simple-sonner'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export default function CampaignChatbot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content:
        "Hello! I'm your AI campaign assistant. I can analyze your campaigns, compare performance, suggest ideas, and help with budgets and influencers. Ask me anything about your existing or new campaigns.",
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || loading) return

    const userMessage = input.trim()
    setInput('')
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }])
    setLoading(true)

    try {
      const response = await fetch('/api/campaigns/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          conversationHistory: messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get response')
      }

      const data = await response.json()
      setMessages((prev) => [...prev, { role: 'assistant', content: data.response }])
    } catch (error) {
      toast.error('Failed to get AI response. Please try again.')
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: "I couldn't complete that. Please check your connection and try again.",
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-full flex flex-col bg-white border-[3px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
      {/* Header */}
      <div className="flex items-center gap-2 p-4 border-b-[3px] border-black bg-[#FFD93D]">
        <div className="w-10 h-10 border-2 border-black flex items-center justify-center bg-white">
          <MessageSquare className="w-5 h-5" strokeWidth={2.5} />
        </div>
        <div>
          <h2 className="text-lg font-black uppercase tracking-tight text-black">
            Campaign Assistant
          </h2>
          <p className="text-xs font-bold text-black/70">
            Analyze campaigns · Ideas · Budgets · Influencers
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[320px] max-h-[520px]">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex gap-2 items-start ${
              message.role === 'user' ? 'flex-row-reverse' : ''
            }`}
          >
            {message.role === 'assistant' && (
              <div className="w-9 h-9 border-2 border-black flex items-center justify-center flex-shrink-0 bg-[#B4F056]">
                <Bot className="w-4 h-4 text-black" strokeWidth={2.5} />
              </div>
            )}
            <div
              className={`max-w-[85%] border-2 border-black px-4 py-2.5 ${
                message.role === 'user'
                  ? 'bg-black text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'
                  : 'bg-[#f5f5f5] text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap leading-relaxed font-medium">
                {message.content}
              </p>
            </div>
            {message.role === 'user' && (
              <div className="w-9 h-9 border-2 border-black flex items-center justify-center flex-shrink-0 bg-white">
                <User className="w-4 h-4 text-black" strokeWidth={2.5} />
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex gap-2 items-start">
            <div className="w-9 h-9 border-2 border-black flex items-center justify-center flex-shrink-0 bg-[#B4F056]">
              <Bot className="w-4 h-4 text-black" strokeWidth={2.5} />
            </div>
            <div className="border-2 border-black px-4 py-2.5 bg-[#f5f5f5] shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-black animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-black animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-black animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="p-4 border-t-[3px] border-black bg-white flex gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about your campaigns, performance, budgets..."
          disabled={loading}
          className="flex-1 px-4 py-3 border-2 border-black font-medium focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] outline-none placeholder:text-black/50"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="p-3 bg-[#B4F056] border-2 border-black font-black uppercase text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-shadow"
          aria-label="Send message"
        >
          <Send className="w-5 h-5" strokeWidth={2.5} />
        </button>
      </form>
    </div>
  )
}
