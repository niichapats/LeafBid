import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import api from '../utils/api.js'
import { getUser } from '../utils/auth.js'

function CreateAuctionPage() {
  const navigate = useNavigate()
  const user = getUser()
  const [plants, setPlants] = useState([])
  const [approvedPlants, setApprovedPlants] = useState([])
  const [auctions, setAuctions] = useState([])
  const [selectedPlantId, setSelectedPlantId] = useState('')
  const [startPrice, setStartPrice] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [editingAuctionId, setEditingAuctionId] = useState(null)
  const [editStartPrice, setEditStartPrice] = useState('')
  const [editStartTime, setEditStartTime] = useState('')
  const [editEndTime, setEditEndTime] = useState('')

  if (!user || user.role !== 'seller') {
    return <Navigate to="/dashboard" replace />
  }

  const approvedPlantIds = useMemo(() => new Set(approvedPlants.map((plant) => Number(plant.id))), [approvedPlants])

  const loadData = async () => {
    try {
      setLoading(true)
      setError('')
      const [plantsRes, auctionsRes] = await Promise.all([
        api.get('/plants/my'),
        api.get('/auctions/my').catch(() => ({ data: [] })),
      ])

      const myPlants = plantsRes.data
      const onlyApprovedPlants = myPlants.filter((plant) => plant.status === 'approved')
      setPlants(myPlants)
      setApprovedPlants(onlyApprovedPlants)
      setAuctions(auctionsRes.data || [])

      if (!selectedPlantId && onlyApprovedPlants.length > 0) {
        setSelectedPlantId(String(onlyApprovedPlants[0].id))
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    const visibleAuctions = auctions.filter((auction) => approvedPlantIds.has(Number(auction.plant_id)))
    if (visibleAuctions.length !== auctions.length) {
      setAuctions(visibleAuctions)
    }
  }, [approvedPlantIds])

  const handleCreateAuction = async (event) => {
    event.preventDefault()

    try {
      setSubmitting(true)
      setError('')
      setSuccess('')
      const response = await api.post('/auctions', {
        plantId: Number(selectedPlantId),
        startPrice: Number(startPrice),
        startTime,
        endTime,
      })

      const createdAuction = response.data
      setSuccess(`Auction created successfully (ID: ${createdAuction.id})`)
      setAuctions((previous) => [createdAuction, ...previous])
      setStartPrice('')
      setStartTime('')
      setEndTime('')
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create auction')
    } finally {
      setSubmitting(false)
    }
  }

  const handleStartAuction = async (auctionId) => {
    try {
      setError('')
      setSuccess('')
      await api.patch(`/auctions/${auctionId}/start`)
      setSuccess(`Auction ${auctionId} started`)
      await loadData()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to start auction')
    }
  }

  const handleEndAuction = async (auctionId) => {
    try {
      setError('')
      setSuccess('')
      await api.patch(`/auctions/${auctionId}/end`)
      setSuccess(`Auction ${auctionId} ended`)
      await loadData()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to end auction')
    }
  }

  const formatDateTimeLocal = (value) => {
    if (!value) {
      return ''
    }

    const date = new Date(value)
    const offset = date.getTimezoneOffset()
    const local = new Date(date.getTime() - offset * 60 * 1000)
    return local.toISOString().slice(0, 16)
  }

  const handleEditClick = (event, auction) => {
    event.stopPropagation()
    setEditingAuctionId(auction.id)
    setEditStartPrice(String(auction.start_price ?? ''))
    setEditStartTime(formatDateTimeLocal(auction.start_time))
    setEditEndTime(formatDateTimeLocal(auction.end_time))
  }

  const handleCancelEdit = (event) => {
    event.stopPropagation()
    setEditingAuctionId(null)
    setEditStartPrice('')
    setEditStartTime('')
    setEditEndTime('')
  }

  const handleUpdateAuction = async (event, auctionId) => {
    event.preventDefault()
    event.stopPropagation()

    try {
      setError('')
      setSuccess('')
      await api.put(`/auctions/${auctionId}`, {
        startPrice: Number(editStartPrice),
        startTime: editStartTime,
        endTime: editEndTime,
      })
      setSuccess(`Auction ${auctionId} updated`)
      setEditingAuctionId(null)
      await loadData()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update auction')
    }
  }

  const handleDeleteAuction = async (event, auctionId) => {
    event.stopPropagation()

    const confirmed = window.confirm('Are you sure?')
    if (!confirmed) {
      return
    }

    try {
      setError('')
      setSuccess('')
      await api.delete(`/auctions/${auctionId}`)
      setSuccess(`Auction ${auctionId} deleted`)
      await loadData()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete auction')
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-emerald-50 via-white to-lime-50 px-4 py-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-emerald-900">Create Auction</h1>
            <p className="mt-1 text-sm text-gray-600">Create and start auctions for your approved plants</p>
          </div>
          <Link to="/dashboard" className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
            Back
          </Link>
        </div>

        {error ? <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p> : null}
        {success ? <p className="mb-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</p> : null}

        <div className="mb-6 rounded-2xl bg-white p-6 shadow ring-1 ring-emerald-100">
          {loading ? <p className="text-gray-600">Loading...</p> : null}

          {!loading && approvedPlants.length === 0 ? (
            <p className="text-gray-600">No approved plants available. Wait for admin approval before creating auctions.</p>
          ) : null}

          {!loading && approvedPlants.length > 0 ? (
            <form onSubmit={handleCreateAuction} className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-gray-700">Approved Plant</label>
                <select
                  value={selectedPlantId}
                  onChange={(e) => setSelectedPlantId(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-2 outline-none focus:border-emerald-500"
                  required
                >
                  {approvedPlants.map((plant) => (
                    <option key={plant.id} value={plant.id}>
                      {plant.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Start Price</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={startPrice}
                  onChange={(e) => setStartPrice(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-2 outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Start Time</label>
                <input
                  type="datetime-local"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-2 outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">End Time</label>
                <input
                  type="datetime-local"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-2 outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-xl bg-emerald-600 px-4 py-2 font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                >
                  {submitting ? 'Creating...' : 'Create Auction'}
                </button>
              </div>
            </form>
          ) : null}
        </div>

        <div className="rounded-2xl bg-white p-6 shadow ring-1 ring-emerald-100">
          <h2 className="mb-4 text-xl font-semibold text-emerald-900">My Auctions</h2>

          {auctions.length === 0 ? <p className="text-gray-600">No auctions to show.</p> : null}

          <div className="space-y-3">
            {auctions.map((auction) => (
              <div
                key={auction.id}
                className="cursor-pointer rounded-xl border border-emerald-100 p-4"
                onClick={() => navigate(`/auctions/${auction.id}`)}
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-emerald-900">{auction.plant_title || `Plant #${auction.plant_id}`}</p>
                    <p className="text-sm text-gray-600">Auction #{auction.id}</p>
                    <div className="mt-2">
                      {auction.status === 'scheduled' ? (
                        <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-800">Scheduled</span>
                      ) : null}
                      {auction.status === 'active' ? (
                        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">Active</span>
                      ) : null}
                      {auction.status === 'ended' ? (
                        <span className="rounded-full bg-gray-200 px-3 py-1 text-xs font-medium text-gray-700">Ended</span>
                      ) : null}
                    </div>
                    <p className="text-sm text-gray-600">Start price: {auction.start_price}</p>
                    <p className="text-sm text-gray-600">Current price: {auction.current_price}</p>
                    <p className="text-sm text-gray-600">
                      Start time: {auction.start_time ? new Date(auction.start_time).toLocaleString() : '-'}
                    </p>
                    <p className="text-sm text-gray-600">
                      End time: {auction.end_time ? new Date(auction.end_time).toLocaleString() : '-'}
                    </p>
                    {auction.status === 'ended' ? (
                      <p className="text-sm text-gray-700">
                        Winner ID: {auction.winner_id ? auction.winner_id : 'No winner'}
                      </p>
                    ) : null}
                  </div>

                  <div className="flex gap-2">
                    {auction.status === 'scheduled' ? (
                      <>
                        <button
                          onClick={(event) => {
                            event.stopPropagation()
                            handleStartAuction(auction.id)
                          }}
                          className="rounded bg-green-700 px-4 py-2 font-medium text-white hover:bg-green-800"
                        >
                          Start Auction
                        </button>
                        <button
                          onClick={(event) => handleEditClick(event, auction)}
                          className="rounded bg-yellow-700 px-4 py-2 font-medium text-white hover:bg-yellow-800"
                        >
                          Edit
                        </button>
                        <button
                          onClick={(event) => handleDeleteAuction(event, auction.id)}
                          className="rounded bg-red-600 px-4 py-2 font-medium text-white hover:bg-red-700"
                        >
                          Delete
                        </button>
                      </>
                    ) : null}

                    {auction.status === 'active' ? (
                      <>
                        <button
                          onClick={(event) => {
                            event.stopPropagation()
                            handleEndAuction(auction.id)
                          }}
                          className="rounded bg-yellow-700 px-4 py-2 font-medium text-white hover:bg-yellow-800"
                        >
                          End Auction
                        </button>
                        <button
                          onClick={(event) => handleDeleteAuction(event, auction.id)}
                          className="rounded bg-red-600 px-4 py-2 font-medium text-white hover:bg-red-700"
                        >
                          Delete
                        </button>
                      </>
                    ) : null}

                    {auction.status === 'ended' ? (
                      <button
                        onClick={(event) => handleDeleteAuction(event, auction.id)}
                        className="rounded bg-red-600 px-4 py-2 font-medium text-white hover:bg-red-700"
                      >
                        Delete
                      </button>
                    ) : null}
                  </div>
                </div>

                {editingAuctionId === auction.id ? (
                  <form
                    onSubmit={(event) => handleUpdateAuction(event, auction.id)}
                    onClick={(event) => event.stopPropagation()}
                    className="mt-4 grid gap-3 rounded-xl border border-yellow-200 bg-yellow-50 p-4 md:grid-cols-3"
                  >
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">Start Price</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={editStartPrice}
                        onChange={(e) => setEditStartPrice(e.target.value)}
                        className="w-full rounded border border-gray-200 px-3 py-2 outline-none focus:border-yellow-600"
                        required
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">Start Time</label>
                      <input
                        type="datetime-local"
                        value={editStartTime}
                        onChange={(e) => setEditStartTime(e.target.value)}
                        className="w-full rounded border border-gray-200 px-3 py-2 outline-none focus:border-yellow-600"
                        required
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">End Time</label>
                      <input
                        type="datetime-local"
                        value={editEndTime}
                        onChange={(e) => setEditEndTime(e.target.value)}
                        className="w-full rounded border border-gray-200 px-3 py-2 outline-none focus:border-yellow-600"
                        required
                      />
                    </div>

                    <div className="md:col-span-3 flex gap-2">
                      <button
                        type="submit"
                        className="rounded bg-yellow-700 px-4 py-2 font-medium text-white hover:bg-yellow-800"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        className="rounded border border-gray-300 bg-white px-4 py-2 font-medium text-gray-700 hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreateAuctionPage
