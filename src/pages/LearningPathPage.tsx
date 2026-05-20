import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Clock, Lock, Grid2X2, Lightbulb, Award } from 'lucide-react'
import { AppLayout } from '@/components/layout'
import { Card, Badge, Button, ProgressBar } from '@/components/ui'
import { useAuth } from '@/contexts/AuthContext'
import { fetchActiveLessons } from '@/services/lessonService'
import { fetchLessonProgress } from '@/services/progressService'
import { cn } from '@/lib/utils'
import type { LessonListItem } from '@/types/lesson'

function LessonCard({ lesson }: { lesson: LessonListItem }) {
  const isLocked = lesson.status === 'locked'
  const canStart = lesson.status === 'available' || lesson.status === 'in-progress'

  return (
    <Card
      variant={canStart ? 'interactive' : 'default'}
      padding="md"
      className={cn('relative', isLocked && 'opacity-60')}
    >
      <div className="flex items-start gap-4">
        <div
          className={cn(
            'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0',
            canStart ? 'bg-primary/10' : 'bg-surface-container-high'
          )}
        >
          {isLocked ? (
            <Lock className="w-5 h-5 text-foreground-muted" />
          ) : (
            <Grid2X2 className="w-5 h-5 text-primary" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant={canStart ? 'primary' : 'neutral'} size="sm">
              Lección {lesson.order}
            </Badge>
            <span className="flex items-center gap-1 text-body-sm text-foreground-muted">
              <Clock className="w-3.5 h-3.5" />
              {lesson.estimatedMinutes} min
            </span>
          </div>

          <h3 className="text-body-md font-semibold text-foreground mb-1">
            {lesson.title}
          </h3>
          <p className="text-body-sm text-foreground-muted line-clamp-2">
            {lesson.normativeBase}
          </p>
        </div>

        {canStart && (
          <Link to={`/leccion/${lesson.lessonId}`}>
            <Button size="sm">
              {lesson.status === 'in-progress' ? 'Continuar' : 'Empezar'}
            </Button>
          </Link>
        )}
      </div>
    </Card>
  )
}

function ProgressCard({
  completed,
  total,
  percent,
}: {
  completed: number
  total: number
  percent: number
}) {
  return (
    <Card padding="lg" className="sticky top-24">
      <h3 className="text-body-md font-semibold text-foreground mb-4">Tu Progreso</h3>

      <div className="flex items-center gap-4 mb-6">
        <div className="relative w-16 h-16">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
            <circle
              className="stroke-surface-container-high"
              strokeWidth="3"
              fill="none"
              r="16"
              cx="18"
              cy="18"
            />
            <circle
              className="stroke-secondary"
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
              r="16"
              cx="18"
              cy="18"
              strokeDasharray={`${percent}, 100`}
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-body-sm font-bold">
            {percent}%
          </span>
        </div>
        <div>
          <p className="text-h3 font-bold text-foreground">
            {completed} de {total}
          </p>
          <p className="text-body-sm text-foreground-muted">Lecciones completadas</p>
        </div>
      </div>

      <div className="bg-surface-container-low rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <Lightbulb className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-body-sm font-semibold text-foreground mb-1">
              Próximo Hito
            </p>
            <p className="text-body-sm text-foreground-muted">
              Completa la Lección 1 para obtener tu certificado de higiene personal.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 border-2 border-dashed border-outline-variant rounded-lg text-center">
        <Award className="w-12 h-12 text-foreground-muted mx-auto mb-2 opacity-50" />
        <p className="text-body-sm text-foreground-muted">
          Aprueba la evaluación final para obtener tu certificado oficial Nexu.
        </p>
      </div>
    </Card>
  )
}

export function LearningPathPage() {
  const { user } = useAuth()
  const firstName = user?.fullName?.split(' ')[0] || 'Usuario'
  const [lessons, setLessons] = useState<LessonListItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.id) return
    ;(async () => {
      try {
        const active = await fetchActiveLessons()
        const withStatus: LessonListItem[] = []

        for (let i = 0; i < active.length; i++) {
          const lesson = active[i]
          const prog = await fetchLessonProgress(user.id, lesson.lessonId)
          let status: LessonListItem['status'] = 'locked'

          if (i === 0) {
            if (prog?.status === 'passed') status = 'completed'
            else if (prog) status = 'in-progress'
            else status = 'available'
          } else if (active[i - 1] && withStatus[i - 1]?.status === 'completed') {
            status = prog ? (prog.status === 'passed' ? 'completed' : 'in-progress') : 'available'
          }

          withStatus.push({ ...lesson, status })
        }

        setLessons(withStatus)
      } finally {
        setLoading(false)
      }
    })()
  }, [user?.id])

  const completed = lessons.filter((l) => l.status === 'completed').length
  const total = lessons.length || 1
  const percent = Math.round((completed / total) * 100)
  const totalMinutes = lessons.reduce((s, l) => s + l.estimatedMinutes, 0)

  return (
    <AppLayout>
      <div className="mb-8">
        <h1 className="text-h1 text-foreground mb-2">Hola, {firstName}!</h1>
        <p className="text-body-lg text-foreground-muted">
          Tu ruta de certificación BPM
          {lessons.length > 0 ? ` (${lessons.length} lección${lessons.length > 1 ? 'es' : ''})` : ''}
        </p>
      </div>

      <div className="flex items-center justify-between mb-6">
        <ProgressBar value={percent} className="flex-1 mr-4" />
        <span className="text-label-caps text-secondary whitespace-nowrap">
          {totalMinutes > 0 ? `${totalMinutes} MIN ESTIMADOS` : 'CARGANDO...'}
        </span>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {lessons.length === 0 ? (
              <p className="text-foreground-muted">
                No hay lecciones activas. Ejecuta el seed de Firestore.
              </p>
            ) : (
              lessons.map((lesson) => <LessonCard key={lesson.lessonId} lesson={lesson} />)
            )}
          </div>

          <div className="lg:col-span-1">
            <ProgressCard completed={completed} total={total} percent={percent} />
          </div>
        </div>
      )}
    </AppLayout>
  )
}
