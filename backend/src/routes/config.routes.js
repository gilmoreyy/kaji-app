import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'
import { SNBT_DATE } from '../config/constants.js'

const router = Router()

router.get('/', requireAuth, (req, res) => {
  res.json({ snbt_date: SNBT_DATE })
})

export default router
