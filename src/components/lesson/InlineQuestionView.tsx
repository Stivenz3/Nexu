import { useState } from 'react'
import { Button, Card, RadioGroup } from '@/components/ui'
import type { LessonQuestion } from '@/types/lesson'

interface InlineQuestionViewProps {
  question: LessonQuestion
  onAnswered: (correct: boolean) => void
}

export function InlineQuestionView({ question, onAnswered }: InlineQuestionViewProps) {
  const [selected, setSelected] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const correctLabel =
    question.options.find((o) => o.isCorrect)?.label ?? ''

  const handleSubmit = () => {
    if (!selected) return
    setSubmitted(true)
    onAnswered(selected === correctLabel)
  }

  return (
    <Card padding="lg" className="max-w-3xl">
      <p className="text-label-caps text-primary mb-2">Pregunta de comprensión</p>
      <h3 className="text-body-lg font-medium text-foreground mb-6">{question.text}</h3>

      <RadioGroup
        variant="card"
        options={question.options.map((o) => ({
          value: o.label,
          label: `${o.label}. ${o.text}`,
        }))}
        selectedValue={selected ?? undefined}
        onValueChange={(v) => !submitted && setSelected(v)}
        isCorrect={selected === correctLabel}
        showFeedback={submitted}
      />

      {submitted && (
        <div className="mt-6 p-4 rounded-lg bg-surface-container-low border border-outline-variant/30">
          <p className="text-body-sm font-semibold text-foreground mb-2">Explicación</p>
          <p className="text-body-sm text-foreground-muted">{question.explanation}</p>
          <p className="text-body-sm text-primary mt-2">{question.normativeRef}</p>
        </div>
      )}

      <div className="flex justify-end mt-6">
        {!submitted ? (
          <Button onClick={handleSubmit} disabled={!selected}>
            Confirmar respuesta
          </Button>
        ) : (
          <Button onClick={() => onAnswered(selected === correctLabel)}>Continuar</Button>
        )}
      </div>
    </Card>
  )
}
