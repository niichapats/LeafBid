require('dotenv').config()

const http = require('http')
const express = require('express')
const cors = require('cors')
const { Server } = require('socket.io')

const auctionService = require('./services/auctionService')

const app = express()
const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
})

app.use(cors())
app.use(express.json())

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'LeafBid API' })
})

io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`)

  // Client asks for the latest bid when entering an auction room.
  socket.on('auction:join', () => {
    socket.emit('bid:update', auctionService.getCurrentAuction())
  })

  // Client submits a bid through WebSocket.
  socket.on('bid:place', (payload) => {
    try {
      const amount = Number(payload?.amount)
      const updatedAuction = auctionService.placeBid(amount)
      io.emit('bid:update', updatedAuction)
    } catch (error) {
      socket.emit('bid:error', { message: error.message })
    }
  })

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`)
  })
})

const PORT = process.env.PORT || 5000
server.listen(PORT, () => {
  console.log(`LeafBid backend running on port ${PORT}`)
})
