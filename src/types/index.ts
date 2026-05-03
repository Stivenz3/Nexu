// User domain types
export interface User {
  id: string
  fullName: string
  email: string
  documentType: DocumentType
  documentNumber: string
  createdAt: Date
}

export type DocumentType = 'cc' | 'ce' | 'passport'

// Learning domain types
export interface Lesson {
  id: string
  number: number
  title: string
  description: string
  duration: number // in minutes
  status: LessonStatus
}

export type LessonStatus = 'locked' | 'available' | 'in-progress' | 'completed'

export interface LessonContent {
  id: string
  lessonId: string
  title: string
  subtitle: string
  sections: ContentSection[]
}

export interface ContentSection {
  id: string
  type: 'text' | 'image' | 'tip' | 'key-concept'
  title?: string
  content: string
  imageUrl?: string
}

// Evaluation domain types
export interface Question {
  id: string
  text: string
  options: QuestionOption[]
  correctOptionId: string
}

export interface QuestionOption {
  id: string
  text: string
}

export interface EvaluationResult {
  totalQuestions: number
  correctAnswers: number
  score: number
  passed: boolean
}

// Certificate domain types
export interface Certificate {
  id: string
  code: string
  userId: string
  userName: string
  userDocument: string
  courseName: string
  courseModule: string
  issueDate: Date
  expiryDate: Date
  score: number
  status: CertificateStatus
}

export type CertificateStatus = 'valid' | 'expired' | 'revoked'

// Progress domain types
export interface Progress {
  userId: string
  completedLessons: string[]
  currentLesson: string | null
  totalLessons: number
  percentage: number
}
