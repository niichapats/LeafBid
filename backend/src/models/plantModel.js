import pool from '../database/db.js'

export async function createPlant(sellerId, title, description, imageUrl) {
  const result = await pool.query(
    'INSERT INTO plants (seller_id, title, description, image_url) VALUES ($1, $2, $3, $4) RETURNING *',
    [sellerId, title, description, imageUrl]
  )
  return result.rows[0]
}

export async function getPlantById(id) {
  const result = await pool.query('SELECT * FROM plants WHERE id = $1', [id])
  return result.rows[0] || null
}

export async function getPlantsBySeller(sellerId) {
  const result = await pool.query(
    'SELECT * FROM plants WHERE seller_id = $1 ORDER BY created_at DESC',
    [sellerId]
  )
  return result.rows
}

export async function getPendingPlants() {
  const result = await pool.query(
    'SELECT plants.*, users.email as seller_email FROM plants JOIN users ON plants.seller_id = users.id WHERE plants.status = $1 ORDER BY plants.created_at ASC',
    ['pending']
  )
  return result.rows
}

export async function updatePlant(id, sellerId, title, description, imageUrl) {
  const result = await pool.query(
    'UPDATE plants SET title=$3, description=$4, image_url=$5 WHERE id=$1 AND seller_id=$2 RETURNING *',
    [id, sellerId, title, description, imageUrl]
  )
  return result.rows[0] || null
}

export async function updatePlantStatus(id, status) {
  const result = await pool.query(
    'UPDATE plants SET status=$2 WHERE id=$1 RETURNING *',
    [id, status]
  )
  return result.rows[0] || null
}

export async function deletePlant(id, sellerId) {
  const result = await pool.query(
    'DELETE FROM plants WHERE id=$1 AND seller_id=$2 RETURNING *',
    [id, sellerId]
  )
  return result.rows[0] || null
}
