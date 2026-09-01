import { useState } from 'react'
import { apiFetch } from '../api/client'
import './ScheduleClassModal.css'

const JENJANG_OPTIONS = ['Kelas 10', 'Kelas 11', 'Kelas 12', 'Gap Year']

export default function AddStudentModal({ onClose, onCreated }) {
  const [form, setForm] = useState({
    nama: '',
    jenjang: JENJANG_OPTIONS[2],
    asal_sekolah: '',
    universitas_tujuan: '',
    jurusan: '',
    email: '',
    no_hp: '',
  })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function set(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const created = await apiFetch('/siswa', { method: 'POST', body: form })
      onCreated(created.id_siswa)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <h2>Add Student</h2>

        <form onSubmit={handleSubmit}>
          <label>
            Nama
            <input value={form.nama} onChange={set('nama')} required />
          </label>
          <label>
            Jenjang
            <select value={form.jenjang} onChange={set('jenjang')}>
              {JENJANG_OPTIONS.map((j) => (
                <option key={j} value={j}>
                  {j}
                </option>
              ))}
            </select>
          </label>
          <label>
            Asal Sekolah
            <input value={form.asal_sekolah} onChange={set('asal_sekolah')} />
          </label>
          <label>
            Universitas Tujuan
            <input value={form.universitas_tujuan} onChange={set('universitas_tujuan')} />
          </label>
          <label>
            Jurusan
            <input value={form.jurusan} onChange={set('jurusan')} />
          </label>
          <label>
            Email
            <input type="email" value={form.email} onChange={set('email')} />
          </label>
          <label>
            No. HP
            <input value={form.no_hp} onChange={set('no_hp')} />
          </label>

          {error && <p className="modal-error">{error}</p>}

          <div className="modal-actions">
            <button type="button" className="modal-cancel" onClick={onClose}>
              Batal
            </button>
            <button type="submit" className="modal-submit" disabled={submitting}>
              {submitting ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
