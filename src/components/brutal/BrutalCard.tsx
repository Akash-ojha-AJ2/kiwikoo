import React from "react";
import { cn } from "@/lib/utils";

interface BrutalCardProps extends React.HTMLAttributes<HTMLDivElement> {
    hoverEffect?: boolean;
}

export default function BrutalCard({
    className,
    hoverEffect = false,
    ...props
}: BrutalCardProps) {
    return (
        <div
            className={cn(
                "bg-white border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-xl",
                hoverEffect && "transition-transform hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]",
                className
            )}
            {...props}
        />
    );
}
