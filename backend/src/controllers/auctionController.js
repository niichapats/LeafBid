import {
	createAuction,
	getActiveAuctions,
	getAuctionById,
	startAuction,
	endAuction,
} from '../services/auctionService.js'

export async function createAuctionController(req, res) {
	const { plantId, startPrice, startTime, endTime } = req.body

	if (!plantId || !startPrice || !startTime || !endTime) {
		return res.status(400).json({ error: 'All fields are required' })
	}

	const sellerId = req.user.userId

	try {
		const result = await createAuction(sellerId, plantId, startPrice, startTime, endTime)
		return res.status(201).json(result)
	} catch (err) {
		return res.status(400).json({ error: err.message })
	}
}

export async function getActiveAuctionsController(req, res) {
	try {
		const result = await getActiveAuctions()
		return res.status(200).json(result)
	} catch (err) {
		return res.status(500).json({ error: err.message })
	}
}

export async function getAuctionByIdController(req, res) {
	const auctionId = req.params.id

	try {
		const result = await getAuctionById(auctionId)
		return res.status(200).json(result)
	} catch (err) {
		return res.status(404).json({ error: err.message })
	}
}

export async function startAuctionController(req, res) {
	const auctionId = req.params.id
	const sellerId = req.user.userId

	try {
		const result = await startAuction(auctionId, sellerId)
		return res.status(200).json(result)
	} catch (err) {
		return res.status(400).json({ error: err.message })
	}
}

export async function endAuctionController(req, res) {
	const auctionId = req.params.id

	try {
		const result = await endAuction(auctionId)
		return res.status(200).json(result)
	} catch (err) {
		return res.status(400).json({ error: err.message })
	}
}
