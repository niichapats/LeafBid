import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../utils/api.js'
import { saveToken } from '../utils/auth.js'

function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await api.post('/auth/login', { email, password })
      saveToken(response.data.token)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-mist-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-3xl border border-emerald-200/70 bg-linear-to-br from-emerald-200/35 to-lime-200/30 p-8 text-white shadow-sm transition-shadow hover:shadow-lg ring-1 ring-emerald-100">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white">LeafBid</h1>
          <p className="mt-2 text-sm text-white/90">Sign in to continue bidding on rare plants</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-white">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-white">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              placeholder="••••••••"
              required
            />
          </div>

          {error ? <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p> : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? 'Signing in...' : 'Login'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-white/90">
          Don’t have an account?{' '}
          <Link to="/register" className="font-medium text-emerald-700 hover:text-emerald-800">
            Register
          </Link>
        </p>
      </div>
    </div>
  )
}

export default LoginPage
