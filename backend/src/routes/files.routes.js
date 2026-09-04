import { Router } from 'express'
import { getFoto } from '../controllers/siswa.controller.js'
import { getAssignmentFile } from '../controllers/jadwal.controller.js'
import { asyncHandler } from '../utils/asyncHandler.js'

const router = Router()

// Publik (tanpa requireAuth): dipakai langsung di <img src>/<iframe> yang tidak bisa
// attach header Authorization. ID di path adalah UUID sehingga tidak predictable —
// perilaku ini menggantikan express.static('/uploads') yang punya karakteristik akses
// publik yang sama.
router.get('/siswa/:id/foto', asyncHandler(getFoto))
router.get('/siswa/:id/jadwal/:id_jadwal/assignment', asyncHandler(getAssignmentFile))

export default router
