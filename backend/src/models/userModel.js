import pool from '../database/db.js'

const VALID_ROLES = ['buyer', 'seller', 'admin']

export async function findByEmail(email) {
  const result = await pool.query('SELECT * FROM users WHERE email = $1', [email])
  return result.rows[0] || null
}

export async function createUser(email, passwordHash, role) {
  if (!VALID_ROLES.includes(role)) {
    throw new Error('Invalid role')
  }

  const result = await pool.query(
    'INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3) RETURNING *',
    [email, passwordHash, role]
  )

  return result.rows[0]
}
