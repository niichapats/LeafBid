import { useEffect, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'
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
    <>
      <Navbar />
      <div className="min-h-screen bg-stone-50 px-4 py-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-slate-900">Active Auctions</h1>
            <p className="mt-1 text-sm text-slate-600">Browse live plant auctions and join a bidding room</p>
          </div>

        {error ? <p className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p> : null}

        {loading ? (
          <div className="text-center py-12">
            <p className="text-slate-500">Loading auctions...</p>
          </div>
        ) : null}

        {!loading && auctions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {auctions.map((auction) => (
              <div
                key={auction.id}
                onClick={() => navigate(`/auctions/${auction.id}`)}
                className="overflow-hidden rounded-2xl border border-stone-200 bg-white text-slate-900 shadow-sm transition-shadow hover:shadow-md cursor-pointer"
              >
                {auction.image_url ? (
                  <img
                    src={`http://localhost:3000${auction.image_url}`}
                    alt={auction.plant_title || 'Plant'}
                    className="w-full h-72 object-cover"
                  />
                ) : (
                  <div className="w-full h-72 bg-gray-200 flex items-center justify-center text-gray-400">
                    No image
                  </div>
                )}

                <div className="p-4">
                  <h3 className="text-lg font-semibold text-slate-900 line-clamp-2">{auction.plant_title || 'Untitled Plant'}</h3>

                  <div className="mt-3 space-y-2">
                    <p className="text-xl font-bold text-emerald-700">฿{Number(auction.current_price).toLocaleString()}</p>
                    <p className="text-sm text-slate-600">
                      End time: {auction.end_time ? new Date(auction.end_time).toLocaleString() : '-'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {!loading && auctions.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-500 text-lg">No active auctions</p>
          </div>
        ) : null}
      </div>
    </div>
    </>
  )
}

export default AuctionsPage
