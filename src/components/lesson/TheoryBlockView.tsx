import { Button } from '@/components/ui'
import type { TheoryBlockContent } from '@/types/lesson'

interface TheoryBlockViewProps {
  content: TheoryBlockContent
  onContinue: () => void
  reviewMode?: boolean
}

export function TheoryBlockView({
  content,
  onContinue,
  reviewMode = false,
}: TheoryBlockViewProps) {
  return (
    <div className="space-y-6 max-w-4xl">
      <p className="text-label-caps text-primary">{content.normativeRef}</p>
      <p className="text-body-lg text-foreground-muted leading-relaxed">{content.summary}</p>

      <ul className="space-y-2">
        {content.keyPoints.map((point, i) => (
          <li
            key={i}
            className="flex gap-3 text-body-md text-foreground before:content-['•'] before:text-primary before:font-bold"
          >
            <span>{point}</span>
          </li>
        ))}
      </ul>

      {content.technicalNote && (
        <div className="rounded-xl border border-secondary/30 bg-secondary/5 p-5">
          <p className="text-body-sm font-semibold text-secondary mb-2">Nota técnica</p>
          <p className="text-body-md text-foreground-muted leading-relaxed">
            {content.technicalNote}
          </p>
        </div>
      )}

      <div className="flex justify-end">
        <Button onClick={onContinue}>
          {reviewMode
            ? content.hasInterludedQuestion
              ? 'Ver pregunta de repaso'
              : 'Listo'
            : content.hasInterludedQuestion
              ? 'Ir a la pregunta'
              : 'Continuar'}
        </Button>
      </div>
    </div>
  )
}
