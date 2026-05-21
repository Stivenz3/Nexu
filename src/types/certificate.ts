import type { Timestamp } from 'firebase/firestore'

export type CertificateStatus = 'valid' | 'expired' | 'revoked'

/** Documento privado: /certificates/{certificateId} */
export interface CertificateRecord {
  certificateId: string
  userId: string
  lessonId: string
  companyId: string | null
  userName: string
  userDocument: string
  lessonTitle: string
  courseName: string
  finalScore: number
  verifyCode: string
  qrVerifyUrl: string
  issuedAt: Timestamp
  expiresAt: Timestamp
  isValid: boolean
}

/** Documento público: /certificatePublic/{verifyCode} */
export interface CertificatePublicRecord {
  certificateId: string
  userId: string
  userName: string
  userDocumentMasked: string
  lessonTitle: string
  courseName: string
  finalScore: number
  issuedAt: Timestamp
  expiresAt: Timestamp
  isValid: boolean
  status: CertificateStatus
}

/** Vista en UI (fechas como Date) */
export interface CertificateView {
  certificateId: string
  verifyCode: string
  userId: string
  userName: string
  userDocument: string
  lessonId: string
  lessonTitle: string
  courseName: string
  finalScore: number
  qrVerifyUrl: string
  issuedAt: Date
  expiresAt: Date
  status: CertificateStatus
}
