const TOKEN_KEY = 'kaji_token'
const API_BASE = import.meta.env.VITE_API_URL ?? ''

export function siswaFotoUrl(id_siswa) {
  return `${API_BASE}/api/siswa/${id_siswa}/foto`
}

export function assignmentFileUrl(id_siswa, id_jadwal) {
  return `${API_BASE}/api/siswa/${id_siswa}/jadwal/${id_jadwal}/assignment`
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

export async function apiFetch(path, options = {}) {
  const token = getToken()
  const isFormData = options.body instanceof FormData
  const res = await fetch(`${API_BASE}/api${path}`, {
    ...options,
    headers: {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    body: isFormData ? options.body : options.body ? JSON.stringify(options.body) : undefined,
  })

  if (res.status === 204) return null

  const data = await res.json().catch(() => null)
  if (!res.ok) {
    throw new Error(data?.message || 'Terjadi kesalahan')
  }
  return data
}
