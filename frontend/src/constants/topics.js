import { getScoreColor } from './score'

export const TOTAL_COLUMNS = 13

// Single source of truth for the 13-topic icon set, keyed by urutan_bab order.
// Matches Bab.nama_bab seeded in backend/prisma/seed.js — keep the two in sync.
export const LEGEND_SYMBOLS = [
  '÷', // 1. Operasi Bilangan
  '√x', // 2. Eksponen dan Logaritma
  'f(x)', // 3. Fungsi dan Persamaan Kuadrat
  '=', // 4. SPLDV
  '△', // 5. Bangun Datar
  '∠', // 6. Trigonometri Dasar
  '3D', // 7. Dimensi Tiga
  'Σ', // 8. Barisan dan Deret
  'μ', // 9. Statistika dan Penyajian Data
  '%', // 10. Peluang
  'Rp', // 11. Aritmatika Sosial
  '[ ]', // 12. Matriks dan Transformasi
  'lim', // 13. Limit dan Turunan Dasar
]

// getScoreColor (constants/score.js) is the single source of truth for score
// thresholds everywhere in the app (Meeting score, Dashboard grid, Learning
// Progress bars). This just adds the "not attempted yet" placeholder state on
// top of it for the 13-column grids.
export function statusForSkor(skor) {
  if (skor === null || skor === undefined) return 'empty'
  return getScoreColor(skor)
}
