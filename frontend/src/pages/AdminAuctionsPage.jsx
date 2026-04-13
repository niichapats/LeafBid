import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
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
    <div className="min-h-screen bg-linear-to-br from-emerald-50 via-white to-lime-50 px-4 py-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-emerald-900">Manage Auctions</h1>
            <p className="mt-1 text-sm text-gray-600">Admin tools for ending and deleting auctions</p>
          </div>
          <Link
            to="/dashboard"
            className="rounded border border-gray-300 bg-white px-4 py-2 font-medium text-gray-700 hover:bg-gray-50"
          >
            Back
          </Link>
        </div>

        {error ? <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p> : null}
        {success ? <p className="mb-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</p> : null}

        <div className="rounded-2xl bg-white p-6 shadow ring-1 ring-emerald-100">
          {loading ? <p className="text-gray-600">Loading auctions...</p> : null}
          {!loading && auctions.length === 0 ? <p className="text-gray-600">No auctions found</p> : null}

          <div className="space-y-3">
            {auctions.map((auction) => (
              <div key={auction.id} className="rounded-xl border border-emerald-100 p-4">
                <p className="font-semibold text-emerald-900">{auction.plant_title || `Plant #${auction.plant_id}`}</p>
                <p className="text-sm text-gray-600">Current price: {auction.current_price}</p>
                <p className="text-sm text-gray-600">Status: {auction.status}</p>
                <p className="text-sm text-gray-600">
                  Start time: {auction.start_time ? new Date(auction.start_time).toLocaleString() : '-'}
                </p>
                <p className="text-sm text-gray-600">
                  End time: {auction.end_time ? new Date(auction.end_time).toLocaleString() : '-'}
                </p>

                <div className="mt-3 flex gap-2">
                  {auction.status === 'active' ? (
                    <button
                      onClick={() => handleEndAuction(auction.id)}
                      className="rounded bg-yellow-700 px-4 py-2 font-medium text-white hover:bg-yellow-800"
                    >
                      End Auction
                    </button>
                  ) : null}
                  <button
                    onClick={() => handleDeleteAuction(auction.id)}
                    className="rounded bg-red-600 px-4 py-2 font-medium text-white hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminAuctionsPage
