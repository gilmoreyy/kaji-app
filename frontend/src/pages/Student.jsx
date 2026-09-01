import { useCallback, useEffect, useState } from 'react'
import { apiFetch } from '../api/client'
import StudentListPanel from '../components/StudentListPanel'
import AddStudentModal from '../components/AddStudentModal'
import StudentProfileCard from '../components/StudentProfileCard'
import LearningProgressCard from '../components/LearningProgressCard'
import StudentClassPanel from '../components/StudentClassPanel'
import './Student.css'

export default function Student() {
  const [siswaList, setSiswaList] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [selectedDetail, setSelectedDetail] = useState(null)
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [error, setError] = useState('')

  const loadList = useCallback(async () => {
    const list = await apiFetch('/siswa')
    setSiswaList(list)
    return list
  }, [])

  const loadDetail = useCallback(async (id) => {
    if (!id) {
      setSelectedDetail(null)
      return
    }
    const detail = await apiFetch(`/siswa/${id}`)
    setSelectedDetail(detail)
  }, [])

  useEffect(() => {
    loadList()
      .then((list) => {
        if (list.length > 0) setSelectedId(list[0].id_siswa)
      })
      .catch((err) => setError(err.message))
  }, [loadList])

  useEffect(() => {
    if (selectedId) loadDetail(selectedId).catch((err) => setError(err.message))
  }, [selectedId, loadDetail])

  function handleCreated(newId) {
    setAddModalOpen(false)
    loadList().then(() => setSelectedId(newId))
  }

  function refreshSelected() {
    loadList()
    loadDetail(selectedId)
  }

  if (error) return <p className="student-error">{error}</p>

  return (
    <div className="student-page">
      <StudentListPanel
        siswaList={siswaList}
        selectedId={selectedId}
        onSelect={setSelectedId}
        onAddClick={() => setAddModalOpen(true)}
      />

      {selectedDetail ? (
        <>
          <div className="student-main">
            <StudentProfileCard
              key={selectedDetail.id_siswa}
              siswa={selectedDetail}
              onUpdated={refreshSelected}
            />
            <LearningProgressCard progres={selectedDetail.progres} />
          </div>
          <StudentClassPanel
            key={`${selectedDetail.id_siswa}-class`}
            siswa={selectedDetail}
            onScheduled={refreshSelected}
          />
        </>
      ) : (
        <p className="student-empty">Belum ada siswa dipilih. Tambahkan siswa baru untuk mulai.</p>
      )}

      {addModalOpen && <AddStudentModal onClose={() => setAddModalOpen(false)} onCreated={handleCreated} />}
    </div>
  )
}
