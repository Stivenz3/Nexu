import { Award, Download, Share2, Info, Calendar } from 'lucide-react'
import { AppLayout } from '@/components/layout'
import { Card, Badge, Button } from '@/components/ui'
import { useAuth } from '@/contexts/AuthContext'
import type { Certificate } from '@/types'

function CertificatePreview({ certificate }: { certificate: Certificate }) {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-CO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  const cert = certificate

  return (
    <Card padding="none" className="overflow-hidden">
      {/* Certificate document */}
      <div className="bg-white p-8 border-b border-outline-variant/30">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-h2 font-bold text-primary mb-4">Nexu</h2>
          <div className="w-20 h-20 mx-auto mb-4 rounded-full border-2 border-primary flex items-center justify-center">
            <Award className="w-10 h-10 text-primary" />
          </div>
          <p className="text-label-caps uppercase tracking-widest text-primary mb-2">
            Certificado de Aprobacion
          </p>
          <p className="text-body-md text-foreground">
            {cert.courseName} - {cert.courseModule}
          </p>
        </div>

        {/* Recipient */}
        <div className="text-center mb-8">
          <p className="text-body-sm text-foreground-muted italic mb-2">
            Este documento certifica que
          </p>
          <h3 className="text-h1 text-primary font-bold">
            {cert.userName}
          </h3>
        </div>

        {/* Details grid */}
        <div className="grid grid-cols-4 gap-4 mb-8 text-center">
          <div>
            <p className="text-label-caps text-foreground-muted mb-1">ID Usuario</p>
            <p className="text-body-md font-semibold text-foreground">{cert.userId}</p>
          </div>
          <div>
            <p className="text-label-caps text-foreground-muted mb-1">Calificacion</p>
            <p className="text-body-md font-semibold text-foreground">{cert.score}%</p>
          </div>
          <div>
            <p className="text-label-caps text-foreground-muted mb-1">Expedicion</p>
            <p className="text-body-md font-semibold text-foreground">{formatDate(cert.issueDate)}</p>
          </div>
          <div>
            <p className="text-label-caps text-foreground-muted mb-1">Vencimiento</p>
            <p className="text-body-md font-semibold text-foreground">{formatDate(cert.expiryDate)}</p>
          </div>
        </div>

        {/* Signature and QR */}
        <div className="grid grid-cols-2 gap-8">
          <div className="bg-surface-container-high rounded-lg p-6">
            <div className="h-24 flex items-center justify-center">
              <p className="text-3xl italic text-foreground-muted font-serif">Nexu</p>
            </div>
            <p className="text-body-sm text-foreground-muted text-center mt-2">
              Director de Capacitacion
            </p>
          </div>
          <div className="bg-primary rounded-lg p-4 flex flex-col items-center justify-center">
            {/* QR Code placeholder */}
            <div className="w-24 h-24 bg-white rounded-lg grid grid-cols-6 grid-rows-6 gap-0.5 p-2">
              {Array.from({ length: 36 }).map((_, i) => (
                <div
                  key={i}
                  className={`${Math.random() > 0.5 ? 'bg-foreground' : 'bg-white'} rounded-sm`}
                />
              ))}
            </div>
            <p className="text-label-caps text-white/80 mt-2 uppercase tracking-wider">
              Verificar Autenticidad
            </p>
          </div>
        </div>
      </div>
    </Card>
  )
}

function ActionsCard() {
  return (
    <Card padding="lg" className="sticky top-24">
      <h3 className="text-body-md font-semibold text-foreground mb-2">Gestion de Logro</h3>
      <p className="text-body-sm text-foreground-muted mb-6">
        Descarga tu certificado oficial en alta resolucion o compartelo directamente en tus redes profesionales para validar tus habilidades.
      </p>

      <div className="space-y-3 mb-6">
        <Button className="w-full justify-center gap-2">
          <Download className="w-4 h-4" />
          Descargar PDF
        </Button>
        <Button variant="outline" className="w-full justify-center gap-2">
          <Share2 className="w-4 h-4" />
          Compartir
        </Button>
      </div>

      {/* Next steps */}
      <div className="bg-primary rounded-lg p-4 text-white mb-6">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-body-sm font-semibold mb-1">Proximos pasos?</p>
            <p className="text-body-sm opacity-90">
              Este certificado es valido por un ano. Te notificaremos 30 dias antes de su vencimiento para que puedas renovarlo.
            </p>
          </div>
        </div>
      </div>

      {/* Promo image */}
      <div className="rounded-lg overflow-hidden relative">
        <img
          src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&q=80"
          alt="Kitchen"
          className="w-full h-32 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
          <p className="text-body-sm text-white font-medium">
            Manten los estandares de higiene en tu cocina.
          </p>
        </div>
      </div>
    </Card>
  )
}

export function CertificatePage() {
  const { user } = useAuth()
  const firstName = user?.fullName?.split(' ')[0] || 'Usuario'

  // Generate certificate data based on authenticated user
  const certificate: Certificate = {
    id: `cert-${user?.id || '001'}`,
    code: `${user?.id?.slice(-4) || 'XXXX'}-${Date.now().toString(36).toUpperCase().slice(-4)}`,
    userId: user?.id || '',
    userName: user?.fullName || '',
    userDocument: `${user?.documentType?.toUpperCase() || 'CC'}. ${user?.documentNumber || ''}`,
    courseName: 'Buenas Practicas de Manufactura',
    courseModule: 'Higiene Personal',
    issueDate: new Date(),
    expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
    score: 92,
    status: 'valid',
  }

  return (
    <AppLayout>
      <div className="mb-8">
        <p className="text-primary font-semibold mb-1">Felicitaciones, {firstName}!</p>
        <h1 className="text-h2 text-foreground">
          Has completado con exito tu certificacion de seguridad alimentaria.
        </h1>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <CertificatePreview certificate={certificate} />
        </div>
        <div className="lg:col-span-1">
          <ActionsCard />
        </div>
      </div>
    </AppLayout>
  )
}
