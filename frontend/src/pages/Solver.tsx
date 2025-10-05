import { useEffect, useState } from 'react'
import { Clock, CheckCircle, XCircle, Download, AlertTriangle, Zap, Brain, Target, TrendingUp, Calendar, Users, Settings, Sparkles } from 'lucide-react'
import { solverService } from '../services/api'
import { FormField } from '../components/forms/FormField'
import { LoadingOptimization, LoadingSpinner } from '../components/LoadingStates'
import toast from 'react-hot-toast'

interface SolverRun {
  id: number
  run_id: string
  status: string
  start_date: string
  end_date?: string
  objective_value?: number
  solve_time?: number
  assignments_count: number
  created_at: string
}

export function Solver() {
  const [runs, setRuns] = useState<SolverRun[]>([])
  const [loading, setLoading] = useState(true)
  const [solving, setSolving] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [selectedRun, setSelectedRun] = useState<SolverRun | null>(null)
  const [errors, setErrors] = useState<any[]>([])
  const [loadingErrors, setLoadingErrors] = useState(false)
  const [formData, setFormData] = useState({
    start_date: '',
    end_date: '',
    max_time: '60',
    min_coverage: '80',
    max_consecutive_days: '6',
    min_rest_hours: '12'
  })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    fetchRuns()
  }, [])

  const fetchRuns = async () => {
    try {
      setLoading(true)
      const response = await solverService.getRuns()
      setRuns(response.data)
    } catch (error) {
      toast.error('Error cargando ejecuciones')
    } finally {
      setLoading(false)
    }
  }

  const fetchErrors = async (runId: string) => {
    try {
      setLoadingErrors(true)
      const response = await solverService.getErrors(runId)
      setErrors(response.data.errors || [])
    } catch (error) {
      toast.error('Error cargando errores')
      setErrors([])
    } finally {
      setLoadingErrors(false)
    }
  }

  const handleViewErrors = (run: SolverRun) => {
    setSelectedRun(run)
    fetchErrors(run.run_id)
  }

  const handleSolve = async (e: React.FormEvent) => {
    e.preventDefault()
    setSolving(true)
    setFormErrors({})

    try {
      const constraints = {
        start_date: formData.start_date,
        end_date: formData.end_date,
        max_time: parseInt(formData.max_time),
        min_coverage: parseInt(formData.min_coverage),
        max_consecutive_days: parseInt(formData.max_consecutive_days),
        min_rest_hours: parseInt(formData.min_rest_hours)
      }

      await solverService.solve(constraints)
      toast.success('Optimización iniciada')
      setShowForm(false)
      setFormData({
        start_date: '',
        end_date: '',
        max_time: '60',
        min_coverage: '80',
        max_consecutive_days: '6',
        min_rest_hours: '12'
      })
      fetchRuns()
    } catch (error: any) {
      if (error.response?.data?.errors) {
        setFormErrors(error.response.data.errors)
      } else {
        toast.error('Error iniciando optimización')
      }
    } finally {
      setSolving(false)
    }
  }

  const handleCancel = () => {
    setShowForm(false)
    setFormData({
      start_date: '',
      end_date: '',
      max_time: '60',
      min_coverage: '80',
      max_consecutive_days: '6',
      min_rest_hours: '12'
    })
    setFormErrors({})
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-600" />
      case 'running':
        return <Clock className="h-5 w-5 text-blue-600 animate-spin" />
      default:
        return <Clock className="h-5 w-5 text-gray-400" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completado'
      case 'failed':
        return 'Fallido'
      case 'running':
        return 'Ejecutando'
      case 'pending':
        return 'Pendiente'
      default:
        return status
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'badge-success'
      case 'failed':
        return 'badge-danger'
      case 'running':
        return 'badge-info'
      case 'pending':
        return 'badge-warning'
      default:
        return 'badge-gray'
    }
  }

  if (loading) {
    return <LoadingOptimization />
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white transition-colors duration-300">
            Optimizador de Turnos
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2 transition-colors duration-300">
            Ejecuta optimizaciones usando Google OR-Tools CP-SAT
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          disabled={solving}
          className="btn btn-primary flex items-center space-x-2"
        >
          <Zap className="h-5 w-5" />
          <span>{solving ? 'Ejecutando...' : 'Nueva Optimización'}</span>
        </button>
      </div>

      {/* AI Features Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card card-elevated group hover:scale-105 transition-all duration-300">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Algoritmo CP-SAT</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Optimización avanzada</p>
            </div>
          </div>
        </div>

        <div className="card card-elevated group hover:scale-105 transition-all duration-300">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
              <Target className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Restricciones Inteligentes</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">8 restricciones avanzadas</p>
            </div>
          </div>
        </div>

        <div className="card card-elevated group hover:scale-105 transition-all duration-300">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Optimización Multi-Objetivo</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Costo + Satisfacción</p>
            </div>
          </div>
        </div>
      </div>

      {/* Solver Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-bounce-in">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <Brain className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                      Configurar Optimización
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Define los parámetros para la optimización CP-SAT
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleCancel}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <form onSubmit={handleSolve} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    label="Fecha de Inicio"
                    type="date"
                    value={formData.start_date}
                    onChange={(value) => setFormData({ ...formData, start_date: value })}
                    error={formErrors.start_date}
                    required
                    icon={<Calendar className="h-4 w-4" />}
                  />
                  
                  <FormField
                    label="Fecha de Fin"
                    type="date"
                    value={formData.end_date}
                    onChange={(value) => setFormData({ ...formData, end_date: value })}
                    error={formErrors.end_date}
                    required
                    icon={<Calendar className="h-4 w-4" />}
                  />
                  
                  <FormField
                    label="Tiempo Máximo (segundos)"
                    type="number"
                    value={formData.max_time}
                    onChange={(value) => setFormData({ ...formData, max_time: value })}
                    error={formErrors.max_time}
                    required
                    icon={<Clock className="h-4 w-4" />}
                    placeholder="60"
                    helpText="Tiempo límite para la optimización"
                  />
                  
                  <FormField
                    label="Cobertura Mínima (%)"
                    type="number"
                    value={formData.min_coverage}
                    onChange={(value) => setFormData({ ...formData, min_coverage: value })}
                    error={formErrors.min_coverage}
                    required
                    icon={<Target className="h-4 w-4" />}
                    placeholder="80"
                    helpText="Porcentaje mínimo de cobertura de turnos"
                  />
                  
                  <FormField
                    label="Máximo Días Consecutivos"
                    type="number"
                    value={formData.max_consecutive_days}
                    onChange={(value) => setFormData({ ...formData, max_consecutive_days: value })}
                    error={formErrors.max_consecutive_days}
                    required
                    icon={<Users className="h-4 w-4" />}
                    placeholder="6"
                    helpText="Máximo de días consecutivos de trabajo"
                  />
                  
                  <FormField
                    label="Horas Mínimas de Descanso"
                    type="number"
                    value={formData.min_rest_hours}
                    onChange={(value) => setFormData({ ...formData, min_rest_hours: value })}
                    error={formErrors.min_rest_hours}
                    required
                    icon={<Settings className="h-4 w-4" />}
                    placeholder="12"
                    helpText="Horas mínimas de descanso entre turnos"
                  />
                </div>
                
                <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="btn btn-secondary"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={solving}
                    className="btn btn-primary flex items-center space-x-2"
                  >
                    {solving && <LoadingSpinner size="sm" />}
                    <Zap className="h-5 w-5" />
                    <span>{solving ? 'Ejecutando...' : 'Iniciar Optimización'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Runs List */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Historial de Optimizaciones
          </h3>
          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            <Sparkles className="h-4 w-4" />
            <span>Powered by OR-Tools</span>
          </div>
        </div>
        
        {runs.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Brain className="h-8 w-8 text-gray-400" />
            </div>
            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No hay optimizaciones ejecutadas
            </h4>
            <p className="text-gray-600 dark:text-gray-400">
              Ejecuta tu primera optimización para ver los resultados aquí
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {runs.map((run) => (
              <div
                key={run.id}
                className="border border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-200 group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
                      {getStatusIcon(run.status)}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        Optimización #{run.id}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        ID: {run.run_id}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <span className={`badge ${getStatusColor(run.status)}`}>
                      {getStatusText(run.status)}
                    </span>
                    
                    {run.status === 'completed' && (
                      <button
                        onClick={() => window.open(`/reports/${run.run_id}`, '_blank')}
                        className="btn btn-success flex items-center space-x-2"
                      >
                        <Download className="h-4 w-4" />
                        <span>Ver Reporte</span>
                      </button>
                    )}
                    
                    {run.status === 'failed' && (
                      <button
                        onClick={() => handleViewErrors(run)}
                        className="btn btn-danger flex items-center space-x-2"
                      >
                        <AlertTriangle className="h-4 w-4" />
                        <span>Ver Errores</span>
                      </button>
                    )}
                  </div>
                </div>
                
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Fecha</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {new Date(run.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Asignaciones</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{run.assignments_count}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Tiempo (seg)</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {run.solve_time ? run.solve_time.toFixed(2) : 'N/A'}
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Valor Objetivo</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {run.objective_value ? run.objective_value.toFixed(2) : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Errors Modal */}
      {selectedRun && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto animate-bounce-in">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                    <AlertTriangle className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      Errores de Optimización #{selectedRun.id}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Detalles de los errores encontrados
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSelectedRun(null)
                    setErrors([])
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {loadingErrors ? (
                <div className="flex items-center justify-center py-12">
                  <LoadingSpinner size="lg" />
                </div>
              ) : errors.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="h-8 w-8 text-gray-400" />
                  </div>
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No se encontraron errores detallados
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400">
                    La optimización falló pero no se registraron errores específicos
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {errors.map((error, index) => (
                    <div key={index} className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
                      <div className="flex items-start">
                        <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-red-800 dark:text-red-200 font-medium">
                            {error.message || 'Error desconocido'}
                          </p>
                          {error.created_at && (
                            <p className="text-red-600 dark:text-red-400 text-sm mt-1">
                              {new Date(error.created_at).toLocaleString()}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
