'use client'

// Lightweight decorative shapes - CSS animations instead of framer-motion
export function DecorativeShapes() {
    return (
        <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
            {/* Static Star Top Right */}
            <div className="absolute top-[8%] right-[8%] w-16 h-16 text-[#FF8C69] hidden lg:block animate-spin-slow">
                <svg viewBox="0 0 24 24" fill="currentColor" stroke="black" strokeWidth="0.5">
                    <path d="M12 0L14.5 9L24 12L14.5 15L12 24L9.5 15L0 12L9.5 9L12 0Z" />
                </svg>
            </div>

            {/* Static Star Top Left */}
            <div className="absolute top-[15%] left-[12%] w-8 h-8 text-[#FFD93D] hidden lg:block animate-spin-slow-reverse">
                <svg viewBox="0 0 24 24" fill="currentColor" stroke="black" strokeWidth="0.8">
                    <path d="M12 0L14.5 9L24 12L14.5 15L12 24L9.5 15L0 12L9.5 9L12 0Z" />
                </svg>
            </div>

            {/* Floating Circle Bottom Left */}
            <div className="absolute bottom-[18%] left-[6%] w-12 h-12 rounded-full border-[4px] border-black bg-[#B4F056] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hidden lg:block animate-bounce-slow" />

            {/* Plus Sign Cross */}
            <div className="absolute bottom-[25%] right-[15%] w-8 h-8 hidden lg:block">
                <div className="absolute top-1/2 left-0 w-full h-2 bg-black -translate-y-1/2 rounded-full" />
                <div className="absolute top-0 left-1/2 h-full w-2 bg-black -translate-x-1/2 rounded-full" />
            </div>

            {/* Yellow Diamond */}
            <div className="absolute bottom-[12%] left-[20%] w-5 h-5 bg-[#FFD93D] border-2 border-black rotate-45 hidden lg:block" />

            {/* Scattered small dots */}
            <div className="absolute top-[40%] left-[3%] w-3 h-3 bg-black rounded-full hidden lg:block" />
            <div className="absolute bottom-[40%] left-[15%] w-2 h-2 bg-black rounded-full hidden lg:block" />

            {/* X Mark */}
            <div className="absolute top-[55%] right-[8%] w-5 h-5 hidden lg:block">
                <div className="absolute top-1/2 left-0 w-full h-1.5 bg-black -translate-y-1/2 rotate-45" />
                <div className="absolute top-1/2 left-0 w-full h-1.5 bg-black -translate-y-1/2 -rotate-45" />
            </div>
        </div>
    )
}
