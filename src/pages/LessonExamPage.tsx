import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  X,
  ClipboardCheck,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Loader2,
  Award,
  RotateCcw,
} from 'lucide-react'
import { Button, Card, RadioGroup } from '@/components/ui'
import { useAuth } from '@/contexts/AuthContext'
import {
  fetchLesson,
  fetchLessonBlocks,
  fetchExamQuestions,
} from '@/services/lessonService'
import { issueCertificate } from '@/services/certificateService'
import {
  canAccessFinalExam,
  saveExamResult,
} from '@/services/progressService'
import type { ExamBlockContent, LessonQuestion } from '@/types/lesson'
import { cn } from '@/lib/utils'

type ExamPhase = 'questions' | 'submitting' | 'results'

interface ExamResult {
  score: number
  passed: boolean
  correct: number
  total: number
  passingPercent: number
  certificateId?: string
  error?: string
}

export function LessonExamPage() {
  const { id: lessonId } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [questions, setQuestions] = useState<LessonQuestion[]>([])
  const [examConfig, setExamConfig] = useState<ExamBlockContent | null>(null)
  const [examBlockId, setExamBlockId] = useState<string | null>(null)
  const [lessonTitle, setLessonTitle] = useState('')
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [showFeedback, setShowFeedback] = useState(false)
  const [loading, setLoading] = useState(true)
  const [blocked, setBlocked] = useState(false)
  const [phase, setPhase] = useState<ExamPhase>('questions')
  const [examResult, setExamResult] = useState<ExamResult | null>(null)

  useEffect(() => {
    if (!lessonId || !user?.id) return
    ;(async () => {
      const allowed = await canAccessFinalExam(user.id, lessonId)
      if (!allowed) {
        setBlocked(true)
        setLoading(false)
        return
      }

      const [lesson, blocks, examQs] = await Promise.all([
        fetchLesson(lessonId),
        fetchLessonBlocks(lessonId),
        fetchExamQuestions(lessonId, 15, true),
      ])
      const examBlock = blocks.find((b) => b.type === 'exam')
      if (lesson) setLessonTitle(lesson.title)
      if (examBlock) {
        setExamBlockId(examBlock.blockId)
        setExamConfig(examBlock.content as ExamBlockContent)
      }
      setQuestions(examQs)
      setLoading(false)
    })()
  }, [lessonId, user?.id])

  const question = questions[currentQuestion]
  const totalQuestions = questions.length

  const handleAnswerSelect = (value: string) => {
    if (!question || phase !== 'questions') return
    setSelectedAnswer(value)
    setAnswers({ ...answers, [question.questionId]: value })
    if (examConfig?.showExplanationAfterAnswer) {
      setShowFeedback(true)
    }
  }

  const correctLabel = question?.options.find((o) => o.isCorrect)?.label

  const calculateScore = (finalAnswers: Record<string, string>) => {
    let correct = 0
    for (const q of questions) {
      const ans = finalAnswers[q.questionId]
      const ok = q.options.find((o) => o.isCorrect)?.label
      if (ans === ok) correct++
    }
    const total = totalQuestions || 1
    const score = Math.round((correct / total) * 100)
    return { correct, total, score }
  }

  const handleNext = async () => {
    if (!question || !lessonId || !user?.id || !examConfig || phase !== 'questions') return

    if (currentQuestion < totalQuestions - 1) {
      const next = currentQuestion + 1
      setCurrentQuestion(next)
      setSelectedAnswer(answers[questions[next].questionId] ?? null)
      setShowFeedback(false)
      return
    }

    const finalAnswers = {
      ...answers,
      [question.questionId]: selectedAnswer ?? answers[question.questionId],
    }

    setPhase('submitting')

    try {
      const { correct, total, score } = calculateScore(finalAnswers)
      const passed = score >= examConfig.passingPercent

      await saveExamResult(
        user.id,
        lessonId,
        score,
        examConfig.passingPercent,
        examBlockId ?? undefined
      )

      let certificateId: string | undefined
      let error: string | undefined

      if (passed) {
        try {
          const cert = await issueCertificate({
            userId: user.id,
            lessonId,
            lessonTitle,
            finalScore: score,
            userName: user.fullName,
            userDocument: `${user.documentType?.toUpperCase() ?? 'CC'}. ${user.documentNumber}`,
            documentType: user.documentType ?? 'cc',
            documentNumber: user.documentNumber,
          })
          certificateId = cert.certificateId
        } catch (e) {
          error =
            e instanceof Error
              ? e.message
              : 'Aprobaste, pero no se pudo generar el certificado. Intenta desde Certificados.'
        }
      }

      setExamResult({
        score,
        passed,
        correct,
        total,
        passingPercent: examConfig.passingPercent,
        certificateId,
        error,
      })
      setPhase('results')
    } catch (e) {
      setExamResult({
        score: 0,
        passed: false,
        correct: 0,
        total: totalQuestions,
        passingPercent: examConfig.passingPercent,
        error:
          e instanceof Error
            ? e.message
            : 'No se pudo guardar el resultado. Revisa tu conexión e intenta de nuevo.',
      })
      setPhase('results')
    }
  }

  const handleRetry = () => {
    setPhase('questions')
    setExamResult(null)
    setCurrentQuestion(0)
    setSelectedAnswer(null)
    setAnswers({})
    setShowFeedback(false)
  }

  const examHeader = (
    <header className="bg-white border-b border-outline-variant/30 sticky top-0 z-50">
      <div className="max-w-container mx-auto px-lg">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <span className="text-h3 font-bold text-primary">Nexu</span>
            <span className="text-outline-variant">|</span>
            <span className="text-body-md text-foreground-muted">Evaluación final</span>
          </div>
          {phase === 'questions' && (
            <button
              type="button"
              onClick={() => navigate(`/leccion/${lessonId}`)}
              className="flex items-center gap-2 text-body-sm text-foreground-muted hover:text-foreground"
            >
              <X className="w-4 h-4" />
              Salir
            </button>
          )}
        </div>
      </div>
    </header>
  )

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  if (blocked) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-surface px-lg text-center">
        <ClipboardCheck className="w-12 h-12 text-foreground-muted mb-4" />
        <h1 className="text-h3 text-foreground mb-2">Evaluación no disponible</h1>
        <p className="text-body-md text-foreground-muted max-w-md mb-6">
          Debes completar todos los bloques de la lección (video, módulos de teoría y
          minijuego) antes de presentar la evaluación final.
        </p>
        <Button onClick={() => navigate(`/leccion/${lessonId}`)}>
          Volver a la lección
        </Button>
      </div>
    )
  }

  if (!examConfig || totalQuestions === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-surface px-lg text-center">
        <p className="text-foreground-muted mb-4">
          No hay preguntas de evaluación configuradas para esta lección.
        </p>
        <Button onClick={() => navigate(`/leccion/${lessonId}`)}>Volver a la lección</Button>
      </div>
    )
  }

  if (phase === 'submitting') {
    return (
      <div className="min-h-screen bg-surface">
        {examHeader}
        <main className="max-w-lg mx-auto px-lg py-24 text-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <h2 className="text-h3 text-foreground mb-2">Calculando tu resultado…</h2>
          <p className="text-body-md text-foreground-muted">
            Guardando respuestas y verificando si alcanzaste el puntaje mínimo.
          </p>
        </main>
      </div>
    )
  }

  if (phase === 'results' && examResult) {
    const { score, passed, correct, total, passingPercent, certificateId, error } =
      examResult

    return (
      <div className="min-h-screen bg-surface">
        {examHeader}
        <main className="max-w-lg mx-auto px-lg py-xl">
          <Card padding="lg" className="text-center">
            {passed ? (
              <CheckCircle2 className="w-16 h-16 text-primary mx-auto mb-4" />
            ) : (
              <XCircle className="w-16 h-16 text-error mx-auto mb-4" />
            )}

            <h1 className="text-h2 text-foreground mb-2">
              {passed ? '¡Felicitaciones, aprobaste!' : 'No alcanzaste el mínimo'}
            </h1>

            <p className="text-body-sm text-foreground-muted mb-6">{lessonTitle}</p>

            <div
              className={cn(
                'inline-flex items-baseline gap-1 rounded-2xl px-6 py-4 mb-4',
                passed ? 'bg-primary/10' : 'bg-error/10'
              )}
            >
              <span
                className={cn(
                  'text-5xl font-bold tabular-nums',
                  passed ? 'text-primary' : 'text-error'
                )}
              >
                {score}%
              </span>
            </div>

            <p className="text-body-md text-foreground mb-2">
              Respondiste correctamente{' '}
              <strong>
                {correct} de {total}
              </strong>{' '}
              preguntas.
            </p>
            <p className="text-body-sm text-foreground-muted mb-6">
              Puntaje mínimo para aprobar: <strong>{passingPercent}%</strong>
            </p>

            {error && (
              <div className="rounded-lg bg-error/10 text-error text-body-sm px-4 py-3 mb-6 text-left">
                {error}
              </div>
            )}

            <div className="flex flex-col gap-3">
              {passed && certificateId && (
                <Button
                  className="w-full justify-center gap-2"
                  onClick={() =>
                    navigate('/certificado', { state: { certificateId } })
                  }
                >
                  <Award className="w-5 h-5" />
                  Ver mi certificado
                </Button>
              )}
              {passed && !certificateId && !error && (
                <Button
                  className="w-full justify-center gap-2"
                  onClick={() => navigate('/certificado')}
                >
                  <Award className="w-5 h-5" />
                  Ir a certificados
                </Button>
              )}
              {!passed && (
                <Button className="w-full justify-center gap-2" onClick={handleRetry}>
                  <RotateCcw className="w-5 h-5" />
                  Intentar de nuevo
                </Button>
              )}
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate(`/leccion/${lessonId}`)}
              >
                Volver a la lección
              </Button>
              <Button variant="ghost" className="w-full" onClick={() => navigate('/ruta')}>
                Ir a la ruta de aprendizaje
              </Button>
            </div>
          </Card>
        </main>
      </div>
    )
  }

  if (!question) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <p className="text-foreground-muted">No hay preguntas de evaluación.</p>
      </div>
    )
  }

  const isCorrect = selectedAnswer === correctLabel

  return (
    <div className="min-h-screen bg-surface">
      {examHeader}

      <main className="max-w-3xl mx-auto px-lg py-xl">
        <div className="mb-8">
          <span className="text-label-caps text-primary uppercase tracking-wider">
            {lessonTitle}
          </span>
          <div className="flex items-center justify-between mt-1">
            <h2 className="text-body-md font-semibold text-foreground">Evaluación final</h2>
            <span className="text-body-sm text-foreground-muted">
              {currentQuestion + 1} de {totalQuestions}
            </span>
          </div>
        </div>

        <div className="flex gap-1 mb-8">
          {questions.map((_, index) => (
            <div
              key={index}
              className={cn(
                'h-1.5 flex-1 rounded-full transition-colors duration-300',
                index < currentQuestion
                  ? 'bg-primary'
                  : index === currentQuestion
                    ? 'bg-secondary'
                    : 'bg-surface-container-high'
              )}
            />
          ))}
        </div>

        <Card padding="lg" className="mb-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center">
              <ClipboardCheck className="w-5 h-5 text-foreground-muted" />
            </div>
            <h3 className="text-body-lg font-medium text-foreground flex-1">
              {question.text}
            </h3>
          </div>

          <RadioGroup
            options={question.options.map((o) => ({
              value: o.label,
              label: `${o.label}. ${o.text}`,
            }))}
            selectedValue={selectedAnswer ?? undefined}
            onValueChange={handleAnswerSelect}
            variant="card"
            isCorrect={isCorrect}
            showFeedback={showFeedback}
          />

          {showFeedback && examConfig.showExplanationAfterAnswer && (
            <div className="mt-6 p-4 rounded-lg bg-surface-container-low">
              <p className="text-body-sm text-foreground-muted">{question.explanation}</p>
            </div>
          )}
        </Card>

        <div className="flex justify-end">
          <Button
            onClick={handleNext}
            disabled={!selectedAnswer}
            className="group"
          >
            <span>
              {currentQuestion < totalQuestions - 1 ? 'Siguiente' : 'Finalizar evaluación'}
            </span>
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </main>
    </div>
  )
}
