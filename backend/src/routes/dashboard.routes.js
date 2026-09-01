import { Router } from 'express'
import { overview } from '../controllers/dashboard.controller.js'
import { requireAuth } from '../middleware/auth.js'
import { asyncHandler } from '../utils/asyncHandler.js'

const router = Router()

router.get('/', requireAuth, asyncHandler(overview))

export default router
