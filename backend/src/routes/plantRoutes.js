import { Router } from 'express'
import { authenticate, authorize } from '../middleware/authMiddleware.js'
import upload from '../middleware/uploadMiddleware.js'
import {
  createPlantController,
  getMyPlantsController,
  updateMyPlantController,
  deleteMyPlantController,
  getPendingPlantsController,
  verifyPlantController,
} from '../controllers/plantController.js'

const router = Router()

router.post('/', authenticate, authorize('seller'), upload.single('image'), createPlantController)
router.get('/my', authenticate, authorize('seller'), getMyPlantsController)
router.put('/:id', authenticate, authorize('seller'), upload.single('image'), updateMyPlantController)
router.delete('/:id', authenticate, authorize('seller'), deleteMyPlantController)

router.get('/admin/pending', authenticate, authorize('admin'), getPendingPlantsController)
router.patch('/admin/:id/verify', authenticate, authorize('admin'), verifyPlantController)

export default router
