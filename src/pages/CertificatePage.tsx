import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Award, Download, Share2, Info, Loader2 } from 'lucide-react'
import { AppLayout } from '@/components/layout'
import {
  CertificateDocument,
  CERTIFICATE_DOCUMENT_ID,
} from '@/components/certificate/CertificateDocument'
import { Card, Button } from '@/components/ui'
import { useAuth } from '@/contexts/AuthContext'
import { downloadCertificatePdf } from '@/lib/certificatePdf'
import {
  getCertificateById,
  getUserCertificates,
} from '@/services/certificateService'
import type { CertificateView } from '@/types/certificate'

function ActionsCard({
  certificate,
  onDownload,
  downloading,
}: {
  certificate: CertificateView
  onDownload: () => void
  downloading: boolean
}) {
  const handleShare = async () => {
    const text = `Certificado Nexu — ${certificate.lessonTitle}. Verificar: ${certificate.qrVerifyUrl}`
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Certificado Nexu',
          text,
          url: certificate.qrVerifyUrl,
        })
      } catch {
        /* usuario canceló */
      }
    } else {
      await navigator.clipboard.writeText(certificate.qrVerifyUrl)
      alert('Enlace de verificación copiado al portapapeles.')
    }
  }

  return (
    <Card padding="lg" className="sticky top-24">
      <h3 className="text-body-md font-semibold text-foreground mb-2">
        Gestión de logro
      </h3>
      <p className="text-body-sm text-foreground-muted mb-6">
        Descarga tu certificado en PDF o comparte el enlace público de verificación.
      </p>

      <div className="space-y-3 mb-6">
        <Button
          className="w-full justify-center gap-2"
          onClick={onDownload}
          disabled={downloading}
        >
          {downloading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Download className="w-4 h-4" />
          )}
          Descargar PDF
        </Button>
        <Button variant="outline" className="w-full justify-center gap-2" onClick={handleShare}>
          <Share2 className="w-4 h-4" />
          Compartir verificación
        </Button>
      </div>

      <div className="bg-primary rounded-lg p-4 text-white mb-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-body-sm font-semibold mb-1">Vigencia</p>
            <p className="text-body-sm opacity-90">
              Válido un año desde la expedición. Código: {certificate.verifyCode}
            </p>
          </div>
        </div>
      </div>

      <p className="text-body-sm text-foreground-muted">
        <Link to={certificate.qrVerifyUrl} className="text-primary underline break-all">
          {certificate.qrVerifyUrl}
        </Link>
      </p>
    </Card>
  )
}

type LocationState = {
  certificateId?: string
}

export function CertificatePage() {
  const { user } = useAuth()
  const location = useLocation()
  const state = location.state as LocationState | null

  const [certificates, setCertificates] = useState<CertificateView[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)

  const firstName = user?.fullName?.split(' ')[0] || 'Usuario'
  const selected =
    certificates.find((c) => c.certificateId === selectedId) ?? certificates[0] ?? null

  useEffect(() => {
    if (!user?.id) return
    ;(async () => {
      setLoading(true)
      try {
        let list = await getUserCertificates(user.id)
        if (state?.certificateId) {
          const fromState = await getCertificateById(state.certificateId)
          if (fromState && !list.some((c) => c.certificateId === fromState.certificateId)) {
            list = [fromState, ...list]
          }
          setSelectedId(state.certificateId)
        } else if (list.length > 0) {
          setSelectedId(list[0].certificateId)
        }
        setCertificates(list)
      } finally {
        setLoading(false)
      }
    })()
  }, [user?.id, state?.certificateId])

  const handleDownload = async () => {
    if (!selected) return
    setDownloading(true)
    try {
      const safeName = selected.userName.replace(/\s+/g, '_').slice(0, 40)
      await downloadCertificatePdf(
        CERTIFICATE_DOCUMENT_ID,
        `Nexu_Certificado_${safeName}_${selected.verifyCode}.pdf`
      )
    } catch (e) {
      alert(e instanceof Error ? e.message : 'No se pudo generar el PDF.')
    } finally {
      setDownloading(false)
    }
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="flex justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    )
  }

  if (!selected) {
    return (
      <AppLayout>
        <Card padding="lg" className="max-w-lg mx-auto text-center">
          <Award className="w-12 h-12 text-foreground-muted mx-auto mb-4 opacity-50" />
          <h1 className="text-h2 text-foreground mb-2">Aún no tienes certificados</h1>
          <p className="text-body-md text-foreground-muted mb-6">
            Aprueba la evaluación final de una lección (mínimo 70 %) para recibir tu
            certificado oficial.
          </p>
          <Link to="/ruta">
            <Button>Ir a la ruta de aprendizaje</Button>
          </Link>
        </Card>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="mb-8">
        <p className="text-primary font-semibold mb-1">Felicitaciones, {firstName}!</p>
        <h1 className="text-h2 text-foreground">
          Tu certificado de seguridad alimentaria está listo.
        </h1>
      </div>

      {certificates.length > 1 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {certificates.map((c) => (
            <button
              key={c.certificateId}
              type="button"
              onClick={() => setSelectedId(c.certificateId)}
              className={`px-4 py-2 rounded-lg text-body-sm font-medium border transition-colors ${
                c.certificateId === selected.certificateId
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-outline-variant text-foreground-muted hover:border-primary/50'
              }`}
            >
              {c.lessonTitle}
            </button>
          ))}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <CertificateDocument certificate={selected} />
        </div>
        <div className="lg:col-span-1">
          <ActionsCard
            certificate={selected}
            onDownload={handleDownload}
            downloading={downloading}
          />
        </div>
      </div>
    </AppLayout>
  )
}
