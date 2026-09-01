import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import logo from '../assets/logo.png'
import './Login.css'

export default function Login() {
  const [mode, setMode] = useState('login')
  const [nama, setNama] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [identifier, setIdentifier] = useState('')
  const [kataSandi, setKataSandi] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { login, register } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      if (mode === 'login') {
        await login(identifier, kataSandi)
      } else {
        await register(nama, username, email, kataSandi)
      }
      navigate('/')
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <img src={logo} alt="KAJI" className="login-logo" />
        <h1>{mode === 'login' ? 'Masuk ke akun kamu' : 'Buat akun tutor'}</h1>

        <form onSubmit={handleSubmit}>
          {mode === 'register' && (
            <label>
              Nama
              <input value={nama} onChange={(e) => setNama(e.target.value)} required />
            </label>
          )}
          {mode === 'register' && (
            <label>
              Username
              <input value={username} onChange={(e) => setUsername(e.target.value)} required />
            </label>
          )}
          {mode === 'register' ? (
            <label>
              Email
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </label>
          ) : (
            <label>
              Username atau Email
              <input value={identifier} onChange={(e) => setIdentifier(e.target.value)} required />
            </label>
          )}
          <label>
            Kata Sandi
            <input
              type="password"
              value={kataSandi}
              onChange={(e) => setKataSandi(e.target.value)}
              required
            />
          </label>

          {error && <p className="login-error">{error}</p>}

          <button type="submit" disabled={submitting}>
            {submitting ? 'Memproses...' : mode === 'login' ? 'Masuk' : 'Daftar'}
          </button>
        </form>

        <button
          type="button"
          className="login-switch"
          onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
        >
          {mode === 'login' ? 'Belum punya akun? Daftar' : 'Sudah punya akun? Masuk'}
        </button>
      </div>
    </div>
  )
}
