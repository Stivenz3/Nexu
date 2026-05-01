import { useNavigate } from "react-router-dom";
import Logo from "../components/Logo";

export default function Splash() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-nexu-teal relative overflow-hidden flex items-center justify-center">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-white/10" />
        <div className="absolute bottom-20 -left-16 w-56 h-56 rounded-full bg-white/10" />
        <div className="absolute -bottom-20 right-8 w-64 h-64 rounded-full bg-black/10" />
      </div>

      <div className="relative z-10 w-full max-w-sm px-6 text-center">
        <Logo size="xl" onDark />
        <p className="text-white text-3xl font-semibold leading-tight mt-4">
          Tu certificación BPM, sin filas ni vueltas.
        </p>

        <div className="mt-8 space-y-3">
          <button
            onClick={() => navigate("/register")}
            className="w-full bg-nexu-orange hover:bg-nexu-orange-dark text-white font-bold text-lg py-3 rounded-xl"
          >
            Crear cuenta
          </button>
          <button
            onClick={() => navigate("/login")}
            className="w-full border border-white/40 bg-white/10 hover:bg-white/15 text-white font-semibold text-lg py-3 rounded-xl"
          >
            Ya tengo cuenta
          </button>
        </div>
      </div>
    </div>
  );
}
