import { NavLink } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Users, 
  Clock, 
  Calculator, 
  Calendar,
  FileText,
  Menu,
  X,
  Sparkles,
  TrendingUp
} from 'lucide-react'
import { useState } from 'react'

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard, badge: null },
  { name: 'Empleados', href: '/employees', icon: Users, badge: null },
  { name: 'Turnos', href: '/shifts', icon: Clock, badge: null },
  { name: 'Optimizador', href: '/solver', icon: Calculator, badge: 'AI' },
  { name: 'Asignaciones', href: '/assignments', icon: Calendar, badge: null },
  { name: 'Reportes', href: '/reports', icon: FileText, badge: null },
]

export function Sidebar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          type="button"
          className="bg-white dark:bg-gray-800 p-2 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-200"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6 text-gray-600 dark:text-gray-400" />
          ) : (
            <Menu className="h-6 w-6 text-gray-600 dark:text-gray-400" />
          )}
        </button>
      </div>

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-gray-800 shadow-xl border-r border-gray-200 dark:border-gray-700 transform transition-all duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:inset-0
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Header */}
        <div className="flex items-center justify-center h-16 px-4 bg-gradient-to-r from-primary-600 to-primary-700">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-white">Sistema de Turnos</h1>
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="mt-8 px-4">
          <ul className="space-y-1">
            {navigation.map((item) => (
              <li key={item.name}>
                <NavLink
                  to={item.href}
                  className={({ isActive }) =>
                    `group flex items-center justify-between px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                      isActive
                        ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 shadow-lg'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-200'
                    }`
                  }
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <div className="flex items-center">
                    <item.icon className={`mr-3 h-5 w-5 transition-colors duration-200 ${
                      navigation.find(n => n.name === item.name)?.name === 'Optimizador' 
                        ? 'text-primary-500' 
                        : ''
                    }`} />
                    {item.name}
                  </div>
                  
                  {item.badge && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary-100 dark:bg-primary-900/50 text-primary-800 dark:text-primary-200 animate-pulse">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        
        {/* Footer */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 rounded-xl p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-primary-600 dark:text-primary-400" />
              <span className="text-xs font-medium text-primary-700 dark:text-primary-300">
                Optimización AI
              </span>
            </div>
            <p className="text-xs text-primary-600 dark:text-primary-400 mt-1">
              Powered by OR-Tools
            </p>
          </div>
        </div>
      </div>

      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </>
  )
}
