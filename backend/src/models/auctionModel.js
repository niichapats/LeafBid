import pool from '../database/db.js'

export async function createAuction(plantId, startPrice, startTime, endTime) {
  const result = await pool.query(
    'INSERT INTO auctions (plant_id, start_price, current_price, start_time, end_time) VALUES ($1, $2, $2, $3, $4) RETURNING *',
    [plantId, startPrice, startTime, endTime]
  )
  return result.rows[0]
}

export async function getAuctionById(id) {
  const result = await pool.query(
    'SELECT auctions.*, plants.title as plant_title, plants.image_url FROM auctions JOIN plants ON auctions.plant_id = plants.id WHERE auctions.id = $1',
    [id]
  )
  return result.rows[0] || null
}

export async function getActiveAuctions() {
  const result = await pool.query(
    "SELECT auctions.*, plants.title as plant_title, plants.image_url FROM auctions JOIN plants ON auctions.plant_id = plants.id WHERE auctions.status = 'active' ORDER BY auctions.end_time ASC"
  )
  return result.rows
}

export async function placeBid(auctionId, buyerId, amount) {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    const auctionRes = await client.query('SELECT * FROM auctions WHERE id = $1 FOR UPDATE', [auctionId])
    const auction = auctionRes.rows[0]

    if (!auction || auction.status !== 'active') {
      throw new Error('Auction is not active')
    }

    if (Number(amount) <= Number(auction.current_price)) {
      throw new Error('Bid must be higher than current price')
    }

    const updateRes = await client.query('UPDATE auctions SET current_price = $2 WHERE id = $1 RETURNING *', [auctionId, amount])
    const updatedAuction = updateRes.rows[0]

    const insertBidRes = await client.query('INSERT INTO bids (auction_id, buyer_id, amount) VALUES ($1, $2, $3) RETURNING *', [auctionId, buyerId, amount])
    const insertedBid = insertBidRes.rows[0]

    await client.query('COMMIT')

    return { auction: updatedAuction, bid: insertedBid }
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
}

export async function endAuction(auctionId) {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    const auctionRes = await client.query('SELECT * FROM auctions WHERE id = $1 FOR UPDATE', [auctionId])
    const auction = auctionRes.rows[0]

    if (!auction) {
      throw new Error('Auction not found')
    }

    const highestBidRes = await client.query('SELECT buyer_id FROM bids WHERE auction_id = $1 ORDER BY amount DESC LIMIT 1', [auctionId])
    const highest = highestBidRes.rows[0]
    const highestBidder = highest ? highest.buyer_id : null

    const updateRes = await client.query('UPDATE auctions SET status = $2, winner_id = $3 WHERE id = $1 RETURNING *', [auctionId, 'ended', highestBidder])
    const updatedAuction = updateRes.rows[0]

    await client.query('COMMIT')
    return updatedAuction
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
}

export async function updateAuctionStatus(auctionId, status) {
  const result = await pool.query('UPDATE auctions SET status = $2 WHERE id = $1 RETURNING *', [auctionId, status])
  return result.rows[0] || null
}
