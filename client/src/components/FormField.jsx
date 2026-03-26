export default function FormField({ label, optional, children, error }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-surface-700 dark:text-surface-200">
        {label}
        {optional && <span className="font-normal text-surface-400 dark:text-surface-400"> (optional)</span>}
      </label>
      {children}
      {error && <p className="mt-1.5 text-sm text-red-600">{error}</p>}
    </div>
  )
}
