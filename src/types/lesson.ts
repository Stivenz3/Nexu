export type BlockType = 'video' | 'theory' | 'game' | 'exam'
export type QuestionType = 'intercalada' | 'evaluacion_final'
export type Difficulty = 'basica' | 'intermedia' | 'avanzada'
export type LessonProgressStatus = 'locked' | 'in_progress' | 'passed' | 'failed'

export interface LessonDoc {
  lessonId: string
  title: string
  order: number
  normativeBase: string
  passingScore: number
  estimatedMinutes: number
  isActive: boolean
  totalBlocks: number
}

export interface VideoBlockContent {
  youtubeUrl: string
  minWatchPercent: number
  durationSeconds: number
}

export interface TheoryBlockContent {
  normativeRef: string
  summary: string
  keyPoints: string[]
  technicalNote: string | null
  hasInterludedQuestion: boolean
  questionId: string | null
  questionIds: string[] | null
}

export interface GameError {
  errorId: string
  description: string
  normativeRef: string
  feedbackText: string
}

export interface GameBlockContent {
  sceneName: string
  scenario: string
  objective: string
  totalErrors: number
  errors: GameError[]
  scoring: {
    baseScore: number
    penaltyPerHint: number
    penaltyPerWrongClick: number
    passingScore: number
  }
  timeLimitSeconds: number
}

export interface ExamBlockContent {
  totalQuestions: number
  passingPercent: number
  randomize: boolean
  showExplanationAfterAnswer: boolean
  unlimitedAttempts: boolean
}

export interface LessonBlock {
  blockId: string
  type: BlockType
  order: number
  title: string
  isRequired: boolean
  content: VideoBlockContent | TheoryBlockContent | GameBlockContent | ExamBlockContent
}

export interface QuestionOption {
  label: string
  text: string
  isCorrect: boolean
}

export interface LessonQuestion {
  questionId: string
  blockRef: string
  questionType: QuestionType
  order: number
  text: string
  options: QuestionOption[]
  explanation: string
  normativeRef: string
  difficulty: Difficulty
}

export interface BlockProgressBase {
  completed: boolean
}

export interface VideoBlockProgress extends BlockProgressBase {
  videoWatched: boolean
  watchedPct: number
}

export interface TheoryBlockProgress extends BlockProgressBase {
  questionAnswered?: boolean
  answeredCorrect?: boolean
  questionsAnswered?: boolean[]
}

export interface GameBlockProgress extends BlockProgressBase {
  gameScore: number
  errorsFound: number
  hintsUsed: number
  timeSpentSec: number
}

export interface ExamBlockProgress extends BlockProgressBase {
  lastScore: number
  attempts: number
  passed: boolean
}

export type BlockProgressEntry =
  | VideoBlockProgress
  | TheoryBlockProgress
  | GameBlockProgress
  | ExamBlockProgress

export type BlocksProgress = Record<string, BlockProgressEntry>

export interface LessonProgress {
  lessonId: string
  status: LessonProgressStatus
  startedAt: unknown
  completedAt: unknown | null
  lastBlockCompleted: string
  totalTimeSpentSec: number
  blocksProgress: BlocksProgress
  evalAttempts: number[]
  bestEvalScore: number
}

export interface LessonListItem extends LessonDoc {
  status: 'locked' | 'available' | 'in-progress' | 'completed'
}
