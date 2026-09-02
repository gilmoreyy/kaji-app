import prisma from '../config/db.js'
import { SNBT_DATE, FAKTOR_PRASYARAT_THRESHOLD } from '../config/constants.js'
import { getScoreColor } from '../utils/score.js'

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

// Lapis navigasi "bab selanjutnya" (terpisah dari skor_prioritas di atas).
// Telusuri bab urut 1..13 dengan pointer maju satu arah:
//   - merah (skor <70)  -> berhenti total di bab ini (belum dikuasai, harus diulang dulu).
//   - kuning (skor 70-74, ATAU skor >=75 tapi bab sebelumnya belum capai
//     FAKTOR_PRASYARAT_THRESHOLD sehingga status hijau-nya "rapuh") -> dicatat ke
//     daftar kuning untuk direview, tapi TIDAK menghentikan penelusuran; pointer
//     tetap maju ke bab berikutnya.
//   - hijau murni (skor >=75 dan prasyarat terpenuhi) -> lanjut ke bab berikutnya.
// Kalau penelusuran sampai bab terakhir (urutan 13) tanpa pernah ketemu merah,
// tidak ada lagi "bab berikutnya" untuk maju -> sesuai rule "kalau bab terakhir
// dapat hijau/kuning, kembali ke bab yang masih kuning", jatuhkan ke bab kuning
// dengan skor terendah di daftar. Kalau daftar kuning kosong juga, berarti semua
// 13 bab benar-benar hijau tuntas -> tidak ada rekomendasi (null).
export async function getBabSelanjutnya(id_siswa) {
  const [babList, progresList] = await Promise.all([
    prisma.bab.findMany({ orderBy: { urutan_bab: 'asc' } }),
    prisma.progres_Siswa.findMany({ where: { id_siswa } }),
  ])
  const skorByBabId = new Map(progresList.map((p) => [p.id_bab, p.skor_bab]))

  const kuningList = []
  let skorBabSebelumnya = null

  for (const bab of babList) {
    const skorBab = skorByBabId.get(bab.id_bab) ?? 0
    const ownColor = getScoreColor(skorBab)
    const status =
      ownColor === 'green' && skorBabSebelumnya !== null && skorBabSebelumnya < FAKTOR_PRASYARAT_THRESHOLD
        ? 'yellow'
        : ownColor

    if (status === 'red') {
      return { id_bab: bab.id_bab, nama_bab: bab.nama_bab, skor_bab: skorBab, status }
    }
    if (status === 'yellow') {
      kuningList.push({ id_bab: bab.id_bab, nama_bab: bab.nama_bab, skor_bab: skorBab, status })
    }

    skorBabSebelumnya = skorBab
  }

  return kuningList.sort((a, b) => a.skor_bab - b.skor_bab)[0] ?? null
}
