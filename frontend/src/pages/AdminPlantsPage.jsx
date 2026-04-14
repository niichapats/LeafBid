import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'
import PageHeader from '../components/PageHeader.jsx'
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
      <div className="min-h-screen bg-stone-50 px-4 py-8">
        <div className="mx-auto max-w-5xl">
          <PageHeader title="Pending Plant Verification" subtitle="Review and approve or reject seller plant listings" />

        {error ? <p className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p> : null}

        <div className="space-y-3">
          {loading ? <p className="text-slate-500">Loading pending plants...</p> : null}
          {!loading && plants.length === 0 ? <p className="text-slate-500">No pending plants</p> : null}

          {plants.map((plant) => (
            <div key={plant.id} className="rounded-2xl border border-stone-200 bg-white p-5 text-slate-900 shadow-sm transition-shadow hover:shadow-md">
              <h2 className="text-xl font-semibold text-slate-900">{plant.title}</h2>
              <div className="mt-2">
                {plant.image_url ? (
                  <img
                    src={`http://localhost:3000${plant.image_url}`}
                    alt={plant.title}
                    className="h-32 w-48 rounded-lg border border-stone-200 object-cover"
                  />
                ) : (
                  <p className="text-sm text-slate-500">No image</p>
                )}
              </div>
              <p className="mt-2 text-sm text-slate-600">{plant.description || 'No description'}</p>
              <p className="mt-2 text-sm text-slate-600">Seller: {plant.seller_email}</p>
              <p className="mt-1 text-xs text-slate-500">
                Created: {plant.created_at ? new Date(plant.created_at).toLocaleString() : '-'}
              </p>

              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => handleVerify(plant.id, 'approved')}
                  className="rounded-full border border-emerald-200 px-4 py-2 text-sm font-medium text-emerald-700 transition-colors hover:bg-emerald-50"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleVerify(plant.id, 'rejected')}
                  className="rounded-full border border-rose-200 px-4 py-2 text-sm font-medium text-rose-600 transition-colors hover:bg-rose-50"
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
