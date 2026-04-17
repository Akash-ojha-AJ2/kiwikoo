"use client"

import { toast } from "@/lib/simple-sonner"

const DEFAULT_KIWIKOO_TOAST_MS = 3000

export function showSuccessToast(title: string, description?: string, duration = DEFAULT_KIWIKOO_TOAST_MS) {
  return toast.success(title, { description, duration })
}

export function showErrorToast(title: string, description?: string, duration = DEFAULT_KIWIKOO_TOAST_MS) {
  return toast.error(title, { description, duration })
}

export function showInfoToast(title: string, description?: string, duration = DEFAULT_KIWIKOO_TOAST_MS) {
  return toast.info(title, { description, duration })
}

export function showWarningToast(title: string, description?: string, duration = DEFAULT_KIWIKOO_TOAST_MS) {
  return toast.warning(title, { description, duration })
}
