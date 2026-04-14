import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'
import PageHeader from '../components/PageHeader.jsx'
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
      <div className="min-h-screen bg-stone-50 px-4 py-8">
        <div className="mx-auto max-w-3xl">
          <PageHeader title="My Profile" subtitle="Manage your account information" containerClassName="mb-8" />

        {error ? <p className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p> : null}
        {success ? <p className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</p> : null}

        {/* Profile Section */}
        <div className="mb-6 rounded-2xl border border-stone-200 bg-white p-6 text-slate-900 shadow-sm transition-shadow hover:shadow-md">
          <h2 className="mb-4 text-xl font-semibold text-slate-900">Profile Information</h2>

          {loading ? (
            <p className="text-slate-500">Loading profile...</p>
          ) : profile ? (
            <>
              {!isEditing ? (
                <div>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-slate-500">Email</label>
                      <p className="text-slate-900">{profile.email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-500">Display Name</label>
                      <p className="text-slate-900">{profile.display_name || 'Not set'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-500">Phone</label>
                      <p className="text-slate-900">{profile.phone || 'Not set'}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="mt-4 rounded-full border border-stone-200 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-stone-100"
                  >
                    Edit Profile
                  </button>
                </div>
              ) : (
                <form onSubmit={handleUpdateProfile}>
                  <div className="space-y-4">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
                      <input
                        type="email"
                        value={profile.email}
                        disabled
                        className="w-full rounded-xl border border-stone-200 bg-stone-100 px-4 py-2 text-slate-500"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-700">Display Name</label>
                      <input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="w-full rounded-xl border border-stone-300 bg-white px-4 py-2 text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                        placeholder="First and Last Name"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-700">Phone</label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => {
                          const value = e.target.value
                          setPhone(value)
                          setPhoneError(validatePhone(value))
                        }}
                        className="w-full rounded-xl border border-stone-300 bg-white px-4 py-2 text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                        placeholder="08XXXXXXXX or 02XXXXXXX"
                      />
                      {phoneError ? <p className="mt-1 text-sm text-rose-600">{phoneError}</p> : null}
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <button
                      type="submit"
                      disabled={submitting || !!phoneError}
                      className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700 disabled:opacity-60"
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
                      className="rounded-full border border-stone-200 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-stone-100"
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
          <div className="rounded-2xl border border-stone-200 bg-white p-6 text-slate-900 shadow-sm transition-shadow hover:shadow-md">
            <h2 className="mb-4 text-xl font-semibold text-slate-900">Won Auctions</h2>

            {wonAuctions.length === 0 ? (
              <p className="text-slate-500">No won auctions yet.</p>
            ) : (
              <div className="space-y-3">
                {wonAuctions.map((auction) => (
                  <Link
                    key={auction.id}
                    to={`/auctions/${auction.id}`}
                    className="flex items-center justify-between rounded-2xl border border-stone-200 bg-stone-50 p-4 text-slate-900 shadow-sm transition-shadow hover:shadow-md"
                  >
                    <div>
                      <p className="font-semibold text-slate-900">{auction.plant_title || `Plant #${auction.plant_id}`}</p>
                      <p className="text-sm text-slate-600">Final price: ฿{auction.current_price}</p>
                      <p className="text-xs text-slate-500">
                        Ended: {auction.end_time ? new Date(auction.end_time).toLocaleString() : '-'}
                      </p>
                    </div>
                    <button className="rounded-full border border-emerald-200 px-4 py-2 text-sm font-medium text-emerald-700 transition-colors hover:bg-emerald-50">
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
