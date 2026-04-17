"use client"

import { AnimatePresence, motion } from "framer-motion"
import { CheckCircle2, AlertCircle, Info, TriangleAlert, X } from "lucide-react"
import { createPortal } from "react-dom"
import { useEffect, useState } from "react"

type ToastKind = "success" | "error" | "info" | "warning"

type ToastOptions = {
  description?: string
  duration?: number
  [key: string]: unknown
}

type ToastItem = {
  id: string
  kind: ToastKind
  title: string
  description?: string
  duration: number
}

const DEFAULT_DURATION = 3000
const MAX_TOASTS = 4
const TOAST_Z_INDEX = 2147483646
const TOAST_EVENT = "kiwikoo:toast"
const TOAST_DISMISS_EVENT = "kiwikoo:toast-dismiss"

const toastTimers = new Map<string, number>()

type WindowWithToastQueue = Window & {
  __kiwikooToastQueue?: ToastItem[]
}

function getToastQueue() {
  if (typeof window === "undefined") return []
  return ((window as WindowWithToastQueue).__kiwikooToastQueue ?? []).slice(-MAX_TOASTS)
}

function setToastQueue(items: ToastItem[]) {
  if (typeof window === "undefined") return
  ;(window as WindowWithToastQueue).__kiwikooToastQueue = items.slice(-MAX_TOASTS)
}

function scheduleDismiss(id: string, duration: number) {
  if (typeof window === "undefined" || duration <= 0) return
  const existing = toastTimers.get(id)
  if (existing) window.clearTimeout(existing)

  const timer = window.setTimeout(() => dismiss(id), duration)
  toastTimers.set(id, timer)
}

function addToast(kind: ToastKind, title: string | undefined, options: ToastOptions = {}) {
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
  const nextToast: ToastItem = {
    id,
    kind,
    title: title || "Notice",
    description: options.description,
    duration: options.duration ?? DEFAULT_DURATION,
  }

  const nextQueue = [...getToastQueue(), nextToast].slice(-MAX_TOASTS)
  setToastQueue(nextQueue)
  window.dispatchEvent(new CustomEvent<ToastItem>(TOAST_EVENT, { detail: nextToast }))
  scheduleDismiss(id, nextToast.duration)

  return id
}

export function dismiss(id?: string) {
  if (typeof window === "undefined") return

  if (id) {
    const timer = toastTimers.get(id)
    if (timer) window.clearTimeout(timer)
    toastTimers.delete(id)
  } else {
    toastTimers.forEach((timer) => window.clearTimeout(timer))
    toastTimers.clear()
  }

  const nextQueue = id ? getToastQueue().filter((toast) => toast.id !== id) : []
  setToastQueue(nextQueue)
  window.dispatchEvent(new CustomEvent<string | undefined>(TOAST_DISMISS_EVENT, { detail: id }))
}

type ToastFn = ((title: string, options?: ToastOptions) => string) & {
  success: (title: string | undefined, options?: ToastOptions) => string
  error: (title: string | undefined, options?: ToastOptions) => string
  info: (title: string | undefined, options?: ToastOptions) => string
  warning: (title: string | undefined, options?: ToastOptions) => string
  dismiss: (id?: string) => void
}

export const toast: ToastFn = Object.assign(
  (title: string | undefined, options?: ToastOptions) => addToast("info", title, options),
  {
    success: (title: string | undefined, options?: ToastOptions) => addToast("success", title, options),
    error: (title: string | undefined, options?: ToastOptions) => addToast("error", title, options),
    info: (title: string | undefined, options?: ToastOptions) => addToast("info", title, options),
    warning: (title: string | undefined, options?: ToastOptions) => addToast("warning", title, options),
    dismiss,
  }
)

function getToastStyles(kind: ToastKind) {
  switch (kind) {
    case "success":
      return {
        bg: "#E8FFB4",
        icon: <CheckCircle2 className="h-4 w-4 text-black" strokeWidth={2.5} />,
      }
    case "error":
      return {
        bg: "#FFE1D9",
        icon: <AlertCircle className="h-4 w-4 text-black" strokeWidth={2.5} />,
      }
    case "warning":
      return {
        bg: "#FFF1C2",
        icon: <TriangleAlert className="h-4 w-4 text-black" strokeWidth={2.5} />,
      }
    default:
      return {
        bg: "#FFFFFF",
        icon: <Info className="h-4 w-4 text-black" strokeWidth={2.5} />,
      }
  }
}

function ToastCard({ toastItem }: { toastItem: ToastItem }) {
  const styles = getToastStyles(toastItem.kind)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -18, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -14, scale: 0.97 }}
      transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
      className="pointer-events-auto w-[min(340px,calc(100vw-24px))] rounded-[18px] border-[3px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
      style={{ backgroundColor: styles.bg }}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-start gap-3 px-4 py-3">
        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border-[2px] border-black bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
          {styles.icon}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-black uppercase tracking-[0.16em] text-black">
            {toastItem.title}
          </p>
          {toastItem.description ? (
            <p className="pt-1 text-[12px] font-medium leading-[1.45] text-black/75">
              {toastItem.description}
            </p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={() => dismiss(toastItem.id)}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl border-[2px] border-black bg-white text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
          aria-label="Dismiss notification"
        >
          <X className="h-3.5 w-3.5" strokeWidth={3} />
        </button>
      </div>
    </motion.div>
  )
}

export function Toaster() {
  const [mounted, setMounted] = useState(false)
  const [items, setItems] = useState<ToastItem[]>([])

  useEffect(() => {
    setMounted(true)

    const handleToast = (event: Event) => {
      const nextToast = (event as CustomEvent<ToastItem>).detail
      setItems((prev) => {
        const nextItems = [...prev.filter((item) => item.id !== nextToast.id), nextToast].slice(-MAX_TOASTS)
        setToastQueue(nextItems)
        return nextItems
      })
    }

    const handleDismiss = (event: Event) => {
      const id = (event as CustomEvent<string | undefined>).detail
      setItems((prev) => {
        const nextItems = id ? prev.filter((item) => item.id !== id) : []
        setToastQueue(nextItems)
        return nextItems
      })
    }

    setItems(getToastQueue())
    window.addEventListener(TOAST_EVENT, handleToast as EventListener)
    window.addEventListener(TOAST_DISMISS_EVENT, handleDismiss as EventListener)

    return () => {
      window.removeEventListener(TOAST_EVENT, handleToast as EventListener)
      window.removeEventListener(TOAST_DISMISS_EVENT, handleDismiss as EventListener)
      toastTimers.forEach((timer) => window.clearTimeout(timer))
      toastTimers.clear()
    }
  }, [])

  if (!mounted) return null

  return createPortal(
    <div
      style={{
        position: "fixed",
        top: "max(16px, env(safe-area-inset-top, 0px))",
        right: "max(16px, env(safe-area-inset-right, 0px))",
        zIndex: TOAST_Z_INDEX,
        display: "flex",
        width: "min(360px, calc(100vw - 24px))",
        flexDirection: "column",
        gap: "12px",
        pointerEvents: "none",
      }}
    >
      <AnimatePresence initial={false}>
        {items.map((toastItem) => (
          <ToastCard key={toastItem.id} toastItem={toastItem} />
        ))}
      </AnimatePresence>
    </div>,
    document.body
  )
}
