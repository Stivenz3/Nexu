import { useEffect, useState } from 'react'
import { Award } from 'lucide-react'
import { Card } from '@/components/ui'
import QRCode from 'qrcode'
import type { CertificateView } from '@/types/certificate'

const DOCUMENT_ID = 'nexu-certificate-document'

interface CertificateDocumentProps {
  certificate: CertificateView
}

function formatDate(date: Date) {
  return date.toLocaleDateString('es-CO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export function CertificateDocument({ certificate }: CertificateDocumentProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)

  useEffect(() => {
    QRCode.toDataURL(certificate.qrVerifyUrl, {
      width: 192,
      margin: 1,
      color: { dark: '#1a1a1a', light: '#ffffff' },
    })
      .then(setQrDataUrl)
      .catch(() => setQrDataUrl(null))
  }, [certificate.qrVerifyUrl])

  const cert = certificate

  return (
    <Card padding="none" className="overflow-hidden">
      <div id={DOCUMENT_ID} className="bg-white p-8 border-b border-outline-variant/30">
        <div className="text-center mb-8">
          <h2 className="text-h2 font-bold text-primary mb-4">Nexu</h2>
          <div className="w-20 h-20 mx-auto mb-4 rounded-full border-2 border-primary flex items-center justify-center">
            <Award className="w-10 h-10 text-primary" />
          </div>
          <p className="text-label-caps uppercase tracking-widest text-primary mb-2">
            Certificado de Aprobación
          </p>
          <p className="text-body-md text-foreground">
            {cert.courseName} — {cert.lessonTitle}
          </p>
        </div>

        <div className="text-center mb-8">
          <p className="text-body-sm text-foreground-muted italic mb-2">
            Este documento certifica que
          </p>
          <h3 className="text-h1 text-primary font-bold">{cert.userName}</h3>
          <p className="text-body-sm text-foreground-muted mt-2">{cert.userDocument}</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8 text-center">
          <div>
            <p className="text-label-caps text-foreground-muted mb-1">Código</p>
            <p className="text-body-sm font-semibold text-foreground font-mono">
              {cert.verifyCode}
            </p>
          </div>
          <div>
            <p className="text-label-caps text-foreground-muted mb-1">Calificación</p>
            <p className="text-body-md font-semibold text-foreground">{cert.finalScore}%</p>
          </div>
          <div>
            <p className="text-label-caps text-foreground-muted mb-1">Expedición</p>
            <p className="text-body-md font-semibold text-foreground">
              {formatDate(cert.issuedAt)}
            </p>
          </div>
          <div>
            <p className="text-label-caps text-foreground-muted mb-1">Vencimiento</p>
            <p className="text-body-md font-semibold text-foreground">
              {formatDate(cert.expiresAt)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8">
          <div className="bg-surface-container-high rounded-lg p-6">
            <div className="h-24 flex items-center justify-center">
              <p className="text-3xl italic text-foreground-muted font-serif">Nexu</p>
            </div>
            <p className="text-body-sm text-foreground-muted text-center mt-2">
              Director de Capacitación
            </p>
            <p className="text-body-sm text-foreground-muted text-center mt-4">
              Resolución 2674 de 2013 — Ministerio de Salud
            </p>
          </div>
          <div className="bg-primary rounded-lg p-4 flex flex-col items-center justify-center min-h-[140px]">
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt="Código QR de verificación"
                className="w-24 h-24 bg-white rounded-lg p-1"
              />
            ) : (
              <div className="w-24 h-24 bg-white/20 rounded-lg animate-pulse" />
            )}
            <p className="text-label-caps text-white/90 mt-2 uppercase tracking-wider text-center">
              Verificar autenticidad
            </p>
          </div>
        </div>
      </div>
    </Card>
  )
}

export { DOCUMENT_ID as CERTIFICATE_DOCUMENT_ID }
