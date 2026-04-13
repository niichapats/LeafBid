import { register, login } from '../services/authService.js'

export async function registerController(req, res) {
  const { email, password, role, displayName, phone } = req.body

  if (!email || !password || !role || !displayName || !phone) {
    return res.status(400).json({ error: 'All fields are required' })
  }

  try {
    const token = await register(email, password, role, displayName, phone)
    return res.status(201).json({ token })
  } catch (err) {
    return res.status(400).json({ error: err.message })
  }
}

export async function loginController(req, res) {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ error: 'email and password are required' })
  }

  try {
    const token = await login(email, password)
    return res.status(200).json({ token })
  } catch (err) {
    return res.status(401).json({ error: err.message })
  }
}
