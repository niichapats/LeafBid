import pool from '../database/db.js'

const VALID_ROLES = ['buyer', 'seller', 'admin']

export async function findByEmail(email) {
  const result = await pool.query('SELECT * FROM users WHERE email = $1', [email])
  return result.rows[0] || null
}

export async function createUser(email, passwordHash, role, displayName, phone) {
  if (!VALID_ROLES.includes(role)) {
    throw new Error('Invalid role')
  }

  const result = await pool.query(
    'INSERT INTO users (email, password_hash, role, display_name, phone) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [email, passwordHash, role, displayName, phone]
  )

  return result.rows[0]
}

export async function getUserById(id) {
  const result = await pool.query(
    'SELECT id, email, role, display_name, phone, created_at FROM users WHERE id = $1',
    [id]
  )
  return result.rows[0] || null
}

export async function updateUserProfile(id, displayName, phone) {
  const result = await pool.query(
    'UPDATE users SET display_name=$2, phone=$3 WHERE id=$1 RETURNING id, email, role, display_name, phone',
    [id, displayName, phone]
  )
  return result.rows[0] || null
}
