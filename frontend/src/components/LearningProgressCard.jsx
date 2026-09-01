import { TOTAL_COLUMNS, LEGEND_SYMBOLS, statusForSkor } from '../constants/topics'
import './LearningProgressCard.css'

export default function LearningProgressCard({ progres }) {
  const rows = Array.from({ length: TOTAL_COLUMNS }).map((_, i) => {
    const p = progres[i]
    return {
      icon: LEGEND_SYMBOLS[i],
      nama_bab: p?.nama_bab,
      skor: p ? p.skor_bab : null,
    }
  })

  return (
    <div className="learning-card">
      <h2>Learning Progress</h2>

      <div className="learning-rows">
        {rows.map((row, i) => (
          <div className="learning-row" key={i}>
            <span className="learning-icon" title={row.nama_bab}>
              {row.icon}
            </span>
            <div className="learning-bar-track">
              {row.skor !== null && (
                <div className={`learning-bar-fill ${statusForSkor(row.skor)}`} style={{ width: `${row.skor}%` }} />
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="learning-axis">
        <span>0%</span>
        <span>25%</span>
        <span>50%</span>
        <span>75%</span>
        <span>100%</span>
      </div>
    </div>
  )
}
