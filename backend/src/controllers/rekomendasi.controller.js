import { assertOwnership } from './siswa.controller.js'
import { generateRekomendasi } from '../services/recommendation.service.js'

export async function getForSiswa(req, res) {
  const siswa = await assertOwnership(req.params.id, req.tutor.id_tutor)
  if (!siswa) return res.status(404).json({ message: 'Siswa tidak ditemukan' })

  const rekomendasi = await generateRekomendasi(siswa.id_siswa)
  res.json(rekomendasi)
}
