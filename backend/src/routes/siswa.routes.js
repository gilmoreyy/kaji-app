import { Router } from 'express'
import {
  list,
  detail,
  create,
  update,
  remove,
  getProgres,
  upsertProgres,
  uploadFoto,
  uploadFotoMiddleware,
} from '../controllers/siswa.controller.js'
import {
  listBySiswa as listJadwalBySiswa,
  create as createJadwal,
  detail as detailJadwal,
  update as updateJadwal,
  uploadAssignment,
  uploadAssignmentMiddleware,
} from '../controllers/jadwal.controller.js'
import { getForSiswa as getRekomendasiForSiswa } from '../controllers/rekomendasi.controller.js'
import { requireAuth } from '../middleware/auth.js'
import { asyncHandler } from '../utils/asyncHandler.js'

const router = Router()
router.use(requireAuth)

router.get('/', asyncHandler(list))
router.post('/', asyncHandler(create))
router.get('/:id', asyncHandler(detail))
router.put('/:id', asyncHandler(update))
router.delete('/:id', asyncHandler(remove))
router.post('/:id/foto', uploadFotoMiddleware, asyncHandler(uploadFoto))

router.get('/:id/progres', asyncHandler(getProgres))
router.put('/:id/progres/:id_bab', asyncHandler(upsertProgres))

router.get('/:id/jadwal', asyncHandler(listJadwalBySiswa))
router.post('/:id/jadwal', asyncHandler(createJadwal))
router.get('/:id/jadwal/:id_jadwal', asyncHandler(detailJadwal))
router.put('/:id/jadwal/:id_jadwal', asyncHandler(updateJadwal))
router.post(
  '/:id/jadwal/:id_jadwal/assignment',
  uploadAssignmentMiddleware,
  asyncHandler(uploadAssignment),
)

router.get('/:id/rekomendasi', asyncHandler(getRekomendasiForSiswa))

export default router
