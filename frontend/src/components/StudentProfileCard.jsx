import { useRef, useState } from 'react'
import { apiFetch } from '../api/client'
import StudentAvatar from './StudentAvatar'
import './StudentProfileCard.css'

export default function StudentProfileCard({ siswa, onUpdated }) {
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState(toForm(siswa))
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [uploadingFoto, setUploadingFoto] = useState(false)
  const fileInputRef = useRef(null)

  function toForm(s) {
    return {
      nama: s.nama,
      asal_sekolah: s.asal_sekolah,
      email: s.email ?? '',
      no_hp: s.no_hp ?? '',
      universitas_tujuan: s.universitas_tujuan,
      jurusan: s.jurusan ?? '',
    }
  }

  function startEdit() {
    setForm(toForm(siswa))
    setError('')
    setEditing(true)
  }

  function set(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }))
  }

  async function handleSave(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await apiFetch(`/siswa/${siswa.id_siswa}`, { method: 'PUT', body: form })
      setEditing(false)
      onUpdated()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleFotoChange(e) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    setError('')
    setUploadingFoto(true)
    try {
      const body = new FormData()
      body.append('foto', file)
      await apiFetch(`/siswa/${siswa.id_siswa}/foto`, { method: 'POST', body })
      onUpdated()
    } catch (err) {
      setError(err.message)
    } finally {
      setUploadingFoto(false)
    }
  }

  return (
    <div className="profile-card">
      <div className="profile-header">
        <h2>Student Profile</h2>
      </div>

      <div className="profile-body">
        <div className="profile-avatar-wrap">
          <StudentAvatar
            id_siswa={siswa.id_siswa}
            foto_profil_mimetype={siswa.foto_profil_mimetype}
            nama={siswa.nama}
            size={64}
            className="profile-avatar"
          />
          <button
            type="button"
            className="profile-avatar-edit"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingFoto}
            title="Ganti foto"
          >
            <CameraIcon />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            hidden
            onChange={handleFotoChange}
          />
        </div>

        <div className="profile-fields">
          {!editing && error && <p className="profile-error">{error}</p>}
          {editing ? (
            <form onSubmit={handleSave} className="profile-form">
              <div className="profile-form-grid">
                <label>
                  Nama
                  <input value={form.nama} onChange={set('nama')} required />
                </label>
                <label>
                  Sekolah
                  <input value={form.asal_sekolah} onChange={set('asal_sekolah')} />
                </label>
                <label>
                  Email
                  <input type="email" value={form.email} onChange={set('email')} />
                </label>
                <label>
                  HP
                  <input value={form.no_hp} onChange={set('no_hp')} />
                </label>
                <label>
                  Universitas
                  <input value={form.universitas_tujuan} onChange={set('universitas_tujuan')} />
                </label>
                <label>
                  Jurusan
                  <input value={form.jurusan} onChange={set('jurusan')} />
                </label>
              </div>
              {error && <p className="profile-error">{error}</p>}
              <div className="profile-form-actions">
                <button type="button" onClick={() => setEditing(false)} className="profile-cancel">
                  Batal
                </button>
                <button type="submit" className="profile-save" disabled={submitting}>
                  {submitting ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          ) : (
            <>
              <div className="profile-section">
                <h3>Personal Data</h3>
                <dl>
                  <dt>Nama</dt>
                  <dd>{siswa.nama}</dd>
                  <dt>Sekolah</dt>
                  <dd>{siswa.asal_sekolah || '-'}</dd>
                  <dt>Email</dt>
                  <dd>{siswa.email || '-'}</dd>
                  <dt>HP</dt>
                  <dd>{siswa.no_hp || '-'}</dd>
                </dl>
              </div>
              <div className="profile-section">
                <h3>Goal</h3>
                <dl>
                  <dt>Universitas</dt>
                  <dd>{siswa.universitas_tujuan || '-'}</dd>
                  <dt>Jurusan</dt>
                  <dd>{siswa.jurusan || '-'}</dd>
                </dl>
              </div>
              <button className="profile-edit-btn" onClick={startEdit}>
                Edit
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function CameraIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path
        d="M4 8h3l1.5-2h7L17 8h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="13" r="3.2" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  )
}
