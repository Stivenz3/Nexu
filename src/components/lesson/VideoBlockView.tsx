import { useState } from 'react'
import { Button } from '@/components/ui'
import type { VideoBlockContent } from '@/types/lesson'

interface VideoBlockViewProps {
  content: VideoBlockContent
  onComplete: () => void
}

function toEmbedUrl(url: string): string {
  if (url.includes('embed')) return url
  const match = url.match(/(?:v=|youtu\.be\/)([\w-]+)/)
  if (match) return `https://www.youtube.com/embed/${match[1]}`
  return url
}

export function VideoBlockView({ content, onComplete }: VideoBlockViewProps) {
  const [canContinue, setCanContinue] = useState(content.minWatchPercent <= 0)

  return (
    <div className="space-y-6">
      <div className="aspect-video w-full rounded-xl overflow-hidden bg-black">
        <iframe
          title="Video de la lección"
          src={toEmbedUrl(content.youtubeUrl)}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
      {content.minWatchPercent > 0 ? (
        <p className="text-body-sm text-foreground-muted">
          Debes ver al menos el {content.minWatchPercent}% del video para continuar.
        </p>
      ) : (
        <p className="text-body-sm text-foreground-muted">
          Modo desarrollo: puedes continuar sin restricción de visualización.
        </p>
      )}
      {!canContinue && (
        <Button variant="outline" onClick={() => setCanContinue(true)}>
          Marcar video como visto (desarrollo)
        </Button>
      )}
      <div className="flex justify-end">
        <Button disabled={!canContinue} onClick={onComplete}>
          Continuar
        </Button>
      </div>
    </div>
  )
}
