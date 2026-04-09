import {
  createPlant as createPlantModel,
  getPlantById,
  getPlantsBySeller,
  getPendingPlants as getPendingPlantsModel,
  updatePlant as updatePlantModel,
  updatePlantStatus,
  deletePlant as deletePlantModel,
} from '../models/plantModel.js'

export async function createPlant(sellerId, title, description, imageUrl) {
  if (!title || title.trim() === '') {
    throw new Error('Title is required')
  }

  return createPlantModel(sellerId, title, description, imageUrl)
}

export async function getMyPlants(sellerId) {
  return getPlantsBySeller(sellerId)
}

export async function updateMyPlant(plantId, sellerId, title, description, imageUrl) {
  if (!title || title.trim() === '') {
    throw new Error('Title is required')
  }

  const result = await updatePlantModel(plantId, sellerId, title, description, imageUrl)
  if (!result) {
    throw new Error('Plant not found or unauthorized')
  }

  return result
}

export async function deleteMyPlant(plantId, sellerId) {
  const result = await deletePlantModel(plantId, sellerId)
  if (!result) {
    throw new Error('Plant not found or unauthorized')
  }

  return result
}

export async function getPendingPlants() {
  return getPendingPlantsModel()
}

export async function verifyPlant(plantId, status) {
  if (status !== 'approved' && status !== 'rejected') {
    throw new Error('Invalid status')
  }

  const result = await updatePlantStatus(plantId, status)
  if (!result) {
    throw new Error('Plant not found')
  }

  return result
}
