import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useMutation } from '@apollo/client'
import { LOGIN } from '../graphql/mutations'
import { useAuth } from '../context/AuthContext'
import FormField from '../components/FormField'

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [doLogin, { loading }] = useMutation(LOGIN)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const { data } = await doLogin({ variables: { email, password } })
      if (data?.login) {
        login(data.login.token, data.login.user)
        navigate('/')
      }
    } catch (err) {
      setError(err.message || 'Login failed')
    }
  }

  return (
    <div className="mx-auto max-w-md animate-fade-in">
      <div className="card p-8 sm:p-10">
        <h1 className="heading-display text-2xl text-surface-900 sm:text-3xl">Log in</h1>
        <p className="mt-2 text-surface-500">Welcome back. Sign in to continue.</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
          <FormField label="Email">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="input-field"
              placeholder="you@example.com"
            />
          </FormField>
          <FormField label="Password">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="input-field"
              placeholder="••••••••"
            />
          </FormField>
          <button type="submit" disabled={loading} className="btn-primary w-full py-3">
            {loading ? 'Logging in...' : 'Log in'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-surface-500">
          Don't have an account? <Link to="/register" className="font-semibold text-accent-500 hover:text-accent-600">Sign up</Link>
        </p>
      </div>
    </div>
  )
}
