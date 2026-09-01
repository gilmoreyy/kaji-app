import { useState } from 'react'
import { apiFetch } from '../api/client'
import { useAuth } from '../context/AuthContext'
import './Settings.css'

function AccountInfoCard() {
  const { tutor, refreshTutor } = useAuth()
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState(null)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function startEdit() {
    setForm({
      username: tutor.username ?? '',
      display_name: tutor.display_name ?? '',
      email: tutor.email ?? '',
      nama: tutor.nama ?? '',
      no_hp: tutor.no_hp ?? '',
      gender: tutor.gender ?? '',
      kata_sandi: '',
    })
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
      const body = { ...form }
      if (!body.kata_sandi) delete body.kata_sandi
      await apiFetch('/auth/me', { method: 'PUT', body })
      await refreshTutor()
      setEditing(false)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (!tutor) return null

  return (
    <div className="account-card">
      <h2>Account Information</h2>

      {editing ? (
        <form onSubmit={handleSave} className="account-form">
          <div className="account-form-grid">
            <label>
              Username
              <input value={form.username} onChange={set('username')} required />
            </label>
            <label>
              Display Name
              <input value={form.display_name} onChange={set('display_name')} />
            </label>
            <label>
              Email
              <input type="email" value={form.email} onChange={set('email')} required />
            </label>
            <label>
              Full Name
              <input value={form.nama} onChange={set('nama')} required />
            </label>
            <label>
              Phone Number
              <input value={form.no_hp} onChange={set('no_hp')} />
            </label>
            <label>
              Gender
              <input value={form.gender} onChange={set('gender')} />
            </label>
            <label>
              Password
              <input
                type="password"
                value={form.kata_sandi}
                onChange={set('kata_sandi')}
                placeholder="Biarkan kosong kalau tidak diganti"
              />
            </label>
          </div>

          {error && <p className="account-error">{error}</p>}

          <div className="account-form-actions">
            <button type="button" className="account-cancel" onClick={() => setEditing(false)}>
              Batal
            </button>
            <button type="submit" className="account-save" disabled={submitting}>
              {submitting ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      ) : (
        <>
          <div className="account-grid">
            <div>
              <span className="account-label">Username</span>
              <span className="account-value">{tutor.username || '-'}</span>
            </div>
            <div>
              <span className="account-label">Display Name</span>
              <span className="account-value">{tutor.display_name || '-'}</span>
            </div>
            <div>
              <span className="account-label">Email</span>
              <span className="account-value">{tutor.email}</span>
            </div>
            <div>
              <span className="account-label">Full Name</span>
              <span className="account-value">{tutor.nama}</span>
            </div>
            <div>
              <span className="account-label">Phone Number</span>
              <span className="account-value">{tutor.no_hp || '-'}</span>
            </div>
            <div>
              <span className="account-label">Gender</span>
              <span className="account-value">{tutor.gender || '-'}</span>
            </div>
            <div>
              <span className="account-label">Password</span>
              <span className="account-value">**************</span>
            </div>
          </div>
          <button className="account-edit-btn" onClick={startEdit}>
            Edit
          </button>
        </>
      )}
    </div>
  )
}

export default function Settings() {
  return (
    <div className="settings-page">
      <AccountInfoCard />
    </div>
  )
}
