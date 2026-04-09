import {
  createPlant,
  getMyPlants,
  updateMyPlant,
  deleteMyPlant,
  getPendingPlants,
  verifyPlant,
} from '../services/plantService.js'

export async function createPlantController(req, res) {
  const { title, description, imageUrl } = req.body

  if (!title) {
    return res.status(400).json({ error: 'Title is required' })
  }

  const sellerId = req.user.userId

  try {
    const result = await createPlant(sellerId, title, description, imageUrl)
    return res.status(201).json(result)
  } catch (err) {
    return res.status(400).json({ error: err.message })
  }
}

export async function getMyPlantsController(req, res) {
  const sellerId = req.user.userId

  try {
    const result = await getMyPlants(sellerId)
    return res.status(200).json(result)
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}

export async function updateMyPlantController(req, res) {
  const plantId = req.params.id
  const sellerId = req.user.userId
  const { title, description, imageUrl } = req.body

  try {
    const result = await updateMyPlant(plantId, sellerId, title, description, imageUrl)
    return res.status(200).json(result)
  } catch (err) {
    return res.status(400).json({ error: err.message })
  }
}

export async function deleteMyPlantController(req, res) {
  const plantId = req.params.id
  const sellerId = req.user.userId

  try {
    await deleteMyPlant(plantId, sellerId)
    return res.status(200).json({ message: 'Plant deleted' })
  } catch (err) {
    return res.status(400).json({ error: err.message })
  }
}

export async function getPendingPlantsController(req, res) {
  try {
    const result = await getPendingPlants()
    return res.status(200).json(result)
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}

export async function verifyPlantController(req, res) {
  const plantId = req.params.id
  const { status } = req.body

  if (!status) {
    return res.status(400).json({ error: 'Status is required' })
  }

  try {
    const result = await verifyPlant(plantId, status)
    return res.status(200).json(result)
  } catch (err) {
    return res.status(400).json({ error: err.message })
  }
}
