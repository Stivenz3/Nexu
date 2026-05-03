import { Link } from 'react-router-dom'
import { Clock, Lock, Grid2X2, Lightbulb, Award } from 'lucide-react'
import { AppLayout } from '@/components/layout'
import { Card, Badge, Button, ProgressBar } from '@/components/ui'
import { mockLessons } from '@/data/mockData'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'
import type { Lesson } from '@/types'

function LessonCard({ lesson }: { lesson: Lesson }) {
  const isLocked = lesson.status === 'locked'
  const isAvailable = lesson.status === 'available'

  return (
    <Card 
      variant={isAvailable ? 'interactive' : 'default'} 
      padding="md"
      className={cn(
        'relative',
        isLocked && 'opacity-60'
      )}
    >
      <div className="flex items-start gap-4">
        <div className={cn(
          'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0',
          isAvailable ? 'bg-primary/10' : 'bg-surface-container-high'
        )}>
          {isLocked ? (
            <Lock className="w-5 h-5 text-foreground-muted" />
          ) : (
            <Grid2X2 className="w-5 h-5 text-primary" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant={isAvailable ? 'primary' : 'neutral'} size="sm">
              Leccion {lesson.number}
            </Badge>
            <span className="flex items-center gap-1 text-body-sm text-foreground-muted">
              <Clock className="w-3.5 h-3.5" />
              {lesson.duration} min
            </span>
          </div>

          <h3 className="text-body-md font-semibold text-foreground mb-1">
            {lesson.title}
          </h3>
          <p className="text-body-sm text-foreground-muted line-clamp-2">
            {lesson.description}
          </p>
        </div>

        {isAvailable && (
          <Link to={`/leccion/${lesson.id}`}>
            <Button size="sm">Empezar</Button>
          </Link>
        )}
      </div>
    </Card>
  )
}

function ProgressCard() {
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
              strokeDasharray={`${20}, 100`}
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-body-sm font-bold">
            20%
          </span>
        </div>
        <div>
          <p className="text-h3 font-bold text-foreground">1 de 5</p>
          <p className="text-body-sm text-foreground-muted">Lecciones completadas</p>
        </div>
      </div>

      <div className="bg-surface-container-low rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <Lightbulb className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-body-sm font-semibold text-foreground mb-1">Proximo Hito</p>
            <p className="text-body-sm text-foreground-muted">
              Completa la Leccion 1 para desbloquear Control de Temperaturas.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-primary rounded-lg p-4 text-white">
        <div className="flex items-start gap-3">
          <Lightbulb className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-body-sm font-semibold mb-1">Tip de Seguridad</p>
            <p className="text-body-sm opacity-90">
              El correcto lavado de manos reduce hasta un 80% el riesgo de contaminacion cruzada. Presta atencion a los 11 pasos!
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 border-2 border-dashed border-outline-variant rounded-lg text-center">
        <Award className="w-12 h-12 text-foreground-muted mx-auto mb-2 opacity-50" />
        <p className="text-body-sm text-foreground-muted">
          Completa todas las lecciones para obtener tu certificado oficial Nexu.
        </p>
      </div>
    </Card>
  )
}

export function LearningPathPage() {
  const { user } = useAuth()
  const firstName = user?.fullName?.split(' ')[0] || 'Usuario'

  return (
    <AppLayout>
      <div className="mb-8">
        <h1 className="text-h1 text-foreground mb-2">Hola, {firstName}!</h1>
        <p className="text-body-lg text-foreground-muted">
          Tu ruta de certificacion BPM (5 lecciones)
        </p>
      </div>

      <div className="flex items-center justify-between mb-6">
        <ProgressBar value={20} className="flex-1 mr-4" />
        <span className="text-label-caps text-secondary whitespace-nowrap">
          1 HORA TOTAL ESTIMADA
        </span>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {mockLessons.map((lesson) => (
            <LessonCard key={lesson.id} lesson={lesson} />
          ))}
        </div>

        <div className="lg:col-span-1">
          <ProgressCard />
        </div>
      </div>
    </AppLayout>
  )
}
