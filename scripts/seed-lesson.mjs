/**
 * Pobla Firestore con una lección desde firestore-seed/lesson_XX/.
 *
 * Uso:
 *   node seed-lesson.mjs 01    → firestore-seed/lesson_01/
 *   node seed-lesson.mjs 02    → firestore-seed/lesson_02/
 *
 * Requiere: gcloud auth application-default login
 * Proyecto: nexu-156ce (firebase use)
 */
import { readFileSync, existsSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import { initializeApp, applicationDefault } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

const __dirname = dirname(fileURLToPath(import.meta.url))
const lessonKey = process.argv[2]

if (!lessonKey || !/^\d{2}$/.test(lessonKey)) {
  console.error('Uso: node seed-lesson.mjs <01|02|03|...>')
  process.exit(1)
}

const SEED_DIR = join(__dirname, '..', 'firestore-seed', `lesson_${lessonKey}`)

function loadJson(filename) {
  const path = join(SEED_DIR, filename)
  if (!existsSync(path)) {
    throw new Error(`No existe ${path}`)
  }
  return JSON.parse(readFileSync(path, 'utf8'))
}

async function deleteCollection(db, collectionPath, batchSize = 400) {
  const colRef = db.collection(collectionPath)
  const snapshot = await colRef.limit(batchSize).get()
  if (snapshot.empty) return

  const batch = db.batch()
  snapshot.docs.forEach((doc) => batch.delete(doc.ref))
  await batch.commit()

  if (snapshot.size >= batchSize) {
    await deleteCollection(db, collectionPath, batchSize)
  }
}

async function main() {
  const lesson = loadJson('lesson.json')
  const blocks = loadJson('blocks.json')
  const questions = loadJson('questions.json')
  const LESSON_ID = lesson.lessonId

  if (!LESSON_ID) {
    throw new Error('lesson.json debe incluir lessonId')
  }
  if (!Array.isArray(blocks) || blocks.length === 0) {
    throw new Error('blocks.json debe ser un array con al menos un bloque')
  }
  if (!Array.isArray(questions)) {
    throw new Error('questions.json debe ser un array')
  }

  initializeApp({
    credential: applicationDefault(),
    projectId: process.env.GCLOUD_PROJECT || process.env.FIREBASE_PROJECT || 'nexu-156ce',
  })

  const db = getFirestore()

  console.log(`Eliminando datos previos de ${LESSON_ID}...`)
  await deleteCollection(db, `lessons/${LESSON_ID}/blocks`)
  await deleteCollection(db, `lessons/${LESSON_ID}/questions`)
  await db.doc(`lessons/${LESSON_ID}`).delete().catch(() => {})

  console.log('Insertando lección, bloques y preguntas...')
  await db.doc(`lessons/${LESSON_ID}`).set(lesson)

  for (const block of blocks) {
    await db.doc(`lessons/${LESSON_ID}/blocks/${block.blockId}`).set(block)
  }

  for (const question of questions) {
    await db.doc(`lessons/${LESSON_ID}/questions/${question.questionId}`).set(question)
  }

  console.log(
    `Listo (lesson_${lessonKey}): 1 lección, ${blocks.length} bloques, ${questions.length} preguntas.`
  )
  console.log(`lessonId: ${LESSON_ID}`)
  if (lesson.isActive === false) {
    console.warn('Aviso: isActive es false — no aparecerá en /ruta hasta activarla.')
  }
}

main().catch((err) => {
  console.error('Error en seed:', err.message)
  process.exit(1)
})
