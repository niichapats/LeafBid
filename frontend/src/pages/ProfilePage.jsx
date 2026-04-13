import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'
import api from '../utils/api.js'
import { getUser } from '../utils/auth.js'

const phoneRegex = /^0[0-9]{8,9}$/

function ProfilePage() {
  const user = getUser()
  const [profile, setProfile] = useState(null)
  const [wonAuctions, setWonAuctions] = useState([])
  const [isEditing, setIsEditing] = useState(false)
  const [displayName, setDisplayName] = useState('')
  const [phone, setPhone] = useState('')
  const [phoneError, setPhoneError] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const validatePhone = (value) => {
    if (!value) {
      return 'Use format 08XXXXXXXX or 02XXXXXXX'
    }
    return phoneRegex.test(value) ? '' : 'Use format 08XXXXXXXX or 02XXXXXXX'
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true)
        setError('')
        const response = await api.get('/profile')
        setProfile(response.data)
        setDisplayName(response.data.display_name || '')
        setPhone(response.data.phone || '')
        setPhoneError(validatePhone(response.data.phone || ''))
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load profile')
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [])

  useEffect(() => {
    const loadWonAuctions = async () => {
      if (user.role !== 'buyer') {
        return
      }

      try {
        const response = await api.get('/auctions/won')
        setWonAuctions(response.data || [])
      } catch (err) {
        console.error('Failed to load won auctions:', err)
      }
    }

    loadWonAuctions()
  }, [user.role])

  const handleUpdateProfile = async (event) => {
    event.preventDefault()

    const currentPhoneError = validatePhone(phone)
    setPhoneError(currentPhoneError)
    if (currentPhoneError) {
      return
    }

    try {
      setSubmitting(true)
      setError('')
      setSuccess('')
      await api.put('/profile', {
        displayName,
        phone,
      })
      setSuccess('Profile updated!')
      setIsEditing(false)
      const response = await api.get('/profile')
      setProfile(response.data)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-mist-950 px-4 py-8">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-emerald-100">My Profile</h1>
            <p className="mt-1 text-sm text-gray-300">Manage your account information</p>
          </div>

        {error ? <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p> : null}
        {success ? <p className="mb-4 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-600">{success}</p> : null}

        {/* Profile Section */}
        <div className="mb-6 rounded-2xl border border-emerald-200/70 bg-linear-to-br from-emerald-200/35 to-lime-200/30 p-6 text-white shadow-sm transition-shadow hover:shadow-lg ring-1 ring-emerald-100">
          <h2 className="mb-4 text-xl font-semibold text-white">Profile Information</h2>

          {loading ? (
            <p className="text-white/90">Loading profile...</p>
          ) : profile ? (
            <>
              {!isEditing ? (
                <div>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-white/80">Email</label>
                      <p className="text-white">{profile.email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-white/80">Display Name</label>
                      <p className="text-white">{profile.display_name || 'Not set'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-white/80">Phone</label>
                      <p className="text-white">{profile.phone || 'Not set'}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="mt-4 rounded-full border border-gray-400 px-4 py-2 text-sm font-medium text-gray-300 transition-colors hover:bg-gray-400/20"
                  >
                    Edit Profile
                  </button>
                </div>
              ) : (
                <form onSubmit={handleUpdateProfile}>
                  <div className="space-y-4">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-white">Email</label>
                      <input
                        type="email"
                        value={profile.email}
                        disabled
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2 text-gray-600"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-white">Display Name</label>
                      <input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="w-full rounded-xl border border-gray-200 px-4 py-2 outline-none focus:border-emerald-500"
                        placeholder="First and Last Name"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-white">Phone</label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => {
                          const value = e.target.value
                          setPhone(value)
                          setPhoneError(validatePhone(value))
                        }}
                        className="w-full rounded-xl border border-gray-200 px-4 py-2 outline-none focus:border-emerald-500"
                        placeholder="08XXXXXXXX or 02XXXXXXX"
                      />
                      {phoneError ? <p className="mt-1 text-sm text-red-600">{phoneError}</p> : null}
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <button
                      type="submit"
                      disabled={submitting || !!phoneError}
                      className="border border-green-400 text-green-300 hover:bg-green-400/20 px-3 py-1.5 text-sm rounded-full font-medium transition-colors"
                    >
                      {submitting ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditing(false)
                        setDisplayName(profile.display_name || '')
                        setPhone(profile.phone || '')
                        setPhoneError(validatePhone(profile.phone || ''))
                      }}
                      className="rounded-full border border-gray-400 px-4 py-2 text-sm font-medium text-gray-300 transition-colors hover:bg-gray-400/20"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </>
          ) : null}
        </div>

        {/* Won Auctions Section (Buyer Only) */}
        {user.role === 'buyer' ? (
          <div className="rounded-2xl border border-emerald-200/70 bg-linear-to-br from-emerald-200/35 to-lime-200/30 p-6 text-white shadow-sm transition-shadow hover:shadow-lg ring-1 ring-emerald-100">
            <h2 className="mb-4 text-xl font-semibold text-white">Won Auctions</h2>

            {wonAuctions.length === 0 ? (
              <p className="text-white/90">No won auctions yet.</p>
            ) : (
              <div className="space-y-3">
                {wonAuctions.map((auction) => (
                  <Link
                    key={auction.id}
                    to={`/auctions/${auction.id}`}
                    className="flex items-center justify-between rounded-xl border border-emerald-200/70 bg-linear-to-br from-emerald-200/35 to-lime-200/30 p-4 text-white shadow-sm transition-shadow hover:shadow-lg"
                  >
                    <div>
                      <p className="font-semibold text-white">{auction.plant_title || `Plant #${auction.plant_id}`}</p>
                      <p className="text-sm text-white/90">Final price: ฿{auction.current_price}</p>
                      <p className="text-xs text-white/80">
                        Ended: {auction.end_time ? new Date(auction.end_time).toLocaleString() : '-'}
                      </p>
                    </div>
                    <button className="rounded-full border border-green-400 px-4 py-2 text-sm font-medium text-green-300 transition-colors hover:bg-green-400/20">
                      View Room
                    </button>
                  </Link>
                ))}
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
    </>
  )
}

export default ProfilePage
