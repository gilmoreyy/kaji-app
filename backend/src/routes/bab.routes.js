import { Router } from 'express'
import { list } from '../controllers/bab.controller.js'
import { requireAuth } from '../middleware/auth.js'
import { asyncHandler } from '../utils/asyncHandler.js'

const router = Router()

router.get('/', requireAuth, asyncHandler(list))

export default router
