import { cn } from '@/lib/utils'

/**
 * Motion graphics by their creators, originally shared through FrameRate.
 * Stored locally (public/videos) so the demo plays without the external player,
 * ad blockers or an internet connection. Credited in the footer.
 */
export const VIDEOS = {
  opener: '/videos/f1-opener.mp4',
  rain: '/videos/f1-rain.mp4',
} as const

type Props = {
  src: string
  title: string
  className?: string
  /** Let scroll and clicks pass through the video. */
  passThrough?: boolean
  /** Fill the parent like `object-fit: cover` instead of keeping a 16:9 box. */
  cover?: boolean
  onLoad?: () => void
}

/** Muted, looping background video. */
export function VideoEmbed({ src, title, className, passThrough, cover, onLoad }: Props) {
  const video = (
    <video
      src={src}
      title={title}
      aria-label={title}
      className={cn('absolute inset-0 h-full w-full object-cover', passThrough && 'pointer-events-none')}
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      onLoadedData={onLoad}
    />
  )
  if (cover) return <div className={cn('absolute inset-0 overflow-hidden', className)}>{video}</div>
  return (
    <div className={cn('relative w-full overflow-hidden', className)} style={{ aspectRatio: '16 / 9' }}>
      {video}
    </div>
  )
}
