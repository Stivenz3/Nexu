/**
 * Verificación del token de reCAPTCHA (v3 devuelve `score`; v2 solo `success`).
 *
 * - Producción: POST a `/api/verify-recaptcha` con la clave secreta solo en servidor.
 * - Desarrollo: si no hay API local, se acepta el token para no bloquear el login.
 *
 * Nunca pongas la clave secreta en el cliente ni en variables VITE_*.
 */

const DEFAULT_VERIFY_PATH = '/api/verify-recaptcha'

function minScoreThreshold(): number {
  const raw = import.meta.env.VITE_RECAPTCHA_MIN_SCORE
  const n = raw !== undefined && raw !== '' ? Number(raw) : 0.5
  return Number.isFinite(n) ? Math.min(1, Math.max(0, n)) : 0.5
}

export interface VerifyRecaptchaResult {
  success: boolean
  score?: number | null
}

export async function verifyRecaptchaToken(token: string | null): Promise<VerifyRecaptchaResult> {
  if (!token?.trim()) {
    return { success: false, score: null }
  }

  const explicitUrl = import.meta.env.VITE_RECAPTCHA_VERIFY_URL?.trim()
  const url = explicitUrl || DEFAULT_VERIFY_PATH
  const threshold = minScoreThreshold()

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })

    if (response.ok) {
      const data = (await response.json()) as { success?: boolean; score?: number | null }
      const apiSuccess = Boolean(data.success)
      const score = data.score ?? null

      // v3: Google devuelve score 0.0–1.0. v2: suele no incluir score; si es null, confiamos en success.
      if (apiSuccess && typeof score === 'number' && score < threshold) {
        return { success: false, score }
      }

      return { success: apiSuccess, score }
    }
  } catch {
    // Red o /api ausente en vite dev
  }

  if (import.meta.env.DEV) {
    console.warn(
      '[reCAPTCHA] API de verificación no disponible; en desarrollo se acepta el token (útil sin backend local).',
    )
    return { success: true, score: null }
  }

  return { success: false, score: null }
}
