import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
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
    <div className="min-h-screen bg-mist-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-3xl border border-emerald-200/70 bg-linear-to-br from-emerald-200/35 to-lime-200/30 p-8 text-white shadow-sm transition-shadow hover:shadow-lg ring-1 ring-emerald-100">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white">Create account</h1>
          <p className="mt-2 text-sm text-white/90">Join LeafBid as a buyer or seller</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-white">Full Name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => handleDisplayNameChange(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              placeholder="First and Last Name"
              required
            />
            {nameError ? <p className="mt-1 text-sm text-red-600">{nameError}</p> : null}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-white">Phone Number</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => handlePhoneChange(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              placeholder="0XXXXXXXXX"
              required
            />
            {phoneError ? <p className="mt-1 text-sm text-red-600">{phoneError}</p> : null}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-white">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => handleEmailChange(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              placeholder="example@email.com"
              required
            />
            {emailError ? <p className="mt-1 text-sm text-red-600">{emailError}</p> : null}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-white">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => handlePasswordChange(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              placeholder="••••••••"
              required
            />
            {passwordError ? <p className="mt-1 text-sm text-red-600">{passwordError}</p> : null}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-white">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            >
              <option value="buyer">Buyer</option>
              <option value="seller">Seller</option>
            </select>
          </div>

          {error ? <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p> : null}

          <button
            type="submit"
            disabled={loading || isFormInvalid}
            className="w-full rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-white/90">
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
