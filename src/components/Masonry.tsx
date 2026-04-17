"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { gsap } from 'gsap';
import './Masonry.css';

interface MasonryItem {
    id: string | number;
    img: string;
    url?: string;
    height: number;
    title?: string;
    category?: string;
    [key: string]: any;
}

interface MasonryProps {
    items: MasonryItem[];
    ease?: string;
    duration?: number;
    stagger?: number;
    animateFrom?: 'bottom' | 'top' | 'left' | 'right' | 'center' | 'random';
    scaleOnHover?: boolean;
    hoverScale?: number;
    blurToFocus?: boolean;
    colorShiftOnHover?: boolean;
}

function toSafeExternalUrl(rawUrl: string): string | null {
    try {
        const parsed = new URL(rawUrl, window.location.origin);
        if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null;
        return parsed.toString();
    } catch {
        return null;
    }
}

const useMedia = (queries: string[], values: number[], defaultValue: number) => {
    // Ensure window is available (client-side)
    const get = () => {
        if (typeof window === 'undefined') return defaultValue;
        const index = queries.findIndex(q => window.matchMedia(q).matches);
        return values[index] ?? defaultValue;
    };

    const [value, setValue] = useState(get);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        const handler = () => setValue(get);
        queries.forEach(q => window.matchMedia(q).addEventListener('change', handler));
        return () => queries.forEach(q => window.matchMedia(q).removeEventListener('change', handler));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [queries]);

    return value;
};

const useMeasure = (): [React.RefObject<HTMLDivElement>, { width: number; height: number }] => {
    const ref = useRef<HTMLDivElement>(null);
    const [size, setSize] = useState({ width: 0, height: 0 });

    useLayoutEffect(() => {
        if (!ref.current) return;
        const ro = new ResizeObserver(([entry]) => {
            const { width, height } = entry.contentRect;
            setSize({ width, height });
        });
        ro.observe(ref.current);
        return () => ro.disconnect();
    }, []);

    return [ref, size];
};

// Optimized: Only preload first 6 images (above fold)
const preloadImages = async (urls: string[], limit: number = 6) => {
    const urlsToPreload = urls.slice(0, limit);
    await Promise.all(
        urlsToPreload.map(
            src =>
                new Promise<void>(resolve => {
                    const img = new Image();
                    img.src = src;
                    img.onload = () => resolve();
                    img.onerror = () => resolve();
                })
        )
    );
};

const Masonry = ({
    items,
    ease = 'power3.out',
    duration = 0.6,
    stagger = 0.05,
    animateFrom = 'bottom',
    scaleOnHover = true,
    hoverScale = 0.95,
    blurToFocus = true,
    colorShiftOnHover = false
}: MasonryProps) => {
    const columns = useMedia(
        ['(min-width:1500px)', '(min-width:1000px)', '(min-width:600px)', '(min-width:400px)'],
        [5, 4, 3, 2],
        1
    );

    const [containerRef, { width }] = useMeasure();
    const [imagesReady, setImagesReady] = useState(false);

    const getInitialPosition = (item: any) => {
        const containerRect = containerRef.current?.getBoundingClientRect();
        if (!containerRect) return { x: item.x, y: item.y };

        let direction = animateFrom;

        if (animateFrom === 'random') {
            const directions = ['top', 'bottom', 'left', 'right'];
            direction = directions[Math.floor(Math.random() * directions.length)] as any;
        }

        switch (direction) {
            case 'top':
                return { x: item.x, y: -200 };
            case 'bottom':
                return { x: item.x, y: window.innerHeight + 200 };
            case 'left':
                return { x: -200, y: item.y };
            case 'right':
                return { x: window.innerWidth + 200, y: item.y };
            case 'center':
                return {
                    x: containerRect.width / 2 - item.w / 2,
                    y: containerRect.height / 2 - item.h / 2
                };
            default:
                return { x: item.x, y: item.y + 100 };
        }
    };

    // Optimized: Only preload first 6 images (above fold), rest lazy load
    useEffect(() => {
        const imageUrls = items.map(i => i.img);
        const firstBatch = imageUrls.slice(0, 6);
        preloadImages(firstBatch).then(() => {
            setImagesReady(true);
            // Lazy load remaining images in background
            if (imageUrls.length > 6) {
                setTimeout(() => {
                    preloadImages(imageUrls.slice(6));
                }, 500);
            }
        });
    }, [items]);

    const grid = useMemo(() => {
        if (!width) return [];

        const colHeights = new Array(columns).fill(0);
        const columnWidth = width / columns;

        return items.map(child => {
            const col = colHeights.indexOf(Math.min(...colHeights));
            const x = columnWidth * col;
            const height = child.height / 2; // Keeping user's logic, though /2 seems arbitrary, maybe they want dense packing
            const y = colHeights[col];

            colHeights[col] += height;

            return { ...child, x, y, w: columnWidth, h: height };
        });
    }, [columns, items, width]);

    const hasMounted = useRef(false);

    useLayoutEffect(() => {
        if (!imagesReady) return;

        // Batch animations with requestAnimationFrame for better scroll performance
        const rafId = requestAnimationFrame(() => {
            grid.forEach((item, index) => {
                const selector = `[data-key="${item.id}"]`;
                const animationProps = {
                    x: item.x,
                    y: item.y,
                    width: item.w,
                    height: item.h
                };

                if (!hasMounted.current) {
                    const initialPos = getInitialPosition(item);
                    const initialState = {
                        opacity: 0,
                        x: initialPos.x,
                        y: initialPos.y,
                        width: item.w,
                        height: item.h,
                        ...(blurToFocus && { filter: 'blur(10px)' })
                    };

                    gsap.fromTo(selector, initialState, {
                        opacity: 1,
                        ...animationProps,
                        ...(blurToFocus && { filter: 'blur(0px)' }),
                        duration: 0.8,
                        ease: 'power3.out',
                        delay: index * stagger,
                        force3D: true // GPU acceleration
                    });
                } else {
                    gsap.to(selector, {
                        ...animationProps,
                        duration: duration,
                        ease: ease,
                        overwrite: 'auto',
                        force3D: true // GPU acceleration
                    });
                }
            });

            hasMounted.current = true;
        });

        return () => {
            if (rafId) cancelAnimationFrame(rafId);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [grid, imagesReady, stagger, animateFrom, blurToFocus, duration, ease]);

    const handleMouseEnter = useCallback((e: React.MouseEvent, item: any) => {
        const element = e.currentTarget;
        const selector = `[data-key="${item.id}"]`;

        if (scaleOnHover) {
            gsap.to(selector, {
                scale: hoverScale,
                duration: 0.3,
                ease: 'power2.out'
            });
        }

        if (colorShiftOnHover) {
            const overlay = element.querySelector('.color-overlay');
            if (overlay) {
                gsap.to(overlay, {
                    opacity: 0.3,
                    duration: 0.3
                });
            }
        }
    }, [scaleOnHover, hoverScale, colorShiftOnHover]);

    const handleMouseLeave = useCallback((e: React.MouseEvent, item: any) => {
        const element = e.currentTarget;
        const selector = `[data-key="${item.id}"]`;

        if (scaleOnHover) {
            gsap.to(selector, {
                scale: 1,
                duration: 0.3,
                ease: 'power2.out'
            });
        }

        if (colorShiftOnHover) {
            const overlay = element.querySelector('.color-overlay');
            if (overlay) {
                gsap.to(overlay, {
                    opacity: 0,
                    duration: 0.3
                });
            }
        }
    }, [scaleOnHover, colorShiftOnHover]);

    return (
        <div ref={containerRef} className="list" style={{ minHeight: '600px' }}>
            {grid.map(item => {
                return (
                    <div
                        key={item.id}
                        data-key={item.id}
                        className="item-wrapper"
                        onClick={() => {
                            if (!item.url) return;
                            const safeUrl = toSafeExternalUrl(item.url);
                            if (safeUrl) window.open(safeUrl, '_blank', 'noopener');
                        }}
                        onMouseEnter={e => handleMouseEnter(e, item)}
                        onMouseLeave={e => handleMouseLeave(e, item)}
                    >
                        <div className="item-img" style={{ backgroundImage: `url(${item.img})` }}>
                            {colorShiftOnHover && (
                                <div
                                    className="color-overlay"
                                    style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        width: '100%',
                                        height: '100%',
                                        background: 'linear-gradient(45deg, rgba(255,0,150,0.5), rgba(0,150,255,0.5))',
                                        opacity: 0,
                                        pointerEvents: 'none',
                                        borderRadius: '8px'
                                    }}
                                />
                            )}
                            {/* Overlay for Title/Category - Added to match previous design */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent p-6 flex flex-col justify-end opacity-0 hover:opacity-100 transition-opacity duration-300">
                                {item.category && (
                                    <span className="inline-block px-2 py-1 bg-white/20 backdrop-blur-md text-white text-[10px] font-medium rounded-full w-fit mb-2">
                                        {item.category}
                                    </span>
                                )}
                                {item.title && (
                                    <h3 className="text-lg font-serif text-white leading-tight">
                                        {item.title}
                                    </h3>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default Masonry;
