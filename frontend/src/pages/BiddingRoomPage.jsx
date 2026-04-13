import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { io } from 'socket.io-client'
import api from '../utils/api.js'
import { getToken, getUser, isLoggedIn } from '../utils/auth.js'

function BiddingRoomPage() {
  const { id } = useParams()
  const socketRef = useRef(null)
  const user = getUser()
  const [auction, setAuction] = useState(null)
  const [winner, setWinner] = useState(null)
  const [bidHistory, setBidHistory] = useState([])
  const [amount, setAmount] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [loadingWinner, setLoadingWinner] = useState(false)

  const auctionId = useMemo(() => Number(id), [id])

  if (!isLoggedIn()) {
    return <Navigate to="/login" replace />
  }

  useEffect(() => {
    const loadAuction = async () => {
      try {
        setLoading(true)
        setError('')
        const response = await api.get(`/auctions/${auctionId}`)
        setAuction(response.data)

        try {
          setLoadingWinner(true)
          const winnerResponse = await api.get(`/auctions/${auctionId}/winner`)
          setWinner(winnerResponse.data)
        } catch (err) {
          console.error('Failed to load winner info:', err)
          setWinner(null)
        } finally {
          setLoadingWinner(false)
        }
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load auction')
      } finally {
        setLoading(false)
      }
    }

    loadAuction()
  }, [auctionId])

  useEffect(() => {
    const token = getToken()
    if (!token) {
      return undefined
    }

    const socket = io('http://localhost:3000', {
      auth: { token },
    })

    socketRef.current = socket

    socket.on('connect', () => {
      socket.emit('join_auction', auctionId)
    })

    socket.on('joined', () => {
      setError('')
    })

    socket.on('bid_placed', (payload) => {
      if (Number(payload.auctionId) !== Number(auctionId)) {
        return
      }

      setAuction((prev) => {
        if (!prev) {
          return prev
        }
        return {
          ...prev,
          current_price: payload.newPrice,
        }
      })

      setBidHistory((prev) => [
        {
          amount: payload.amount,
          buyerEmail: payload.buyerEmail,
          placedAt: payload.placedAt,
        },
        ...prev,
      ])
    })

    socket.on('bid_error', (payload) => {
      setError(payload?.error || 'Bid failed')
    })

    return () => {
      socket.emit('leave_auction', auctionId)
      socket.disconnect()
    }
  }, [auctionId])

  const handlePlaceBid = (event) => {
    event.preventDefault()
    setError('')

    const bidValue = Number(amount)
    if (!bidValue || bidValue <= 0) {
      setError('Please enter a valid bid amount')
      return
    }

    socketRef.current?.emit('place_bid', {
      auctionId,
      amount: bidValue,
    })
    setAmount('')
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-emerald-50 via-white to-lime-50 px-4 py-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-emerald-900">Bidding Room</h1>
            <p className="mt-1 text-sm text-gray-600">Real-time bidding for auction #{auctionId}</p>
          </div>
          <Link
            to="/auctions"
            className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Back to Auctions
          </Link>
        </div>

        {error ? <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p> : null}

        {user?.role === 'seller' ? (
          <p className="mb-4 rounded-xl bg-yellow-100 px-4 py-3 text-sm text-yellow-800">
            You are viewing this auction as a seller. Bidding is not allowed.
          </p>
        ) : null}

        <div className="mb-6 rounded-2xl bg-white p-6 shadow ring-1 ring-emerald-100">
          {loading ? <p className="text-gray-600">Loading auction...</p> : null}

          {!loading && auction ? (
            <div>
              <h2 className="text-2xl font-semibold text-emerald-900">{auction.plant_title}</h2>
              <div className="mt-2 rounded-lg bg-gray-50 p-3">
                <p className="text-sm text-gray-700">Seller: {winner?.seller_email || '-'}</p>
                {winner?.seller_display_name ? (
                  <p className="text-sm text-gray-700">Name: {winner.seller_display_name}</p>
                ) : null}
                {winner?.seller_phone ? <p className="text-sm text-gray-700">Phone: {winner.seller_phone}</p> : null}
              </div>
              <p className="mt-2 text-sm text-gray-700">Current price: {auction.current_price}</p>
              <p className="mt-1 text-sm text-gray-600">
                End time: {auction.end_time ? new Date(auction.end_time).toLocaleString() : '-'}
              </p>
            </div>
          ) : null}
        </div>

        {user?.role === 'buyer' ? (
          <form onSubmit={handlePlaceBid} className="mb-6 rounded-2xl bg-white p-6 shadow ring-1 ring-emerald-100">
            <label className="mb-2 block text-sm font-medium text-gray-700">Your bid amount</label>
            <div className="flex gap-2">
              <input
                type="number"
                min="0"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-4 py-2 outline-none focus:border-emerald-500"
                placeholder="Enter bid"
              />
              <button
                type="submit"
                className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
              >
                Place Bid
              </button>
            </div>
          </form>
        ) : null}

        {!loading && auction?.status === 'ended' ? (
          <div className="mb-6">
            {loadingWinner ? (
              <div className="rounded-2xl bg-gray-100 p-6 text-center text-gray-600">
                Loading auction results...
              </div>
            ) : winner?.winner_email ? (
              <div className="rounded-2xl bg-blue-50 p-6 ring-1 ring-blue-200">
                <p className="text-lg font-semibold text-blue-800">Auction Ended!</p>
                <p className="mt-2 text-sm text-blue-800">Winner: {winner.winner_email}</p>
                {winner.winner_display_name ? (
                  <p className="text-sm text-blue-800">Name: {winner.winner_display_name}</p>
                ) : null}

                {user?.userId === auction?.winner_id ? (
                  <p className="mt-3 text-sm font-semibold text-blue-800">Congratulations! You won this auction.</p>
                ) : null}

                {user?.role === 'seller' ? (
                  <div className="mt-3 rounded-lg bg-blue-100 p-3">
                    <p className="text-sm font-semibold text-blue-800">Winner Contact Information:</p>
                    <p className="text-sm text-blue-800">Email: {winner.winner_email}</p>
                    {winner.winner_display_name ? (
                      <p className="text-sm text-blue-800">Name: {winner.winner_display_name}</p>
                    ) : null}
                    {winner.winner_phone ? (
                      <p className="text-sm text-blue-800">Phone: {winner.winner_phone}</p>
                    ) : null}
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="rounded-2xl bg-gray-100 p-6 ring-1 ring-gray-300">
                <p className="font-semibold text-gray-900">Auction ended with no bids</p>
              </div>
            )}
          </div>
        ) : null}

        <div className="rounded-2xl bg-white p-6 shadow ring-1 ring-emerald-100">
          <h3 className="mb-4 text-lg font-semibold text-emerald-900">Bid History</h3>

          {bidHistory.length === 0 ? <p className="text-gray-600">No bids yet.</p> : null}

          <div className="space-y-3">
            {bidHistory.map((bid, index) => (
              <div key={`${bid.placedAt}-${index}`} className="rounded-xl border border-emerald-100 p-3">
                <p className="text-sm font-semibold text-emerald-900">Amount: {bid.amount}</p>
                <p className="text-xs text-gray-600">Buyer: {bid.buyerEmail}</p>
                <p className="text-xs text-gray-500">
                  Placed at: {bid.placedAt ? new Date(bid.placedAt).toLocaleString() : '-'}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default BiddingRoomPage
