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

export async function getAllAuctionsBySeller(sellerId) {
  const result = await pool.query(
    'SELECT auctions.*, plants.title as plant_title, plants.image_url FROM auctions JOIN plants ON auctions.plant_id = plants.id WHERE plants.seller_id = $1 ORDER BY auctions.id DESC',
    [sellerId]
  )
  return result.rows
}

export async function getWonAuctions(buyerId) {
  const result = await pool.query(
    "SELECT auctions.*, plants.title as plant_title, users.email as seller_email, users.display_name as seller_name, users.phone as seller_phone FROM auctions JOIN plants ON auctions.plant_id = plants.id JOIN users ON plants.seller_id = users.id WHERE auctions.winner_id = $1 AND auctions.status = 'ended' ORDER BY auctions.id DESC",
    [buyerId]
  )
  return result.rows
}

export async function getAuctionWithWinner(auctionId) {
  const result = await pool.query(
    'SELECT auctions.*, plants.title as plant_title, winner.email as winner_email, winner.display_name as winner_display_name, winner.phone as winner_phone, seller.email as seller_email, seller.display_name as seller_display_name, seller.phone as seller_phone FROM auctions JOIN plants ON auctions.plant_id = plants.id LEFT JOIN users winner ON auctions.winner_id = winner.id JOIN users seller ON plants.seller_id = seller.id WHERE auctions.id = $1',
    [auctionId]
  )
  return result.rows[0] || null
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

    if (Number(amount) < Number(auction.current_price) + 100) {
      throw new Error('Bid must be at least ฿100 higher than current price')
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

export async function deleteAuction(auctionId) {
  const result = await pool.query('DELETE FROM auctions WHERE id = $1 RETURNING *', [auctionId])
  return result.rows[0] || null
}

export async function updateAuction(auctionId, sellerId, startPrice, startTime, endTime) {
  const result = await pool.query(
    "UPDATE auctions SET start_price=$3, current_price=$3, start_time=$4, end_time=$5 FROM plants WHERE auctions.id=$1 AND auctions.plant_id = plants.id AND plants.seller_id=$2 AND auctions.status='scheduled' RETURNING auctions.*",
    [auctionId, sellerId, startPrice, startTime, endTime]
  )
  return result.rows[0] || null
}
