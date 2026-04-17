'use client'

import { useEffect } from 'react'
import { AlertCircle, RotateCcw } from 'lucide-react'

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error('Brand Portal Error:', error)
    }, [error])

    return (
        <div className="flex h-[calc(100vh-80px)] w-full flex-col items-center justify-center gap-4 text-center">
            <div className="rounded-full bg-red-100 p-4">
                <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-black text-black">Something went wrong!</h2>
            <p className="max-w-md text-black/60">
                We encountered an unexpected error while loading this page.
                Our team has been notified.
            </p>
            <div className="flex gap-4 mt-4">
                <button type="button"
                    onClick={() => window.location.href = '/dashboard'}
                    className="px-6 py-3 border-2 border-black font-bold uppercase hover:bg-gray-100"
                >
                    Go to Dashboard
                </button>
                <button type="button"
                    onClick={() => reset()}
                    className="flex items-center gap-2 px-6 py-3 bg-[#B4F056] border-[3px] border-black font-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-px hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
                >
                    <RotateCcw className="w-5 h-5" />
                    Try again
                </button>
            </div>
            {process.env.NODE_ENV === 'development' && (
                <div className="mt-8 p-4 bg-gray-100 border border-black text-left max-w-2xl overflow-auto text-xs font-mono">
                    <p className="font-bold text-red-600 mb-2">{error.name}: {error.message}</p>
                    <pre>{error.stack}</pre>
                </div>
            )}
        </div>
    )
}
