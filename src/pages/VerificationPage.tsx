import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  CheckCircle2,
  ShieldCheck,
  Calendar,
  Printer,
  BookOpen,
  Building2,
  XCircle,
  Loader2,
} from 'lucide-react'
import { Card, Badge, Button } from '@/components/ui'
import { getPublicVerification } from '@/services/certificateService'
import type { PublicVerificationView } from '@/services/certificateService'
export function VerificationPage() {
  const { code } = useParams<{ code: string }>()
  const [cert, setCert] = useState<PublicVerificationView | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!code) {
      setNotFound(true)
      setLoading(false)
      return
    }
    ;(async () => {
      setLoading(true)
      const result = await getPublicVerification(code)
      setCert(result)
      setNotFound(!result)
      setLoading(false)
    })()
  }, [code])

  const formatDate = (date: Date) =>
    date.toLocaleDateString('es-CO', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })

  const handlePrint = () => window.print()

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <header className="bg-white border-b border-outline-variant/30 print:hidden">
        <div className="max-w-container mx-auto px-lg">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link to="/" className="text-h3 font-bold text-primary">
                Nexu
              </Link>
              <span className="text-outline-variant">|</span>
              <span className="text-body-md text-foreground-muted">
                Verificación pública de certificado
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-3xl mx-auto px-lg py-xl w-full">
        {notFound || !cert ? (
          <Card className="bg-surface-container-low border-none mb-8" padding="lg">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-error flex items-center justify-center">
                <XCircle className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-h2 text-error mb-2">Certificado no encontrado</h1>
              <p className="text-body-md text-foreground-muted">
                El código de verificación no corresponde a ningún certificado en Nexu.
              </p>
            </div>
          </Card>
        ) : (
          <>
            <Card className="bg-surface-container-low border-none mb-8" padding="lg">
              <div className="text-center">
                <div
                  className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                    cert.status === 'valid' ? 'bg-primary' : 'bg-error'
                  }`}
                >
                  {cert.status === 'valid' ? (
                    <CheckCircle2 className="w-8 h-8 text-white" />
                  ) : (
                    <XCircle className="w-8 h-8 text-white" />
                  )}
                </div>
                <h1
                  className={`text-h2 mb-2 ${
                    cert.status === 'valid' ? 'text-primary' : 'text-error'
                  }`}
                >
                  {cert.status === 'valid'
                    ? 'Certificado válido'
                    : cert.status === 'expired'
                      ? 'Certificado vencido'
                      : 'Certificado no vigente'}
                </h1>
                <p className="text-body-md text-foreground-muted">
                  Documento emitido por el sistema Nexu — verificación{' '}
                  {cert.status === 'valid' ? 'exitosa' : 'con observaciones'}.
                </p>
              </div>
            </Card>

            <Card padding="lg" className="mb-6">
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-label-caps text-foreground-muted mb-1">
                    Nombre del titular
                  </p>
                  <p className="text-body-lg font-semibold text-foreground">
                    {cert.userName}
                  </p>
                </div>
                <div>
                  <p className="text-label-caps text-foreground-muted mb-1">Documento</p>
                  <p className="text-body-lg font-semibold text-foreground">
                    {cert.userDocumentMasked}
                  </p>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-label-caps text-foreground-muted mb-1">Curso completado</p>
                <p className="text-h3 text-primary font-semibold">
                  {cert.courseName} — {cert.lessonTitle}
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-4 mb-4">
                <div>
                  <p className="text-label-caps text-foreground-muted mb-1">Calificación</p>
                  <p className="text-body-md font-semibold">{cert.finalScore}%</p>
                </div>
                <div>
                  <p className="text-label-caps text-foreground-muted mb-1">Expedición</p>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-primary" />
                    <p className="text-body-md font-semibold">
                      {formatDate(cert.issuedAt)}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-label-caps text-foreground-muted mb-1">Válido hasta</p>
                  <p className="text-body-md font-semibold">{formatDate(cert.expiresAt)}</p>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-label-caps text-foreground-muted mb-1">Código único</p>
                <code className="px-3 py-1.5 bg-surface-container-high rounded-lg text-body-md font-mono">
                  {cert.verifyCode}
                </code>
              </div>

              <div className="flex gap-2">
                {cert.status === 'valid' && (
                  <Badge variant="success" className="gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Verificado
                  </Badge>
                )}
                <Badge variant="primary" className="gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  Cumple normativa BPM
                </Badge>
              </div>
            </Card>

            <div className="grid md:grid-cols-2 gap-4 mb-8">
              <Card padding="md">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-body-md font-semibold text-primary mb-2">
                      Información académica
                    </h3>
                    <p className="text-body-sm text-foreground-muted">
                      Capacitación en BPM alineada con la Resolución 2674 de 2013 para
                      manipuladores de alimentos en Colombia.
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
                    <h3 className="text-body-md font-semibold text-primary mb-2">
                      Entidad emisora
                    </h3>
                    <p className="text-body-sm text-foreground-muted">
                      Certificado emitido por Nexu en el marco del Decreto 3075 de 1997 y la
                      Resolución 2674 de 2013.
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            <div className="flex justify-center gap-4 print:hidden">
              <Button variant="outline" className="gap-2" onClick={handlePrint}>
                <Printer className="w-4 h-4" />
                Imprimir
              </Button>
            </div>
          </>
        )}
      </main>

      <footer className="bg-surface-container-highest py-8 mt-auto print:hidden">
        <div className="max-w-3xl mx-auto px-lg text-center">
          <p className="text-body-md text-foreground-muted mb-2">
            <span className="font-semibold">Nexu</span> © {new Date().getFullYear()}
          </p>
          <p className="text-body-sm text-foreground-muted max-w-lg mx-auto">
            Verificación pública de certificados de capacitación en Buenas Prácticas de
            Manufactura (BPM).
          </p>
        </div>
      </footer>
    </div>
  )
}
