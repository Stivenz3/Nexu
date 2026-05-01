import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase/config";
import { useAuth } from "../context/AuthContext";
import Logo from "../components/Logo";

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await signOut(auth);
    navigate("/");
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between shadow-sm">
        <Logo size="md" />
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500 hidden sm:block">
            {user?.displayName || user?.email}
          </span>
          <button
            onClick={handleLogout}
            className="text-sm font-medium text-gray-500 hover:text-nexu-teal border border-gray-200 hover:border-nexu-teal px-4 py-2 rounded-lg transition-all"
          >
            Cerrar sesión
          </button>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="w-24 h-24 bg-nexu-teal/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <span className="text-5xl">🎮</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            ¡Listo para aprender!
          </h1>
          <p className="text-gray-500 text-sm leading-relaxed">
            Hola,{" "}
            <span className="font-semibold text-nexu-teal">
              {user?.displayName || user?.email}
            </span>
            . Los módulos del juego BPM estarán disponibles pronto.
          </p>
        </div>
      </main>
    </div>
  );
}
