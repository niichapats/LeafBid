import { useEffect, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'
import AuctionCard from '../components/AuctionCard.jsx'
import PageHeader from '../components/PageHeader.jsx'
import api from '../utils/api.js'
import { getUser } from '../utils/auth.js'

function DashboardPage() {
  const navigate = useNavigate()
  const user = getUser()
  const [auctions, setAuctions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  if (!user) {
    return <Navigate to="/login" replace />
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError('')
        const auctionsRes = await api.get('/auctions')
        const activeAuctions = (auctionsRes.data || []).filter((auction) => auction.status === 'active')
        setAuctions(activeAuctions)
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load data')
        console.error('Error fetching data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleCardClick = (auctionId) => {
    navigate(`/auctions/${auctionId}`)
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />
      
      <div className="px-4 py-8">
        <div className="mx-auto max-w-6xl">
          <PageHeader title="Active Auctions" containerClassName="mb-8" />

          {error ? (
            <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          ) : null}

          {loading ? (
            <div className="text-center py-12">
              <p className="text-slate-500">Loading auctions...</p>
            </div>
          ) : null}

          {!loading && auctions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {auctions.map((auction) => (
                <AuctionCard key={auction.id} auction={auction} onClick={handleCardClick} />
              ))}
            </div>
          ) : null}

          {!loading && auctions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-500 text-lg">No active auctions at the moment</p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}

export default DashboardPage