import multer from 'multer'
import prisma from '../config/db.js'
import { assertOwnership } from './siswa.controller.js'
import { generateRekomendasi, getBabSelanjutnya } from '../services/recommendation.service.js'

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== 'application/pdf') {
      return cb(new Error('File harus berformat PDF'))
    }
    cb(null, true)
  },
})

export const uploadAssignmentMiddleware = upload.single('file')

async function findJadwalForSiswa(id_siswa, id_jadwal) {
  const jadwal = await prisma.jadwal_Pertemuan.findUnique({ where: { id_jadwal } })
  if (!jadwal || jadwal.id_siswa !== id_siswa) return null
  return jadwal
}

async function meetingNumberFor(id_siswa, id_jadwal) {
  const semua = await prisma.jadwal_Pertemuan.findMany({
    where: { id_siswa },
    orderBy: { tanggal_pertemuan: 'asc' },
    select: { id_jadwal: true },
  })
  return semua.findIndex((j) => j.id_jadwal === id_jadwal) + 1
}

export async function listBySiswa(req, res) {
  const siswa = await assertOwnership(req.params.id, req.tutor.id_tutor)
  if (!siswa) return res.status(404).json({ message: 'Siswa tidak ditemukan' })

  const jadwal = await prisma.jadwal_Pertemuan.findMany({
    where: { id_siswa: siswa.id_siswa },
    include: { bab: true },
    orderBy: { tanggal_pertemuan: 'desc' },
  })
  res.json(jadwal)
}

export async function create(req, res) {
  const siswa = await assertOwnership(req.params.id, req.tutor.id_tutor)
  if (!siswa) return res.status(404).json({ message: 'Siswa tidak ditemukan' })

  const { tanggal_pertemuan, waktu_pertemuan } = req.body
  if (!tanggal_pertemuan || !waktu_pertemuan) {
    return res.status(400).json({ message: 'tanggal_pertemuan dan waktu_pertemuan wajib diisi' })
  }

  // generateRekomendasi hanya mengurutkan prioritas (dipakai utk daftar
  // review); bab_selanjutnya dari getBabSelanjutnya adalah yang menegakkan
  // aturan "merah -> tetap di bab itu, kuning/hijau -> boleh lanjut", jadi itu
  // yang menentukan id_bab jadwal baru. Fallback ke top3 prioritas hanya kalau
  // semua bab sudah hijau tuntas (getBabSelanjutnya mengembalikan null).
  const [rekomendasi, babSelanjutnya] = await Promise.all([
    generateRekomendasi(siswa.id_siswa),
    getBabSelanjutnya(siswa.id_siswa),
  ])

  const jadwal = await prisma.jadwal_Pertemuan.create({
    data: {
      id_siswa: siswa.id_siswa,
      tanggal_pertemuan: new Date(tanggal_pertemuan),
      waktu_pertemuan,
      id_bab: babSelanjutnya?.id_bab ?? rekomendasi[0]?.id_bab ?? null,
    },
  })
  res.status(201).json(jadwal)
}

export async function detail(req, res) {
  const siswa = await assertOwnership(req.params.id, req.tutor.id_tutor)
  if (!siswa) return res.status(404).json({ message: 'Siswa tidak ditemukan' })

  const jadwal = await findJadwalForSiswa(siswa.id_siswa, req.params.id_jadwal)
  if (!jadwal) return res.status(404).json({ message: 'Jadwal tidak ditemukan' })

  const [bab, meeting_number] = await Promise.all([
    jadwal.id_bab ? prisma.bab.findUnique({ where: { id_bab: jadwal.id_bab } }) : null,
    meetingNumberFor(siswa.id_siswa, jadwal.id_jadwal),
  ])

  res.json({ ...jadwal, nama_siswa: siswa.nama, nama_bab: bab?.nama_bab ?? null, meeting_number })
}

export async function update(req, res) {
  const siswa = await assertOwnership(req.params.id, req.tutor.id_tutor)
  if (!siswa) return res.status(404).json({ message: 'Siswa tidak ditemukan' })

  const jadwal = await findJadwalForSiswa(siswa.id_siswa, req.params.id_jadwal)
  if (!jadwal) return res.status(404).json({ message: 'Jadwal tidak ditemukan' })

  const { tanggal_pertemuan, waktu_pertemuan, id_bab, skor, catatan } = req.body
  const updated = await prisma.jadwal_Pertemuan.update({
    where: { id_jadwal: jadwal.id_jadwal },
    data: {
      tanggal_pertemuan: tanggal_pertemuan ? new Date(tanggal_pertemuan) : undefined,
      waktu_pertemuan,
      id_bab: id_bab === undefined ? undefined : id_bab === null ? null : Number(id_bab),
      skor: skor === undefined ? undefined : skor === null ? null : Number(skor),
      catatan,
    },
  })

  // The meeting score is what actually reflects a student's current mastery of a bab —
  // cascade it into Progres_Siswa so Dashboard/Learning Progress/the recommendation
  // engine (which all read skor_bab, never Jadwal_Pertemuan.skor) pick it up immediately.
  if (skor !== undefined && skor !== null && updated.id_bab) {
    await prisma.progres_Siswa.upsert({
      where: { id_siswa_id_bab: { id_siswa: updated.id_siswa, id_bab: updated.id_bab } },
      update: { skor_bab: Number(skor) },
      create: { id_siswa: updated.id_siswa, id_bab: updated.id_bab, skor_bab: Number(skor) },
    })
  }

  res.json(updated)
}

export async function uploadAssignment(req, res) {
  const siswa = await assertOwnership(req.params.id, req.tutor.id_tutor)
  if (!siswa) return res.status(404).json({ message: 'Siswa tidak ditemukan' })

  const jadwal = await findJadwalForSiswa(siswa.id_siswa, req.params.id_jadwal)
  if (!jadwal) return res.status(404).json({ message: 'Jadwal tidak ditemukan' })

  if (!req.file) return res.status(400).json({ message: 'File PDF wajib diunggah' })

  const updated = await prisma.jadwal_Pertemuan.update({
    where: { id_jadwal: jadwal.id_jadwal },
    data: {
      assignment_nama_file: req.file.originalname,
      assignment_data: req.file.buffer,
    },
  })
  res.json(updated)
}

export async function getAssignmentFile(req, res) {
  const jadwal = await prisma.jadwal_Pertemuan.findUnique({
    where: { id_jadwal: req.params.id_jadwal },
    select: { id_siswa: true, assignment_data: true, assignment_nama_file: true },
  })
  if (!jadwal || jadwal.id_siswa !== req.params.id || !jadwal.assignment_data) {
    return res.status(404).end()
  }

  res.set('Content-Type', 'application/pdf')
  res.set('Content-Disposition', `inline; filename="${jadwal.assignment_nama_file}"`)
  res.send(Buffer.from(jadwal.assignment_data))
}

export async function listAll(req, res) {
  const id_tutor = req.tutor.id_tutor
  const month = Number(req.query.month)
  const year = Number(req.query.year)

  const where = { siswa: { id_tutor } }
  if (Number.isInteger(month) && Number.isInteger(year)) {
    const start = new Date(Date.UTC(year, month - 1, 1))
    const end = new Date(Date.UTC(year, month, 1))
    where.tanggal_pertemuan = { gte: start, lt: end }
  }

  const jadwal = await prisma.jadwal_Pertemuan.findMany({
    where,
    include: { siswa: true },
    orderBy: { tanggal_pertemuan: 'asc' },
  })

  res.json(
    jadwal.map((j) => ({
      id_jadwal: j.id_jadwal,
      id_siswa: j.id_siswa,
      nama_siswa: j.siswa.nama,
      tanggal_pertemuan: j.tanggal_pertemuan,
      waktu_pertemuan: j.waktu_pertemuan,
    })),
  )
}
