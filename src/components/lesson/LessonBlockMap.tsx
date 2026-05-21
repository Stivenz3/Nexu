import {
  Play,
  BookOpen,
  Gamepad2,
  ClipboardCheck,
  Check,
  Lock,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { BlockType, LessonBlock, LessonProgress } from '@/types/lesson'
import { canNavigateToBlock } from '@/services/progressService'

const TYPE_META: Record<
  BlockType,
  { label: string; icon: React.ReactNode }
> = {
  video: { label: 'Video', icon: <Play className="h-4 w-4 shrink-0" /> },
  theory: { label: 'Teoría', icon: <BookOpen className="h-4 w-4 shrink-0" /> },
  game: { label: 'Práctica', icon: <Gamepad2 className="h-4 w-4 shrink-0" /> },
  exam: { label: 'Evaluación', icon: <ClipboardCheck className="h-4 w-4 shrink-0" /> },
}

export interface LessonBlockMapProps {
  blocks: LessonBlock[]
  progress: LessonProgress | null
  activeIndex: number
  onSelectBlock: (index: number) => void
}

export function LessonBlockMap({
  blocks,
  progress,
  activeIndex,
  onSelectBlock,
}: LessonBlockMapProps) {
  return (
    <div className="mb-8">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-body-md font-semibold text-foreground">Mapa de la lección</h2>
        <p className="text-body-sm text-foreground-muted">
          Haz clic en un bloque para estudiar o repasar
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {blocks.map((block, index) => {
          const meta = TYPE_META[block.type]
          const completed = Boolean(
            progress?.blocksProgress[block.blockId]?.completed
          )
          const accessible = canNavigateToBlock(blocks, progress, index)
          const isActive = index === activeIndex
          const isExam = block.type === 'exam'

          return (
            <button
              key={block.blockId}
              type="button"
              disabled={!accessible}
              onClick={() => accessible && onSelectBlock(index)}
              className={cn(
                'relative flex flex-col items-start rounded-xl border p-3 text-left transition-all',
                'min-h-[5.5rem]',
                accessible
                  ? 'cursor-pointer hover:border-primary/50 hover:shadow-sm'
                  : 'cursor-not-allowed opacity-50',
                isActive
                  ? 'border-primary bg-primary/5 ring-2 ring-primary/30'
                  : completed
                    ? 'border-primary/30 bg-primary/[0.03]'
                    : 'border-outline-variant/40 bg-white'
              )}
            >
              <div className="mb-2 flex w-full items-center justify-between gap-1">
                <span
                  className={cn(
                    'flex h-6 w-6 items-center justify-center rounded-md text-body-sm font-bold',
                    isActive ? 'bg-primary text-white' : 'bg-surface-container-high text-foreground-muted'
                  )}
                >
                  {block.order}
                </span>
                {completed ? (
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/15 text-primary">
                    <Check className="h-3.5 w-3.5" />
                  </span>
                ) : !accessible ? (
                  <Lock className="h-4 w-4 text-foreground-muted" />
                ) : null}
              </div>

              <span className="mb-1 flex items-center gap-1.5 text-label-caps text-foreground-muted">
                {meta.icon}
                {meta.label}
              </span>

              <span className="line-clamp-2 text-body-sm font-medium leading-snug text-foreground">
                {block.title}
              </span>

              {completed && !isActive && (
                <span className="mt-2 text-body-sm text-primary">Repasar</span>
              )}
              {isExam && accessible && !completed && (
                <span className="mt-2 text-body-sm text-secondary">Listo para examen</span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
