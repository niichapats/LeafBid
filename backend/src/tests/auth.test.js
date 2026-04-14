import express from 'express'
import request from 'supertest'
import { beforeEach, describe, expect, it, jest } from '@jest/globals'

const registerMock = jest.fn()
const loginMock = jest.fn()

jest.unstable_mockModule('../services/authService.js', () => ({
  register: registerMock,
  login: loginMock,
}))

const { default: authRoutes } = await import('../routes/authRoutes.js')

function buildApp() {
  const app = express()
  app.use(express.json())
  app.use('/api/auth', authRoutes)
  return app
}

describe('Auth API integration', () => {
  beforeEach(() => {
    registerMock.mockReset()
    loginMock.mockReset()
  })

  it('POST /api/auth/register with valid data returns token', async () => {
    const app = buildApp()
    registerMock.mockResolvedValue('mock-register-token')

    const response = await request(app).post('/api/auth/register').send({
      email: 'buyer@test.com',
      password: 'Password1!',
      role: 'buyer',
      displayName: 'Buyer User',
      phone: '0812345678',
    })

    expect(response.status).toBe(201)
    expect(response.body).toEqual({ token: 'mock-register-token' })
  })

  it('POST /api/auth/register with duplicate email returns 400', async () => {
    const app = buildApp()
    registerMock.mockRejectedValue(new Error('Email already exists'))

    const response = await request(app).post('/api/auth/register').send({
      email: 'buyer@test.com',
      password: 'Password1!',
      role: 'buyer',
      displayName: 'Buyer User',
      phone: '0812345678',
    })

    expect(response.status).toBe(400)
    expect(response.body.error).toBe('Email already exists')
  })

  it('POST /api/auth/register with invalid password returns 400', async () => {
    const app = buildApp()
    registerMock.mockRejectedValue(new Error('Password must be at least 8 characters with uppercase, number, and special character'))

    const response = await request(app).post('/api/auth/register').send({
      email: 'buyer@test.com',
      password: 'weakpass',
      role: 'buyer',
      displayName: 'Buyer User',
      phone: '0812345678',
    })

    expect(response.status).toBe(400)
    expect(response.body.error).toBe('Password must be at least 8 characters with uppercase, number, and special character')
  })

  it('POST /api/auth/login with valid credentials returns token', async () => {
    const app = buildApp()
    loginMock.mockResolvedValue('mock-login-token')

    const response = await request(app).post('/api/auth/login').send({
      email: 'buyer@test.com',
      password: 'Password1!',
    })

    expect(response.status).toBe(200)
    expect(response.body).toEqual({ token: 'mock-login-token' })
  })

  it('POST /api/auth/login with wrong password returns 401', async () => {
    const app = buildApp()
    loginMock.mockRejectedValue(new Error('Invalid credentials'))

    const response = await request(app).post('/api/auth/login').send({
      email: 'buyer@test.com',
      password: 'WrongPassword1!',
    })

    expect(response.status).toBe(401)
    expect(response.body.error).toBe('Invalid credentials')
  })
})
