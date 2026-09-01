import prisma from '../config/db.js'
import { SNBT_DATE, FAKTOR_PRASYARAT_THRESHOLD } from '../config/constants.js'

const MS_PER_DAY = 1000 * 60 * 60 * 24

function faktorUrgensi(sisaHari) {
  if (sisaHari > 90) return 1
  if (sisaHari > 30) return 1.5
  return 2
}

function faktorPrasyarat(skorPrasyarat) {
  if (skorPrasyarat === null) return 1 // bab pertama, tidak ada prasyarat
  return skorPrasyarat >= FAKTOR_PRASYARAT_THRESHOLD ? 1 : 0.5
}

export async function generateRekomendasi(id_siswa) {
  const [babList, progresList] = await Promise.all([
    prisma.bab.findMany({ orderBy: { urutan_bab: 'asc' } }),
    prisma.progres_Siswa.findMany({ where: { id_siswa } }),
  ])

  const skorByBabId = new Map(progresList.map((p) => [p.id_bab, p.skor_bab]))
  const babByUrutan = new Map(babList.map((b) => [b.urutan_bab, b]))

  const sisaHari = Math.ceil((SNBT_DATE.getTime() - Date.now()) / MS_PER_DAY)
  const urgensi = faktorUrgensi(sisaHari)

  const scored = babList.map((bab) => {
    const skorBab = skorByBabId.get(bab.id_bab) ?? 0
    const babPrasyarat = babByUrutan.get(bab.urutan_bab - 1)
    const skorPrasyarat = babPrasyarat ? (skorByBabId.get(babPrasyarat.id_bab) ?? 0) : null
    const prasyarat = faktorPrasyarat(skorPrasyarat)

    return {
      id_bab: bab.id_bab,
      nama_bab: bab.nama_bab,
      skor_bab: skorBab,
      skor_prioritas: (100 - skorBab) * urgensi * prasyarat,
    }
  })

  const top3 = scored.sort((a, b) => b.skor_prioritas - a.skor_prioritas).slice(0, 3)

  await prisma.$transaction([
    prisma.rekomendasi.deleteMany({ where: { id_siswa } }),
    prisma.rekomendasi.createMany({
      data: top3.map((r) => ({
        id_siswa,
        id_bab: r.id_bab,
        skor_prioritas: r.skor_prioritas,
      })),
    }),
  ])

  return top3
}
