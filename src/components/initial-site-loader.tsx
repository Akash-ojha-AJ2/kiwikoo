"use client"

import { usePathname } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"

const INTRO_FALLBACK_MS = 6000
const INTRO_Z = 2147483647
const INTRO_BG = "#f8a100"
const INTRO_SESSION_KEY = "kiwikoo:intro-seen:v1"

export default function InitialSiteLoader() {
  const pathname = usePathname()
  const [show, setShow] = useState(false)
  const [mounted, setMounted] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    if (!mounted) return
    const base = pathname?.split("?")[0] ?? ""
    const shouldShow = base === "/" || base === ""
    const alreadySeen =
      typeof window !== "undefined" &&
      window.sessionStorage.getItem(INTRO_SESSION_KEY) === "1"

    if (!shouldShow || alreadySeen) {
      setShow(false)
      return
    }

    window.sessionStorage.setItem(INTRO_SESSION_KEY, "1")
    setShow(true)
  }, [mounted, pathname])

  useEffect(() => {
    if (!show) return
    const originalBodyOverflow = document.body.style.overflow
    const originalHtmlOverflow = document.documentElement.style.overflow
    const originalBodyOverscroll = document.body.style.overscrollBehavior
    const originalHtmlOverscroll = document.documentElement.style.overscrollBehavior

    document.body.style.overflow = "hidden"
    document.documentElement.style.overflow = "hidden"
    document.body.style.overscrollBehavior = "none"
    document.documentElement.style.overscrollBehavior = "none"

    let dismissed = false
    const dismiss = () => {
      if (dismissed) return
      dismissed = true
      setShow(false)
      document.body.style.overflow = originalBodyOverflow
      document.documentElement.style.overflow = originalHtmlOverflow
      document.body.style.overscrollBehavior = originalBodyOverscroll
      document.documentElement.style.overscrollBehavior = originalHtmlOverscroll
    }

    const video = videoRef.current
    const fallbackTimer = window.setTimeout(dismiss, INTRO_FALLBACK_MS)

    if (video) {
      video.onended = dismiss
      video.onerror = dismiss
      video.currentTime = 0
      const playPromise = video.play()
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(dismiss)
      }
    }

    return () => {
      window.clearTimeout(fallbackTimer)
      if (video) {
        video.onended = null
        video.onerror = null
      }
      document.body.style.overflow = originalBodyOverflow
      document.documentElement.style.overflow = originalHtmlOverflow
      document.body.style.overscrollBehavior = originalBodyOverscroll
      document.documentElement.style.overscrollBehavior = originalHtmlOverscroll
    }
  }, [show])

  if (!mounted || !show) return null

  return createPortal(
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: INTRO_Z,
        background: INTRO_BG,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        touchAction: "none",
      }}
    >
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        preload="auto"
        disablePictureInPicture
        controls={false}
        style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }}
        onEnded={() => setShow(false)}
        onError={() => setShow(false)}
      >
        <source src="/assets/download.mp4" type="video/mp4" />
      </video>
    </div>,
    document.body
  )
}
