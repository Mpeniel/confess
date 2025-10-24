import { Link } from 'react-router-dom'
import logo from '../assets/icons/logo.svg'

export default function Login() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-xl text-center">
        {/* Logo/icone minimal */}
        {/* <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-full ring-1 ring-[#77B3DE]/30">
          <span className="inline-block h-6 w-6 rounded-full border-2 border-[#77B3DE]"></span>
        </div> */}
        <img src={logo} alt="Confess logo" className="mx-auto mb-6 h-12 w-12 rounded-full" />

        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900">
          Confess
        </h1>
        <p className="mt-2 text-gray-600">
          Confesse ton identité · répète la vérité.
        </p>

        <div className="mx-auto mt-10 flex w-full max-w-sm flex-col gap-3">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-xl bg-[#4A9EE6] px-5 py-3 text-white font-semibold shadow-sm hover:opacity-95 transition"
          >
            Se connecter
          </Link>

          <Link
            to="/signup"
            className="inline-flex items-center justify-center rounded-xl bg-[#4A9EE6]/15 px-5 py-3 text-[#2B67A2] font-semibold ring-1 ring-[#4A9EE6]/30 hover:bg-[#4A9EE6]/20 transition"
          >
            Créer un compte
          </Link>
        </div>
      </div>
    </div>
  )
}
