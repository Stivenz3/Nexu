import { useState } from "react";
import { Link } from "react-router-dom";
import { sendPasswordResetEmail } from "firebase/auth";
import AuthLayout from "../components/AuthLayout";
import InputField from "../components/InputField";
import { auth } from "../firebase/config";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [firebaseError, setFirebaseError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const topRight = (
    <Link to="/login" className="hover:underline">
      Volver al login
    </Link>
  );

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email.trim()) {
      setEmailError("Correo obligatorio");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError("Correo inválido");
      return;
    }

    setLoading(true);
    setFirebaseError("");
    try {
      await sendPasswordResetEmail(auth, email);
      setSent(true);
    } catch (err) {
      const messages = {
        "auth/user-not-found": "No existe cuenta con este correo",
        "auth/network-request-failed": "Sin conexión",
      };
      setFirebaseError(messages[err.code] || "No se pudo enviar el correo");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout backTo="/login" topRight={topRight}>
      {!sent ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm w-full p-8">
          <h1 className="text-4xl font-bold text-gray-900 leading-none">Recuperar contraseña</h1>
          <p className="text-gray-500 mt-2 mb-6">Te enviaremos un enlace a tu correo.</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <InputField
              label="Correo electrónico"
              type="email"
              placeholder="laura@correo.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setEmailError("");
                setFirebaseError("");
              }}
              error={emailError}
              required
              autoComplete="email"
            />

            {firebaseError && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5">
                {firebaseError}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-nexu-teal hover:bg-nexu-teal-dark text-white text-base font-semibold py-3 rounded-lg disabled:opacity-60"
            >
              {loading ? "Enviando..." : "Enviar enlace de recuperación"}
            </button>

            <p className="text-center text-sm text-gray-500">
              ¿Recordaste tu contraseña?{" "}
              <Link to="/login" className="text-nexu-teal font-semibold hover:underline">
                Inicia sesión
              </Link>
            </p>
          </form>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm w-full p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900">¡Revisa tu correo!</h2>
          <p className="text-gray-500 mt-2 text-sm">Enviamos un enlace a:</p>
          <p className="text-nexu-teal font-semibold mt-1">{email}</p>
          <div className="mt-6 space-y-3">
            <Link
              to="/login"
              className="block w-full bg-nexu-teal hover:bg-nexu-teal-dark text-white font-semibold py-3 rounded-lg"
            >
              Volver al login
            </Link>
            <button onClick={() => setSent(false)} className="text-sm text-gray-500 hover:text-nexu-teal">
              Reenviar correo
            </button>
          </div>
        </div>
      )}
    </AuthLayout>
  );
}
