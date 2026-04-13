import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'
import api from '../utils/api.js'
import { getUser } from '../utils/auth.js'

function AdminPlantsPage() {
  const user = getUser()
  const [plants, setPlants] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  if (!user || user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />
  }

  const loadPendingPlants = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await api.get('/plants/admin/pending')
      setPlants(response.data)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load pending plants')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPendingPlants()
  }, [])

  const handleVerify = async (plantId, status) => {
    try {
      setError('')
      await api.patch(`/plants/admin/${plantId}/verify`, { status })
      await loadPendingPlants()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to verify plant')
    }
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-mist-950 px-4 py-8">
        <div className="mx-auto max-w-5xl">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-emerald-100">Pending Plant Verification</h1>
            <p className="mt-1 text-sm text-gray-300">Review and approve or reject seller plant listings</p>
          </div>

        {error ? <p className="mb-4 bg-red-400/20 text-red-300 border border-red-400/50 rounded-full px-3 py-1 text-sm">{error}</p> : null}

        <div className="space-y-3">
          {loading ? <p className="text-gray-300">Loading pending plants...</p> : null}
          {!loading && plants.length === 0 ? <p className="text-gray-300">No pending plants</p> : null}

          {plants.map((plant) => (
            <div key={plant.id} className="rounded-2xl border border-emerald-200/70 bg-linear-to-br from-emerald-200/35 to-lime-200/30 p-5 text-white shadow-sm transition-shadow hover:shadow-lg ring-1 ring-emerald-100">
              <h2 className="text-xl font-semibold text-white">{plant.title}</h2>
              <div className="mt-2">
                {plant.image_url ? (
                  <img
                    src={`http://localhost:3000${plant.image_url}`}
                    alt={plant.title}
                    className="h-32 w-48 rounded-lg border border-gray-200 object-cover"
                  />
                ) : (
                  <p className="text-sm text-white/80">No image</p>
                )}
              </div>
              <p className="mt-2 text-sm text-white/90">{plant.description || 'No description'}</p>
              <p className="mt-2 text-sm text-white/90">Seller: {plant.seller_email}</p>
              <p className="mt-1 text-xs text-white/80">
                Created: {plant.created_at ? new Date(plant.created_at).toLocaleString() : '-'}
              </p>

              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => handleVerify(plant.id, 'approved')}
                  className="rounded-full border border-green-400 px-4 py-2 text-sm font-medium text-green-300 transition-colors hover:bg-green-400/20"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleVerify(plant.id, 'rejected')}
                  className="rounded-full border border-red-400 px-4 py-2 text-sm font-medium text-red-300 transition-colors hover:bg-red-400/20"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
    </>
  )
}

export default AdminPlantsPage
