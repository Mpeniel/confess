import { Link, NavLink } from 'react-router-dom'
import logo from '../assets/icons/logo.svg'

const linkBase =
  "px-3 py-2 rounded-lg text-sm font-medium transition hover:opacity-90 cursor-pointer"
const active =
  "text-[#2B67A2] bg-[#E8F2FD]"

export default function Navbar() {
  return (
    <header id="site-header" className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b border-gray-200">
      <nav className="mx-auto max-w-6xl px-4 md:px-8 lg:px-10 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="Confess Logo" className="h-8 w-8" />
          <span className="font-semibold">Confess</span>
        </Link>

        {/* Links */}
        <div className="hidden md:flex items-center gap-1">
          <NavLink to="/"
            className={({isActive}) => `${linkBase} ${isActive ? active : "text-gray-600"}`}>
            Dashboard
          </NavLink>
          <NavLink to="/campaigns"
            className={({isActive}) => `${linkBase} ${isActive ? active : "text-gray-600"}`}>
            Campagnes
          </NavLink>
        </div>

        {/* Actions droites */}
        <div className="flex items-center gap-2">
          {/* Bell icon */}
          <button className="p-2 rounded-lg ring-1 ring-black/5 hover:bg-black/5" aria-label="Notifications">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M12 22a2.5 2.5 0 0 0 2.45-2h-4.9A2.5 2.5 0 0 0 12 22Z" className="fill-gray-500"/>
              <path d="M19 17H5l1.2-1.5A6 6 0 0 0 7 12V9a5 5 0 1 1 10 0v3c0 .9.3 1.8.8 2.6L19 17Z" className="fill-gray-400"/>
            </svg>
          </button>

          {/* Theme toggle */}
          {/* <button
            onClick={() => {}}
            className="px-3 py-2 text-sm rounded-lg ring-1 ring-black/5 hover:bg-black/5"
          >
            { '☀️ 🌙'}
          </button> */}

          {/* Avatar */}
          <div className="h-8 w-8 rounded-full bg-linear-to-br from-[#77B3DE] to-[#4A9EE6]" />
        </div>
      </nav>
    </header>
  )
}
