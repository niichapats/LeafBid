import { useEffect, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import api from '../utils/api.js'
import { isLoggedIn } from '../utils/auth.js'

function AuctionsPage() {
  const navigate = useNavigate()
  const [auctions, setAuctions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  if (!isLoggedIn()) {
    return <Navigate to="/login" replace />
  }

  useEffect(() => {
    const loadAuctions = async () => {
      try {
        setLoading(true)
        setError('')
        const response = await api.get('/auctions')
        setAuctions(response.data)
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load auctions')
      } finally {
        setLoading(false)
      }
    }

    loadAuctions()
  }, [])

  return (
    <div className="min-h-screen bg-linear-to-br from-emerald-50 via-white to-lime-50 px-4 py-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-emerald-900">Active Auctions</h1>
            <p className="mt-1 text-sm text-gray-600">Browse live plant auctions and join a bidding room</p>
          </div>
          <Link
            to="/dashboard"
            className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Back
          </Link>
        </div>

        {error ? <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p> : null}

        <div className="space-y-3">
          {loading ? <p className="text-gray-600">Loading auctions...</p> : null}
          {!loading && auctions.length === 0 ? <p className="text-gray-600">No active auctions</p> : null}

          {auctions.map((auction) => (
            <div
              key={auction.id}
              onClick={() => navigate(`/auctions/${auction.id}`)}
              className="rounded-2xl bg-white p-5 shadow ring-1 ring-emerald-100 cursor-pointer hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-4">
                {auction.image_url ? (
                  <img
                    src={`http://localhost:3000${auction.image_url}`}
                    alt={auction.plant_title}
                    className="w-40 h-40 object-cover rounded-lg shrink-0"
                  />
                ) : (
                  <div className="w-40 h-40 bg-gray-100 rounded-lg shrink-0 flex items-center justify-center text-gray-400">
                    No image
                  </div>
                )}

                <div className="flex-1">
                  <div>
                    <h2 className="text-xl font-semibold text-emerald-900">{auction.plant_title}</h2>
                    <p className="mt-2 text-sm text-gray-600">Current price: {auction.current_price}</p>
                    <p className="mt-1 text-sm text-gray-600">
                      End time: {auction.end_time ? new Date(auction.end_time).toLocaleString() : '-'}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">Status: {auction.status}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default AuctionsPage
