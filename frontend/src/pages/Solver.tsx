import { useEffect, useState } from 'react'
import { Play, Clock, CheckCircle, XCircle, Download } from 'lucide-react'
import { solverService } from '../services/api'
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

  const handleSolve = async (constraints: any) => {
    try {
      setSolving(true)
      const response = await solverService.solve(constraints)
      toast.success('Optimización iniciada')
      setShowForm(false)
      fetchRuns()
    } catch (error) {
      toast.error('Error iniciando optimización')
    } finally {
      setSolving(false)
    }
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
        return 'bg-green-100 text-green-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      case 'running':
        return 'bg-blue-100 text-blue-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Optimizador de Turnos</h1>
          <p className="text-gray-600 mt-2">
            Ejecuta optimizaciones usando Google OR-Tools CP-SAT
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          disabled={solving}
          className="btn btn-primary flex items-center"
        >
          <Play className="mr-2 h-4 w-4" />
          {solving ? 'Ejecutando...' : 'Nueva Optimización'}
        </button>
      </div>

      {/* Solver Form Modal */}
      {showForm && (
        <SolverForm
          onClose={() => setShowForm(false)}
          onSolve={handleSolve}
          loading={solving}
        />
      )}

      {/* Runs List */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Historial de Optimizaciones
        </h3>
        
        {runs.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No hay optimizaciones ejecutadas aún
          </div>
        ) : (
          <div className="space-y-4">
            {runs.map((run) => (
              <div
                key={run.id}
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(run.status)}
                    <div>
                      <h4 className="font-medium text-gray-900">
                        Optimización #{run.id}
                      </h4>
                      <p className="text-sm text-gray-600">
                        ID: {run.run_id}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${getStatusColor(run.status)}`}
                    >
                      {getStatusText(run.status)}
                    </span>
                    
                    {run.status === 'completed' && (
                      <button
                        onClick={() => window.open(`/reports/${run.run_id}`, '_blank')}
                        className="text-primary-600 hover:text-primary-800 flex items-center"
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Ver Reporte
                      </button>
                    )}
                  </div>
                </div>
                
                <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Fecha</p>
                    <p className="font-medium">
                      {new Date(run.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Asignaciones</p>
                    <p className="font-medium">{run.assignments_count}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Tiempo (seg)</p>
                    <p className="font-medium">
                      {run.solve_time ? run.solve_time.toFixed(2) : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Valor Objetivo</p>
                    <p className="font-medium">
                      {run.objective_value ? run.objective_value.toFixed(2) : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// Componente de formulario de solver
function SolverForm({ 
  onClose, 
  onSolve, 
  loading 
}: { 
  onClose: () => void
  onSolve: (constraints: any) => void
  loading: boolean
}) {
  const [formData, setFormData] = useState({
    start_date: '',
    end_date: '',
    max_hours_per_employee: 40,
    min_rest_hours: 12,
    prefer_employee_preferences: true,
    minimize_cost: true,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const constraints = {
      constraints: {
        start_date: new Date(formData.start_date),
        end_date: new Date(formData.end_date),
        max_hours_per_employee: formData.max_hours_per_employee,
        min_rest_hours: formData.min_rest_hours,
        prefer_employee_preferences: formData.prefer_employee_preferences,
        minimize_cost: formData.minimize_cost,
      }
    }
    
    onSolve(constraints)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">
          Configurar Optimización
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha Inicio
              </label>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="input"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha Fin
              </label>
              <input
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                className="input"
                required
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Máx. Horas por Empleado
            </label>
            <input
              type="number"
              value={formData.max_hours_per_employee}
              onChange={(e) => setFormData({ ...formData, max_hours_per_employee: parseInt(e.target.value) || 40 })}
              className="input"
              min="1"
              max="80"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mín. Horas de Descanso
            </label>
            <input
              type="number"
              value={formData.min_rest_hours}
              onChange={(e) => setFormData({ ...formData, min_rest_hours: parseInt(e.target.value) || 12 })}
              className="input"
              min="1"
              max="24"
              required
            />
          </div>
          
          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.prefer_employee_preferences}
                onChange={(e) => setFormData({ ...formData, prefer_employee_preferences: e.target.checked })}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">
                Considerar preferencias de empleados
              </span>
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.minimize_cost}
                onChange={(e) => setFormData({ ...formData, minimize_cost: e.target.checked })}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">
                Minimizar costos
              </span>
            </label>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Ejecutando...' : 'Ejecutar Optimización'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
