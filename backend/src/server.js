import dotenv from 'dotenv'
dotenv.config()

import express from 'express'
import pool from './database/db.js'
import authRoutes from './routes/authRoutes.js'

const app = express()

app.use(express.json())
app.use('/api/auth', authRoutes)

app.use((err, req, res, next) => {
  res.status(500).json({ error: err.message })
})

const PORT = process.env.PORT || 3000

pool
  .query('SELECT 1')
  .then(() => {
    console.log('Database connected')
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`)
    })
  })
  .catch((error) => {
    console.error('Database connection failed:', error)
    process.exit(1)
  })
