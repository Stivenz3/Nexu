import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { X, ClipboardCheck, ArrowRight } from 'lucide-react'
import { Button, Card, RadioGroup } from '@/components/ui'
import { useAuth } from '@/contexts/AuthContext'
import {
  fetchLesson,
  fetchLessonBlocks,
  fetchExamQuestions,
} from '@/services/lessonService'
import { issueCertificate } from '@/services/certificateService'
import { saveExamResult } from '@/services/progressService'
import type { ExamBlockContent, LessonQuestion } from '@/types/lesson'
import { cn } from '@/lib/utils'

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

  useEffect(() => {
    if (!lessonId) return
    ;(async () => {
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
  }, [lessonId])

  const question = questions[currentQuestion]
  const totalQuestions = questions.length

  const handleAnswerSelect = (value: string) => {
    if (!question) return
    setSelectedAnswer(value)
    setAnswers({ ...answers, [question.questionId]: value })
    if (examConfig?.showExplanationAfterAnswer) {
      setShowFeedback(true)
    }
  }

  const correctLabel = question?.options.find((o) => o.isCorrect)?.label

  const handleNext = async () => {
    if (!question || !lessonId || !user?.id || !examConfig) return

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
    let correct = 0
    for (const q of questions) {
      const ans = finalAnswers[q.questionId]
      const ok = q.options.find((o) => o.isCorrect)?.label
      if (ans === ok) correct++
    }
    const score = Math.round((correct / totalQuestions) * 100)
    await saveExamResult(
      user.id,
      lessonId,
      score,
      examConfig.passingPercent,
      examBlockId ?? undefined
    )

    if (score >= examConfig.passingPercent) {
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
      navigate('/certificado', { state: { certificateId: cert.certificateId } })
    } else {
      navigate(`/leccion/${lessonId}`, {
        state: { examFailed: true, score },
      })
    }
  }

  if (loading || !question) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  const isCorrect = selectedAnswer === correctLabel

  return (
    <div className="min-h-screen bg-surface">
      <header className="bg-white border-b border-outline-variant/30 sticky top-0 z-50">
        <div className="max-w-container mx-auto px-lg">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <span className="text-h3 font-bold text-primary">Nexu</span>
              <span className="text-outline-variant">|</span>
              <span className="text-body-md text-foreground-muted">
                Evaluación final
              </span>
            </div>
            <button
              type="button"
              onClick={() => navigate(`/leccion/${lessonId}`)}
              className="flex items-center gap-2 text-body-sm text-foreground-muted hover:text-foreground"
            >
              <X className="w-4 h-4" />
              Salir
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-lg py-xl">
        <div className="mb-8">
          <span className="text-label-caps text-primary uppercase tracking-wider">
            {lessonTitle}
          </span>
          <div className="flex items-center justify-between mt-1">
            <h2 className="text-body-md font-semibold text-foreground">
              Evaluación final — Lección 1
            </h2>
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

          {showFeedback && examConfig?.showExplanationAfterAnswer && (
            <div className="mt-6 p-4 rounded-lg bg-surface-container-low">
              <p className="text-body-sm text-foreground-muted">{question.explanation}</p>
            </div>
          )}
        </Card>

        <div className="flex justify-end">
          <Button onClick={handleNext} disabled={!selectedAnswer} className="group">
            <span>
              {currentQuestion < totalQuestions - 1 ? 'Siguiente' : 'Finalizar'}
            </span>
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </main>
    </div>
  )
}
