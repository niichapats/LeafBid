import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'
import api from '../utils/api.js'
import { getUser } from '../utils/auth.js'

function AdminAuctionsPage() {
  const user = getUser()
  const [auctions, setAuctions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  if (!user || user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />
  }

  const loadAuctions = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await api.get('/auctions')
      setAuctions(response.data || [])
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load auctions')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAuctions()
  }, [])

  const handleEndAuction = async (auctionId) => {
    try {
      setError('')
      setSuccess('')
      await api.patch(`/auctions/${auctionId}/end`)
      setSuccess(`Auction ${auctionId} ended`)
      await loadAuctions()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to end auction')
    }
  }

  const handleDeleteAuction = async (auctionId) => {
    const confirmed = window.confirm('Are you sure?')
    if (!confirmed) {
      return
    }

    try {
      setError('')
      setSuccess('')
      await api.delete(`/auctions/${auctionId}`)
      setSuccess(`Auction ${auctionId} deleted`)
      await loadAuctions()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete auction')
    }
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-stone-50 px-4 py-8">
        <div className="mx-auto max-w-5xl">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-slate-900">Manage Auctions</h1>
            <p className="mt-1 text-sm text-slate-600">Admin tools for ending and deleting auctions</p>
          </div>

        {error ? <p className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p> : null}
        {success ? <p className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</p> : null}

        <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
          {loading ? <p className="text-slate-500">Loading auctions...</p> : null}
          {!loading && auctions.length === 0 ? <p className="text-slate-500">No auctions found</p> : null}

          <div className="space-y-3">
            {auctions.map((auction) => (
              <div key={auction.id} className="rounded-2xl border border-stone-200 bg-white p-4 text-slate-900 shadow-sm transition-shadow hover:shadow-md">
                <div className="flex items-start gap-4">
                  {auction.image_url ? (
                    <img
                      src={`http://localhost:3000${auction.image_url}`}
                      alt={auction.plant_title}
                      className="w-32 h-32 object-cover rounded-lg shrink-0"
                    />
                  ) : (
                    <div className="w-32 h-32 bg-gray-100 rounded-lg shrink-0 flex items-center justify-center text-gray-400 text-sm">
                      No image
                    </div>
                  )}

                  <div className="flex-1 flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-900">{auction.plant_title || `Plant #${auction.plant_id}`}</p>

                      <div className="mt-2">
                        {auction.status === 'scheduled' ? (
                          <span className="bg-amber-50 text-amber-700 border border-amber-200 rounded-full px-3 py-1 text-sm">Scheduled</span>
                        ) : null}
                        {auction.status === 'active' ? (
                          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full px-3 py-1 text-sm">Active</span>
                        ) : null}
                        {auction.status === 'ended' ? (
                          <span className="bg-slate-50 text-slate-600 border border-slate-200 rounded-full px-3 py-1 text-sm">Ended</span>
                        ) : null}
                      </div>

                      <p className="mt-2 text-sm text-slate-600">Start price: ฿{auction.start_price}</p>
                      <p className="text-sm text-slate-600">Current price: ฿{auction.current_price}</p>
                      <p className="text-sm text-slate-600">
                        Start time: {auction.start_time ? new Date(auction.start_time).toLocaleString() : '-'}
                      </p>
                      <p className="text-sm text-slate-600">
                        End time: {auction.end_time ? new Date(auction.end_time).toLocaleString() : '-'}
                      </p>
                    </div>

                    <div className="flex gap-2">
                    {auction.status === 'active' ? (
                      <button
                        onClick={() => handleEndAuction(auction.id)}
                        className="rounded-full border border-amber-200 px-3 py-1.5 text-sm font-medium text-amber-700 transition-colors hover:bg-amber-50"
                      >
                        End Auction
                      </button>
                    ) : null}
                    <button
                      onClick={() => handleDeleteAuction(auction.id)}
                      className="rounded-full border border-rose-200 px-3 py-1.5 text-sm font-medium text-rose-600 transition-colors hover:bg-rose-50"
                    >
                      Delete
                    </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
    </>
  )
}

export default AdminAuctionsPage
