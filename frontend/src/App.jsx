import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import AppLayout from './layout/AppLayout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Student from './pages/Student'
import Calendar from './pages/Calendar'
import Material from './pages/Material'
import Settings from './pages/Settings'
import ClassDetail from './pages/ClassDetail'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<Dashboard />} />
            <Route path="/student" element={<Student />} />
            <Route path="/student/:studentId/meeting/:jadwalId" element={<ClassDetail />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/material" element={<Material />} />
            <Route path="/setting" element={<Settings />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
