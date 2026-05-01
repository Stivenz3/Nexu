import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import AuthLayout from "../components/AuthLayout";
import InputField from "../components/InputField";
import { auth, db } from "../firebase/config";

const TIPOS_DOC = [
  { value: "CC", label: "Cédula" },
  { value: "TI", label: "Tarjeta de identidad" },
  { value: "CE", label: "Cédula extranjería" },
  { value: "PA", label: "Pasaporte" },
  { value: "NIT", label: "NIT" },
];

export default function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [firebaseError, setFirebaseError] = useState("");
  const [form, setForm] = useState({
    nombre: "",
    tipoDoc: "CC",
    numeroDoc: "",
    email: "",
    password: "",
    aceptaPolitica: false,
  });
  const [errors, setErrors] = useState({});

  const topRight = (
    <Link to="/login" className="hover:underline">
      ¿Ya tienes cuenta?
    </Link>
  );

  function handleChange(field) {
    return (e) => {
      const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
      setForm((prev) => ({ ...prev, [field]: value }));
      if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
      setFirebaseError("");
    };
  }

  function validate() {
    const newErrors = {};
    if (!form.nombre.trim()) newErrors.nombre = "Nombre obligatorio";
    if (!form.numeroDoc.trim()) newErrors.numeroDoc = "Documento obligatorio";
    if (!form.email.trim()) newErrors.email = "Correo obligatorio";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = "Correo inválido";
    if (!form.password) newErrors.password = "Contraseña obligatoria";
    else if (form.password.length < 8) newErrors.password = "Mínimo 8 caracteres";
    if (!form.aceptaPolitica) newErrors.aceptaPolitica = "Debes aceptar la política";
    return newErrors;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setFirebaseError("");
    try {
      const { user } = await createUserWithEmailAndPassword(auth, form.email, form.password);
      await updateProfile(user, { displayName: form.nombre });

      await setDoc(doc(db, "users", user.uid), {
        nombre: form.nombre,
        tipoDoc: form.tipoDoc,
        numeroDoc: form.numeroDoc,
        email: form.email,
        aceptaPolitica: true,
        rol: "manipulador",
        progreso: {},
        createdAt: serverTimestamp(),
      });

      navigate("/login", { state: { registered: true } });
    } catch (err) {
      const messages = {
        "auth/email-already-in-use": "Este correo ya está registrado",
        "auth/invalid-email": "Correo inválido",
        "auth/network-request-failed": "Sin conexión",
      };
      setFirebaseError(messages[err.code] || "No se pudo crear la cuenta");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout backTo="/" topRight={topRight}>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm w-full p-8">
        <h1 className="text-4xl font-bold text-gray-900 leading-none">Crear cuenta</h1>
        <p className="text-gray-500 mt-2 mb-6">Te toma 2 minutos y empiezas a aprender.</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <InputField
            label="Nombre completo"
            placeholder="Laura Gómez"
            value={form.nombre}
            onChange={handleChange("nombre")}
            error={errors.nombre}
            required
            autoComplete="name"
          />

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">Documento</label>
            <div className="grid grid-cols-1 sm:grid-cols-[130px_1fr] gap-3">
              <select
                value={form.tipoDoc}
                onChange={handleChange("tipoDoc")}
                className="w-full border border-gray-300 rounded-lg px-3 py-3 text-sm outline-none focus:border-nexu-teal focus:ring-2 focus:ring-nexu-teal/10"
              >
                {TIPOS_DOC.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>

              <input
                type="text"
                placeholder="1234567890"
                value={form.numeroDoc}
                onChange={handleChange("numeroDoc")}
                className={`w-full border rounded-lg px-4 py-3 text-sm outline-none ${
                  errors.numeroDoc
                    ? "border-red-400"
                    : "border-gray-300 focus:border-nexu-teal focus:ring-2 focus:ring-nexu-teal/10"
                }`}
              />
            </div>
            {errors.numeroDoc && <p className="text-xs text-red-500 mt-1">{errors.numeroDoc}</p>}
          </div>

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
            placeholder="Mínimo 8 caracteres"
            value={form.password}
            onChange={handleChange("password")}
            error={errors.password}
            required
            autoComplete="new-password"
          />

          <label className="flex items-start gap-2.5 text-sm text-gray-600 leading-6">
            <input
              type="checkbox"
              checked={form.aceptaPolitica}
              onChange={handleChange("aceptaPolitica")}
              className="mt-1 h-4 w-4 accent-nexu-teal"
            />
            <span>
              Acepto la{" "}
              <a href="#" onClick={(e) => e.preventDefault()} className="text-nexu-teal underline">
                política de tratamiento de datos
              </a>
              .
            </span>
          </label>
          {errors.aceptaPolitica && <p className="text-xs text-red-500">{errors.aceptaPolitica}</p>}

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
            {loading ? "Creando cuenta..." : "Crear cuenta"}
          </button>

          <p className="text-center text-sm text-gray-500">
            ¿Ya tienes cuenta?{" "}
            <Link to="/login" className="text-nexu-teal font-semibold hover:underline">
              Inicia sesión
            </Link>
          </p>
        </form>
      </div>
    </AuthLayout>
  );
}
