import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { AppLayout } from '@/components/layout'
import { Button, ProgressBar } from '@/components/ui'
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
  ensureLessonProgress,
  isBlockUnlocked,
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

export function LessonFlowPage() {
  const { id: lessonId } = useParams<{ id: string }>()
  const navigate = useNavigate()
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

      const prog = progressData
      setProgress(prog)

      const firstIncomplete = blocksData.findIndex(
        (b) => !prog.blocksProgress[b.blockId]?.completed
      )
      const idx = firstIncomplete >= 0 ? firstIncomplete : 0
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

  const currentBlock = blocks[blockIndex]
  const unlocked = currentBlock
    ? isBlockUnlocked(blocks, progress, blockIndex)
    : false

  const goToNextBlock = () => {
    setStep('content')
    setQuestionIndex(0)
    setCurrentQuestion(null)
    if (blockIndex < blocks.length - 1) {
      setBlockIndex(blockIndex + 1)
    } else {
      navigate('/ruta')
    }
  }

  const handleVideoComplete = async () => {
    if (!user?.id || !lessonId || !currentBlock) return
    await markBlockCompleted(user.id, lessonId, currentBlock.blockId, {
      videoWatched: true,
      watchedPct: 100,
    })
    setProgress((p) =>
      p
        ? {
            ...p,
            blocksProgress: {
              ...p.blocksProgress,
              [currentBlock.blockId]: {
                completed: true,
                videoWatched: true,
                watchedPct: 100,
              },
            },
          }
        : p
    )
    goToNextBlock()
  }

  const handleTheoryContinue = async () => {
    const content = currentBlock?.content as TheoryBlockContent
    const qIds = content ? getTheoryQuestionIds(content) : []
    if (qIds.length > 0) {
      const q = await fetchQuestion(lessonId!, qIds[0])
      setCurrentQuestion(q)
      setQuestionIndex(0)
      setStep('question')
    } else {
      await markBlockCompleted(user!.id, lessonId!, currentBlock!.blockId)
      goToNextBlock()
    }
  }

  const handleQuestionAnswered = async (correct: boolean) => {
    if (!user?.id || !lessonId || !currentBlock) return
    const content = currentBlock.content as TheoryBlockContent
    const qIds = getTheoryQuestionIds(content)

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

      if (questionIndex < qIds.length - 1) {
        const nextQ = await fetchQuestion(lessonId, qIds[questionIndex + 1])
        setCurrentQuestion(nextQ)
        setQuestionIndex(questionIndex + 1)
        return
      }
    }

    await markBlockCompleted(user.id, lessonId, currentBlock.blockId, {
      questionAnswered: true,
      answeredCorrect: correct,
      questionsAnswered: qIds.map(() => true),
    })
    goToNextBlock()
  }

  const handleGameComplete = async (score: number, errorsFound: number) => {
    if (!user?.id || !lessonId || !currentBlock) return
    await markBlockCompleted(user.id, lessonId, currentBlock.blockId, {
      gameScore: score,
      errorsFound,
      hintsUsed: 0,
      timeSpentSec: 0,
    })
    goToNextBlock()
  }

  const handleExamStart = () => {
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

  if (error || !lesson || !currentBlock) {
    return (
      <AppLayout showBack onBack={() => navigate('/ruta')}>
        <p className="text-error">{error ?? 'Sin contenido'}</p>
        <Link to="/ruta" className="text-primary mt-4 inline-block">
          Volver a la ruta
        </Link>
      </AppLayout>
    )
  }

  const progressPct = ((blockIndex + 1) / blocks.length) * 100

  return (
    <AppLayout showBack onBack={() => navigate('/ruta')} headerTitle="Lección">
      <div className="mb-6">
        <Link to="/ruta" className="text-body-sm text-primary font-medium">
          ← Ruta de aprendizaje
        </Link>
        <h1 className="text-h2 text-foreground mt-2">{lesson.title}</h1>
        <p className="text-body-sm text-foreground-muted mt-1">
          Bloque {blockIndex + 1} de {blocks.length}: {currentBlock.title}
        </p>
        <ProgressBar value={progressPct} className="mt-4" />
      </div>

      {!unlocked ? (
        <p className="text-foreground-muted">
          Completa el bloque anterior para desbloquear este contenido.
        </p>
      ) : (
        <>
          {currentBlock.type === 'video' && step === 'content' && (
            <VideoBlockView
              content={currentBlock.content as VideoBlockContent}
              onComplete={handleVideoComplete}
            />
          )}

          {currentBlock.type === 'theory' && step === 'content' && (
            <TheoryBlockView
              content={currentBlock.content as TheoryBlockContent}
              onContinue={handleTheoryContinue}
            />
          )}

          {currentBlock.type === 'theory' &&
            step === 'question' &&
            currentQuestion && (
              <InlineQuestionView
                question={currentQuestion}
                onAnswered={handleQuestionAnswered}
              />
            )}

          {currentBlock.type === 'game' && (
            <GameBlockView
              content={currentBlock.content as GameBlockContent}
              onComplete={handleGameComplete}
            />
          )}

          {currentBlock.type === 'exam' && (
            <div className="max-w-2xl space-y-4">
              <p className="text-body-md text-foreground-muted">
                Evaluación final con{' '}
                {(currentBlock.content as ExamBlockContent).totalQuestions}{' '}
                preguntas. Necesitas{' '}
                {(currentBlock.content as ExamBlockContent).passingPercent}% para
                aprobar.
              </p>
              <Button onClick={handleExamStart}>Iniciar evaluación final</Button>
            </div>
          )}
        </>
      )}
    </AppLayout>
  )
}
