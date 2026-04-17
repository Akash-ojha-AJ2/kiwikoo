"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";

const locations = [
    { name: "New York", image: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?q=80&w=1000&auto=format&fit=crop" },
    { name: "Beijing", image: "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?q=80&w=1000&auto=format&fit=crop" },
    { name: "Hyderabad", image: "https://images.unsplash.com/photo-1626014903708-40b05333d029?q=80&w=1000&auto=format&fit=crop" },
    { name: "London", image: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?q=80&w=1000&auto=format&fit=crop" },
    { name: "Redmond", image: "https://images.unsplash.com/photo-1612454903387-a3e970d6255f?q=80&w=1000&auto=format&fit=crop" },
];

export default function Locations() {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    return (
        <section className="py-32 container mx-auto px-6">
            <div className="flex flex-col items-center space-y-4">
                {locations.map((location, index) => (
                    <motion.div
                        key={location.name}
                        className="relative group cursor-pointer w-full text-center"
                        onMouseEnter={() => setHoveredIndex(index)}
                        onMouseLeave={() => setHoveredIndex(null)}
                    >
                        <h2 className="text-6xl md:text-8xl lg:text-9xl font-serif text-charcoal/20 transition-colors duration-500 group-hover:text-charcoal">
                            {location.name}
                        </h2>

                        {/* Floating Image Card */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
                            animate={{
                                opacity: hoveredIndex === index ? 1 : 0,
                                scale: hoveredIndex === index ? 1 : 0.8,
                                rotate: hoveredIndex === index ? 0 : -5,
                                x: hoveredIndex === index ? 0 : -20,
                            }}
                            transition={{ duration: 0.4, ease: "easeOut" }}
                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10 hidden md:block"
                            style={{ marginLeft: index % 2 === 0 ? "200px" : "-200px" }} // Alternate sides
                        >
                            <div className="w-64 h-48 bg-white p-2 shadow-xl rotate-3">
                                <div className="relative w-full h-full overflow-hidden bg-gray-200">
                                    <Image
                                        src={location.image}
                                        alt={location.name}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}
