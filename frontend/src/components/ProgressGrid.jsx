import { Fragment } from 'react'
import { TOTAL_COLUMNS, LEGEND_SYMBOLS, statusForSkor } from '../constants/topics'
import StudentAvatar from './StudentAvatar'
import './ProgressGrid.css'

export default function ProgressGrid({ siswaProgress }) {
  const babCount = siswaProgress[0]?.progres.length ?? 0
  const placeholderCount = Math.max(0, TOTAL_COLUMNS - babCount)

  return (
    <div className="progress-card">
      {siswaProgress.length === 0 ? (
        <p className="progress-empty">Belum ada siswa. Tambahkan siswa dulu di halaman Student.</p>
      ) : (
        <div className="progress-body">
          <div className="progress-grid-table">
            <div className="progress-divider" />
            {siswaProgress.map((s) => (
              <Fragment key={s.id_siswa}>
                <StudentAvatar
                  foto_profil={s.foto_profil}
                  nama={s.nama}
                  size={44}
                  className="progress-avatar"
                />
                <div className="progress-cells">
                  {s.progres.map((p) => (
                    <span
                      key={p.id_bab}
                      className={`progress-cell ${statusForSkor(p.skor_bab)}`}
                      title={p.nama_bab}
                    />
                  ))}
                  {Array.from({ length: placeholderCount }).map((_, i) => (
                    <span key={`placeholder-${i}`} className="progress-cell empty" />
                  ))}
                </div>
              </Fragment>
            ))}
          </div>
        </div>
      )}

      <div className="progress-legend">
        {Array.from({ length: TOTAL_COLUMNS }).map((_, i) => {
          const bab = siswaProgress[0]?.progres[i]
          return (
            <span key={i} className="progress-legend-icon" title={bab?.nama_bab}>
              {LEGEND_SYMBOLS[i] ?? '?'}
            </span>
          )
        })}
      </div>
    </div>
  )
}
