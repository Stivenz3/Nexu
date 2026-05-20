import { doc, getDoc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore'
import { db } from '@/firebase/config'
import type { ExamBlockProgress, LessonBlock, LessonProgress } from '@/types/lesson'

const INITIAL_BLOCKS_PROGRESS = {
  b01_video: { completed: false, videoWatched: false, watchedPct: 0 },
  b02_modulo_a: { completed: false, questionAnswered: false, answeredCorrect: false },
  b03_modulo_b: { completed: false, questionAnswered: false, answeredCorrect: false },
  b04_modulo_c: { completed: false, questionsAnswered: [false, false, false] },
  b05_modulo_d: { completed: false, questionsAnswered: [false, false] },
  b06_modulo_e: { completed: false, questionAnswered: false, answeredCorrect: false },
  b07_game: {
    completed: false,
    gameScore: 0,
    errorsFound: 0,
    hintsUsed: 0,
    timeSpentSec: 0,
  },
  b08_exam: { completed: false, lastScore: 0, attempts: 0, passed: false },
} as LessonProgress['blocksProgress']

export async function fetchLessonProgress(
  userId: string,
  lessonId: string
): Promise<LessonProgress | null> {
  const snap = await getDoc(doc(db, 'users', userId, 'lessonProgress', lessonId))
  return snap.exists() ? (snap.data() as LessonProgress) : null
}

export async function ensureLessonProgress(
  userId: string,
  lessonId: string
): Promise<LessonProgress> {
  const existing = await fetchLessonProgress(userId, lessonId)
  if (existing) return existing

  const progress: LessonProgress = {
    lessonId,
    status: 'in_progress',
    startedAt: serverTimestamp(),
    completedAt: null,
    lastBlockCompleted: '',
    totalTimeSpentSec: 0,
    blocksProgress: { ...INITIAL_BLOCKS_PROGRESS },
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
  passingPercent: number
) {
  const ref = doc(db, 'users', userId, 'lessonProgress', lessonId)
  const snap = await getDoc(ref)
  const current = snap.data() as LessonProgress
  const exam = (current.blocksProgress.b08_exam ?? {}) as ExamBlockProgress
  const passed = score >= passingPercent
  const attempts = (exam?.attempts ?? 0) + 1
  const bestEvalScore = Math.max(current.bestEvalScore ?? 0, score)

  await updateDoc(ref, {
    bestEvalScore,
    evalAttempts: [...(current.evalAttempts ?? []), score],
    status: passed ? 'passed' : 'failed',
    completedAt: passed ? serverTimestamp() : current.completedAt,
    'blocksProgress.b08_exam': {
      completed: passed,
      lastScore: score,
      attempts,
      passed,
    },
    lastBlockCompleted: passed ? 'b08_exam' : current.lastBlockCompleted,
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
