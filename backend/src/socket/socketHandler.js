import jwt from 'jsonwebtoken'
import { placeBid } from '../services/auctionService.js'

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
    })
  })
}
