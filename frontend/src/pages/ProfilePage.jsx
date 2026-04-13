import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
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
    <div className="min-h-screen bg-linear-to-br from-emerald-50 via-white to-lime-50 px-4 py-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-emerald-900">My Profile</h1>
            <p className="mt-1 text-sm text-gray-600">Manage your account information</p>
          </div>
          <Link
            to="/dashboard"
            className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Back to Dashboard
          </Link>
        </div>

        {error ? <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p> : null}
        {success ? <p className="mb-4 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-600">{success}</p> : null}

        {/* Profile Section */}
        <div className="mb-6 rounded-2xl bg-white p-6 shadow ring-1 ring-emerald-100">
          <h2 className="mb-4 text-xl font-semibold text-emerald-900">Profile Information</h2>

          {loading ? (
            <p className="text-gray-600">Loading profile...</p>
          ) : profile ? (
            <>
              {!isEditing ? (
                <div>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Email</label>
                      <p className="text-gray-900">{profile.email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Display Name</label>
                      <p className="text-gray-900">{profile.display_name || 'Not set'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Phone</label>
                      <p className="text-gray-900">{profile.phone || 'Not set'}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="mt-4 rounded-xl bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-800"
                  >
                    Edit Profile
                  </button>
                </div>
              ) : (
                <form onSubmit={handleUpdateProfile}>
                  <div className="space-y-4">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
                      <input
                        type="email"
                        value={profile.email}
                        disabled
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2 text-gray-600"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">Display Name</label>
                      <input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="w-full rounded-xl border border-gray-200 px-4 py-2 outline-none focus:border-emerald-500"
                        placeholder="First and Last Name"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">Phone</label>
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
                      className="rounded-xl bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-800 disabled:bg-gray-400"
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
                      className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
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
          <div className="rounded-2xl bg-white p-6 shadow ring-1 ring-emerald-100">
            <h2 className="mb-4 text-xl font-semibold text-emerald-900">Won Auctions</h2>

            {wonAuctions.length === 0 ? (
              <p className="text-gray-600">No won auctions yet.</p>
            ) : (
              <div className="space-y-3">
                {wonAuctions.map((auction) => (
                  <Link
                    key={auction.id}
                    to={`/auctions/${auction.id}`}
                    className="flex items-center justify-between rounded-xl border border-emerald-100 p-4 hover:bg-emerald-50"
                  >
                    <div>
                      <p className="font-semibold text-emerald-900">{auction.plant_title || `Plant #${auction.plant_id}`}</p>
                      <p className="text-sm text-gray-600">Final price: {auction.current_price}</p>
                      <p className="text-xs text-gray-500">
                        Ended: {auction.end_time ? new Date(auction.end_time).toLocaleString() : '-'}
                      </p>
                    </div>
                    <button className="rounded-xl bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-800">
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
  )
}

export default ProfilePage
