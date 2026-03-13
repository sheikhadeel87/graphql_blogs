import Nav from './Nav'

export default function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-mesh">
      <Nav />
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-12 relative">
        {children}
      </main>
      <footer className="border-t border-surface-200 bg-white/50 py-6 mt-auto">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-surface-500">
          <span>Blog — GraphQL + React</span>
          <span>© {new Date().getFullYear()}</span>
        </div>
      </footer>
    </div>
  )
}
