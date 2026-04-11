import dotenv from 'dotenv'
dotenv.config()

import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import pool from './database/db.js'
import authRoutes from './routes/authRoutes.js'
import plantRoutes from './routes/plantRoutes.js'
import auctionRoutes from './routes/auctionRoutes.js'
import initSocket from './socket/socketHandler.js'

const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer, { cors: { origin: '*' } })

initSocket(io)

app.use(express.json())
app.use('/api/auth', authRoutes)
app.use('/api/plants', plantRoutes)
app.use('/api/auctions', auctionRoutes)

app.use((err, req, res, next) => {
  res.status(500).json({ error: err.message })
})

const PORT = process.env.PORT || 3000

pool
  .query('SELECT 1')
  .then(() => {
    console.log('Database connected')
    httpServer.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`)
    })
  })
  .catch((error) => {
    console.error('Database connection failed:', error)
    process.exit(1)
  })
