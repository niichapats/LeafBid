import { getPlantById } from '../models/plantModel.js'
import {
  createAuction as createAuctionModel,
  getAuctionById as getAuctionByIdModel,
  getActiveAuctions as getActiveAuctionsModel,
  placeBid as placeBidModel,
  endAuction as endAuctionModel,
  updateAuctionStatus as updateAuctionStatusModel,
} from '../models/auctionModel.js'

export async function createAuction(sellerId, plantId, startPrice, startTime, endTime) {
  if (Number(startPrice) <= 0) {
    throw new Error('Start price must be greater than 0')
  }

  const start = new Date(startTime)
  const end = new Date(endTime)
  if (!(end > start)) {
    throw new Error('End time must be after start time')
  }

  const plant = await getPlantById(plantId)
  if (!plant) {
    throw new Error('Plant not found')
  }

  if (plant.seller_id !== Number(sellerId)) {
    throw new Error('Unauthorized')
  }

  if (plant.status !== 'approved') {
    throw new Error('Plant must be approved before auction')
  }

  return createAuctionModel(plantId, startPrice, startTime, endTime)
}

export async function getActiveAuctions() {
  return getActiveAuctionsModel()
}

export async function getAuctionById(auctionId) {
  const auction = await getAuctionByIdModel(auctionId)
  if (!auction) {
    throw new Error('Auction not found')
  }
  return auction
}

export async function startAuction(auctionId, sellerId) {
  const auction = await getAuctionByIdModel(auctionId)
  if (!auction) {
    throw new Error('Auction not found')
  }

  return updateAuctionStatusModel(auctionId, 'active')
}

export async function placeBid(auctionId, buyerId, amount) {
  if (Number(amount) <= 0) {
    throw new Error('Invalid bid amount')
  }

  return placeBidModel(auctionId, buyerId, amount)
}

export async function endAuction(auctionId) {
  return endAuctionModel(auctionId)
}

export async function updateAuctionStatus(auctionId, status) {
  return updateAuctionStatusModel(auctionId, status)
}
