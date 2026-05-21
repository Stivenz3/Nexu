import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  Timestamp,
  where,
  orderBy,
} from 'firebase/firestore'
import { db } from '@/firebase/config'
import { buildVerifyUrl } from '@/lib/verifyUrl'
import type {
  CertificatePublicRecord,
  CertificateRecord,
  CertificateStatus,
  CertificateView,
} from '@/types/certificate'

const CERTIFICATES = 'certificates'
const CERTIFICATE_PUBLIC = 'certificatePublic'
const COURSE_NAME = 'Buenas Prácticas de Manufactura'
const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000

function maskDocument(documentType: string, documentNumber: string): string {
  const tail = documentNumber.slice(-4)
  return `${documentType.toUpperCase()}. ***${tail}`
}

function generateVerifyCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = 'NX-'
  for (let i = 0; i < 10; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

function generateCertificateId(userId: string, lessonId: string): string {
  const t = Date.now().toString(36)
  return `cert_${userId.slice(0, 6)}_${lessonId.slice(0, 12)}_${t}`
}

function resolveStatus(expiresAt: Date, isValid: boolean): CertificateStatus {
  if (!isValid) return 'revoked'
  if (expiresAt.getTime() < Date.now()) return 'expired'
  return 'valid'
}

function toView(
  data: CertificateRecord,
  expiresAt: Date,
  issuedAt: Date
): CertificateView {
  return {
    certificateId: data.certificateId,
    verifyCode: data.verifyCode,
    userId: data.userId,
    userName: data.userName,
    userDocument: data.userDocument,
    lessonId: data.lessonId,
    lessonTitle: data.lessonTitle,
    courseName: data.courseName,
    finalScore: data.finalScore,
    qrVerifyUrl: data.qrVerifyUrl,
    issuedAt,
    expiresAt,
    status: resolveStatus(expiresAt, data.isValid),
  }
}

function timestampToDate(ts: Timestamp): Date {
  return ts.toDate()
}

export async function getCertificateByLesson(
  userId: string,
  lessonId: string
): Promise<CertificateView | null> {
  const q = query(
    collection(db, CERTIFICATES),
    where('userId', '==', userId),
    where('lessonId', '==', lessonId)
  )
  const snap = await getDocs(q)
  if (snap.empty) return null
  const data = snap.docs[0].data() as CertificateRecord
  return toView(
    data,
    timestampToDate(data.expiresAt),
    timestampToDate(data.issuedAt)
  )
}

export async function getCertificateById(
  certificateId: string
): Promise<CertificateView | null> {
  const snap = await getDoc(doc(db, CERTIFICATES, certificateId))
  if (!snap.exists()) return null
  const data = snap.data() as CertificateRecord
  return toView(
    data,
    timestampToDate(data.expiresAt),
    timestampToDate(data.issuedAt)
  )
}

export async function getUserCertificates(userId: string): Promise<CertificateView[]> {
  const q = query(
    collection(db, CERTIFICATES),
    where('userId', '==', userId),
    orderBy('issuedAt', 'desc')
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => {
    const data = d.data() as CertificateRecord
    return toView(
      data,
      timestampToDate(data.expiresAt),
      timestampToDate(data.issuedAt)
    )
  })
}

export interface IssueCertificateInput {
  userId: string
  lessonId: string
  lessonTitle: string
  finalScore: number
  userName: string
  userDocument: string
  documentType: string
  documentNumber: string
  companyId?: string | null
}

/** Crea certificado si no existe para esa lección; si ya existe, lo devuelve. */
export async function issueCertificate(
  input: IssueCertificateInput
): Promise<CertificateView> {
  const existing = await getCertificateByLesson(input.userId, input.lessonId)
  if (existing) return existing

  const certificateId = generateCertificateId(input.userId, input.lessonId)
  const verifyCode = generateVerifyCode()
  const qrVerifyUrl = buildVerifyUrl(verifyCode)
  const issuedAt = Timestamp.now()
  const expiresAt = Timestamp.fromMillis(Date.now() + ONE_YEAR_MS)
  const userDocument = input.userDocument

  const privateDoc: CertificateRecord = {
    certificateId,
    userId: input.userId,
    lessonId: input.lessonId,
    companyId: input.companyId ?? null,
    userName: input.userName,
    userDocument,
    lessonTitle: input.lessonTitle,
    courseName: COURSE_NAME,
    finalScore: input.finalScore,
    verifyCode,
    qrVerifyUrl,
    issuedAt,
    expiresAt,
    isValid: true,
  }

  const publicDoc: CertificatePublicRecord = {
    certificateId,
    userId: input.userId,
    userName: input.userName,
    userDocumentMasked: maskDocument(input.documentType, input.documentNumber),
    lessonTitle: input.lessonTitle,
    courseName: COURSE_NAME,
    finalScore: input.finalScore,
    issuedAt,
    expiresAt,
    isValid: true,
    status: 'valid',
  }

  await setDoc(doc(db, CERTIFICATES, certificateId), privateDoc)
  await setDoc(doc(db, CERTIFICATE_PUBLIC, verifyCode), publicDoc)

  return toView(
    privateDoc,
    expiresAt.toDate(),
    issuedAt.toDate()
  )
}

export interface PublicVerificationView {
  verifyCode: string
  userName: string
  userDocumentMasked: string
  lessonTitle: string
  courseName: string
  finalScore: number
  issuedAt: Date
  expiresAt: Date
  status: CertificateStatus
}

export async function getPublicVerification(
  verifyCode: string
): Promise<PublicVerificationView | null> {
  const snap = await getDoc(doc(db, CERTIFICATE_PUBLIC, verifyCode.toUpperCase()))
  if (!snap.exists()) {
    const snapRaw = await getDoc(doc(db, CERTIFICATE_PUBLIC, verifyCode))
    if (!snapRaw.exists()) return null
    return mapPublic(snapRaw.data() as CertificatePublicRecord, verifyCode)
  }
  return mapPublic(snap.data() as CertificatePublicRecord, verifyCode.toUpperCase())
}

function mapPublic(
  data: CertificatePublicRecord,
  verifyCode: string
): PublicVerificationView {
  const expiresAt = timestampToDate(data.expiresAt)
  const status = resolveStatus(expiresAt, data.isValid)
  return {
    verifyCode,
    userName: data.userName,
    userDocumentMasked: data.userDocumentMasked,
    lessonTitle: data.lessonTitle,
    courseName: data.courseName,
    finalScore: data.finalScore,
    issuedAt: timestampToDate(data.issuedAt),
    expiresAt,
    status,
  }
}
