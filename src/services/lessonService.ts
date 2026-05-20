import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  where,
} from 'firebase/firestore'
import { db } from '@/firebase/config'
import type {
  LessonBlock,
  LessonDoc,
  LessonQuestion,
  TheoryBlockContent,
} from '@/types/lesson'

const LESSONS = 'lessons'

export async function fetchActiveLessons(): Promise<LessonDoc[]> {
  const q = query(
    collection(db, LESSONS),
    where('isActive', '==', true),
    orderBy('order', 'asc')
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => d.data() as LessonDoc)
}

export async function fetchLesson(lessonId: string): Promise<LessonDoc | null> {
  const snap = await getDoc(doc(db, LESSONS, lessonId))
  return snap.exists() ? (snap.data() as LessonDoc) : null
}

export async function fetchLessonBlocks(lessonId: string): Promise<LessonBlock[]> {
  const q = query(
    collection(db, LESSONS, lessonId, 'blocks'),
    orderBy('order', 'asc')
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => d.data() as LessonBlock)
}

export async function fetchLessonQuestions(
  lessonId: string
): Promise<LessonQuestion[]> {
  const snap = await getDocs(collection(db, LESSONS, lessonId, 'questions'))
  return snap.docs.map((d) => d.data() as LessonQuestion)
}

export async function fetchQuestion(
  lessonId: string,
  questionId: string
): Promise<LessonQuestion | null> {
  const snap = await getDoc(doc(db, LESSONS, lessonId, 'questions', questionId))
  return snap.exists() ? (snap.data() as LessonQuestion) : null
}

export async function fetchExamQuestions(
  lessonId: string,
  count = 15,
  randomize = true
): Promise<LessonQuestion[]> {
  const all = (await fetchLessonQuestions(lessonId)).filter(
    (q) => q.questionType === 'evaluacion_final'
  )
  const pool = randomize ? shuffle([...all]) : [...all].sort((a, b) => a.order - b.order)
  return pool.slice(0, count)
}

export function getTheoryQuestionIds(content: TheoryBlockContent): string[] {
  if (content.questionIds?.length) return content.questionIds
  if (content.questionId) return [content.questionId]
  return []
}

function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}
