/**
 * Pobla Firestore con la Lección 1 (Higiene Personal).
 * Requiere: firebase login && firebase use nexu-156ce
 * Ejecutar: npm run seed:lesson1
 */
import { readFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import { initializeApp, applicationDefault } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

const __dirname = dirname(fileURLToPath(import.meta.url))
const SEED_DIR = join(__dirname, '..', 'firestore-seed', 'lesson_01')
const LESSON_ID = 'lesson_01_higiene_personal'

function loadJson(filename) {
  return JSON.parse(readFileSync(join(SEED_DIR, filename), 'utf8'))
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
  initializeApp({
    credential: applicationDefault(),
    projectId: process.env.GCLOUD_PROJECT || process.env.FIREBASE_PROJECT || 'nexu-156ce',
  })

  const db = getFirestore()
  const lesson = loadJson('lesson.json')
  const blocks = loadJson('blocks.json')
  const questions = loadJson('questions.json')

  console.log('Eliminando datos previos de la lección 1...')
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

  console.log(`Listo: 1 lección, ${blocks.length} bloques, ${questions.length} preguntas.`)
}

main().catch((err) => {
  console.error('Error en seed:', err.message)
  process.exit(1)
})
