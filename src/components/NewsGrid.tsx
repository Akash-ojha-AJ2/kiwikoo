"use client";

import { motion } from "framer-motion";
import Masonry from "./Masonry";

const newsItems = [
    {
        id: "1",
        title: "Virtual Try-On Revolution",
        category: "Feature",
        img: "https://images.unsplash.com/photo-1558171813-4c088753af8f?q=80&w=1000&auto=format&fit=crop",
        height: 600,
    },
    {
        id: "2",
        title: "AI Fashion Styling Tips",
        category: "Guide",
        img: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1000&auto=format&fit=crop",
        height: 400,
    },
    {
        id: "3",
        title: "Brand Collaboration Success",
        category: "Case Study",
        img: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1000&auto=format&fit=crop",
        height: 400,
    },
    {
        id: "4",
        title: "Creator Marketing Trends",
        category: "Insights",
        img: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=1000&auto=format&fit=crop",
        height: 600,
    },
];

export default function NewsGrid() {
    return (
        <section className="py-24 container mx-auto px-6 min-h-screen">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="mb-12"
            >
                <span className="text-sm font-medium text-peach uppercase tracking-wider">Updates</span>
                <h2 className="text-4xl md:text-5xl font-serif mt-2 text-charcoal">
                    Latest <span className="italic">News</span>
                </h2>
            </motion.div>
            <div className="h-[800px] w-full">
                <Masonry
                    items={newsItems}
                    ease="power3.out"
                    duration={0.6}
                    stagger={0.05}
                    animateFrom="bottom"
                    scaleOnHover={true}
                    hoverScale={0.95}
                    blurToFocus={true}
                    colorShiftOnHover={false}
                />
            </div>
        </section>
    );
}
