import cron from 'node-cron'
import { updateAuctionStatus, endAuction } from '../models/auctionModel.js'
import pool from '../database/db.js'

export function initScheduler() {
  cron.schedule('* * * * *', async () => {
    const toStart = await pool.query(
      "SELECT id FROM auctions WHERE status='scheduled' AND start_time <= NOW()"
    )

    for (const auction of toStart.rows) {
      await updateAuctionStatus(auction.id, 'active')
      console.log(`Auto-started auction ${auction.id}`)
    }

    const toEnd = await pool.query(
      "SELECT id FROM auctions WHERE status='active' AND end_time <= NOW()"
    )

    for (const auction of toEnd.rows) {
      await endAuction(auction.id)
      console.log(`Auto-ended auction ${auction.id}`)
    }
  })
}
