import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'
import './AppLayout.css'

const TITLE_BY_PATH = {
  '/': 'Dashboard',
  '/student': 'Student',
  '/calendar': 'Calendar',
  '/material': 'Material',
  '/setting': 'Settings',
}

export default function AppLayout() {
  const { pathname } = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const title =
    TITLE_BY_PATH[pathname] ?? (pathname.startsWith('/student') ? 'Student' : 'Dashboard')

  return (
    <div className="app-layout">
      <Sidebar collapsed={!sidebarOpen} />
      <div className="app-layout-main">
        <Header title={title} onToggleSidebar={() => setSidebarOpen((open) => !open)} />
        <div className="app-layout-content">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
