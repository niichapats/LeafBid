import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import PageHeader from '../components/PageHeader.jsx'
import api from '../utils/api.js'
import { saveToken } from '../utils/auth.js'

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const phoneRegex = /^[0-9]{9,10}$/
const nameRegex = /^[a-zA-Z\s]+$/

function RegisterPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [phone, setPhone] = useState('')
  const [role, setRole] = useState('buyer')
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [nameError, setNameError] = useState('')
  const [phoneError, setPhoneError] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const isFormInvalid =
    !!emailError ||
    !!passwordError ||
    !!nameError ||
    !!phoneError ||
    !email ||
    !password ||
    !displayName ||
    !phone ||
    !role

  const handleEmailChange = (value) => {
    setEmail(value)
    if (!value) {
      setEmailError('')
      return
    }
    setEmailError(emailRegex.test(value) ? '' : 'Invalid email format')
  }

  const handlePasswordChange = (value) => {
    setPassword(value)
    if (!value) {
      setPasswordError('')
      return
    }
    const isValid = value.length >= 8 && /[A-Z]/.test(value) && /[0-9]/.test(value) && /[!@#$%^&*]/.test(value)
    setPasswordError(isValid ? '' : 'Min 8 chars, uppercase, number, and special character required')
  }

  const handleDisplayNameChange = (value) => {
    setDisplayName(value)
    if (!value) {
      setNameError('')
      return
    }
    const isValid = value.trim().length >= 2 && nameRegex.test(value.trim())
    setNameError(isValid ? '' : 'Name must be at least 2 characters, letters and spaces only')
  }

  const handlePhoneChange = (value) => {
    setPhone(value)
    if (!value) {
      setPhoneError('')
      return
    }
    setPhoneError(phoneRegex.test(value) ? '' : 'Phone number must be 9-10 digits')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await api.post('/auth/register', { email, password, role, displayName, phone })
      saveToken(response.data.token)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-3xl border border-stone-200 bg-white p-8 text-slate-900 shadow-sm transition-shadow hover:shadow-md">
        <PageHeader
          title="Create account"
          subtitle="Join LeafBid as a buyer or seller"
          containerClassName="mb-8 text-center"
          subtitleClassName="mt-2 text-sm text-slate-600"
        />

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Full Name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => handleDisplayNameChange(e.target.value)}
              className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              placeholder="First and Last Name"
              required
            />
            {nameError ? <p className="mt-1 text-sm text-rose-600">{nameError}</p> : null}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Phone Number</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => handlePhoneChange(e.target.value)}
              className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              placeholder="0XXXXXXXXX"
              required
            />
            {phoneError ? <p className="mt-1 text-sm text-rose-600">{phoneError}</p> : null}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => handleEmailChange(e.target.value)}
              className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              placeholder="example@email.com"
              required
            />
            {emailError ? <p className="mt-1 text-sm text-rose-600">{emailError}</p> : null}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => handlePasswordChange(e.target.value)}
              className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              placeholder="••••••••"
              required
            />
            {passwordError ? <p className="mt-1 text-sm text-rose-600">{passwordError}</p> : null}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            >
              <option value="buyer">Buyer</option>
              <option value="seller">Seller</option>
            </select>
          </div>

          {error ? <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p> : null}

          <button
            type="submit"
            disabled={loading || isFormInvalid}
            className="w-full border border-emerald-100 bg-linear-to-r from-emerald-200 to-lime-200/90 text-emerald-900/90 rounded-full px-3 py-1.5 text-sm font-medium hover:from-green-400 hover:to-emerald-400 disabled:opacity-60"
          >
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-emerald-700 hover:text-emerald-800">
            Login
          </Link>
        </p>
      </div>
    </div>
  )
}

export default RegisterPage
