import { Loader2, Zap, TrendingUp, Users, Clock } from 'lucide-react'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

export function LoadingSpinner({ size = 'md', className = '' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12'
  }

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <Loader2 className={`${sizeClasses[size]} animate-spin text-primary-600`} />
    </div>
  )
}

export function LoadingCard() {
  return (
    <div className="card animate-pulse">
      <div className="space-y-4">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
      </div>
    </div>
  )
}

export function LoadingTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="card">
      <div className="space-y-4">
        {/* Header skeleton */}
        <div className="flex justify-between items-center">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse"></div>
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse"></div>
        </div>
        
        {/* Table skeleton */}
        <div className="space-y-3">
          {[...Array(rows)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function LoadingDashboard() {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 animate-pulse"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-64 animate-pulse"></div>
        </div>
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse"></div>
      </div>

      {/* Stats cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="card animate-pulse">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                </div>
              </div>
              <div className="text-right space-y-1">
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-12"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Content skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="card animate-pulse">
            <div className="space-y-4">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
              <div className="space-y-3">
                {[...Array(3)].map((_, j) => (
                  <div key={j} className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function LoadingForm() {
  return (
    <div className="card animate-pulse">
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-28"></div>
          <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
        <div className="flex justify-end space-x-3">
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
        </div>
      </div>
    </div>
  )
}

export function LoadingOptimization() {
  return (
    <div className="card text-center py-12">
      <div className="space-y-6">
        <div className="relative">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center mx-auto animate-pulse">
            <Zap className="h-8 w-8 text-white" />
          </div>
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
            <TrendingUp className="h-3 w-3 text-white" />
          </div>
        </div>
        
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Optimizando Turnos
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            El algoritmo CP-SAT está procesando la información...
          </p>
        </div>
        
        <div className="flex justify-center space-x-2">
          <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
        
        <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center justify-center space-x-2">
            <Users className="h-4 w-4" />
            <span>Analizando empleados disponibles</span>
          </div>
          <div className="flex items-center justify-center space-x-2">
            <Clock className="h-4 w-4" />
            <span>Evaluando restricciones de turnos</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export function LoadingError() {
  return (
    <div className="card text-center py-12">
      <div className="space-y-4">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto">
          <div className="w-8 h-8 bg-red-500 rounded-full animate-pulse"></div>
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Error de Carga
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            No se pudieron cargar los datos
          </p>
        </div>
      </div>
    </div>
  )
}
