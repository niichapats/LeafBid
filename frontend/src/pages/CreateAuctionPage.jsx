import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import api from '../utils/api.js'
import { getUser } from '../utils/auth.js'

function CreateAuctionPage() {
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
        api.get('/auctions').catch(() => ({ data: [] })),
      ])

      const myPlants = plantsRes.data
      const onlyApprovedPlants = myPlants.filter((plant) => plant.status === 'approved')
      const approvedIds = new Set(onlyApprovedPlants.map((plant) => Number(plant.id)))
      setPlants(myPlants)
      setApprovedPlants(onlyApprovedPlants)

      const visibleAuctions = (auctionsRes.data || []).filter((auction) => approvedIds.has(Number(auction.plant_id)))
      setAuctions(visibleAuctions)

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
      const response = await api.patch(`/auctions/${auctionId}/start`)
      const updatedAuction = response.data

      setAuctions((previous) =>
        previous.map((auction) => (Number(auction.id) === Number(updatedAuction.id) ? updatedAuction : auction))
      )
      setSuccess(`Auction ${auctionId} started`)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to start auction')
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
              <div key={auction.id} className="rounded-xl border border-emerald-100 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-emerald-900">{auction.plant_title || `Plant #${auction.plant_id}`}</p>
                    <p className="text-sm text-gray-600">
                      Auction #{auction.id} • Status: {auction.status || 'scheduled'} • Current price: {auction.current_price}
                    </p>
                  </div>

                  <button
                    onClick={() => handleStartAuction(auction.id)}
                    disabled={auction.status === 'active' || auction.status === 'ended'}
                    className="rounded-lg bg-yellow-700 px-3 py-2 text-sm font-semibold text-white hover:bg-yellow-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Start Auction
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreateAuctionPage
