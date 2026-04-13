import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import api from '../utils/api.js'
import { isLoggedIn } from '../utils/auth.js'

function AuctionsPage() {
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
            <div key={auction.id} className="rounded-2xl bg-white p-5 shadow ring-1 ring-emerald-100">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold text-emerald-900">{auction.plant_title}</h2>
                  <p className="mt-2 text-sm text-gray-600">Current price: {auction.current_price}</p>
                  <p className="mt-1 text-sm text-gray-600">
                    End time: {auction.end_time ? new Date(auction.end_time).toLocaleString() : '-'}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">Status: {auction.status}</p>
                </div>

                <Link
                  to={`/auctions/${auction.id}`}
                  className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                >
                  Join Auction
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default AuctionsPage
