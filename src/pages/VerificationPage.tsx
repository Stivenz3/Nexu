import { useParams } from 'react-router-dom'
import { CheckCircle2, ShieldCheck, Calendar, Download, Printer, BookOpen, Building2, XCircle } from 'lucide-react'
import { Card, Badge, Button } from '@/components/ui'
import type { Certificate } from '@/types'

export function VerificationPage() {
  const { code } = useParams<{ code: string }>()

  // In a real app, this would fetch from an API based on the verification code
  // For now, we simulate a verification lookup
  const isValidCode = code && code.length >= 6

  // Simulated certificate data (in production, this would come from the API)
  const cert: Certificate | null = isValidCode
    ? {
        id: 'cert-001',
        code: code,
        userId: 'NX-2026-0001',
        userName: 'Usuario Verificado',
        userDocument: 'CC. ***.***.***',
        courseName: 'Buenas Practicas de Manufactura',
        courseModule: 'Higiene Personal',
        issueDate: new Date(),
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        score: 92,
        status: 'valid',
      }
    : null
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-CO', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-outline-variant/30">
        <div className="max-w-container mx-auto px-lg">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <span className="text-h3 font-bold text-primary">Nexu</span>
              <span className="text-outline-variant">|</span>
              <span className="text-body-md text-foreground-muted">Verificacion publica de certificado</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 max-w-3xl mx-auto px-lg py-xl w-full">
        {!cert ? (
          <Card className="bg-surface-container-low border-none mb-8" padding="lg">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-error flex items-center justify-center">
                <XCircle className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-h2 text-error mb-2">Certificado no encontrado</h1>
              <p className="text-body-md text-foreground-muted">
                El codigo de verificacion proporcionado no corresponde a ningun certificado valido en nuestro sistema.
              </p>
            </div>
          </Card>
        ) : (
          <>
            {/* Success banner */}
            <Card className="bg-surface-container-low border-none mb-8" padding="lg">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-h2 text-primary mb-2">Certificado valido</h1>
                <p className="text-body-md text-foreground-muted">
                  Este documento ha sido emitido y verificado satisfactoriamente por el sistema Nexu.
                </p>
              </div>
            </Card>

        {/* Certificate details card */}
        <Card padding="none" className="overflow-hidden mb-6">
          <div className="flex">
            {/* Photo */}
            <div className="w-40 flex-shrink-0">
              <img
                src="https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=300&q=80"
                alt="Certificate holder"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Details */}
            <div className="flex-1 p-6">
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-label-caps text-foreground-muted mb-1">Nombre del titular</p>
                  <p className="text-body-lg font-semibold text-foreground">{cert.userName}</p>
                </div>
                <div>
                  <p className="text-label-caps text-foreground-muted mb-1">Documento</p>
                  <p className="text-body-lg font-semibold text-foreground">{cert.userDocument}</p>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-label-caps text-foreground-muted mb-1">Curso completado</p>
                <p className="text-h3 text-primary font-semibold">
                  BPM - {cert.courseModule}
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-label-caps text-foreground-muted mb-1">Valido hasta</p>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-primary" />
                    <p className="text-body-md font-semibold text-foreground">{formatDate(cert.expiryDate)}</p>
                  </div>
                </div>
                <div>
                  <p className="text-label-caps text-foreground-muted mb-1">Codigo unico</p>
                  <code className="px-3 py-1.5 bg-surface-container-high rounded-lg text-body-md font-mono">
                    {cert.code}
                  </code>
                </div>
              </div>

              {/* Badges */}
              <div className="flex gap-2">
                <Badge variant="success" className="gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Verificado
                </Badge>
                <Badge variant="primary" className="gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  Cumple normativa
                </Badge>
              </div>
            </div>
          </div>
        </Card>

        {/* Info cards */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <Card padding="md">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-body-md font-semibold text-primary mb-2">Informacion Academica</h3>
                <p className="text-body-sm text-foreground-muted">
                  El curso de BPM (Buenas Practicas de Manufactura) - Higiene Personal cubre los estandares exigidos por las autoridades sanitarias para la manipulacion segura de alimentos.
                </p>
              </div>
            </div>
          </Card>

          <Card padding="md">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Building2 className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-body-md font-semibold text-primary mb-2">Entidad Emisora</h3>
                <p className="text-body-sm text-foreground-muted">
                  Este certificado es emitido por Nexu en cumplimiento con el Decreto 3075 de 1997 y la Resolucion 2674 de 2013 de la autoridad nacional de salud.
                </p>
              </div>
            </div>
          </Card>
        </div>

            {/* Actions */}
            <div className="flex justify-center gap-4">
              <Button className="gap-2">
                <Download className="w-4 h-4" />
                Descargar PDF
              </Button>
              <Button variant="outline" className="gap-2">
                <Printer className="w-4 h-4" />
                Imprimir
              </Button>
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-surface-container-highest py-8 mt-auto">
        <div className="max-w-3xl mx-auto px-lg text-center">
          <p className="text-body-md text-foreground-muted mb-2">
            <span className="font-semibold">Nexu</span> &copy; 2024
          </p>
          <p className="text-body-sm text-foreground-muted max-w-lg mx-auto">
            Aviso Legal: Este es un documento de soporte de capacitacion en Buenas Practicas de Manufactura (BPM). Esta pagina de verificacion publica confirma que el titular completo satisfactoriamente los modulos requeridos en la fecha indicada. El uso fraudulento de esta informacion esta sujeto a sanciones legales segun la normativa vigente.
          </p>
        </div>
      </footer>
    </div>
  )
}
