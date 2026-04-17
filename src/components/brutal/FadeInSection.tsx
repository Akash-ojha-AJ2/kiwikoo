"use client";

import React from "react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { cn } from "@/lib/utils";

interface FadeInSectionProps {
    children: React.ReactNode;
    className?: string;
    /** Delay before animation starts */
    delay?: number;
    /** Animation direction */
    direction?: "up" | "down" | "left" | "right" | "none";
    /** Distance to travel */
    distance?: number;
    /** Include subtle scale */
    scale?: boolean;
    /** Trigger only once */
    once?: boolean;
}

/**
 * Fade-in animation wrapper using Framer Motion.
 * Triggers on viewport entry.
 */
export default function FadeInSection({
    children,
    className,
    delay = 0,
    direction = "up",
    distance = 30,
    scale = false,
    once = true,
}: FadeInSectionProps) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once, margin: "-50px" });

    const getDirectionOffset = () => {
        switch (direction) {
            case "up":
                return { y: distance };
            case "down":
                return { y: -distance };
            case "left":
                return { x: distance };
            case "right":
                return { x: -distance };
            default:
                return {};
        }
    };

    const initial = {
        opacity: 0,
        ...getDirectionOffset(),
        ...(scale ? { scale: 0.96 } : {}),
    };

    const animate = {
        opacity: isInView ? 1 : 0,
        x: isInView ? 0 : getDirectionOffset().x || 0,
        y: isInView ? 0 : getDirectionOffset().y || 0,
        scale: isInView ? 1 : scale ? 0.96 : 1,
    };

    return (
        <motion.div
            ref={ref}
            initial={initial}
            animate={animate}
            transition={{
                duration: 0.6,
                delay,
                ease: [0.22, 1, 0.36, 1], // Custom easing for smooth feel
            }}
            className={cn(className)}
        >
            {children}
        </motion.div>
    );
}
