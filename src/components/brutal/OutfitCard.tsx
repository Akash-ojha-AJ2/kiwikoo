import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import BrutalCard from "./BrutalCard";

interface OutfitCardProps {
    imageSrc: string;
    label: string;
    isSelected?: boolean;
    onClick?: () => void;
}

export default function OutfitCard({
    imageSrc,
    label,
    isSelected = false,
    onClick,
}: OutfitCardProps) {
    return (
        <div className="flex flex-col gap-2 cursor-pointer group" onClick={onClick}>
            <div className="relative">
                <BrutalCard
                    className={cn(
                        "p-2 w-28 h-28 flex items-center justify-center overflow-hidden transition-all",
                        isSelected ? "bg-white border-black" : "bg-white"
                    )}
                >
                    {/* Placeholder for actual image or icon */}
                    <div className="relative w-full h-full">
                        {/* If we had real images we'd use them, but purely for UI vibe as requested */}
                        <div className={cn("w-full h-full bg-gray-100 rounded-lg flex items-center justify-center border-2 border-black", isSelected ? "bg-[#FF8C69]" : "")}>
                            {/* Simulated Clothing Item */}
                            <span className="text-2xl">👕</span>
                        </div>
                    </div>

                    {isSelected && (
                        <div className="absolute top-[-5px] right-[-5px] bg-[#B4F056] border-2 border-black w-6 h-6 flex items-center justify-center rounded-full shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] z-10">
                            <svg width="12" height="10" viewBox="0 0 12 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M1 5L4.5 8.5L11 1.5" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                    )}
                </BrutalCard>
            </div>
            <div className={cn(
                "bg-white border-[2px] border-black px-2 py-1 text-xs font-bold text-center shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] rounded-md",
                isSelected ? "bg-white" : "bg-white"
            )}>
                {label}
            </div>
        </div>
    );
}
