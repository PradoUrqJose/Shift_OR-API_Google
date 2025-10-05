import { Link, useLocation } from 'react-router-dom'
import { ChevronRight, Home } from 'lucide-react'

interface BreadcrumbItem {
  name: string
  href: string
  current?: boolean
}

const routeNames: Record<string, string> = {
  '/': 'Dashboard',
  '/employees': 'Empleados',
  '/shifts': 'Turnos',
  '/solver': 'Optimizador',
  '/assignments': 'Asignaciones',
  '/reports': 'Reportes',
  '/login': 'Iniciar Sesión'
}

export function Breadcrumbs() {
  const location = useLocation()
  const pathnames = location.pathname.split('/').filter((x) => x)

  const breadcrumbs: BreadcrumbItem[] = [
    {
      name: 'Dashboard',
      href: '/',
      current: location.pathname === '/'
    }
  ]

  // Construir breadcrumbs dinámicamente
  let currentPath = ''
  pathnames.forEach((pathname, index) => {
    currentPath += `/${pathname}`
    const isLast = index === pathnames.length - 1
    
    breadcrumbs.push({
      name: routeNames[currentPath] || pathname.charAt(0).toUpperCase() + pathname.slice(1),
      href: currentPath,
      current: isLast
    })
  })

  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 mb-6">
      <Link
        to="/"
        className="flex items-center space-x-1 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200"
      >
        <Home className="h-4 w-4" />
        <span>Inicio</span>
      </Link>
      
      {breadcrumbs.length > 1 && (
        <>
          <ChevronRight className="h-4 w-4" />
          <div className="flex items-center space-x-2">
            {breadcrumbs.slice(1).map((breadcrumb, index) => (
              <div key={breadcrumb.href} className="flex items-center space-x-2">
                {index > 0 && <ChevronRight className="h-4 w-4" />}
                {breadcrumb.current ? (
                  <span className="font-medium text-gray-900 dark:text-white">
                    {breadcrumb.name}
                  </span>
                ) : (
                  <Link
                    to={breadcrumb.href}
                    className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200"
                  >
                    {breadcrumb.name}
                  </Link>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </nav>
  )
}
