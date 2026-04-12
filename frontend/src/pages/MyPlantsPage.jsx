import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import api from '../utils/api.js'
import { getUser } from '../utils/auth.js'

function MyPlantsPage() {
  const user = getUser()
  const [plants, setPlants] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (!user || user.role !== 'seller') {
    return <Navigate to="/dashboard" replace />
  }

  const loadPlants = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await api.get('/plants/my')
      setPlants(response.data)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load plants')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPlants()
  }, [])

  const handleCreatePlant = async (event) => {
    event.preventDefault()
    if (!title.trim()) {
      setError('Title is required')
      return
    }

    try {
      setSubmitting(true)
      setError('')
      await api.post('/plants', {
        title,
        description,
        imageUrl,
      })
      setTitle('')
      setDescription('')
      setImageUrl('')
      setShowForm(false)
      await loadPlants()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create plant')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (plantId) => {
    try {
      setError('')
      await api.delete(`/plants/${plantId}`)
      await loadPlants()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete plant')
    }
  }

  const getStatusClass = (status) => {
    if (status === 'approved') {
      return 'bg-emerald-50 text-emerald-700'
    }

    if (status === 'pending') {
      return 'bg-amber-50 text-amber-700'
    }

    return 'bg-red-50 text-red-700'
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-emerald-50 via-white to-lime-50 px-4 py-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-emerald-900">My Plants</h1>
            <p className="mt-1 text-sm text-gray-600">Manage your plant listings for LeafBid</p>
          </div>
          <div className="flex gap-2">
            <Link to="/dashboard" className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
              Back
            </Link>
            <button
              onClick={() => setShowForm((value) => !value)}
              className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
            >
              Create New Plant
            </button>
          </div>
        </div>

        {error ? <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p> : null}

        {showForm ? (
          <form onSubmit={handleCreatePlant} className="mb-6 rounded-2xl bg-white p-6 shadow ring-1 ring-emerald-100">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-gray-700">Title *</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-2 outline-none focus:border-emerald-500"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-2 outline-none focus:border-emerald-500"
                  rows={3}
                />
              </div>
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-gray-700">Image URL</label>
                <input
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-2 outline-none focus:border-emerald-500"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="mt-4 rounded-xl bg-emerald-600 px-4 py-2 font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
            >
              {submitting ? 'Saving...' : 'Save Plant'}
            </button>
          </form>
        ) : null}

        <div className="space-y-3">
          {loading ? <p className="text-gray-600">Loading plants...</p> : null}
          {!loading && plants.length === 0 ? <p className="text-gray-600">No plants found.</p> : null}

          {plants.map((plant) => (
            <div key={plant.id} className="rounded-2xl bg-white p-5 shadow ring-1 ring-emerald-100">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-emerald-900">{plant.title}</h2>
                  <p className="mt-2 text-sm text-gray-600">{plant.description || 'No description'}</p>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs">
                    <span className={`rounded-full px-3 py-1 ${getStatusClass(plant.status)}`}>Status: {plant.status}</span>
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-gray-700">
                      Created: {plant.created_at ? new Date(plant.created_at).toLocaleString() : '-'}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleDelete(plant.id)}
                  className="rounded-xl bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default MyPlantsPage
