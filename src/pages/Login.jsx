import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import AuthLayout from "../components/AuthLayout";
import InputField from "../components/InputField";
import { auth } from "../firebase/config";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const registered = location.state?.registered;

  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [firebaseError, setFirebaseError] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);

  const topRight = (
    <Link to="/register" className="hover:underline">
      Crear cuenta
    </Link>
  );

  function handleChange(field) {
    return (e) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
      if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
      setFirebaseError("");
    };
  }

  function validate() {
    const newErrors = {};
    if (!form.email.trim()) newErrors.email = "Correo obligatorio";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = "Correo inválido";
    if (!form.password) newErrors.password = "Contraseña obligatoria";
    return newErrors;
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (isBlocked) {
      setFirebaseError("Demasiados intentos. Intenta de nuevo en unos minutos.");
      return;
    }

    const validationErrors = validate();
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setFirebaseError("");

    try {
      await signInWithEmailAndPassword(auth, form.email, form.password);
      setAttempts(0);
      navigate("/dashboard");
    } catch (err) {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      if (newAttempts >= 3) {
        setFirebaseError("Bloqueado 15 minutos por 3 intentos fallidos.");
        setIsBlocked(true);
        setTimeout(() => setIsBlocked(false), 15 * 60 * 1000);
      } else {
        const messages = {
          "auth/user-not-found": "No existe cuenta con ese correo",
          "auth/wrong-password": `Contraseña incorrecta (${newAttempts}/3)`,
          "auth/invalid-credential": `Correo o contraseña incorrectos (${newAttempts}/3)`,
          "auth/network-request-failed": "Sin conexión",
        };
        setFirebaseError(messages[err.code] || "No se pudo iniciar sesión");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout backTo="/" topRight={topRight}>
      {registered && (
        <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          ¡Cuenta creada! Inicia sesión para continuar.
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm w-full p-8">
        <h1 className="text-4xl font-bold text-gray-900 leading-none">¡Bienvenido de nuevo!</h1>
        <p className="text-gray-500 mt-2 mb-6">Continúa donde la dejaste.</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <InputField
            label="Correo electrónico"
            type="email"
            placeholder="laura@correo.com"
            value={form.email}
            onChange={handleChange("email")}
            error={errors.email}
            required
            autoComplete="email"
          />

          <InputField
            label="Contraseña"
            type="password"
            placeholder="Tu contraseña"
            value={form.password}
            onChange={handleChange("password")}
            error={errors.password}
            required
            autoComplete="current-password"
            rightSlot={
              <Link to="/forgot-password" className="text-nexu-teal hover:underline">
                ¿Olvidaste tu contraseña?
              </Link>
            }
          />

          {firebaseError && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5">
              {firebaseError}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || isBlocked}
            className="w-full bg-nexu-teal hover:bg-nexu-teal-dark text-white text-base font-semibold py-3 rounded-lg disabled:opacity-60"
          >
            {loading ? "Entrando..." : isBlocked ? "Bloqueado temporalmente" : "Entrar"}
          </button>

          <p className="text-center text-sm text-gray-500">
            ¿Primera vez?{" "}
            <Link to="/register" className="text-nexu-teal font-semibold hover:underline">
              Crea una cuenta
            </Link>
          </p>
        </form>
      </div>
    </AuthLayout>
  );
}
