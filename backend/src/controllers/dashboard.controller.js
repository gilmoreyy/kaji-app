import prisma from '../config/db.js'
import { generateRekomendasi } from '../services/recommendation.service.js'
import { SNBT_DATE } from '../config/constants.js'

const UPCOMING_LIMIT = 10

export async function overview(req, res) {
  const id_tutor = req.tutor.id_tutor

  const [babList, siswaList] = await Promise.all([
    prisma.bab.findMany({ orderBy: { urutan_bab: 'asc' } }),
    prisma.siswa.findMany({
      where: { id_tutor },
      include: { progres: true },
      orderBy: { nama: 'asc' },
    }),
  ])

  // Every student (Atika included — there is no per-student special-casing or mock
  // data path here) is read from the same Progres_Siswa rows, mapped the exact same
  // way siswa.controller.js's detail() builds `progres` for the Student page. That's
  // what guarantees this grid and a student's own Learning Progress bar can never
  // drift apart: editing a score anywhere (e.g. via the Meeting page's skor cascade
  // in jadwal.controller.js) updates Progres_Siswa once, and both views re-read it.
  const siswa_progress = siswaList.map((s) => {
    const skorByBabId = new Map(s.progres.map((p) => [p.id_bab, p.skor_bab]))
    return {
      id_siswa: s.id_siswa,
      nama: s.nama,
      jenjang: s.jenjang,
      progres: babList.map((bab) => ({
        id_bab: bab.id_bab,
        urutan_bab: bab.urutan_bab,
        nama_bab: bab.nama_bab,
        skor_bab: skorByBabId.has(bab.id_bab) ? skorByBabId.get(bab.id_bab) : null,
      })),
    }
  })

  const startOfToday = new Date()
  startOfToday.setHours(0, 0, 0, 0)

  const jadwalMendatang = await prisma.jadwal_Pertemuan.findMany({
    where: {
      tanggal_pertemuan: { gte: startOfToday },
      siswa: { id_tutor },
    },
    include: { siswa: true },
    orderBy: { tanggal_pertemuan: 'asc' },
    take: UPCOMING_LIMIT,
  })

  const idSiswaTerlibat = [...new Set(jadwalMendatang.map((j) => j.id_siswa))]
  const semuaJadwalSiswaTerlibat = idSiswaTerlibat.length
    ? await prisma.jadwal_Pertemuan.findMany({
        where: { id_siswa: { in: idSiswaTerlibat } },
        orderBy: { tanggal_pertemuan: 'asc' },
      })
    : []

  const meetingNumberByJadwalId = new Map()
  for (const id_siswa of idSiswaTerlibat) {
    const jadwalSiswa = semuaJadwalSiswaTerlibat.filter((j) => j.id_siswa === id_siswa)
    jadwalSiswa.forEach((j, index) => {
      meetingNumberByJadwalId.set(j.id_jadwal, index + 1)
    })
  }

  const upcoming_class = await Promise.all(
    jadwalMendatang.map(async (j) => {
      const rekomendasi = await generateRekomendasi(j.id_siswa)
      return {
        id_jadwal: j.id_jadwal,
        id_siswa: j.id_siswa,
        nama_siswa: j.siswa.nama,
        tanggal_pertemuan: j.tanggal_pertemuan,
        waktu_pertemuan: j.waktu_pertemuan,
        meeting_number: meetingNumberByJadwalId.get(j.id_jadwal),
        topik: rekomendasi[0]?.nama_bab ?? null,
        rekomendasi,
      }
    }),
  )

  res.json({
    snbt_date: SNBT_DATE,
    siswa_progress,
    upcoming_class,
  })
}
