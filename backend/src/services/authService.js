import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { findByEmail, createUser } from '../models/userModel.js'

const VALID_ROLES = ['buyer', 'seller', 'admin']
const SALT_ROUNDS = 10
const TOKEN_EXPIRES_IN = '7d'

export async function register(email, password, role) {
  if (!VALID_ROLES.includes(role)) {
    throw new Error('Invalid role')
  }

  const existingUser = await findByEmail(email)
  if (existingUser) {
    throw new Error('Email already exists')
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS)
  const user = await createUser(email, passwordHash, role)

  return jwt.sign(
    { userId: user.id, role: user.role, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: TOKEN_EXPIRES_IN }
  )
}

export async function login(email, password) {
  const user = await findByEmail(email)
  if (!user) {
    throw new Error('Invalid credentials')
  }

  const isMatch = await bcrypt.compare(password, user.password_hash)
  if (!isMatch) {
    throw new Error('Invalid credentials')
  }

  return jwt.sign(
    { userId: user.id, role: user.role, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: TOKEN_EXPIRES_IN }
  )
}
