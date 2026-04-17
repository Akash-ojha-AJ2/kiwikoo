/* eslint-disable jsx-a11y/alt-text */
import Image from 'next/image'
import type { ComponentProps } from 'react'

type AppImageProps = Omit<ComponentProps<typeof Image>, 'fill' | 'width' | 'height'> & {
  alt: string
  fill?: boolean
  width?: number
  height?: number
}

export function AppImage({
  fill = true,
  width = 1200,
  height = 1200,
  sizes = '100vw',
  unoptimized = true,
  ...props
}: AppImageProps) {
  if (fill) {
    return (
      <Image
        {...props}
        fill
        sizes={sizes}
        unoptimized={unoptimized}
      />
    )
  }

  return (
    <Image
      {...props}
      width={width}
      height={height}
      sizes={sizes}
      unoptimized={unoptimized}
    />
  )
}
