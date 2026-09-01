import { useEffect, useState } from 'react'
import { apiFetch } from '../api/client'
import { LEGEND_SYMBOLS } from '../constants/topics'
import './Material.css'

// TODO: replace with actual teaching module PDF per material topic
const TEACHING_MODULE_FILE = '/assets/dummy/latihan-soal-mat-wajib-tka.pdf'
const TEACHING_MODULE_NAME = 'latihan-soal-mat-wajib-tka.pdf'

// Mock only — there's no "submission" feature/table backing this yet. Reused as-is
// for every bab tab until a real per-topic submission flow exists.
const SUBMITTED_BY_MOCK = [
  { nama: 'Nakeisha', tanggal: '3 Juli 2026', waktu: '09.15 WIB' },
  { nama: 'Kila', tanggal: '1 Juli 2026', waktu: '16.06 WIB' },
  { nama: 'Josie', tanggal: '10 Juli 2026', waktu: '02.12 WIB' },
  { nama: 'Atika', tanggal: '2 Juli 2026', waktu: '08.41 WIB' },
]

function initials(nama) {
  return nama
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}

export default function Material() {
  const [babList, setBabList] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    apiFetch('/bab')
      .then((list) => {
        setBabList(list)
        if (list.length > 0) setSelectedId(list[0].id_bab)
      })
      .catch((err) => setError(err.message))
  }, [])

  const selected = babList.find((b) => b.id_bab === selectedId)

  if (error) return <p className="material-error">{error}</p>

  return (
    <div className="material-page">
      <div className="material-breadcrumb">
        Material {selected && <> &gt; <span>{selected.nama_bab}</span></>}
      </div>

      <div className="material-body">
        <div className="material-tabs">
          {babList.map((b, i) => (
            <button
              key={b.id_bab}
              className={`material-tab${b.id_bab === selectedId ? ' active' : ''}`}
              onClick={() => setSelectedId(b.id_bab)}
            >
              <span className="material-tab-icon">{LEGEND_SYMBOLS[i] ?? '?'}</span>
              {b.nama_bab}
            </button>
          ))}
        </div>

        {selected ? (
          <>
            <div className="material-main">
              <div className="material-content">
                <h2>Material Summary</h2>
                <p className="material-summary">{selected.ringkasan || 'Belum ada ringkasan untuk bab ini.'}</p>
              </div>

              <div className="material-content">
                <div className="teaching-module-header">
                  <h2>Teaching Module</h2>
                  <a
                    href={TEACHING_MODULE_FILE}
                    download={TEACHING_MODULE_NAME}
                    className="module-icon-btn"
                    title="Download"
                  >
                    <DownloadIcon />
                  </a>
                </div>
                <a
                  href={TEACHING_MODULE_FILE}
                  target="_blank"
                  rel="noreferrer"
                  className="preview-module-btn"
                >
                  <EyeIcon /> Preview Module
                </a>
                <iframe src={TEACHING_MODULE_FILE} title="Teaching module preview" className="module-preview" />
              </div>
            </div>

            <div className="submitted-by-panel">
              <h2>Submitted by</h2>
              <div className="submitted-by-list">
                {SUBMITTED_BY_MOCK.map((s, i) => (
                  <div className="submitted-by-card" key={i}>
                    <div className="submitted-by-avatar">{initials(s.nama)}</div>
                    <div>
                      <div className="submitted-by-nama">{s.nama}</div>
                      <div className="submitted-by-meta">
                        {s.tanggal}
                        <br />
                        {s.waktu}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <p className="material-summary">Memuat...</p>
        )}
      </div>
    </div>
  )
}

function EyeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  )
}

function DownloadIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 4v12M7 11l5 5 5-5M4 20h16"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
