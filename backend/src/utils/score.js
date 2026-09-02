// Satu-satunya sumber kebenaran ambang skor -> status warna, dipakai di
// recommendation.service.js (navigasi bab selanjutnya). Ambang 75 harus selalu
// sinkron dengan FAKTOR_PRASYARAT_THRESHOLD di config/constants.js, dan definisi
// ini harus selalu sinkron dengan frontend/src/constants/score.js.
export function getScoreColor(score) {
  if (score >= 75) return 'green'
  if (score >= 70) return 'yellow'
  return 'red'
}
