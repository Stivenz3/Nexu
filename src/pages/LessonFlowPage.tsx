import { useCallback, useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { BookOpenCheck } from 'lucide-react'
import { AppLayout } from '@/components/layout'
import { Button, ProgressBar } from '@/components/ui'
import { LessonBlockMap } from '@/components/lesson/LessonBlockMap'
import { GameBlockView } from '@/components/lesson/GameBlockView'
import { InlineQuestionView } from '@/components/lesson/InlineQuestionView'
import { TheoryBlockView } from '@/components/lesson/TheoryBlockView'
import { VideoBlockView } from '@/components/lesson/VideoBlockView'
import { useAuth } from '@/contexts/AuthContext'
import {
  fetchLesson,
  fetchLessonBlocks,
  fetchQuestion,
  getTheoryQuestionIds,
} from '@/services/lessonService'
import {
  canNavigateToBlock,
  ensureLessonProgress,
  fetchLessonProgress,
  isExamUnlocked,
  markBlockCompleted,
  updateBlockProgress,
} from '@/services/progressService'
import type {
  ExamBlockContent,
  GameBlockContent,
  LessonBlock,
  LessonDoc,
  LessonProgress,
  LessonQuestion,
  TheoryBlockContent,
  VideoBlockContent,
} from '@/types/lesson'

type Step = 'content' | 'question'

type LocationState = {
  examFailed?: boolean
  score?: number
}

export function LessonFlowPage() {
  const { id: lessonId } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()

  const [lesson, setLesson] = useState<LessonDoc | null>(null)
  const [blocks, setBlocks] = useState<LessonBlock[]>([])
  const [progress, setProgress] = useState<LessonProgress | null>(null)
  const [blockIndex, setBlockIndex] = useState(0)
  const [step, setStep] = useState<Step>('content')
  const [questionIndex, setQuestionIndex] = useState(0)
  const [currentQuestion, setCurrentQuestion] = useState<LessonQuestion | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [examGateMessage, setExamGateMessage] = useState<string | null>(null)
  const [blockJustCompleted, setBlockJustCompleted] = useState<string | null>(null)

  useEffect(() => {
    const state = location.state as LocationState | null
    if (state?.examFailed && typeof state.score === 'number') {
      setExamGateMessage(
        `Obtuviste ${state.score}% en la evaluación. Repasa los módulos del mapa y vuelve a intentar cuando estés listo.`
      )
      navigate(location.pathname, { replace: true, state: {} })
    }
  }, [location.state, location.pathname, navigate])

  const load = useCallback(async () => {
    if (!lessonId || !user?.id) return
    setLoading(true)
    setError(null)
    try {
      const [lessonData, blocksData] = await Promise.all([
        fetchLesson(lessonId),
        fetchLessonBlocks(lessonId),
      ])
      const progressData = await ensureLessonProgress(user.id, lessonId, blocksData)
      if (!lessonData) {
        setError('Lección no encontrada.')
        return
      }
      setLesson(lessonData)
      setBlocks(blocksData)
      setProgress(progressData)

      const firstIncomplete = blocksData.findIndex(
        (b) => !progressData.blocksProgress[b.blockId]?.completed
      )
      const idx = firstIncomplete >= 0 ? firstIncomplete : blocksData.length - 1
      setBlockIndex(idx)
      setStep('content')
      setQuestionIndex(0)
    } catch {
      setError('No se pudo cargar la lección. Verifica tu conexión.')
    } finally {
      setLoading(false)
    }
  }, [lessonId, user?.id])

  useEffect(() => {
    load()
  }, [load])

  const refreshProgress = useCallback(async () => {
    if (!lessonId || !user?.id) return null
    const latest = await fetchLessonProgress(user.id, lessonId)
    if (latest) setProgress(latest)
    return latest
  }, [lessonId, user?.id])

  const selectBlock = useCallback(
    (index: number) => {
      if (!canNavigateToBlock(blocks, progress, index)) return
      setBlockIndex(index)
      setStep('content')
      setQuestionIndex(0)
      setCurrentQuestion(null)
      setExamGateMessage(null)
      setBlockJustCompleted(null)
    },
    [blocks, progress]
  )

  const finishBlock = useCallback(
    async (blockId: string, extra: Record<string, unknown> = {}) => {
      if (!user?.id || !lessonId) return
      await markBlockCompleted(user.id, lessonId, blockId, extra)
      await refreshProgress()
      setBlockJustCompleted(blockId)
      setExamGateMessage(null)
    },
    [user?.id, lessonId, refreshProgress]
  )

  const currentBlock = blocks[blockIndex]
  const isReviewing = Boolean(
    currentBlock && progress?.blocksProgress[currentBlock.blockId]?.completed
  )
  const unlocked = currentBlock
    ? canNavigateToBlock(blocks, progress, blockIndex)
    : false
  const examReady = isExamUnlocked(blocks, progress)
  const contentBlocks = blocks.filter((b) => b.type !== 'exam')
  const completedContentCount = contentBlocks.filter(
    (b) => progress?.blocksProgress[b.blockId]?.completed
  ).length

  const handleVideoComplete = async () => {
    if (!currentBlock || isReviewing) return
    await finishBlock(currentBlock.blockId, {
      videoWatched: true,
      watchedPct: 100,
    })
  }

  const handleTheoryContinue = async () => {
    const content = currentBlock?.content as TheoryBlockContent
    const qIds = content ? getTheoryQuestionIds(content) : []
    if (qIds.length > 0) {
      const q = await fetchQuestion(lessonId!, qIds[0])
      setCurrentQuestion(q)
      setQuestionIndex(0)
      setStep('question')
    } else if (currentBlock && !isReviewing) {
      await finishBlock(currentBlock.blockId)
    }
  }

  const handleQuestionAnswered = async (correct: boolean) => {
    if (!user?.id || !lessonId || !currentBlock) return
    const content = currentBlock.content as TheoryBlockContent
    const qIds = getTheoryQuestionIds(content)

    if (isReviewing) {
      if (questionIndex < qIds.length - 1) {
        const nextQ = await fetchQuestion(lessonId, qIds[questionIndex + 1])
        setCurrentQuestion(nextQ)
        setQuestionIndex(questionIndex + 1)
      } else {
        setStep('content')
        setCurrentQuestion(null)
      }
      return
    }

    if (qIds.length > 1) {
      const bp = progress?.blocksProgress[currentBlock.blockId] as {
        questionsAnswered?: boolean[]
      }
      const answered = [...(bp?.questionsAnswered ?? qIds.map(() => false))]
      answered[questionIndex] = true

      await updateBlockProgress(user.id, lessonId, currentBlock.blockId, {
        ...bp,
        questionsAnswered: answered,
        questionAnswered: answered.every(Boolean),
        answeredCorrect: correct,
      })
      await refreshProgress()

      if (questionIndex < qIds.length - 1) {
        const nextQ = await fetchQuestion(lessonId, qIds[questionIndex + 1])
        setCurrentQuestion(nextQ)
        setQuestionIndex(questionIndex + 1)
        return
      }
    }

    await finishBlock(currentBlock.blockId, {
      questionAnswered: true,
      answeredCorrect: correct,
      questionsAnswered: qIds.map(() => true),
    })
    setStep('content')
    setCurrentQuestion(null)
  }

  const handleGameComplete = async (score: number, errorsFound: number) => {
    if (!currentBlock || isReviewing) return
    await finishBlock(currentBlock.blockId, {
      gameScore: score,
      errorsFound,
      hintsUsed: 0,
      timeSpentSec: 0,
    })
  }

  const handleExamStart = () => {
    if (!examReady) {
      const pending = contentBlocks.find(
        (b) => !progress?.blocksProgress[b.blockId]?.completed
      )
      setExamGateMessage(
        pending
          ? `Completa primero el bloque «${pending.title}» (cajita ${pending.order}) antes de la evaluación.`
          : 'Completa todos los bloques de contenido antes de la evaluación final.'
      )
      if (pending) {
        const idx = blocks.findIndex((b) => b.blockId === pending.blockId)
        if (idx >= 0) selectBlock(idx)
      }
      return
    }
    navigate(`/leccion/${lessonId}/evaluacion`)
  }

  if (loading) {
    return (
      <AppLayout showBack onBack={() => navigate('/ruta')}>
        <div className="flex justify-center py-24">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
        </div>
      </AppLayout>
    )
  }

  if (error || !lesson || blocks.length === 0) {
    return (
      <AppLayout showBack onBack={() => navigate('/ruta')}>
        <p className="text-error">{error ?? 'Sin contenido'}</p>
        <Link to="/ruta" className="text-primary mt-4 inline-block">
          Volver a la ruta
        </Link>
      </AppLayout>
    )
  }

  const progressPct =
    contentBlocks.length > 0
      ? (completedContentCount / contentBlocks.length) * 100
      : ((blockIndex + 1) / blocks.length) * 100

  const justCompletedBlock = blockJustCompleted
    ? blocks.find((b) => b.blockId === blockJustCompleted)
    : null

  return (
    <AppLayout showBack onBack={() => navigate('/ruta')} headerTitle="Lección">
      <div className="mb-6">
        <Link to="/ruta" className="text-body-sm text-primary font-medium">
          ← Ruta de aprendizaje
        </Link>
        <h1 className="text-h2 text-foreground mt-2">{lesson.title}</h1>
        <ProgressBar value={progressPct} className="mt-4" />
        {contentBlocks.length > 0 && (
          <p className="text-body-sm text-foreground-muted mt-2">
            Contenido completado: {completedContentCount} de {contentBlocks.length}
          </p>
        )}
      </div>

      <LessonBlockMap
        blocks={blocks}
        progress={progress}
        activeIndex={blockIndex}
        onSelectBlock={selectBlock}
      />

      {blockJustCompleted && justCompletedBlock && (
        <div className="mb-4 rounded-lg border border-primary/30 bg-primary/5 px-4 py-3 text-body-sm text-foreground">
          <strong>¡Bloque completado!</strong> «{justCompletedBlock.title}». Elige el
          siguiente bloque en el mapa o repasa uno anterior.
        </div>
      )}

      {examGateMessage && (
        <div className="mb-4 rounded-lg border border-secondary/40 bg-secondary/10 px-4 py-3 text-body-sm text-foreground">
          {examGateMessage}
        </div>
      )}

      {currentBlock && (
        <div className="mb-4">
          <p className="text-body-sm text-foreground-muted">
            Viendo: <span className="font-medium text-foreground">{currentBlock.title}</span>
          </p>
        </div>
      )}

      {!currentBlock ? null : !unlocked ? (
        <div className="space-y-3">
          <p className="text-foreground-muted">
            Este bloque está bloqueado. Completa el anterior en el mapa o elige uno ya
            desbloqueado (marcado sin candado).
          </p>
        </div>
      ) : (
        <>
          {isReviewing && (
            <div className="mb-4 flex items-start gap-3 rounded-lg border border-primary/25 bg-primary/5 px-4 py-3">
              <BookOpenCheck className="h-5 w-5 shrink-0 text-primary mt-0.5" />
              <div>
                <p className="text-body-sm font-semibold text-foreground">Modo repaso</p>
                <p className="text-body-sm text-foreground-muted">
                  Ya completaste este bloque. Puedes volver a leer el contenido; elige otro
                  bloque en el mapa cuando quieras.
                </p>
              </div>
            </div>
          )}

          {currentBlock.type === 'video' && step === 'content' && (
            <VideoBlockView
              content={currentBlock.content as VideoBlockContent}
              onComplete={handleVideoComplete}
              reviewMode={isReviewing}
            />
          )}

          {currentBlock.type === 'theory' && step === 'content' && (
            <TheoryBlockView
              content={currentBlock.content as TheoryBlockContent}
              onContinue={handleTheoryContinue}
              reviewMode={isReviewing}
            />
          )}

          {currentBlock.type === 'theory' &&
            step === 'question' &&
            currentQuestion && (
              <InlineQuestionView
                question={currentQuestion}
                onAnswered={handleQuestionAnswered}
                reviewMode={isReviewing}
              />
            )}

          {currentBlock.type === 'game' && (
            <GameBlockView
              content={currentBlock.content as GameBlockContent}
              onComplete={handleGameComplete}
              reviewMode={isReviewing}
            />
          )}

          {currentBlock.type === 'exam' && (
            <div className="max-w-2xl space-y-4">
              <p className="text-body-md text-foreground-muted">
                Evaluación final con{' '}
                {(currentBlock.content as ExamBlockContent).totalQuestions}{' '}
                preguntas. Necesitas{' '}
                {(currentBlock.content as ExamBlockContent).passingPercent}% para aprobar.
              </p>
              {!examReady && (
                <p className="text-body-sm text-foreground-muted">
                  Completa las cajitas de contenido (video, teoría y minijuego) antes de
                  iniciar.
                </p>
              )}
              <Button onClick={handleExamStart} disabled={!examReady}>
                {examReady ? 'Iniciar evaluación final' : 'Evaluación bloqueada'}
              </Button>
            </div>
          )}
        </>
      )}
    </AppLayout>
  )
}
