import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useMutation } from '@apollo/client'
import { REGISTER } from '../graphql/mutations'
import { useAuth } from '../context/AuthContext'
import FormField from '../components/FormField'

export default function Register() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [doRegister, { loading }] = useMutation(REGISTER)

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const { data } = await doRegister({ variables: form })
      if (data?.register) {
        login(data.register.token, data.register.user)
        navigate('/')
      }
    } catch (err) {
      setError(err.message || 'Registration failed')
    }
  }

  return (
    <div className="mx-auto max-w-md animate-fade-in">
      <div className="card p-8 sm:p-10">
        <h1 className="heading-display text-2xl text-surface-900 sm:text-3xl">Create account</h1>
        <p className="mt-2 text-surface-500">Join to start writing and commenting.</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
          <FormField label="Name">
            <input type="text" value={form.name} onChange={set('name')} required className="input-field" placeholder="Your name" />
          </FormField>
          <FormField label="Email">
            <input type="email" value={form.email} onChange={set('email')} required className="input-field" placeholder="you@example.com" />
          </FormField>
          <FormField label="Password">
            <input type="password" value={form.password} onChange={set('password')} required className="input-field" placeholder="••••••••" />
          </FormField>
          <button type="submit" disabled={loading} className="btn-primary w-full py-3">
            {loading ? 'Creating account...' : 'Sign up'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-surface-500">
          Already have an account? <Link to="/login" className="font-semibold text-accent-500 hover:text-accent-600">Log in</Link>
        </p>
      </div>
    </div>
  )
}
