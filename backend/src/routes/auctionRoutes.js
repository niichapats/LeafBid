import { Router } from 'express'
import { authenticate, authorize } from '../middleware/authMiddleware.js'
import {
	createAuctionController,
	getActiveAuctionsController,
	getMyAuctionsController,
	getAuctionByIdController,
	startAuctionController,
	endAuctionController,
	deleteAuctionController,
	updateAuctionController,
} from '../controllers/auctionController.js'

const router = Router()

router.get('/', authenticate, getActiveAuctionsController)
router.get('/my', authenticate, authorize('seller'), getMyAuctionsController)
router.get('/:id', authenticate, getAuctionByIdController)

router.post('/', authenticate, authorize('seller'), createAuctionController)
router.patch('/:id/start', authenticate, authorize('seller'), startAuctionController)
router.put('/:id', authenticate, authorize('seller'), updateAuctionController)

router.patch('/:id/end', authenticate, authorize('seller', 'admin'), endAuctionController)
router.delete('/:id', authenticate, authorize('seller', 'admin'), deleteAuctionController)

export default router
