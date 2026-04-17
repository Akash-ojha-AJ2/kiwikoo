"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
    /** Apply generous padding for breathing room */
    size?: "sm" | "md" | "lg";
    /** Constrain width */
    maxWidth?: "6xl" | "7xl" | "full";
    /** Background variant */
    bg?: "cream" | "white" | "dark";
}

/**
 * Section wrapper with consistent spacing and max-width constraints.
 * Desktop: 120-160px vertical padding
 * Mobile: 80-100px vertical padding
 */
export default function Section({
    children,
    className,
    size = "lg",
    maxWidth = "6xl",
    bg = "cream",
    ...props
}: SectionProps) {
    const sizeStyles = {
        sm: "py-16 md:py-20", // 64px / 80px
        md: "py-20 md:py-28", // 80px / 112px
        lg: "py-24 md:py-40", // 96px / 160px
    };

    const maxWidthStyles = {
        "6xl": "max-w-6xl",
        "7xl": "max-w-7xl",
        full: "max-w-full",
    };

    const bgStyles = {
        cream: "bg-[#F9F8F4]",
        white: "bg-white",
        dark: "bg-black text-white",
    };

    return (
        <section
            className={cn(sizeStyles[size], bgStyles[bg], className)}
            {...props}
        >
            <div className={cn("mx-auto px-6 md:px-8", maxWidthStyles[maxWidth])}>
                {children}
            </div>
        </section>
    );
}
