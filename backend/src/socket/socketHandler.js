import jwt from 'jsonwebtoken'
import { placeBid } from '../services/auctionService.js'

const bidTimestamps = new Map()

export default function initSocket(io) {
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token
      if (!token) {
        return next(new Error('Authentication error'))
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      socket.user = decoded
      return next()
    } catch (err) {
      return next(new Error('Authentication error'))
    }
  })

  io.on('connection', (socket) => {
    socket.on('join_auction', (auctionId) => {
      socket.join(`auction_${auctionId}`)
      socket.emit('joined', { auctionId })
    })

    socket.on('place_bid', async ({ auctionId, amount }) => {
      try {
        const userId = socket.user.userId
        const now = Date.now()
        const last = bidTimestamps.get(userId) || 0

        if (now - last < 1000) {
          socket.emit('bid_error', { error: 'Please wait 1 second before placing another bid' })
          return
        }

        bidTimestamps.set(userId, now)

        const buyerId = socket.user.userId
        const result = await placeBid(auctionId, buyerId, amount)

        io.to(`auction_${auctionId}`).emit('bid_placed', {
          auctionId,
          newPrice: result.auction.current_price,
          buyerEmail: socket.user.email,
          amount,
          placedAt: result.bid.placed_at,
        })
      } catch (err) {
        socket.emit('bid_error', { error: err.message })
      }
    })

    socket.on('leave_auction', (auctionId) => {
      socket.leave(`auction_${auctionId}`)
    })

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id)
      bidTimestamps.delete(socket.user?.userId)
    })
  })
}