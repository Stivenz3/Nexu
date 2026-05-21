/** URL pública de verificación (misma origen que la app desplegada). */
export function buildVerifyUrl(verifyCode: string): string {
  const base =
    typeof window !== 'undefined'
      ? window.location.origin
      : import.meta.env.VITE_APP_URL ?? 'https://nexu.vercel.app'
  return `${base.replace(/\/$/, '')}/verificar/${verifyCode}`
}
