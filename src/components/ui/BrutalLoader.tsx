'use client'

type LoaderTone = 'brand' | 'influencer' | 'neutral'

export function BrutalLoader({
    size = 'md',
    className = '',
    showLabel = true,
    tone = 'neutral',
    label = 'Loading...'
}: {
    size?: 'sm' | 'md' | 'lg',
    className?: string,
    showLabel?: boolean,
    tone?: LoaderTone,
    label?: string,
}) {
    const sizeMap = {
        sm: { box: 24, shadowWidth: 24, shadowHeight: 4, top: 34, labelClass: 'text-[9px]' },
        md: { box: 36, shadowWidth: 36, shadowHeight: 5, top: 48, labelClass: 'text-[10px]' },
        lg: { box: 48, shadowWidth: 48, shadowHeight: 5, top: 60, labelClass: 'text-xs' },
    }

    const toneMap: Record<LoaderTone, { block: string, shadow: string, text: string }> = {
        brand: {
            block: '#B4F056',
            shadow: 'rgba(180, 240, 86, 0.35)',
            text: 'text-black/70',
        },
        influencer: {
            block: '#FF8C69',
            shadow: 'rgba(255, 140, 105, 0.35)',
            text: 'text-black/70',
        },
        neutral: {
            block: '#FFD93D',
            shadow: 'rgba(240, 128, 128, 0.32)',
            text: 'text-black/65',
        },
    }

    const currentSize = sizeMap[size]
    const currentTone = toneMap[tone]

    return (
        <div className={['flex flex-col items-center justify-center', className].join(' ')}>
            <div
                className="relative"
                style={{
                    width: currentSize.box,
                    height: currentSize.top + currentSize.shadowHeight,
                }}
                aria-label={label}
                role="status"
            >
                <span
                    className="absolute left-0 rounded-[999px]"
                    style={{
                        width: currentSize.shadowWidth,
                        height: currentSize.shadowHeight,
                        top: currentSize.top,
                        background: currentTone.shadow,
                        animation: 'brutal-loader-shadow 0.5s linear infinite',
                    }}
                />
                <span
                    className="absolute left-0 rounded-[6px] border-[2px] border-black"
                    style={{
                        width: currentSize.box,
                        height: currentSize.box,
                        background: currentTone.block,
                        animation: 'brutal-loader-jump 0.5s linear infinite',
                        boxShadow: '4px 4px 0 rgba(0,0,0,0.16)',
                    }}
                />
            </div>
            {showLabel && (
                <p className={['mt-3 font-black uppercase tracking-[0.2em]', currentTone.text, currentSize.labelClass].join(' ')}>
                    {label}
                </p>
            )}
            {/* Global keyframes — scoped styled-jsx renames @keyframes so inline animation: names never matched */}
            <style jsx global>{`
                @keyframes brutal-loader-jump {
                    15% {
                        border-bottom-right-radius: 3px;
                    }

                    25% {
                        transform: translateY(9px) rotate(22.5deg);
                    }

                    50% {
                        transform: translateY(18px) scale(1, 0.9) rotate(45deg);
                        border-bottom-right-radius: 24px;
                    }

                    75% {
                        transform: translateY(9px) rotate(67.5deg);
                    }

                    100% {
                        transform: translateY(0) rotate(90deg);
                    }
                }

                @keyframes brutal-loader-shadow {
                    0%,
                    100% {
                        transform: scale(1, 1);
                    }

                    50% {
                        transform: scale(1.2, 1);
                    }
                }
            `}</style>
        </div>
    )
}
