"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"
import { showSuccessToast } from "@/lib/kiwikoo-toast"

const AUTH_TOAST_KEY = "kiwikoo-auth-toast"

export function setAuthToast(message: "logged_in" | "logged_out" | "admin_logged_in") {
  if (typeof window === "undefined") return
  window.sessionStorage.setItem(AUTH_TOAST_KEY, message)
}

export default function AuthToastBridge() {
  const pathname = usePathname()

  useEffect(() => {
    if (typeof window === "undefined") return

    const pendingToast = window.sessionStorage.getItem(AUTH_TOAST_KEY)
    if (!pendingToast) return

    window.sessionStorage.removeItem(AUTH_TOAST_KEY)

    if (pendingToast === "logged_out") {
      showSuccessToast("Logged out", "You have been signed out successfully.")
      return
    }

    if (pendingToast === "admin_logged_in") {
      showSuccessToast("Admin signed in", "Welcome back to the command center.")
      return
    }

    if (pendingToast === "logged_in") {
      showSuccessToast("Signed in", "Welcome back to Kiwikoo.")
    }
  }, [pathname])

  return null
}
