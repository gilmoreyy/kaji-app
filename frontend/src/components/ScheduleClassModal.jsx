import { useState } from 'react'
import { apiFetch } from '../api/client'
import './ScheduleClassModal.css'

export default function ScheduleClassModal({ siswaList, onClose, onScheduled }) {
  const [idSiswa, setIdSiswa] = useState(siswaList[0]?.id_siswa ?? '')
  const [tanggal, setTanggal] = useState('')
  const [waktu, setWaktu] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!idSiswa) {
      setError('Pilih siswa dulu')
      return
    }
    setSubmitting(true)
    try {
      await apiFetch(`/siswa/${idSiswa}/jadwal`, {
        method: 'POST',
        body: { tanggal_pertemuan: tanggal, waktu_pertemuan: waktu },
      })
      onScheduled()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <h2>Schedule a class</h2>

        {siswaList.length === 0 ? (
          <p className="modal-empty">Belum ada siswa. Tambahkan siswa dulu di halaman Student.</p>
        ) : (
          <form onSubmit={handleSubmit}>
            <label>
              Siswa
              <select value={idSiswa} onChange={(e) => setIdSiswa(e.target.value)}>
                {siswaList.map((s) => (
                  <option key={s.id_siswa} value={s.id_siswa}>
                    {s.nama}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Tanggal
              <input type="date" value={tanggal} onChange={(e) => setTanggal(e.target.value)} required />
            </label>
            <label>
              Waktu
              <input type="time" value={waktu} onChange={(e) => setWaktu(e.target.value)} required />
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
        )}
      </div>
    </div>
  )
}
