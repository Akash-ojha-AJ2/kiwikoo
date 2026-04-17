"use client";

import { ReactLenis as Lenis } from "@studio-freight/react-lenis";
import { useEffect, useState } from "react";

/**
 * DISABLED SMOOTH SCROLL FOR INSTANT SCROLLING
 * 
 * Lenis smooth scroll causes noticeable delay on scroll.
 * Disabled by default for instant, native scroll performance.
 * Can be re-enabled per user preference if needed.
 */
export function ReactLenis({ children }: { children: React.ReactNode }) {
    // Disable smooth scroll by default for instant scrolling
    const [shouldSmooth, setShouldSmooth] = useState(false);

    useEffect(() => {
        // Only enable if user explicitly prefers smooth scroll
        // Check for a query param or localStorage preference
        const urlParams = new URLSearchParams(window.location.search);
        const prefersSmooth = urlParams.get('smooth') === 'true' || 
                              localStorage.getItem('prefers-smooth-scroll') === 'true';
        
        if (prefersSmooth) {
            setShouldSmooth(true);
        }
    }, []);

    // Skip Lenis entirely - use native scroll for instant response
    if (!shouldSmooth) {
        return <>{children}</>;
    }

    // Only enable if user explicitly wants it (very fast settings)
    return (
        <Lenis root options={{
            lerp: 0.8,            // Very fast, almost instant
            duration: 0.1,        // Minimal delay
            smoothWheel: true,
            touchMultiplier: 0,   // Native touch scroll
        }}>
            {children}
        </Lenis>
    );
}

