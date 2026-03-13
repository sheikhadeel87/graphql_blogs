import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Nav() {
  const { user, logout, isLoggedIn } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false)
      }
    }
    if (menuOpen) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [menuOpen])

  const name = user?.name ?? 'User'
  const initials = name
    .split(/\s+/)
    .map((s) => s[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
  const avatarUrl = user?.avatar ?? null

  return (
    <nav className="sticky top-0 z-50 border-b border-surface-200/80 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
          to="/"
          className="font-display text-xl font-bold tracking-tight text-surface-900 hover:text-accent-500 transition-colors"
        >
          Blog
        </Link>
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            to="/"
            className="rounded-lg px-3 py-2 text-sm font-medium text-surface-600 hover:bg-surface-100 hover:text-surface-900"
          >
            Latest posts
          </Link>
          {isLoggedIn ? (
            <>
              <Link
                to="/dashboard"
                className="rounded-lg px-3 py-2 text-sm font-medium text-surface-600 hover:bg-surface-100 hover:text-surface-900"
              >
                Dashboard
              </Link>
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen((o) => !o)}
                className="flex shrink-0 items-center justify-center rounded-full w-9 h-9 overflow-hidden bg-surface-200 text-surface-600 font-semibold text-sm hover:ring-2 hover:ring-accent-500/30 focus:outline-none focus:ring-2 focus:ring-accent-500/50 transition-all"
                aria-expanded={menuOpen}
                aria-haspopup="true"
                aria-label="User menu"
              >
                {avatarUrl ? (
                  <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  initials
                )}
              </button>

              {menuOpen && (
                <div
                  className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-surface-200/80 bg-white py-2 shadow-lg z-50"
                  role="menu"
                >
                  <div className="px-4 py-3">
                    <p className="font-semibold text-surface-900 truncate">{name}</p>
                    <p className="mt-0.5 text-sm text-surface-500 truncate">{user?.email ?? ''}</p>
                  </div>
                  <div className="border-t border-surface-100" />
                  <div className="py-1">
                    <Link
                      to="/dashboard"
                      className="block px-4 py-2 text-sm text-surface-600 hover:bg-surface-50"
                      onClick={() => setMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false)
                        logout()
                      }}
                      className="flex w-full items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" y1="12" x2="9" y2="12" />
                      </svg>
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-lg px-3 py-2 text-sm font-medium text-surface-600 hover:bg-surface-100 hover:text-surface-900"
              >
                Log in
              </Link>
              <Link
                to="/register"
                className="btn-primary px-4 py-2.5 text-sm"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
