import { Outlet, Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { Loading } from './Loading'
import { Breadcrumbs } from './Breadcrumbs'

export function Layout() {
  const { user, loading } = useAuth()

  if (loading) {
    return <Loading />
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="flex flex-col lg:flex-row">
        <Sidebar />
        <div className="flex-1 flex flex-col min-h-screen">
          <Header />
          <main className="flex-1 p-4 sm:p-6 lg:p-8 animate-fade-in container-responsive">
            <Breadcrumbs />
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}
