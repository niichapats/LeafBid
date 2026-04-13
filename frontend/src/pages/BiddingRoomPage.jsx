import { useEffect, useMemo, useRef, useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { io } from 'socket.io-client'
import Navbar from '../components/Navbar.jsx'
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
          const bidHistoryResponse = await api.get(`/auctions/${auctionId}/bids`)
          const initialHistory = bidHistoryResponse.data.map((bid) => ({
            amount: bid.amount,
            buyerEmail: bid.buyer_email,
            placed_at: bid.placed_at,
          }))
          setBidHistory(initialHistory)
        } catch (err) {
          console.error('Failed to load bid history:', err)
          setBidHistory([])
        }

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

    socket.on('bid_placed', (data) => {
      if (Number(data.auctionId) !== Number(auctionId)) {
        return
      }

      setAuction((prev) => {
        if (!prev) {
          return prev
        }
        return {
          ...prev,
          current_price: data.newPrice,
        }
      })

      setBidHistory((prev) => [
        {
          amount: data.amount,
          buyerEmail: data.buyerEmail,
          placedAt: data.placedAt,
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
    <>
      <Navbar />
      <div className="min-h-screen bg-mist-950 px-4 py-8">
        <div className="mx-auto max-w-5xl">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-emerald-100">Bidding Room</h1>
            <p className="mt-1 text-sm text-gray-300">Real-time bidding for auction #{auctionId}</p>
          </div>

        {error ? <p className="mb-4 bg-red-400/20 text-red-300 border border-red-400/50 rounded-full px-3 py-1 text-sm">{error}</p> : null}

        {user?.role === 'seller' ? (
          <p className="mb-4 bg-yellow-400/20 text-yellow-300 border border-yellow-400/50 rounded-full px-3 py-1 text-sm">
            You are viewing this auction as a seller. Bidding is not allowed.
          </p>
        ) : null}

        <div className="mb-6 rounded-2xl border border-emerald-200/70 bg-linear-to-br from-emerald-200/35 to-lime-200/30 p-6 text-white shadow-sm transition-shadow hover:shadow-lg ring-1 ring-emerald-100">
          {loading ? <p className="text-white/90">Loading auction...</p> : null}

          {!loading && auction ? (
            <div>
              {auction.image_url ? (
                <img
                  src={`http://localhost:3000${auction.image_url}`}
                  alt={auction.plant_title}
                  className="w-full object-contain rounded-lg mb-4 max-h-96 "
                />
              ) : (
                <div className="w-full h-64 rounded-lg mb-4 flex items-center justify-center text-gray-400">
                  No image available
                </div>
              )}
              <h2 className="text-2xl text-white">{auction.plant_title}</h2>
              <div className="mt-2 rounded-lg bg-gray-50/20 p-3">
                <p className="text-sm text-white">Seller: {winner?.seller_email || '-'}</p>
                {winner?.seller_display_name ? (
                  <p className="text-sm text-white">Name: {winner.seller_display_name}</p>
                ) : null}
                {winner?.seller_phone ? <p className="text-sm text-white">Phone: {winner.seller_phone}</p> : null}
              </div>
              <p className="mt-10 text-4xl text-white">Current price: ฿{auction.current_price}</p>
              <p className="mt-10 text-sm text-white/90">
                End time: {auction.end_time ? new Date(auction.end_time).toLocaleString() : '-'}
              </p>
            </div>
          ) : null}
        </div>

        {user?.role === 'buyer' ? (
          <form onSubmit={handlePlaceBid} className="mb-6 rounded-2xl border border-emerald-200/70 bg-linear-to-br from-emerald-200/35 to-lime-200/30 p-6 text-white shadow-sm transition-shadow hover:shadow-lg ring-1 ring-emerald-100">
            <label className="mb-2 block text-sm font-medium text-white">Your bid amount</label>
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
                className="rounded-full bg-green-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-600"
              >
                Place Bid
              </button>
            </div>
          </form>
        ) : null}

        {!loading && auction?.status === 'ended' ? (
          <div className="mb-6">
            {loadingWinner ? (
              <div className="rounded-2xl border border-emerald-200/70 bg-linear-to-br from-emerald-200/35 to-lime-200/30 p-6 text-center text-white shadow-sm transition-shadow hover:shadow-lg">
                Loading auction results...
              </div>
            ) : winner?.winner_email ? (
              <div className="rounded-2xl border border-emerald-200/70 bg-linear-to-br from-emerald-200/35 to-lime-200/30 p-6 text-white shadow-sm transition-shadow hover:shadow-lg ring-1 ring-emerald-100">
                <p className="text-lg font-semibold text-white">Auction Ended!</p>
                <p className="mt-2 text-sm text-white">Winner: {winner.winner_email}</p>
                {winner.winner_display_name ? (
                  <p className="text-sm text-white">Name: {winner.winner_display_name}</p>
                ) : null}

                {user?.userId === auction?.winner_id ? (
                  <p className="mt-3 text-sm font-semibold text-white">Congratulations! You won this auction.</p>
                ) : null}

                {user?.role === 'seller' ? (
                  <div className="mt-3 rounded-lg bg-white/20 p-3">
                    <p className="text-sm font-semibold text-white">Winner Contact Information:</p>
                    <p className="text-sm text-white">Email: {winner.winner_email}</p>
                    {winner.winner_display_name ? (
                      <p className="text-sm text-white">Name: {winner.winner_display_name}</p>
                    ) : null}
                    {winner.winner_phone ? (
                      <p className="text-sm text-white">Phone: {winner.winner_phone}</p>
                    ) : null}
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="rounded-2xl border border-emerald-200/70 bg-linear-to-br from-emerald-200/35 to-lime-200/30 p-6 text-white shadow-sm transition-shadow hover:shadow-lg ring-1 ring-emerald-100">
                <p className="font-semibold text-white">Auction ended with no bids</p>
              </div>
            )}
          </div>
        ) : null}

        <div className="rounded-2xl border border-emerald-200/70 bg-linear-to-br from-emerald-200/35 to-lime-200/30 p-6 text-white shadow-sm transition-shadow hover:shadow-lg ring-1 ring-emerald-100">
          <h3 className="mb-4 text-lg font-semibold text-white">Bid History</h3>

          {bidHistory.length === 0 ? <p className="text-white/90">No bids yet.</p> : null}

          <div className="space-y-3">
            {bidHistory.map((bid, index) => (
              <div key={`${bid.placed_at || bid.placedAt}-${index}`} className="rounded-xl border border-emerald-200/70 bg-linear-to-br from-emerald-200/35 to-lime-200/30 p-3 text-white shadow-sm transition-shadow hover:shadow-lg">
                <p className="text-sm font-semibold text-white">Amount: {bid.amount}</p>
                <p className="text-xs text-white/90">Buyer: {bid.buyerEmail}</p>
                <p className="text-xs text-white/80">
                  {(() => {
                    const time = bid.placed_at || bid.placedAt
                    return `Placed at: ${time ? new Date(time).toLocaleString() : '-'}`
                  })()}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
    </>
  )
}

export default BiddingRoomPage
