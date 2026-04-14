import { getUserById, updateUserProfile } from '../models/userModel.js'

export async function getProfile(userId) {
  return getUserById(userId)
}

export async function updateProfile(userId, displayName, phone) {
  return updateUserProfile(userId, displayName, phone)
}
