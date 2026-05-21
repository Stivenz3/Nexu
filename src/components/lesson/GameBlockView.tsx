import { useState } from 'react'
import { Button, Card } from '@/components/ui'
import type { GameBlockContent } from '@/types/lesson'

interface GameBlockViewProps {
  content: GameBlockContent
  onComplete: (score: number, errorsFound: number) => void
  reviewMode?: boolean
}

export function GameBlockView({
  content,
  onComplete,
  reviewMode = false,
}: GameBlockViewProps) {
  const [found, setFound] = useState<Set<string>>(new Set())
  const [wrongClicks, setWrongClicks] = useState(0)
  const [hintsUsed, setHintsUsed] = useState(0)

  const toggleError = (errorId: string) => {
    setFound((prev) => {
      const next = new Set(prev)
      if (next.has(errorId)) next.delete(errorId)
      else next.add(errorId)
      return next
    })
  }

  const handleFinish = () => {
    const { baseScore, penaltyPerWrongClick, penaltyPerHint, passingScore } =
      content.scoring
    const score = Math.max(
      0,
      baseScore -
        wrongClicks * penaltyPerWrongClick -
        hintsUsed * penaltyPerHint
    )
    onComplete(score, found.size)
    if (score < passingScore && found.size < content.totalErrors) {
      // still allow continue in dev if found all errors
    }
  }

  const allFound = found.size >= content.totalErrors

  return (
    <div className="space-y-6 max-w-4xl">
      <p className="text-body-md text-foreground-muted">{content.scenario}</p>
      <p className="text-body-md font-medium text-foreground">{content.objective}</p>

      <Card padding="lg" className="bg-surface-container-low">
        <p className="text-body-sm text-foreground-muted mb-4">
          Escena: {content.sceneName} · Encuentra {content.totalErrors} errores (
          {found.size}/{content.totalErrors})
        </p>
        <div className="grid sm:grid-cols-2 gap-3">
          {content.errors.map((err) => {
            const isFound = found.has(err.errorId)
            return (
              <button
                key={err.errorId}
                type="button"
                onClick={() => toggleError(err.errorId)}
                className={`text-left p-4 rounded-lg border-2 transition-colors ${
                  isFound
                    ? 'border-success bg-success/10'
                    : 'border-outline-variant hover:border-primary/50'
                }`}
              >
                <span className="text-body-sm font-semibold block mb-1">
                  {isFound ? '✓ ' : ''}
                  Error en cocina
                </span>
                {isFound && (
                  <>
                    <p className="text-body-sm text-foreground-muted">{err.description}</p>
                    <p className="text-body-sm text-primary mt-2">{err.feedbackText}</p>
                  </>
                )}
              </button>
            )
          })}
        </div>
        <div className="flex gap-3 mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setHintsUsed((h) => h + 1)}
          >
            Pista ({hintsUsed})
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setWrongClicks((w) => w + 1)}
          >
            Simular clic erróneo
          </Button>
        </div>
      </Card>

      {!reviewMode && (
        <div className="flex justify-end">
          <Button onClick={handleFinish} disabled={!allFound}>
            {allFound ? 'Completar minijuego' : `Faltan ${content.totalErrors - found.size} errores`}
          </Button>
        </div>
      )}
    </div>
  )
}
