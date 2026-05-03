import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ArrowRight, Lightbulb, ChevronRight } from 'lucide-react'
import { AppLayout } from '@/components/layout'
import { Card, Button, ProgressBar } from '@/components/ui'
import { mockLessonContent } from '@/data/mockData'

export function LessonPage() {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(0)
  const content = mockLessonContent
  const totalSteps = content.sections.length
  const progress = ((currentStep + 1) / totalSteps) * 100

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      // Go to evaluation
      navigate('/evaluacion')
    }
  }

  const currentSection = content.sections[currentStep]

  return (
    <AppLayout 
      showBack 
      onBack={() => navigate('/ruta')}
      headerTitle="Learning Path"
    >
      {/* Top navigation tabs */}
      <div className="flex items-center gap-8 mb-8 border-b border-outline-variant/30">
        <Link 
          to="/ruta" 
          className="pb-4 text-body-md font-medium text-primary border-b-2 border-primary"
        >
          Learning Path
        </Link>
        <Link 
          to="/evaluacion" 
          className="pb-4 text-body-md font-medium text-foreground-muted hover:text-foreground"
        >
          Assessments
        </Link>
        <Link 
          to="/certificado" 
          className="pb-4 text-body-md font-medium text-foreground-muted hover:text-foreground"
        >
          Certificates
        </Link>
      </div>

      {/* Progress indicator */}
      <div className="flex items-center justify-between mb-8">
        <ProgressBar value={progress} variant="secondary" className="flex-1 mr-4" />
        <span className="text-body-sm text-foreground-muted">
          {Math.round(progress)}% completado
        </span>
      </div>

      <div className="max-w-4xl">
        {/* Lesson title */}
        <div className="mb-8">
          <h1 className="text-h1 text-foreground mb-2">{content.title}</h1>
          <p className="text-body-lg text-foreground-muted">{content.subtitle}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Left: Image */}
          {currentSection.type === 'image' || currentSection.type === 'text' ? (
            <div>
              <div className="rounded-xl overflow-hidden mb-4">
                <img
                  src={currentSection.imageUrl || 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=600&q=80'}
                  alt="Lesson illustration"
                  className="w-full h-64 object-cover"
                />
              </div>
              {currentSection.type === 'image' && (
                <p className="text-body-sm text-foreground-muted italic">
                  {currentSection.content}
                </p>
              )}
            </div>
          ) : null}

          {/* Right: Content */}
          <div>
            {currentSection.type === 'text' && (
              <Card padding="lg">
                {currentSection.title && (
                  <h2 className="text-h2 text-primary mb-4">{currentSection.title}</h2>
                )}
                <div className="prose prose-sm text-foreground-muted">
                  {currentSection.content.split('\n\n').map((paragraph, index) => (
                    <p key={index} className="mb-4 last:mb-0 text-body-md leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </Card>
            )}

            {currentSection.type === 'key-concept' && (
              <div className="bg-primary rounded-xl p-6 text-white">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                    <Lightbulb className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-body-md font-semibold mb-2">{currentSection.title}</h3>
                    <p className="text-body-md opacity-90 leading-relaxed">
                      {currentSection.content}
                    </p>
                  </div>
                </div>
                <div className="flex justify-end mt-4">
                  <ChevronRight className="w-8 h-8 opacity-30" />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-end mt-8">
          <Button 
            onClick={handleNext}
            className="group"
          >
            <span>{currentStep < totalSteps - 1 ? 'Siguiente' : 'Ir a Evaluacion'}</span>
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </AppLayout>
  )
}
