import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'
import PlantCard from '../components/PlantCard.jsx'
import StatusBadge from '../components/StatusBadge.jsx'
import PageHeader from '../components/PageHeader.jsx'
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

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-stone-50 px-4 py-8">
        <div className="mx-auto max-w-5xl">
          <div className="mb-6 flex items-center justify-between">
            <PageHeader
              title="Plants Management"
              subtitle="Create and manage your plant listings for LeafBid"
              containerClassName=""
            />
            <button
              onClick={() => setShowForm((value) => !value)}
              className="rounded-full border border-green-400 px-3 py-1.5 text-sm font-medium text-green-300 transition-colors hover:bg-green-400/20"
            >
              Create New Plant
            </button>
          </div>

        {error ? <p className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p> : null}

        {showForm ? (
          <form onSubmit={handleCreatePlant} className="mb-6 rounded-2xl border border-stone-200 bg-white p-6 text-slate-900 shadow-sm transition-shadow hover:shadow-md">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-slate-700">Title *</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-xl border border-stone-300 bg-white px-4 py-2 text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-slate-700">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-xl border border-stone-300 bg-white px-4 py-2 text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  rows={3}
                />
              </div>
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-slate-700">Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                  className="w-full rounded-xl border border-stone-300 bg-white px-4 py-2 text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="mt-4 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-700 transition-colors hover:bg-emerald-100"
            >
              {submitting ? 'Saving...' : 'Save Plant'}
            </button>
          </form>
        ) : null}

        <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-slate-900">My Plants</h2>

          <div className="space-y-3">
            {loading ? <p className="text-slate-500">Loading plants...</p> : null}
            {!loading && plants.length === 0 ? <p className="text-slate-500">No plants found.</p> : null}

            {plants.map((plant) => (
              <PlantCard
                key={plant.id}
                plant={plant}
                onDelete={handleDelete}
                onEdit={openEditForm}
                showEditButton={plant.status === 'pending'}
                statusBadge={<StatusBadge status={plant.status}>Status: {plant.status}</StatusBadge>}
                createdLabel={`Created: ${plant.created_at ? new Date(plant.created_at).toLocaleString() : '-'}`}
              >
                {editingPlantId === plant.id ? (
                  <form onSubmit={(event) => handleUpdatePlant(event, plant)} className="mt-4 space-y-3 rounded-2xl border border-stone-200 bg-stone-50 p-4 text-slate-900 shadow-sm transition-shadow hover:shadow-md">
                    <input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full rounded-xl border border-stone-300 bg-white px-4 py-2 text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                      placeholder="Title"
                      required
                    />
                    <textarea
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      className="w-full rounded-xl border border-stone-300 bg-white px-4 py-2 text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                      rows={3}
                      placeholder="Description"
                    />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setEditImageFile(e.target.files?.[0] || null)}
                      className="w-full rounded-xl border border-stone-300 bg-white px-4 py-2 text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                    />
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        disabled={submitting}
                        className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-700 transition-colors hover:bg-emerald-100"
                      >
                        {submitting ? 'Saving...' : 'Save'}
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        className="rounded-full border border-stone-200 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-stone-100"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : null}
              </PlantCard>
            ))}
          </div>
        </div>
      </div>
    </div>
    </>
  )
}

export default MyPlantsPage
