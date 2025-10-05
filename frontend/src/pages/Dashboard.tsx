import { useEffect, useState } from 'react'
import { Users, Clock, Calculator, TrendingUp, Sparkles, Zap, Target, BarChart3 } from 'lucide-react'
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
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white transition-colors duration-300">
            Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2 transition-colors duration-300">
            Resumen del sistema de optimización de turnos
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 text-sm text-primary-600 dark:text-primary-400">
            <Sparkles className="h-4 w-4" />
            <span>AI Powered</span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card card-elevated group hover:scale-105 transition-all duration-300 animate-fade-in-up animate-stagger-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Empleados</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalEmployees}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-green-600 dark:text-green-400 font-medium">+12%</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">vs mes anterior</div>
            </div>
          </div>
        </div>

        <div className="card card-elevated group hover:scale-105 transition-all duration-300 animate-fade-in-up animate-stagger-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Turnos</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalShifts}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">Activos</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Configurados</div>
            </div>
          </div>
        </div>

        <div className="card card-elevated group hover:scale-105 transition-all duration-300 animate-fade-in-up animate-stagger-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                <Calculator className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Optimizaciones</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.recentRuns}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-purple-600 dark:text-purple-400 font-medium">+5</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">esta semana</div>
            </div>
          </div>
        </div>

        <div className="card card-elevated group hover:scale-105 transition-all duration-300 animate-fade-in-up animate-stagger-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Tasa de Éxito</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.successRate}%</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-green-600 dark:text-green-400 font-medium">+3.2%</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">mejora</div>
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
