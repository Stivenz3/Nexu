export const config = { runtime: 'edge' }

/**
 * Verificación servidor de reCAPTCHA (v3 devuelve `score`; v2 no).
 * Vercel (no VITE): RECAPTCHA_SECRET_KEY — debe ser el par de la clave de sitio v3.
 */
export default async function handler(request: Request): Promise<Response> {
  if (request.method !== 'POST') {
    return json({ success: false, error: 'Method not allowed' }, 405)
  }

  let token = ''
  try {
    const body = (await request.json()) as { token?: string }
    token = typeof body.token === 'string' ? body.token : ''
  } catch {
    return json({ success: false }, 400)
  }

  if (!token) {
    return json({ success: false }, 400)
  }

  const secret = process.env.RECAPTCHA_SECRET_KEY
  if (!secret) {
    return json({ success: false, error: 'RECAPTCHA_SECRET_KEY no configurada' }, 500)
  }

  const params = new URLSearchParams()
  params.set('secret', secret)
  params.set('response', token)

  const verifyRes = await fetch('https://www.google.com/recaptcha/api/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  })

  const data = (await verifyRes.json()) as {
    success: boolean
    score?: number
    challenge_ts?: string
    hostname?: string
    'error-codes'?: string[]
  }

  return json({
    success: data.success,
    score: data.score ?? null,
    errors: data['error-codes'] ?? null,
  })
}

function json(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  })
}
