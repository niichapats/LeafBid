import dotenv from 'dotenv'
dotenv.config()

import express from 'express'
import pool from './database/db.js'

const app = express()

app.use(express.json())

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
