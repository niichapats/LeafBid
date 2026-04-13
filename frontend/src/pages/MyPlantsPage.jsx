import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'
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
  const [imageFile, setImageFile] = useState(null)
  const [editingPlantId, setEditingPlantId] = useState(null)
  const [editTitle, setEditTitle] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editImageFile, setEditImageFile] = useState(null)
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

      const formData = new FormData()
      formData.append('title', title)
      formData.append('description', description)
      if (imageFile) {
        formData.append('image', imageFile)
      }

      await api.post('/plants', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      setTitle('')
      setDescription('')
      setImageFile(null)
      setShowForm(false)
      await loadPlants()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create plant')
    } finally {
      setSubmitting(false)
    }
  }

  const openEditForm = (plant) => {
    setEditingPlantId(plant.id)
    setEditTitle(plant.title || '')
    setEditDescription(plant.description || '')
    setEditImageFile(null)
  }

  const handleCancelEdit = () => {
    setEditingPlantId(null)
    setEditTitle('')
    setEditDescription('')
    setEditImageFile(null)
  }

  const handleUpdatePlant = async (event, plant) => {
    event.preventDefault()
    if (!editTitle.trim()) {
      setError('Title is required')
      return
    }

    try {
      setSubmitting(true)
      setError('')

      const formData = new FormData()
      formData.append('title', editTitle)
      formData.append('description', editDescription)
      formData.append('imageUrl', plant.image_url || '')
      if (editImageFile) {
        formData.append('image', editImageFile)
      }

      await api.put(`/plants/${plant.id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      handleCancelEdit()
      await loadPlants()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update plant')
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
      return 'bg-green-400/20 text-green-300 border border-green-400/50 rounded-full px-3 py-1 text-sm'
    }

    if (status === 'pending') {
      return 'bg-yellow-400/20 text-yellow-300 border border-yellow-400/50 rounded-full px-3 py-1 text-sm'
    }

    return 'bg-red-400/20 text-red-300 border border-red-400/50 rounded-full px-3 py-1 text-sm'
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-mist-950 px-4 py-8">
        <div className="mx-auto max-w-5xl">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-emerald-100">Plants Management</h1>
              <p className="mt-1 text-sm text-gray-300">Create and manage your plant listings for LeafBid</p>
            </div>
            <button
              onClick={() => setShowForm((value) => !value)}
              className="rounded-full border border-green-400 px-3 py-1.5 text-sm font-medium text-green-300 transition-colors hover:bg-green-400/20"
            >
              Create New Plant
            </button>
          </div>

        {error ? <p className="mb-4 bg-red-400/20 text-red-300 border border-red-400/50 rounded-full px-3 py-1 text-sm">{error}</p> : null}

        {showForm ? (
          <form onSubmit={handleCreatePlant} className="mb-6 rounded-2xl border border-emerald-200/70 bg-linear-to-br from-emerald-200/35 to-lime-200/30 p-6 text-white shadow-sm transition-shadow hover:shadow-lg ring-1 ring-emerald-100">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-white">Title *</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-2 outline-none focus:border-emerald-500"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-white">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-2 outline-none focus:border-emerald-500"
                  rows={3}
                />
              </div>
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-white">Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-2 outline-none focus:border-emerald-500"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="mt-4 border border-green-400 text-green-300 hover:bg-green-400/20 px-3 py-1.5 text-sm rounded-full font-medium transition-colors"
            >
              {submitting ? 'Saving...' : 'Save Plant'}
            </button>
          </form>
        ) : null}

        <div className="rounded-2xl p-6 shadow ring-1 ring-emerald-100">
          <h2 className="mb-4 text-xl font-semibold text-emerald-200">My Plants</h2>

          <div className="space-y-3">
            {loading ? <p className="text-gray-600">Loading plants...</p> : null}
            {!loading && plants.length === 0 ? <p className="text-gray-600">No plants found.</p> : null}

            {plants.map((plant) => (
              <div key={plant.id} className="rounded-xl border border-emerald-200/70 bg-linear-to-br from-emerald-200/35 to-lime-200/30 p-4 text-white shadow-sm transition-shadow hover:shadow-lg">
                <div className="flex items-start justify-between gap-4">
                  <div>
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
                    <div className="mt-3 flex flex-wrap gap-2 text-xs">
                      <span className={getStatusClass(plant.status)}>Status: {plant.status}</span>
                      <span className="bg-gray-400/20 text-gray-300 border border-gray-400/50 rounded-full px-3 py-1 text-sm">
                        Created: {plant.created_at ? new Date(plant.created_at).toLocaleString() : '-'}
                      </span>
                    </div>

                    {editingPlantId === plant.id ? (
                      <form onSubmit={(event) => handleUpdatePlant(event, plant)} className="mt-4 space-y-3 rounded-xl border border-emerald-200/70 bg-linear-to-br from-emerald-200/35 to-lime-200/30 p-4 text-white shadow-sm transition-shadow hover:shadow-lg">
                        <input
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="w-full rounded-xl border border-gray-200 px-4 py-2 outline-none focus:border-emerald-500"
                          placeholder="Title"
                          required
                        />
                        <textarea
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                          className="w-full rounded-xl border border-gray-200 px-4 py-2 outline-none focus:border-emerald-500"
                          rows={3}
                          placeholder="Description"
                        />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => setEditImageFile(e.target.files?.[0] || null)}
                          className="w-full rounded-xl border border-gray-200 px-4 py-2 outline-none focus:border-emerald-500"
                        />
                        <div className="flex gap-2">
                          <button
                            type="submit"
                            disabled={submitting}
                            className="border border-green-400 text-green-300 hover:bg-green-400/20 px-3 py-1.5 text-sm rounded-full font-medium transition-colors"
                          >
                            {submitting ? 'Saving...' : 'Save'}
                          </button>
                          <button
                            type="button"
                            onClick={handleCancelEdit}
                            className="rounded-full border border-gray-400 px-4 py-2 text-sm font-medium text-gray-300 transition-colors hover:bg-gray-400/20"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    ) : null}
                  </div>

                  <div className="flex gap-2">
                    {plant.status === 'pending' ? (
                      <button
                        onClick={() => openEditForm(plant)}
                        className="rounded-full border border-gray-400 px-4 py-2 text-sm font-medium text-gray-300 transition-colors hover:bg-gray-400/20"
                      >
                        Edit
                      </button>
                    ) : null}
                    <button
                      onClick={() => handleDelete(plant.id)}
                      className="rounded-full border border-red-400 px-4 py-2 text-sm font-medium text-red-300 transition-colors hover:bg-red-400/20"
                    >
                      Delete
                    </button>
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

export default MyPlantsPage
