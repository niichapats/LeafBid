import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
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
    <div className="min-h-screen bg-linear-to-br from-emerald-50 via-white to-lime-50 px-4 py-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-emerald-900">Pending Plant Verification</h1>
            <p className="mt-1 text-sm text-gray-600">Review and approve or reject seller plant listings</p>
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
          {loading ? <p className="text-gray-600">Loading pending plants...</p> : null}
          {!loading && plants.length === 0 ? <p className="text-gray-600">No pending plants</p> : null}

          {plants.map((plant) => (
            <div key={plant.id} className="rounded-2xl bg-white p-5 shadow ring-1 ring-emerald-100">
              <h2 className="text-xl font-semibold text-emerald-900">{plant.title}</h2>
              <p className="mt-2 text-sm text-gray-600">{plant.description || 'No description'}</p>
              <p className="mt-2 text-sm text-gray-700">Seller: {plant.seller_email}</p>
              <p className="mt-1 text-xs text-gray-500">
                Created: {plant.created_at ? new Date(plant.created_at).toLocaleString() : '-'}
              </p>

              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => handleVerify(plant.id, 'approved')}
                  className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleVerify(plant.id, 'rejected')}
                  className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default AdminPlantsPage
