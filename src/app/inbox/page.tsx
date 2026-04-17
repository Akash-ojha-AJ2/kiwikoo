'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, CheckCircle2, Clock, MessageSquare, Bell, ArrowRight } from 'lucide-react'
import { toast } from '@/lib/simple-sonner'
import {
  useNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
  useUser,
} from '@/lib/react-query/hooks'
import { BrutalLoader } from '@/components/ui/BrutalLoader'

// Neo-Brutalist Components
function BrutalCard({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={`bg-white border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6 relative transition-all hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] ${className}`}>
      {children}
    </div>
  )
}

function BrutalButton({ onClick, children, variant = 'primary', className = '' }: { onClick?: () => void, children: React.ReactNode, variant?: 'primary' | 'secondary' | 'outline', className?: string }) {
  const variants = {
    primary: 'bg-[#FFD93D] text-black hover:bg-[#ffe066]',
    secondary: 'bg-black text-white hover:bg-gray-800',
    outline: 'bg-white text-black hover:bg-gray-50'
  }

  return (
    <button type="button"
      onClick={onClick}
      className={`px-4 py-2 font-bold uppercase tracking-wider border-[2px] border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all flex items-center gap-2 ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  )
}


function formatDistanceToNow(date: Date): string {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) return 'JUST NOW'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} MINS AGO`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} HRS AGO`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} DAYS AGO`
  return `${Math.floor(diffInSeconds / 604800)} WEEKS AGO`
}

export default function InboxPage() {
  const router = useRouter()
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all')
  const { data, isLoading: loading } = useNotifications()
  const { data: user } = useUser()
  const markAsReadMutation = useMarkNotificationRead()
  const markAllAsReadMutation = useMarkAllNotificationsRead()

  const notifications = useMemo(() => data?.notifications || [], [data?.notifications])
  const unreadCount = useMemo(() => data?.unreadCount || 0, [data?.unreadCount])

  const handleNotificationClick = async (notification: any) => {
    // Mark as read if unread
    if (!notification.isRead) {
      try {
        await markAsReadMutation.mutateAsync(notification.id)
      } catch (error) {
        console.error('Failed to mark as read:', error)
        toast.error('Failed to mark as read')
      }
    }

    // Navigate based on notification type
    if (notification.type === 'collab_request' || notification.type === 'collab_accepted' || notification.type === 'collab_declined') {
      if (user?.role === 'BRAND') {
        router.push('/brand/collaborations')
      } else if (user?.role === 'INFLUENCER') {
        router.push('/influencer/collaborations')
      } else {
        router.push('/brand/collaborations')
      }
    }
  }

  const markAllAsRead = async () => {
    try {
      await markAllAsReadMutation.mutateAsync()
      toast.success('All marked as read!')
    } catch (error) {
      toast.error('Failed to mark all as read')
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'collab_request':
        return <div className="p-2 bg-[#90E8FF] border-[2px] border-black"><MessageSquare className="h-5 w-5 text-black" /></div>
      case 'collab_accepted':
        return <div className="p-2 bg-[#BAFCA2] border-[2px] border-black"><CheckCircle2 className="h-5 w-5 text-black" /></div>
      case 'collab_declined':
        return <div className="p-2 bg-[#FFABAB] border-[2px] border-black"><Clock className="h-5 w-5 text-black" /></div>
      default:
        return <div className="p-2 bg-white border-[2px] border-black"><Bell className="h-5 w-5 text-black" /></div>
    }
  }

  const filteredNotifications = useMemo(() => {
    return notifications.filter((n: any) => {
      if (filter === 'unread') return !n.isRead
      if (filter === 'read') return n.isRead
      return true
    })
  }, [notifications, filter])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] pt-24 flex items-center justify-center">
        <BrutalLoader size="lg" tone="influencer" label="Loading inbox" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] pt-28 pb-20">
      <div className="container mx-auto px-6 max-w-4xl">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h1 className="text-6xl font-black text-black uppercase leading-none mb-2">
              Inbox
            </h1>
            <p className="text-xl font-bold text-black/60 border-l-[4px] border-[#FFD93D] pl-4">
              {unreadCount > 0 ? `${unreadCount} NEW UPDATES` : 'ALL CAUGHT UP'}
            </p>
          </div>

          {unreadCount > 0 && (
            <BrutalButton onClick={markAllAsRead} variant="outline">
              <CheckCircle2 className="w-4 h-4" />
              Mark All Read
            </BrutalButton>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-4 mb-8">
          {[
            { id: 'all', label: 'All', count: notifications.length },
            { id: 'unread', label: 'Unread', count: unreadCount },
            { id: 'read', label: 'Read', count: notifications.length - unreadCount },
          ].map((tab) => (
            <button type="button"
              key={tab.id}
              onClick={() => setFilter(tab.id as any)}
              className={`px-6 py-2 font-black uppercase tracking-wider border-[2px] border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all ${filter === tab.id
                  ? 'bg-black text-white hover:bg-gray-800'
                  : 'bg-white text-black hover:bg-[#FFD93D]'
                }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Notifications List */}
        <AnimatePresence mode="wait">
          {filteredNotifications.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white border-[3px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-16 text-center"
            >
              <div className="w-20 h-20 bg-[#FDFBF7] border-[3px] border-black flex items-center justify-center mx-auto mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <Mail className="w-10 h-10 text-black" />
              </div>
              <h3 className="text-2xl font-black uppercase mb-2">No Notifications</h3>
              <p className="font-bold text-black/60 uppercase tracking-wide">
                {filter === 'unread'
                  ? "You're seeing this because you're awesome."
                  : 'Check back later for updates.'}
              </p>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {filteredNotifications.map((notification: any, index: number) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div
                    onClick={() => handleNotificationClick(notification)}
                    className={`group cursor-pointer relative ${!notification.isRead ? 'z-10' : 'z-0'}`}
                  >
                    {/* "NEW" Badge for unread */}
                    {!notification.isRead && (
                      <div className="absolute -top-3 -right-2 bg-[#FFD93D] px-2 py-1 border-[2px] border-black text-xs font-black uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] z-20">
                        NEW
                      </div>
                    )}

                    <BrutalCard className={`${!notification.isRead ? 'bg-[#fffdf5]' : 'bg-white'}`}>
                      <div className="flex items-start gap-4">
                        {getNotificationIcon(notification.type)}
                        <div className="flex-1">
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                            <p className="font-bold text-lg leading-tight uppercase mb-1 group-hover:underline decoration-2 underline-offset-2">
                              {notification.content}
                            </p>
                            <span className="text-xs font-black text-black/40 whitespace-nowrap bg-gray-100 px-2 py-1 border-[1px] border-black">
                              {formatDistanceToNow(new Date(notification.createdAt))}
                            </span>
                          </div>
                          <div className="mt-2 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#FFD93D] group-hover:text-black transition-colors">
                            View Details <ArrowRight className="w-4 h-4" />
                          </div>
                        </div>
                      </div>
                    </BrutalCard>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
