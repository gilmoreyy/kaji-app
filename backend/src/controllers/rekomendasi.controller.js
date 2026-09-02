import { assertOwnership } from './siswa.controller.js'
import { generateRekomendasi, getBabSelanjutnya } from '../services/recommendation.service.js'

export async function getForSiswa(req, res) {
  const siswa = await assertOwnership(req.params.id, req.tutor.id_tutor)
  if (!siswa) return res.status(404).json({ message: 'Siswa tidak ditemukan' })

  const [rekomendasi, bab_selanjutnya] = await Promise.all([
    generateRekomendasi(siswa.id_siswa),
    getBabSelanjutnya(siswa.id_siswa),
  ])
  res.json({ rekomendasi, bab_selanjutnya })
}
