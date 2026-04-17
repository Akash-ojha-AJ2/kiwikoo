import type { Metadata } from 'next'
import type React from 'react'
import { Bungee } from 'next/font/google'
import AuthToastBridge from '@/components/auth-toast-bridge'
import { Toaster } from '@/components/ui/sonner'
import NavSwitcher from '@/components/landing/NavSwitcher'
import FooterSwitcher from '@/components/landing/FooterSwitcher'
import ProfileCompletionGate from '@/components/ProfileCompletionGate'
import { ReactQueryProvider } from '@/lib/react-query/provider'
import { RealtimeListener } from '@/components/providers/realtime-listener'
import { getCurrentUserPayload, toCurrentUserQueryData } from '@/lib/current-user'
import './globals.css'
import { ReactLenis } from '@/lib/lenis'

const bungee = Bungee({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-bungee',
})

export const metadata: Metadata = {
  title: 'Kiwikoo - AI Fashion Try-On Marketplace',
  description: 'AI-powered platform connecting influencers and brands with virtual try-on capabilities.',
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
}

// Defined at module level so the object reference is stable across SSR and client,
// preventing React's hydration mismatch on the <body> style prop.
const FONT_VARS = {
  '--font-plus-jakarta-sans': '"Plus Jakarta Sans", Inter, system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif',
  '--font-playfair': 'Playfair Display, Georgia, Cambria, "Times New Roman", serif',
  '--font-inter': 'Inter, system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif',
  '--font-geist-sans': 'Inter, system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif',
  '--font-geist-mono': '"SFMono-Regular", Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
} as React.CSSProperties

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const initialUser = toCurrentUserQueryData(await getCurrentUserPayload())

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${bungee.variable} antialiased bg-cream text-charcoal`} style={FONT_VARS} suppressHydrationWarning>
        <ReactQueryProvider initialUser={initialUser}>
          <Toaster />
          <AuthToastBridge />
          <ReactLenis>
            <NavSwitcher />
            <RealtimeListener />
            <ProfileCompletionGate />
            <main className="animate-fade-in" suppressHydrationWarning>
              {children}
            </main>

            <FooterSwitcher />
          </ReactLenis>
        </ReactQueryProvider>
      </body>
    </html>
  )
}
