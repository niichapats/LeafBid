import { Router } from 'express'
import { authenticate, authorize } from '../middleware/authMiddleware.js'
import {
	createAuctionController,
	getActiveAuctionsController,
	getAuctionByIdController,
	startAuctionController,
	endAuctionController,
} from '../controllers/auctionController.js'

const router = Router()

router.get('/', authenticate, getActiveAuctionsController)
router.get('/:id', authenticate, getAuctionByIdController)

router.post('/', authenticate, authorize('seller'), createAuctionController)
router.patch('/:id/start', authenticate, authorize('seller'), startAuctionController)

router.patch('/:id/end', authenticate, authorize('admin'), endAuctionController)

export default router
