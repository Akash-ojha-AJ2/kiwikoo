'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from '@/lib/simple-sonner'
import {
    Inbox,
    Search,
    Send,
    Loader2,
    MessageCircle,
    ChevronLeft,
} from 'lucide-react'

interface Conversation {
    id: string
    other_party: {
        id: string
        name: string
        email: string
    }
    last_message?: string
    last_message_at?: string
    unread_count: number
}

interface Message {
    id: string
    sender_id: string
    content: string
    created_at: string
    read: boolean
}

export default function BrandInboxPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const [conversations, setConversations] = useState<Conversation[]>([])
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
    const [messages, setMessages] = useState<Message[]>([])
    const [newMessage, setNewMessage] = useState('')
    const [loading, setLoading] = useState(true)
    const [sending, setSending] = useState(false)
    const [currentUserId, setCurrentUserId] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState('')

    useEffect(() => {
        fetchCurrentUser()
        fetchConversations()
    }, [])

    useEffect(() => {
        // Check if we should start a new conversation
        const toId = searchParams.get('to')
        if (toId && currentUserId) {
            startConversation(toId)
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams, currentUserId])

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    const fetchCurrentUser = async () => {
        try {
            const res = await fetch('/api/auth/me')
            const data = await res.json()
            if (res.ok && data.user) {
                setCurrentUserId(data.user.id)
            }
        } catch (error) {
            console.error('Failed to fetch current user:', error)
        }
    }

    const fetchConversations = async () => {
        try {
            const res = await fetch('/api/conversations')
            const data = await res.json()

            if (!res.ok) throw new Error(data.error)

            const nextConversations = data.conversations || []
            setConversations(nextConversations)
            return nextConversations as Conversation[]
        } catch (error) {
            console.error('Failed to fetch conversations:', error)
            toast.error('Failed to load conversations')
            return [] as Conversation[]
        } finally {
            setLoading(false)
        }
    }

    const startConversation = async (recipientId: string) => {
        try {
            const res = await fetch('/api/conversations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ recipient_id: recipientId }),
            })

            const data = await res.json()

            if (!res.ok) throw new Error(data.error)

            // Refresh conversations and select the new one
            const nextConversations = await fetchConversations()

            // Find and select the conversation
            const conv = nextConversations.find(c =>
                c.other_party.id === recipientId
            ) || {
                id: data.conversation.id,
                other_party: {
                    id: recipientId,
                    name: 'User',
                    email: '',
                },
                unread_count: 0,
            }

            selectConversation(conv)

            // Clear the URL param
            router.replace('/brand/inbox')
        } catch (error) {
            console.error('Failed to start conversation:', error)
            toast.error('Failed to start conversation')
        }
    }

    const selectConversation = async (conversation: Conversation) => {
        setSelectedConversation(conversation)
        setMessages([])

        try {
            const res = await fetch(`/api/conversations/${conversation.id}/messages`)
            const data = await res.json()

            if (!res.ok) throw new Error(data.error)

            setMessages(data.messages || [])
            setConversations(prev => prev.map((item) =>
                item.id === conversation.id
                    ? { ...item, unread_count: 0 }
                    : item
            ))
            setSelectedConversation((prev) =>
                prev && prev.id === conversation.id
                    ? { ...prev, unread_count: 0 }
                    : conversation
            )
        } catch (error) {
            console.error('Failed to fetch messages:', error)
            toast.error('Failed to load messages')
        }
    }

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newMessage.trim() || !selectedConversation || sending) return

        setSending(true)
        const content = newMessage.trim()
        setNewMessage('')

        // Optimistic update
        const optimisticMessage: Message = {
            id: `temp-${Date.now()}`,
            sender_id: currentUserId || '',
            content,
            created_at: new Date().toISOString(),
            read: false,
        }
        setMessages(prev => [...prev, optimisticMessage])

        try {
            const res = await fetch(`/api/conversations/${selectedConversation.id}/messages`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content }),
            })

            const data = await res.json()

            if (!res.ok) throw new Error(data.error)

            // Replace optimistic message with real one
            setMessages(prev => prev.map(m =>
                m.id === optimisticMessage.id ? data.message : m
            ))
            const sentAt = data.message?.created_at || optimisticMessage.created_at
            setConversations(prev => prev.map((item) =>
                item.id === selectedConversation.id
                    ? {
                        ...item,
                        last_message: content,
                        last_message_at: sentAt,
                    }
                    : item
            ))
        } catch (error) {
            console.error('Failed to send message:', error)
            toast.error('Failed to send message')
            // Remove optimistic message on error
            setMessages(prev => prev.filter(m => m.id !== optimisticMessage.id))
            setNewMessage(content)
        } finally {
            setSending(false)
        }
    }

    const filteredConversations = useMemo(() => {
        const query = searchQuery.trim().toLowerCase()
        if (!query) return conversations

        return conversations.filter((conversation) =>
            conversation.other_party.name.toLowerCase().includes(query) ||
            conversation.other_party.email.toLowerCase().includes(query) ||
            (conversation.last_message || '').toLowerCase().includes(query)
        )
    }, [conversations, searchQuery])

    const formatTime = (dateString: string) => {
        const date = new Date(dateString)
        const now = new Date()
        const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

        if (diffDays === 0) {
            return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
        } else if (diffDays === 1) {
            return 'Yesterday'
        } else if (diffDays < 7) {
            return date.toLocaleDateString('en-US', { weekday: 'short' })
        } else {
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-black" />
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 animate-fade-in">
            <h1 className="text-2xl sm:text-3xl font-black text-black mb-6">
                <Inbox className="inline-block w-8 h-8 mr-2 -mt-1" />
                Inbox
            </h1>

            <div className="bg-white border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex min-h-[68dvh] lg:h-[calc(100dvh-220px)]">
                {/* Conversations List */}
                <div className={`w-full md:w-80 border-r-[3px] border-black flex flex-col ${selectedConversation ? 'hidden md:flex' : 'flex'}`}>
                    <div className="p-4 border-b-2 border-black">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black/40" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search conversations..."
                                className="w-full pl-9 pr-4 py-2 border-2 border-black text-sm font-medium focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] outline-none"
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {filteredConversations.length === 0 ? (
                            <div className="p-6 text-center">
                                <MessageCircle className="w-12 h-12 mx-auto mb-3 text-black/20" />
                                <p className="text-black/60 font-medium text-sm">
                                    {searchQuery.trim() ? 'No matching conversations' : 'No conversations yet'}
                                </p>
                                <p className="text-black/40 text-xs mt-1">
                                    {searchQuery.trim() ? 'Try a different name or email' : 'Start by messaging an influencer'}
                                </p>
                            </div>
                        ) : (
                            filteredConversations.map(conv => (
                                <button type="button"
                                    key={conv.id}
                                    onClick={() => selectConversation(conv)}
                                    className={`w-full p-4 text-left border-b-2 border-black/10 hover:bg-gray-50 hover:-translate-y-[1px] transition-all ${selectedConversation?.id === conv.id ? 'bg-[#B4F056]/20' : ''
                                        }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 bg-gradient-to-br from-[#B4F056] to-[#FFD93D] border-2 border-black flex items-center justify-center shrink-0">
                                            <span className="font-black">
                                                {conv.other_party.name.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                                <h3 className="font-bold truncate">{conv.other_party.name}</h3>
                                                {conv.last_message_at && (
                                                    <span className="text-xs text-black/40 ml-2 shrink-0">
                                                        {formatTime(conv.last_message_at)}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-black/60 truncate">
                                                {conv.last_message || 'No messages yet'}
                                            </p>
                                        </div>
                                        {conv.unread_count > 0 && (
                                            <span className="w-5 h-5 bg-[#FF8C69] border border-black text-xs font-black flex items-center justify-center shrink-0">
                                                {conv.unread_count}
                                            </span>
                                        )}
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* Messages Area */}
                <div className={`flex-1 flex flex-col ${selectedConversation ? 'flex' : 'hidden md:flex'}`}>
                    {selectedConversation ? (
                        <>
                            {/* Header */}
                            <div className="p-4 border-b-2 border-black flex items-center gap-3">
                                <button type="button"
                                    onClick={() => setSelectedConversation(null)}
                                    className="md:hidden p-2 hover:bg-gray-100"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                <div className="w-10 h-10 bg-gradient-to-br from-[#B4F056] to-[#FFD93D] border-2 border-black flex items-center justify-center">
                                    <span className="font-black">
                                        {selectedConversation.other_party.name.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                                <div>
                                    <h2 className="font-black">{selectedConversation.other_party.name}</h2>
                                    <p className="text-xs text-black/60">{selectedConversation.other_party.email}</p>
                                </div>
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                {messages.length === 0 ? (
                                    <div className="h-full flex items-center justify-center">
                                        <div className="text-center">
                                            <MessageCircle className="w-12 h-12 mx-auto mb-3 text-black/20" />
                                            <p className="text-black/60 font-medium">No messages yet</p>
                                            <p className="text-black/40 text-sm">Start the conversation!</p>
                                        </div>
                                    </div>
                                ) : (
                                    messages.map(message => (
                                        <div
                                            key={message.id}
                                            className={`flex ${message.sender_id === currentUserId ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <div
                                                className={`max-w-[85%] sm:max-w-[70%] p-3 border-2 border-black ${message.sender_id === currentUserId
                                                        ? 'bg-[#B4F056]'
                                                        : 'bg-white'
                                                    }`}
                                            >
                                                <p className="font-medium">{message.content}</p>
                                                <p className="text-xs text-black/50 mt-1">
                                                    {formatTime(message.created_at)}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input */}
                            <form onSubmit={sendMessage} className="p-4 border-t-2 border-black flex flex-col sm:flex-row gap-3">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Type a message..."
                                    className="flex-1 px-4 py-3 border-2 border-black font-medium focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] outline-none"
                                />
                                <button
                                    type="submit"
                                    disabled={!newMessage.trim() || sending}
                                    className="w-full sm:w-auto px-6 py-3 bg-[#B4F056] border-2 border-black font-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-y-[1px] disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                                >
                                    {sending ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <Send className="w-5 h-5" />
                                    )}
                                </button>
                            </form>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center">
                            <div className="text-center">
                                <Inbox className="w-16 h-16 mx-auto mb-4 text-black/20" />
                                <h3 className="text-xl font-black text-black/60 mb-2">Select a Conversation</h3>
                                <p className="text-black/40 font-medium">
                                    Choose a conversation from the list or start a new one
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
