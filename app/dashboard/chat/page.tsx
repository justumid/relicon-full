"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Send, Paperclip, ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { CubeIcon } from "@/components/icons/CubeIcon"
import { toast } from "sonner"
import { useAuth } from "@/lib/auth"

interface Message {
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

const initialMessages: Message[] = [
  {
    role: "assistant",
    content:
      "Hello! I'm Relicon AI, your creative advertising assistant. I can help you:\n\n• Analyze your ad performance (CTR, ROAS, conversions)\n• Identify top-performing campaigns\n• Optimize your budget allocation\n• Understand advertising metrics\n• Get recommendations to improve ROI\n\nI have access to your real-time analytics data. What would you like to know?",
    timestamp: new Date(),
  },
]

// Suggested questions for quick access
const suggestedQuestions = [
  "How are my campaigns performing?",
  "What's my best ROAS campaign?",
  "How can I improve my CTR?",
  "Which platform is performing best?",
  "Should I increase my budget?",
  "What's a good ROAS benchmark?",
]

export default function ChatPage() {
  const { user } = useAuth()
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || isTyping) return

    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date(),
    }

    // Add user message immediately
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsTyping(true)

    try {
      // Prepare conversation history (exclude initial greeting for API)
      const conversationHistory = messages
        .slice(1) // Skip the initial greeting
        .map(msg => ({
          role: msg.role,
          content: msg.content
        }))

      // Add current user message
      conversationHistory.push({
        role: userMessage.role,
        content: userMessage.content
      })

      // Call chat API with streaming
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: conversationHistory,
          userId: user?.id || 'anonymous',
          stream: true
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to get response')
      }

      // Handle streaming response
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) {
        throw new Error('No response stream available')
      }

      // Create initial AI message
      const aiMessage: Message = {
        role: "assistant",
        content: "",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, aiMessage])

      let accumulatedContent = ""

      while (true) {
        const { done, value } = await reader.read()
        
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            
            if (data === '[DONE]') {
              setIsTyping(false)
              return
            }

            try {
              const parsed = JSON.parse(data)
              if (parsed.content) {
                accumulatedContent += parsed.content
                
                // Update the last message with accumulated content
                setMessages((prev) => {
                  const newMessages = [...prev]
                  const lastMessage = newMessages[newMessages.length - 1]
                  if (lastMessage && lastMessage.role === 'assistant') {
                    lastMessage.content = accumulatedContent
                  }
                  return newMessages
                })
              }
            } catch (e) {
              // Ignore parsing errors for malformed chunks
            }
          }
        }
      }

    } catch (error: any) {
      console.error('Chat error:', error)

      // Remove the empty AI message if it exists
      setMessages((prev) => {
        const newMessages = [...prev]
        const lastMessage = newMessages[newMessages.length - 1]
        if (lastMessage && lastMessage.role === 'assistant' && !lastMessage.content) {
          newMessages.pop()
        }
        return newMessages
      })

      // Add error message
      const errorMessage: Message = {
        role: "assistant",
        content: "I apologize, but I encountered an error processing your request. Please make sure your OpenAI API key is configured and try again.",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, errorMessage])
      toast.error('Failed to send message: ' + error.message)
    } finally {
      setIsTyping(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="h-screen flex flex-col bg-[#0a0a0a]">
      <div className="border-b border-[#1f1f1f] bg-[#0d0d0d] px-6 xl:px-8 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#161616] border border-[#252525] rounded-xl flex items-center justify-center">
            <CubeIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-white">Relicon AI</h1>
            <p className="text-sm text-gray-500">Your creative advertising assistant</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 xl:px-8 py-6">
        <div className="xl:max-w-none max-w-4xl mx-auto space-y-6">
          {messages.map((message, index) => (
            <div key={index} className={`flex gap-4 ${message.role === "user" ? "justify-end" : "justify-start"}`}>
              {message.role === "assistant" && (
                <div className="w-8 h-8 bg-[#161616] border border-[#252525] rounded-lg flex items-center justify-center shrink-0">
                  <CubeIcon className="w-5 h-5 text-white" />
                </div>
              )}
              <div
                className={`max-w-[70%] rounded-2xl px-5 py-3 ${
                  message.role === "user"
                    ? "bg-[#1a1a1a] text-white border border-[#252525]"
                    : "bg-[#161616] text-gray-200 border border-[#252525]"
                }`}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                <p className="text-xs mt-2 opacity-60">
                  {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
              {message.role === "user" && (
                <div className="w-8 h-8 bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] rounded-lg flex items-center justify-center shrink-0">
                  <span className="text-white text-sm font-medium">U</span>
                </div>
              )}
            </div>
          ))}

          {/* Suggested Questions - Show only if conversation just started */}
          {messages.length === 1 && !isTyping && (
            <div className="space-y-3 mt-6">
              <p className="text-gray-400 text-sm font-medium px-2">Suggested questions:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {suggestedQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => setInput(question)}
                    className="text-left p-3 rounded-lg bg-[#161616] border border-[#252525] hover:border-[#404040] hover:bg-[#1a1a1a] transition-colors text-gray-300 text-sm"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}

          {isTyping && (
            <div className="flex gap-4 justify-start">
              <div className="w-8 h-8 bg-[#161616] border border-[#252525] rounded-lg flex items-center justify-center shrink-0">
                <CubeIcon className="w-5 h-5 text-white" />
              </div>
              <div className="bg-[#161616] border border-[#252525] rounded-2xl px-5 py-3">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div
                    className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  />
                  <div
                    className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="border-t border-[#1f1f1f] bg-[#0d0d0d] px-6 xl:px-8 py-4">
        <div className="xl:max-w-none max-w-4xl mx-auto">
          <div className="relative bg-[#161616] border border-[#252525] rounded-2xl p-4">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask Relicon AI anything... (Shift + Enter for new line)"
              className="min-h-[60px] max-h-[200px] resize-none bg-transparent border-0 text-gray-200 placeholder:text-gray-600 focus-visible:ring-0 focus-visible:ring-offset-0 p-0"
            />

            <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#252525]">
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 text-gray-500 hover:text-gray-300 hover:bg-[#1f1f1f]"
                >
                  <Paperclip className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 text-gray-500 hover:text-gray-300 hover:bg-[#1f1f1f]"
                >
                  <ImageIcon className="w-4 h-4" />
                </Button>
              </div>

              <Button
                onClick={handleSend}
                disabled={!input.trim()}
                className="bg-white hover:bg-gray-200 text-black rounded-lg px-6 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4 mr-2" />
                Send
              </Button>
            </div>
          </div>

          <p className="text-xs text-gray-600 text-center mt-3">
            Relicon AI can make mistakes. Consider checking important information.
          </p>
        </div>
      </div>
    </div>
  )
}
