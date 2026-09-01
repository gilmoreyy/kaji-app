import { useCallback, useEffect, useState } from 'react'
import { apiFetch } from '../api/client'
import ProgressGrid from '../components/ProgressGrid'
import UpcomingClassPanel from '../components/UpcomingClassPanel'
import './Dashboard.css'

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [siswaList, setSiswaList] = useState([])
  const [error, setError] = useState('')

  const load = useCallback(() => {
    Promise.all([apiFetch('/dashboard'), apiFetch('/siswa')])
      .then(([dashboard, siswa]) => {
        setData(dashboard)
        setSiswaList(siswa)
      })
      .catch((err) => setError(err.message))
  }, [])

  useEffect(() => {
    load()
  }, [load])

  if (error) return <p className="dashboard-error">{error}</p>
  if (!data) return null

  return (
    <div className="dashboard">
      <div className="dashboard-main">
        <h2 className="dashboard-section-title">Student's Progress</h2>
        <ProgressGrid siswaProgress={data.siswa_progress} />
      </div>
      <div className="dashboard-side">
        <UpcomingClassPanel
          upcomingClass={data.upcoming_class}
          siswaList={siswaList}
          onScheduled={load}
        />
      </div>
    </div>
  )
}
