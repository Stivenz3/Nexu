import { doc, getDoc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore'
import { db } from '@/firebase/config'
import {
  fetchActiveLessons,
  fetchLessonBlocks,
  getTheoryQuestionIds,
} from '@/services/lessonService'
import type {
  ExamBlockProgress,
  LessonBlock,
  LessonProgress,
  TheoryBlockContent,
  BlockProgressEntry,
} from '@/types/lesson'

export function createInitialBlockProgress(block: LessonBlock): BlockProgressEntry {
  switch (block.type) {
    case 'video':
      return { completed: false, videoWatched: false, watchedPct: 0 }
    case 'theory': {
      const content = block.content as TheoryBlockContent
      const questionIds = getTheoryQuestionIds(content)
      if (questionIds.length > 1) {
        return {
          completed: false,
          questionsAnswered: questionIds.map(() => false),
        }
      }
      return {
        completed: false,
        questionAnswered: false,
        answeredCorrect: false,
      }
    }
    case 'game':
      return {
        completed: false,
        gameScore: 0,
        errorsFound: 0,
        hintsUsed: 0,
        timeSpentSec: 0,
      }
    case 'exam':
      return { completed: false, lastScore: 0, attempts: 0, passed: false }
    default:
      return { completed: false }
  }
}

export function buildBlocksProgress(blocks: LessonBlock[]): LessonProgress['blocksProgress'] {
  return Object.fromEntries(
    blocks.map((block) => [block.blockId, createInitialBlockProgress(block)])
  )
}

export async function getExamBlockId(lessonId: string, blocks?: LessonBlock[]): Promise<string | null> {
  const list = blocks ?? (await fetchLessonBlocks(lessonId))
  return list.find((b) => b.type === 'exam')?.blockId ?? null
}

export async function fetchLessonProgress(
  userId: string,
  lessonId: string
): Promise<LessonProgress | null> {
  const snap = await getDoc(doc(db, 'users', userId, 'lessonProgress', lessonId))
  return snap.exists() ? (snap.data() as LessonProgress) : null
}

export async function ensureLessonProgress(
  userId: string,
  lessonId: string,
  blocks?: LessonBlock[]
): Promise<LessonProgress> {
  const existing = await fetchLessonProgress(userId, lessonId)
  if (existing) return existing

  const blockList = blocks ?? (await fetchLessonBlocks(lessonId))
  if (blockList.length === 0) {
    throw new Error(`La lección ${lessonId} no tiene bloques en Firestore.`)
  }

  const progress: LessonProgress = {
    lessonId,
    status: 'in_progress',
    startedAt: serverTimestamp(),
    completedAt: null,
    lastBlockCompleted: '',
    totalTimeSpentSec: 0,
    blocksProgress: buildBlocksProgress(blockList),
    evalAttempts: [],
    bestEvalScore: 0,
  }

  await setDoc(doc(db, 'users', userId, 'lessonProgress', lessonId), progress)
  return progress
}

export async function updateBlockProgress(
  userId: string,
  lessonId: string,
  blockId: string,
  blockUpdate: Record<string, unknown>,
  lastBlockCompleted?: string
) {
  const ref = doc(db, 'users', userId, 'lessonProgress', lessonId)
  const snap = await getDoc(ref)
  const current = snap.data() as LessonProgress
  const prev = current?.blocksProgress?.[blockId] ?? { completed: false }

  const payload: Record<string, unknown> = {
    [`blocksProgress.${blockId}`]: { ...prev, ...blockUpdate },
  }
  if (lastBlockCompleted) {
    payload.lastBlockCompleted = lastBlockCompleted
  }
  await updateDoc(ref, payload)
}

export async function markBlockCompleted(
  userId: string,
  lessonId: string,
  blockId: string,
  extra: Record<string, unknown> = {}
) {
  const ref = doc(db, 'users', userId, 'lessonProgress', lessonId)
  const snap = await getDoc(ref)
  const current = snap.data() as LessonProgress
  const prev = current.blocksProgress[blockId] ?? { completed: false }

  await updateDoc(ref, {
    lastBlockCompleted: blockId,
    [`blocksProgress.${blockId}`]: { ...prev, ...extra, completed: true },
  })
}

export async function saveExamResult(
  userId: string,
  lessonId: string,
  score: number,
  passingPercent: number,
  examBlockId?: string
) {
  const examId = examBlockId ?? (await getExamBlockId(lessonId))
  if (!examId) {
    throw new Error(`No hay bloque de examen en la lección ${lessonId}.`)
  }

  const ref = doc(db, 'users', userId, 'lessonProgress', lessonId)
  const snap = await getDoc(ref)
  const current = snap.data() as LessonProgress
  const exam = (current.blocksProgress[examId] ?? {}) as ExamBlockProgress
  const passed = score >= passingPercent
  const attempts = (exam?.attempts ?? 0) + 1
  const bestEvalScore = Math.max(current.bestEvalScore ?? 0, score)

  await updateDoc(ref, {
    bestEvalScore,
    evalAttempts: [...(current.evalAttempts ?? []), score],
    status: passed ? 'passed' : 'failed',
    completedAt: passed ? serverTimestamp() : current.completedAt,
    [`blocksProgress.${examId}`]: {
      completed: passed,
      lastScore: score,
      attempts,
      passed,
    },
    lastBlockCompleted: passed ? examId : current.lastBlockCompleted,
  })
}

export function isBlockUnlocked(
  blocks: LessonBlock[],
  progress: LessonProgress | null,
  blockIndex: number
): boolean {
  if (blockIndex === 0) return true
  if (!progress) return blockIndex === 0
  const prevBlock = blocks[blockIndex - 1]
  const prevProgress = progress.blocksProgress[prevBlock.blockId]
  return Boolean(prevProgress?.completed)
}

/** Última lección desbloqueada en la ruta (misma lógica que LearningPathPage). */
export async function resolveEvalLessonId(userId: string): Promise<string> {
  const lessons = await fetchActiveLessons()
  if (lessons.length === 0) return 'lesson_01_higiene_personal'

  let targetId = lessons[0].lessonId

  for (let i = 0; i < lessons.length; i++) {
    const prevPassed =
      i === 0 || (await fetchLessonProgress(userId, lessons[i - 1].lessonId))?.status === 'passed'
    if (!prevPassed) break
    targetId = lessons[i].lessonId
  }

  return targetId
}
