"use client";

import React from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { cn } from "@/lib/utils";

interface ParallaxWrapperProps {
    children: React.ReactNode;
    className?: string;
    /** Speed of parallax effect (positive = moves up on scroll, negative = moves down) */
    speed?: number;
    /** Max movement in pixels */
    maxOffset?: number;
}

/**
 * Subtle parallax wrapper for hero visuals and large image cards.
 * Movement is kept minimal (±30px max) for subconscious effect.
 */
export default function ParallaxWrapper({
    children,
    className,
    speed = 0.3,
    maxOffset = 30,
}: ParallaxWrapperProps) {
    const ref = useRef(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start end", "end start"],
    });

    // Transform scroll progress to parallax offset
    const y = useTransform(
        scrollYProgress,
        [0, 1],
        [maxOffset * speed, -maxOffset * speed]
    );

    return (
        <motion.div ref={ref} style={{ y }} className={cn(className)}>
            {children}
        </motion.div>
    );
}
