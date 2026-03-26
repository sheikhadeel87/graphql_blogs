import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation } from '@apollo/client'
import { useAuth } from '../context/AuthContext'
import { GET_NOTIFICATIONS } from '../graphql/queries'
import { MARK_ALL_NOTIFICATIONS_READ } from '../graphql/mutations'
import { formatPostDateShort } from '../lib/dateUtils'
import { useTheme } from '../context/ThemeContext'

export default function Nav() {
  const { user, logout, isLoggedIn } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const menuRef = useRef(null)
  const notificationsRef = useRef(null)

  const { data: notificationsData, refetch } = useQuery(GET_NOTIFICATIONS, {
    variables: { limit: 20 },
    skip: !isLoggedIn,
    fetchPolicy: 'cache-and-network',
  })
  const notifications = notificationsData?.notifications ?? []
  const unreadCount = notifications.filter(n => !n.isRead).length

  const [markAllAsRead] = useMutation(MARK_ALL_NOTIFICATIONS_READ, {
    onCompleted: () => {
      refetch()
    },
  })

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

  useEffect(() => {
    function handleClickOutside(e) {
      if (notificationsRef.current && !notificationsRef.current.contains(e.target)) {
        setNotificationsOpen(false)
      }
    }
    if (notificationsOpen) {
      document.addEventListener('click', handleClickOutside)
      // Optimistically mark all as read when dropdown opens
      if (unreadCount > 0) {
        markAllAsRead()
      }
      return () => document.removeEventListener('click', handleClickOutside)
    }
    // eslint-disable-next-line
  }, [notificationsOpen])

  const name = user?.name ?? 'User'
  const initials = name
    .split(/\s+/)
    .map((s) => s[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
  const avatarUrl = user?.avatar ?? null
  const { theme, setTheme } = useTheme()
  return (
    <nav className="sticky top-0 z-50 border-b border-surface-200/80 dark:border-surface-700 bg-white/80 dark:bg-surface-900 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="relative w-8 h-8">
            <div className="w-full h-full rounded-full border-2 border-[#4F85F5]"></div>
            <div className="absolute w-2 h-2 bg-[#4F85F5] rounded-full top-1 left-1"></div>
            <div className="absolute w-2 h-2 bg-[#4F85F5] rounded-full bottom-1 right-1"></div>
          </div>

          <span className="font-display text-xl font-semibold text-gray-900 dark:text-white">
            BlogQL
          </span>
        </Link>
        <div className="flex items-center gap-0 sm:gap-3 text-surface-600 dark:text-surface-200">
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded focus:outline-none"
            aria-label="Toggle dark mode"
          >
            {theme === 'dark' ? '🌙' : '☀️'}
          </button>
          <Link
            to="/"
            className="rounded-lg px-3 py-2 text-sm font-medium text-surface-600 dark:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-800 hover:text-surface-900 dark:hover:text-white"
          >
            Latest posts
          </Link>

          {isLoggedIn ? (
            <>
              <Link
                to="/dashboard"
                className="rounded-lg px-3 py-2 text-sm font-medium text-surface-600 dark:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-800 hover:text-surface-900 dark:hover:text-white"
              >
                Dashboard
              </Link>
              <div className="relative" ref={notificationsRef}>
                <button
                  type="button"
                  onClick={() => setNotificationsOpen((o) => !o)}
                  className="relative flex shrink-0 items-center justify-center rounded-full w-9 h-9 text-surface-600 dark:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-800 hover:text-surface-900 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-accent-500/50 transition-all"
                  aria-expanded={notificationsOpen}
                  aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} new` : ''}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                  </svg>
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </button>
                {notificationsOpen && (
                  <div
                    className="absolute right-0 top-full mt-2 w-80 max-h-[min(24rem,70vh)] overflow-y-auto rounded-xl border border-surface-200/80 dark:border-surface-700 bg-white dark:bg-surface-900 shadow-lg z-50"
                    role="menu"
                  >
                    <div className="sticky top-0 bg-white dark:bg-surface-900 border-b border-surface-100 dark:border-surface-700 px-4 py-3 flex items-center justify-between">
                      <span className="font-semibold text-surface-900 dark:text-white">🔔 Notifications</span>
                      {unreadCount > 0 && (
                        <span className="text-xs text-surface-500 dark:text-surface-400">{unreadCount} new</span>
                      )}
                    </div>
                    <div className="py-2">
                      {notifications.length === 0 ? (
                        <p className="px-4 py-6 text-center text-sm text-surface-500 dark:text-surface-400">No notifications yet.</p>
                      ) : (
                        notifications.map((n) => {
                          const actorName = n.actor?.name ?? 'Someone'
                          const timeStr = n.createdAt ? formatPostDateShort(n.createdAt) : ''
                          let message = ''
                          if (n.type === 'like') message = 'liked your post'
                          else if (n.type === 'comment') message = 'commented on your post'
                          else if (n.type === 'follow') message = 'started following you'
                          const postLink = n.post && (n.type === 'like' || n.type === 'comment')
                          return (
                            <div
                              key={n.id}
                              className="px-4 py-3 hover:bg-surface-50 dark:hover:bg-surface-800 border-b border-surface-50 dark:border-surface-700 last:border-0"
                            >
                              {postLink && n.post ? (
                                <Link
                                  to={`/post/${n.post.id}`}
                                  onClick={() => setNotificationsOpen(false)}
                                  className="block text-sm"
                                >
                                  <span className="font-medium text-surface-900">{actorName}</span>
                                  <span className="text-surface-600"> {message} </span>
                                  <span className="text-accent-600 hover:underline font-medium line-clamp-1" title={n.post.title}>
                                    {n.post.title || 'your post'}
                                  </span>
                                  {timeStr && <span className="block text-xs text-surface-400 mt-0.5">{timeStr}</span>}
                                </Link>
                              ) : (
                                <div className="text-sm">
                                  <span className="font-medium text-surface-900">{actorName}</span>
                                  <span className="text-surface-600"> {message}</span>
                                  {timeStr && <span className="block text-xs text-surface-400 mt-0.5">{timeStr}</span>}
                                </div>
                              )}
                            </div>
                          )
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>
              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  onClick={() => setMenuOpen((o) => !o)}
                  className="mr-1 flex shrink-0 items-center justify-center rounded-full w-9 h-9 overflow-hidden bg-surface-200 dark:bg-surface-600 text-surface-700 dark:text-surface-100 font-semibold text-sm hover:ring-2 hover:ring-accent-500/30 focus:outline-none focus:ring-2 focus:ring-accent-500/50 transition-all"
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
                    className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-surface-200/80 dark:border-surface-700 bg-white dark:bg-surface-900 py-2 shadow-lg z-50"
                    role="menu"
                  >
                    <div className="px-4 py-3">
                      <p className="font-semibold text-surface-900 dark:text-white truncate">{name}</p>
                      <p className="mt-0.5 text-sm text-surface-500 dark:text-surface-400 truncate">{user?.email ?? ''}</p>
                    </div>
                    <div className="border-t border-surface-100 dark:border-surface-700" />
                    <div className="py-1">
                      <Link
                        to="/dashboard"
                        className="block px-4 py-2 text-sm text-surface-600 dark:text-surface-200 hover:bg-surface-50 dark:hover:bg-surface-800"
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
                        className="flex w-full items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
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
