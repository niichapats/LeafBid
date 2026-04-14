import { getProfile, updateProfile } from '../services/profileService.js'

export async function getProfileController(req, res) {
  const userId = req.user.userId

  try {
    const result = await getProfile(userId)
    if (!result) {
      return res.status(404).json({ error: 'User not found' })
    }
    return res.status(200).json(result)
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}

export async function updateProfileController(req, res) {
  const userId = req.user.userId
  const { displayName, phone } = req.body

  try {
    const result = await updateProfile(userId, displayName, phone)
    return res.status(200).json(result)
  } catch (err) {
    return res.status(400).json({ error: err.message })
  }
}
