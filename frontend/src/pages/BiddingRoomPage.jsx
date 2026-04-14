import { useEffect, useMemo, useRef, useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { io } from 'socket.io-client'
import Navbar from '../components/Navbar.jsx'
import PageHeader from '../components/PageHeader.jsx'
import BidHistoryList from '../components/BidHistoryList.jsx'
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

    if (auction && bidValue < Number(auction.current_price) + 100) {
      setError('Bid must be at least ฿100 higher than current price')
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
      <div className="min-h-screen bg-stone-50 px-4 py-8">
        <div className="mx-auto max-w-5xl">
          <PageHeader title="Bidding Room" subtitle="Real-time bidding" />

        {error ? <p className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p> : null}

        {user?.role === 'seller' ? (
          <p className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            You are viewing this auction as a seller. Bidding is not allowed.
          </p>
        ) : null}

        <div className="mb-6 rounded-2xl border border-stone-200 bg-white p-6 text-slate-900 shadow-sm transition-shadow hover:shadow-md">
          {loading ? <p className="text-slate-500">Loading auction...</p> : null}

          {!loading && auction ? (
            <div>
              {auction.image_url ? (
                <img
                  src={`http://localhost:3000${auction.image_url}`}
                  alt={auction.plant_title}
                  className="w-full object-contain rounded-lg mb-4 max-h-96 "
                />
              ) : (
                <div className="w-full h-64 rounded-lg mb-4 flex items-center justify-center bg-stone-100 text-slate-400">
                  No image available
                </div>
              )}
              <h2 className="text-2xl text-slate-900">{auction.plant_title}</h2>
              <div className="mt-2 rounded-xl border border-stone-200 bg-stone-50 p-3">
                <p className="text-sm text-slate-700">Seller: {winner?.seller_email || '-'}</p>
                {winner?.seller_display_name ? (
                  <p className="text-sm text-slate-700">Name: {winner.seller_display_name}</p>
                ) : null}
                {winner?.seller_phone ? <p className="text-sm text-slate-700">Phone: {winner.seller_phone}</p> : null}
              </div>
              <p className="mt-10 text-4xl text-emerald-700">Current price: ฿{auction.current_price}</p>
              <p className="mt-10 text-sm text-slate-600">
                End time: {auction.end_time ? new Date(auction.end_time).toLocaleString() : '-'}
              </p>
            </div>
          ) : null}
        </div>

        {user?.role === 'buyer' && auction?.status !== 'ended' ? (
          <form onSubmit={handlePlaceBid} className="mb-6 rounded-2xl border border-stone-200 bg-white p-6 text-slate-900 shadow-sm transition-shadow hover:shadow-md">
            <label className="mb-2 block text-sm font-medium text-slate-700">Your bid amount</label>
            <div className="flex gap-2">
              <input
                type="number"
                min="0"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full rounded-xl border border-stone-300 bg-white px-4 py-2 text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                placeholder="Enter bid"
              />
              <button
                type="submit"
                className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700 disabled:opacity-60"
              >
                Place Bid
              </button>
            </div>
            {auction ? <p className="text-sm text-slate-400 mt-1">Minimum bid: ฿{Number(auction.current_price) + 100}</p> : null}
          </form>
        ) : null}

        {!loading && auction?.status === 'ended' ? (
          <div className="mb-6">
            {loadingWinner ? (
              <div className="rounded-2xl border border-stone-200 bg-white p-6 text-center text-slate-900 shadow-sm transition-shadow hover:shadow-md">
                Loading auction results...
              </div>
            ) : winner?.winner_email ? (
              <div className="rounded-2xl border border-stone-200 bg-white p-6 text-slate-900 shadow-sm transition-shadow hover:shadow-md">
                <p className="text-lg font-semibold text-slate-900">Auction Ended!</p>
                <p className="mt-2 text-sm text-amber-800">Winner: {winner.winner_display_name}</p>

                {user?.userId === auction?.winner_id ? (
                  <p className="mt-3 text-lg font-semibold text-amber-800">🏆 Congratulations! You won this auction.</p>
                ) : null}

                {user?.role === 'seller' ? (
                  <div className="mt-3 rounded-xl border border-yellow-100 bg-linear-to-r from-orange-100/60 to-yellow-100/60 p-3">
                    <p className="text-sm font-semibold text-slate-900">Winner Contact Information:</p>
                    <p className="text-sm text-slate-700">Email: {winner.winner_email}</p>
                    {winner.winner_phone ? (
                      <p className="text-sm text-slate-700">Phone: {winner.winner_phone}</p>
                    ) : null}
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="rounded-2xl border border-stone-200 bg-white p-6 text-slate-900 shadow-sm transition-shadow hover:shadow-md">
                <p className="font-semibold text-slate-900">Auction ended with no bids</p>
              </div>
            )}
          </div>
        ) : null}

        <div className="rounded-2xl border border-stone-200 bg-white p-6 text-slate-900 shadow-sm transition-shadow hover:shadow-md">
          <h3 className="mb-4 text-lg font-semibold text-slate-900">Bid History</h3>

          {bidHistory.length === 0 ? <p className="text-slate-500">No bids yet.</p> : null}

          <BidHistoryList bids={bidHistory} />
        </div>
      </div>
    </div>
    </>
  )
}

export default BiddingRoomPage
