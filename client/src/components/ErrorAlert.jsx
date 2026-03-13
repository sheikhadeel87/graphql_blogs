export default function ErrorAlert({ message }) {
  if (!message) return null
  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
      <p className="font-medium">Something went wrong</p>
      <p className="mt-1 text-sm opacity-90">{message}</p>
    </div>
  )
}
