export function getScoreColor(score) {
  if (score >= 75) return 'green'
  if (score >= 70) return 'yellow'
  return 'red'
}
