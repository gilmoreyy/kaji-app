import StudentAvatar from './StudentAvatar'
import './StudentListPanel.css'

export default function StudentListPanel({ siswaList, selectedId, onSelect, onAddClick }) {
  return (
    <div className="student-list-panel">
      <button className="add-student-btn" onClick={onAddClick}>
        <PlusIcon />
        Add Student
      </button>

      <div className="student-list">
        {siswaList.length === 0 && <p className="student-list-empty">Belum ada siswa.</p>}
        {siswaList.map((s) => (
          <button
            key={s.id_siswa}
            className={`student-list-item${s.id_siswa === selectedId ? ' active' : ''}`}
            onClick={() => onSelect(s.id_siswa)}
          >
            <StudentAvatar
              id_siswa={s.id_siswa}
              foto_profil_mimetype={s.foto_profil_mimetype}
              nama={s.nama}
              size={36}
              className="student-list-avatar"
            />
            <div className="student-list-info">
              <div className="student-list-nama">{s.nama}</div>
              <div className="student-list-sekolah">{s.asal_sekolah}</div>
              <div className="student-list-univ">{s.universitas_tujuan}</div>
            </div>
            <span className="student-list-badge">{s.jumlah_pertemuan}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

function PlusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 8v8M8 12h8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}
