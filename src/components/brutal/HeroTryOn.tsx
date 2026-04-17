"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import BrutalCard from "./BrutalCard";
import OutfitCard from "./OutfitCard";
import FadeInSection from "./FadeInSection";
import ParallaxWrapper from "./ParallaxWrapper";
import { useUser } from "@/lib/react-query/hooks";
import { ChevronRight, Upload, Zap } from "lucide-react";

// Placeholder images
const DEMO_IMAGE_BEFORE =
    "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000&auto=format&fit=crop";
const DEMO_IMAGE_AFTER =
    "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?q=80&w=1000&auto=format&fit=crop";

export default function HeroTryOn() {
    const router = useRouter();
    const { data: user, isLoading } = useUser();
    const [selectedOutfit, setSelectedOutfit] = useState("Selected");
    const [hasPhoto, setHasPhoto] = useState(false);

    const isLoggedIn = !isLoading && user !== null && user !== undefined;

    const handleUploadClick = () => {
        if (!isLoggedIn) {
            router.push("/register?intent=tryon");
        } else {
            router.push("/influencer/try-on?step=upload");
        }
    };

    const handleGenerateClick = () => {
        if (!hasPhoto) {
            handleUploadClick();
        } else {
            router.push("/influencer/try-on?step=generate");
        }
    };

    return (
        <div className="w-full max-w-7xl mx-auto px-4 md:px-8 flex flex-col items-center">
            {/* Main Content Grid - Increased gap for breathing room */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 w-full items-center">

                {/* Left Side: Headlines & CTA */}
                <div className="lg:col-span-5 flex flex-col gap-6 md:gap-8 text-left">
                    {/* Headline with fade-in */}
                    <FadeInSection delay={0.1}>
                        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black tracking-tighter leading-[0.92] text-black">
                            Try Clothes. <br />
                            <span className="text-[#FF8C69]">Instantly.</span>
                        </h1>
                    </FadeInSection>

                    {/* Subtext with slight delay */}
                    <FadeInSection delay={0.2}>
                        <p className="text-base sm:text-lg md:text-xl font-medium text-black/80 leading-relaxed border-l-[3px] border-black pl-4 sm:pl-5">
                            The ultimate fashion marketplace connecting influencers with the
                            hottest brands. Try, Share, and Earn with vertically integrated AI.
                        </p>
                    </FadeInSection>

                    {/* CTA Button */}
                    <FadeInSection delay={0.3}>
                        <div className="flex flex-col sm:flex-row gap-4 pt-2">
                            <button type="button"
                                onClick={handleUploadClick}
                                className="w-full sm:w-auto flex items-center justify-center gap-3 px-6 sm:px-8 py-3.5 sm:py-4 text-base sm:text-lg font-bold text-black bg-[#B4F056] border-[3px] border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all group"
                            >
                                <Upload className="w-6 h-6" />
                                Upload a Photo
                                <svg
                                    className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform"
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                >
                                    <path d="M3 3L10.07 19.97L12.58 12.58L19.97 10.07L3 3Z" />
                                </svg>
                            </button>
                        </div>
                    </FadeInSection>

                    {/* Outfit Selector Row - More spacing */}
                    <FadeInSection delay={0.4}>
                        <div className="mt-6">
                            <h3 className="text-base font-bold mb-4 uppercase tracking-widest">
                                Select Outfit:
                            </h3>
                            <div className="flex gap-3 sm:gap-5 overflow-x-auto pb-4 pt-2 px-1">
                                <OutfitCard
                                    imageSrc=""
                                    label="Selected"
                                    isSelected={selectedOutfit === "Selected"}
                                    onClick={() => setSelectedOutfit("Selected")}
                                />
                                <OutfitCard
                                    imageSrc=""
                                    label="New"
                                    isSelected={selectedOutfit === "New"}
                                    onClick={() => setSelectedOutfit("New")}
                                />
                                <OutfitCard
                                    imageSrc=""
                                    label="Hoodie"
                                    isSelected={selectedOutfit === "Hoodie"}
                                    onClick={() => setSelectedOutfit("Hoodie")}
                                />
                            </div>
                        </div>
                    </FadeInSection>
                </div>

                {/* Right Side: Visual Demo with Parallax */}
                <div className="lg:col-span-7 w-full">
                    <div className="relative flex flex-col md:flex-row gap-6 items-center justify-center">

                        {/* Before Card with Parallax */}
                        <ParallaxWrapper speed={0.2} maxOffset={25}>
                            <FadeInSection delay={0.2} direction="left">
                                <BrutalCard className="relative p-2 w-full max-w-[260px] md:w-[260px] lg:w-[280px] aspect-[3/4] rotate-[-2deg] z-10 hover:z-20 transition-all hover:rotate-0 bg-white">
                                    <div className="absolute top-[-12px] left-[-8px] bg-black text-white px-3 py-1 font-black text-lg uppercase tracking-widest border-2 border-white transform -rotate-3 shadow-[4px_4px_0px_#FF8C69]">
                                        Before
                                    </div>
                                    <div className="w-full h-full border-2 border-black overflow-hidden bg-gray-200">
                                        <Image
                                            src={DEMO_IMAGE_BEFORE}
                                            alt="Before Try-On"
                                            width={400}
                                            height={600}
                                            className="object-cover w-full h-full grayscale-[0.2]"
                                        />
                                    </div>
                                </BrutalCard>
                            </FadeInSection>
                        </ParallaxWrapper>

                        {/* Arrow Indicator */}
                        <div className="z-30 md:absolute md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 pointer-events-none">
                            <FadeInSection delay={0.4} scale>
                                <div className="text-5xl drop-shadow-[4px_4px_0_#000]">
                                    ➡️
                                </div>
                            </FadeInSection>
                        </div>

                        {/* After Card with Parallax */}
                        <ParallaxWrapper speed={-0.15} maxOffset={20}>
                            <FadeInSection delay={0.3} direction="right">
                                <BrutalCard className="relative p-2 w-full max-w-[260px] md:w-[260px] lg:w-[280px] aspect-[3/4] rotate-[2deg] z-10 hover:z-20 transition-all hover:rotate-0 bg-white">
                                    <div className="absolute top-[-12px] right-[-8px] bg-[#FF8C69] text-black px-3 py-1 font-black text-lg uppercase tracking-widest border-2 border-black transform rotate-3 shadow-[4px_4px_0px_#000]">
                                        After 😎
                                    </div>
                                    <div className="w-full h-full border-2 border-black overflow-hidden bg-gray-200 relative">
                                        <Image
                                            src={DEMO_IMAGE_AFTER}
                                            alt="After Try-On"
                                            width={400}
                                            height={600}
                                            className="object-cover w-full h-full"
                                        />
                                        <div className="absolute bottom-0 left-0 w-full bg-black/80 text-white text-center py-1 text-xs font-bold uppercase">
                                            Generated by AI
                                        </div>
                                    </div>
                                </BrutalCard>
                            </FadeInSection>
                        </ParallaxWrapper>
                    </div>

                    {/* Generate Try-On Button - More top margin */}
                    <FadeInSection delay={0.5}>
                        <div className="mt-12 flex justify-center">
                            <button type="button"
                                onClick={handleGenerateClick}
                                disabled={!hasPhoto && isLoggedIn}
                                className={`w-full sm:w-auto flex items-center justify-center gap-3 px-6 sm:px-8 py-3.5 sm:py-4 text-base sm:text-lg font-bold text-black border-[3px] border-black rounded-xl transition-all ${!hasPhoto && isLoggedIn
                                        ? "bg-gray-200 cursor-not-allowed opacity-60 shadow-none"
                                        : "bg-[#FF8C69] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
                                    }`}
                            >
                                <Zap className="w-6 h-6" />
                                Generate Try-On
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </FadeInSection>
                </div>
            </div>
        </div>
    );
}


