import pool from '../database/db.js'

export async function getBidsByAuction(auctionId) {
  const result = await pool.query(
    'SELECT bids.*, users.email as buyer_email FROM bids JOIN users ON bids.buyer_id = users.id WHERE bids.auction_id = $1 ORDER BY bids.amount DESC',
    [auctionId]
  )
  return result.rows
}
