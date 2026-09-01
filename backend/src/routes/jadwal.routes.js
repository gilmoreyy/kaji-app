import { Router } from 'express'
import { listAll } from '../controllers/jadwal.controller.js'
import { requireAuth } from '../middleware/auth.js'
import { asyncHandler } from '../utils/asyncHandler.js'

const router = Router()

router.get('/', requireAuth, asyncHandler(listAll))

export default router
