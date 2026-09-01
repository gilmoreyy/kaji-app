import { useState } from 'react'
import { apiFetch } from '../api/client'
import './StudentProfileCard.css'

function initials(nama) {
  return nama
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}

export default function StudentProfileCard({ siswa, onUpdated }) {
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState(toForm(siswa))
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

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

  return (
    <div className="profile-card">
      <div className="profile-header">
        <h2>Student Profile</h2>
      </div>

      <div className="profile-body">
        <div className="profile-avatar">{initials(siswa.nama)}</div>

        <div className="profile-fields">
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
