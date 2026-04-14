import dotenv from 'dotenv'
dotenv.config()

import express from 'express'
import cors from 'cors'
import rateLimit from 'express-rate-limit'
import { createServer } from 'http'
import { Server } from 'socket.io'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import pool from './database/db.js'
import authRoutes from './routes/authRoutes.js'
import plantRoutes from './routes/plantRoutes.js'
import auctionRoutes from './routes/auctionRoutes.js'
import profileRoutes from './routes/profileRoutes.js'
import initSocket from './socket/socketHandler.js'
import { initScheduler } from './scheduler/auctionScheduler.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const uploadsPath = path.join(__dirname, '..', 'uploads')

fs.mkdirSync(uploadsPath, { recursive: true })

const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer, { cors: { origin: '*' } })
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Too many requests, please try again later' },
})

initSocket(io)

app.use(cors({ origin: 'http://localhost:5173', credentials: true }))
app.use(express.json())
app.use('/uploads', express.static(uploadsPath))
app.use('/api/auth', authLimiter)
app.use('/api/auth', authRoutes)
app.use('/api/plants', plantRoutes)
app.use('/api/auctions', auctionRoutes)
app.use('/api/profile', profileRoutes)

app.use((err, req, res, next) => {
  res.status(500).json({ error: err.message })
})

const PORT = process.env.PORT || 3000

pool
  .query('SELECT 1')
  .then(() => {
    console.log('Database connected')
    initScheduler()
    httpServer.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`)
    })
  })
  .catch((error) => {
    console.error('Database connection failed:', error)
    process.exit(1)
  })
