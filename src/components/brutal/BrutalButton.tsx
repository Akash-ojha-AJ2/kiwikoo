import React from "react";
import { cn } from "@/lib/utils";

interface BrutalButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "accent";
    size?: "sm" | "md" | "lg";
}

export default function BrutalButton({
    className,
    variant = "primary",
    size = "md",
    ...props
}: BrutalButtonProps) {
    const baseStyles =
        "font-bold border-[3px] border-black transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]";

    const variants = {
        primary: "bg-[#FF8C69] text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]", // Peach from globals
        secondary: "bg-white text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
        accent: "bg-[#B4F056] text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]", // A vibrant lime/green for accents
    };

    const sizes = {
        sm: "px-4 py-2 text-sm",
        md: "px-6 py-3 text-base",
        lg: "px-8 py-4 text-xl",
    };

    return (
        <button
            className={cn(baseStyles, variants[variant], sizes[size], className)}
            {...props}
        />
    );
}
