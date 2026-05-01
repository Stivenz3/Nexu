import { Link } from "react-router-dom";
import Logo from "./Logo";

export default function AuthLayout({ children, topRight, backTo }) {
  return (
    <div className="min-h-screen bg-[#f8f9fb] flex overflow-hidden">
      <aside className="hidden lg:flex w-[360px] shrink-0 bg-nexu-teal relative overflow-hidden p-10">
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-white/10" />
        <div className="absolute -bottom-24 -left-20 w-80 h-80 rounded-full bg-white/10" />

        <div className="relative z-10 flex flex-col justify-between h-full text-white">
          <div>
            <Logo size="lg" onDark />
            <p className="text-white/65 text-xs uppercase tracking-widest font-semibold mt-2">
              Certificación BPM
            </p>
          </div>

          <div>
            <h2 className="text-4xl font-extrabold leading-tight">
              Aprende.<br />Practica.<br />
              <span className="text-nexu-orange">Certifícate.</span>
            </h2>
            <p className="mt-4 text-white/75 text-sm leading-relaxed">
              Capacitación digital para manipuladores de alimentos en Colombia.
            </p>
          </div>
        </div>
      </aside>

      <section className="flex-1 min-w-0 flex flex-col">
        <header className="h-16 bg-white border-b border-gray-200 px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {backTo && (
              <Link
                to={backTo}
                className="w-8 h-8 rounded-md text-gray-500 hover:text-nexu-teal hover:bg-nexu-teal/10 flex items-center justify-center"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                </svg>
              </Link>
            )}
            <Link to="/">
              <Logo size="sm" />
            </Link>
          </div>
          <div className="text-sm text-nexu-teal font-medium">{topRight}</div>
        </header>

        <main className="flex-1 flex items-center justify-center px-4 py-8">
          <div className="w-full max-w-md">{children}</div>
        </main>
      </section>
    </div>
  );
}
