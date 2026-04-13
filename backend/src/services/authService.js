import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { findByEmail, createUser } from '../models/userModel.js'

const VALID_ROLES = ['buyer', 'seller', 'admin']
const SALT_ROUNDS = 10
const TOKEN_EXPIRES_IN = '7d'
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_REGEX = /^0[0-9]{8,9}$/
const DISPLAY_NAME_REGEX = /^[a-zA-Z\s]+$/

export async function register(email, password, role, displayName, phone) {
  if (!VALID_ROLES.includes(role)) {
    throw new Error('Invalid role')
  }

  if (!EMAIL_REGEX.test(email)) {
    throw new Error('Invalid email format')
  }

  const hasValidPassword =
    password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password) && /[!@#$%^&*]/.test(password)

  if (!hasValidPassword) {
    throw new Error('Password must be at least 8 characters with uppercase, number, and special character')
  }

  if (!displayName?.trim()) {
    throw new Error('Display name is required')
  }

  const normalizedDisplayName = displayName.trim()
  if (normalizedDisplayName.length < 2 || !DISPLAY_NAME_REGEX.test(normalizedDisplayName)) {
    throw new Error('Display name must be at least 2 characters and contain only letters and spaces')
  }

  if (!phone?.trim()) {
    throw new Error('Phone is required')
  }

  const normalizedPhone = phone.trim()
  if (!PHONE_REGEX.test(normalizedPhone)) {
    throw new Error('Invalid phone number. Use format 08XXXXXXXX or 02XXXXXXX')
  }

  const existingUser = await findByEmail(email)
  if (existingUser) {
    throw new Error('Email already exists')
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS)
  const user = await createUser(email, passwordHash, role, normalizedDisplayName, normalizedPhone)

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
