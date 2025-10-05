import { useEffect, useState } from 'react'
import { Users, Clock, Calculator, TrendingUp } from 'lucide-react'
// import { api } from '../services/api'

interface DashboardStats {
  totalEmployees: number
  totalShifts: number
  recentRuns: number
  successRate: number
}

export function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalEmployees: 0,
    totalShifts: 0,
    recentRuns: 0,
    successRate: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Simular datos por ahora - en producción vendrían del backend
        setStats({
          totalEmployees: 25,
          totalShifts: 8,
          recentRuns: 12,
          successRate: 85.5
        })
      } catch (error) {
        console.error('Error cargando estadísticas:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Resumen del sistema de optimización de turnos
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Empleados</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalEmployees}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <Clock className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Turnos</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalShifts}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Calculator className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Optimizaciones</p>
              <p className="text-2xl font-bold text-gray-900">{stats.recentRuns}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-orange-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tasa de Éxito</p>
              <p className="text-2xl font-bold text-gray-900">{stats.successRate}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h3>
          <div className="space-y-3">
            <button className="w-full btn btn-primary text-left">
              <Calculator className="inline mr-2 h-4 w-4" />
              Ejecutar Optimización
            </button>
            <button className="w-full btn btn-secondary text-left">
              <Users className="inline mr-2 h-4 w-4" />
              Gestionar Empleados
            </button>
            <button className="w-full btn btn-secondary text-left">
              <Clock className="inline mr-2 h-4 w-4" />
              Configurar Turnos
            </button>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Optimización Reciente</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Optimización #001</p>
                <p className="text-sm text-gray-600">Hace 2 horas</p>
              </div>
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                Completado
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Optimización #002</p>
                <p className="text-sm text-gray-600">Hace 1 día</p>
              </div>
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                En proceso
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* System Info */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Información del Sistema</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="font-medium text-gray-900">Solver</p>
            <p className="text-gray-600">Google OR-Tools CP-SAT</p>
          </div>
          <div>
            <p className="font-medium text-gray-900">Versión</p>
            <p className="text-gray-600">1.0.0</p>
          </div>
          <div>
            <p className="font-medium text-gray-900">Última actualización</p>
            <p className="text-gray-600">Hace 5 minutos</p>
          </div>
        </div>
      </div>
    </div>
  )
}
