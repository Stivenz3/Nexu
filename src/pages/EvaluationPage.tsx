import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Clock, X, ClipboardCheck, Lightbulb, ArrowRight } from 'lucide-react'
import { Header } from '@/components/layout'
import { Card, Badge, Button, RadioGroup } from '@/components/ui'
import { mockQuestions } from '@/data/mockData'
import { cn } from '@/lib/utils'

export function EvaluationPage() {
  const navigate = useNavigate()
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [timeLeft, setTimeLeft] = useState(10 * 60) // 10 minutes
  const [showFeedback, setShowFeedback] = useState(false)

  const totalQuestions = mockQuestions.length
  const question = mockQuestions[currentQuestion]
  const progress = ((currentQuestion + 1) / totalQuestions) * 100

  // Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) {
          clearInterval(timer)
          navigate('/certificado')
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [navigate])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleAnswerSelect = (value: string) => {
    setSelectedAnswer(value)
    setAnswers({ ...answers, [question.id]: value })
    
    // Show feedback briefly
    setShowFeedback(true)
  }

  const handleNext = () => {
    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion(currentQuestion + 1)
      setSelectedAnswer(answers[mockQuestions[currentQuestion + 1]?.id] || null)
      setShowFeedback(false)
    } else {
      navigate('/certificado')
    }
  }

  const isCorrect = selectedAnswer === question.correctOptionId

  return (
    <div className="min-h-screen bg-surface">
      {/* Custom header for evaluation */}
      <header className="bg-white border-b border-outline-variant/30 sticky top-0 z-50">
        <div className="max-w-container mx-auto px-lg">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <span className="text-h3 font-bold text-primary">Nexu</span>
              <span className="text-outline-variant">|</span>
              <span className="text-body-md text-foreground-muted">Evaluacion Final</span>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-surface-container-low rounded-full">
                <Clock className="w-4 h-4 text-foreground-muted" />
                <span className="font-mono font-semibold text-foreground">{formatTime(timeLeft)}</span>
              </div>
              <button 
                onClick={() => navigate('/ruta')}
                className="flex items-center gap-2 text-body-sm text-foreground-muted hover:text-foreground"
              >
                <X className="w-4 h-4" />
                Salir
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-lg py-xl">
        {/* Module info */}
        <div className="mb-8">
          <span className="text-label-caps text-primary uppercase tracking-wider">Modulo Actual</span>
          <div className="flex items-center justify-between mt-1">
            <h2 className="text-body-md font-semibold text-foreground">
              Leccion 1: Higiene personal
            </h2>
            <span className="text-body-sm text-foreground-muted">
              {currentQuestion + 1} de {totalQuestions}
            </span>
          </div>
        </div>

        {/* Progress segments */}
        <div className="flex gap-1 mb-8">
          {mockQuestions.map((_, index) => (
            <div
              key={index}
              className={cn(
                'h-1.5 flex-1 rounded-full transition-colors duration-300',
                index < currentQuestion
                  ? 'bg-primary'
                  : index === currentQuestion
                  ? 'bg-secondary'
                  : 'bg-surface-container-high'
              )}
            />
          ))}
        </div>

        {/* Question card */}
        <Card padding="lg" className="mb-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center">
              <ClipboardCheck className="w-5 h-5 text-foreground-muted" />
            </div>
            <h3 className="text-body-lg font-medium text-foreground flex-1">
              {question.text}
            </h3>
          </div>

          <RadioGroup
            options={question.options.map(o => ({ value: o.id, label: o.text }))}
            selectedValue={selectedAnswer || undefined}
            onValueChange={handleAnswerSelect}
            variant="card"
            isCorrect={isCorrect}
            showFeedback={showFeedback}
          />
        </Card>

        {/* Tip card */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <div className="rounded-xl overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=400&q=80"
              alt="Hand washing"
              className="w-full h-48 object-cover"
            />
          </div>
          <Card className="bg-primary-light" padding="md">
            <div className="flex items-start gap-3">
              <Lightbulb className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-body-sm font-semibold text-white mb-2">
                  Recordatorio de Seguridad
                </h4>
                <p className="text-body-sm text-white/80">
                  El lavado de manos es la barrera mas importante contra la contaminacion cruzada. Asegurate de frotar entre los dedos y debajo de las unas durante todo el proceso.
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Decorative circle */}
        <div className="fixed top-1/2 right-0 w-96 h-96 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />

        {/* Navigation */}
        <div className="flex justify-end">
          <Button 
            onClick={handleNext}
            disabled={!selectedAnswer}
            className="group"
          >
            <span>{currentQuestion < totalQuestions - 1 ? 'Siguiente' : 'Finalizar'}</span>
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </main>
    </div>
  )
}
