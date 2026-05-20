import { Modal } from './Modal'

interface TermsOfServiceModalProps {
  onClose: () => void
}

export function TermsOfServiceModal({ onClose }: TermsOfServiceModalProps) {
  return (
    <Modal onClose={onClose}>
      <h2 className="text-2xl sm:text-3xl font-bold text-primary mb-4 text-center pr-8">
        Términos de Servicio
      </h2>
      <div className="prose text-gray-700 flex-1 min-h-0 overflow-y-auto w-full border border-outline-variant/10 rounded-md p-4 sm:p-5 bg-surface">
        <p>Al usar este servicio aceptas estos términos y condiciones.</p>
        <h3 className="text-xl font-semibold text-gray-800 mt-4">1. Uso</h3>
        <p>Solo puedes usar Nexu legalmente y respetar nuestras reglas.</p>
        <h3 className="text-xl font-semibold text-gray-800 mt-4">2. Propiedad</h3>
        <p>El contenido y marca Nexu son propiedad protegida por la ley.</p>
        <h3 className="text-xl font-semibold text-gray-800 mt-4">3. Responsabilidad</h3>
        <p>No nos hacemos responsables por daños indirectos o pérdidas.</p>
        <h3 className="text-xl font-semibold text-gray-800 mt-4">4. Ley</h3>
        <p>La ley colombiana regula estos términos.</p>
        <h3 className="text-xl font-semibold text-gray-800 mt-4">5. Cambios</h3>
        <p>Podemos actualizar estos términos y avisaremos ante cambios importantes.</p>
      </div>
      <button
        type="button"
        onClick={onClose}
        className="mt-6 sm:mt-8 mx-auto w-full sm:w-auto px-6 py-3 rounded-lg bg-primary text-white font-semibold shadow hover:bg-primary-dark transition-colors text-lg shrink-0"
      >
        Entendido
      </button>
    </Modal>
  )
}
