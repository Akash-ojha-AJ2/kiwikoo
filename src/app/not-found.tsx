'use client'

import Link from 'next/link'
import { Home, ArrowLeft, AlertTriangle } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7] px-4 relative overflow-hidden">

      {/* Background decoration */}
      <div className="absolute top-20 left-20 w-32 h-32 bg-[#FFD93D] border-[4px] border-black opacity-20 rotate-12" />
      <div className="absolute bottom-20 right-20 w-48 h-48 bg-[#90E8FF] rounded-full border-[4px] border-black opacity-20 -rotate-12" />

      <div className="text-center max-w-2xl w-full relative z-10">

        {/* Brutalist 404 Box */}
        <div className="bg-white border-[4px] border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] p-12 md:p-16 mb-12 relative transform rotate-1">
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-[#FFD93D] px-6 py-2 border-[4px] border-black text-xl font-black uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 stroke-[3]" />
            Error
          </div>

          <h1 className="text-[120px] md:text-[180px] font-black text-black leading-none mb-4 drop-shadow-[4px_4px_0px_rgba(0,0,0,0.2)]">
            404
          </h1>
          <h2 className="text-3xl md:text-5xl font-black uppercase text-black mb-6 tracking-tight">
            Page Not Found
          </h2>
          <p className="text-xl font-bold text-black/60 max-w-md mx-auto">
            The page you&apos;re looking for has vanished into the digital void or never existed.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-6 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-black text-white text-lg font-black uppercase tracking-wider border-[3px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] hover:bg-white hover:text-black transition-all"
          >
            <Home className="w-5 h-5" />
            Go Home
          </Link>
          <button type="button"
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-black text-lg font-black uppercase tracking-wider border-[3px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all"
          >
            <ArrowLeft className="w-5 h-5 stroke-[3]" />
            Go Back
          </button>
        </div>
      </div>
    </div>
  )
}
