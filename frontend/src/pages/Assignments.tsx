import { useEffect, useState } from 'react'
import { User, Clock } from 'lucide-react'
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

interface Assignment {
  id: number
  employee_id: number
  shift_id: number
  date: string
  status: string
  employee_name?: string
  shift_name?: string
}

export function Assignments() {
  const [runs, setRuns] = useState<SolverRun[]>([])
  const [selectedRun, setSelectedRun] = useState<SolverRun | null>(null)
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)
  const [assignmentsLoading, setAssignmentsLoading] = useState(false)

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

  const fetchAssignments = async (runId: string) => {
    try {
      setAssignmentsLoading(true)
      const response = await solverService.getAssignments(runId)
      setAssignments(response.data)
    } catch (error) {
      toast.error('Error cargando asignaciones')
    } finally {
      setAssignmentsLoading(false)
    }
  }

  const handleViewAssignments = (run: SolverRun) => {
    setSelectedRun(run)
    fetchAssignments(run.run_id)
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
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Asignaciones de Turnos</h1>
        <p className="text-gray-600 mt-2">
          Visualiza las asignaciones generadas por el optimizador
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Runs List */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Ejecuciones Disponibles
          </h3>
          
          {runs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No hay ejecuciones disponibles
            </div>
          ) : (
            <div className="space-y-3">
              {runs.map((run) => (
                <div
                  key={run.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedRun?.id === run.id
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                  onClick={() => handleViewAssignments(run)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium text-gray-900">
                        Optimización #{run.id}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {new Date(run.created_at).toLocaleString()}
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          run.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : run.status === 'failed'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {run.status}
                      </span>
                      
                      <span className="text-sm font-medium text-gray-600">
                        {run.assignments_count} asignaciones
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Assignments Details */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Detalles de Asignaciones
          </h3>
          
          {!selectedRun ? (
            <div className="text-center py-8 text-gray-500">
              Selecciona una ejecución para ver las asignaciones
            </div>
          ) : assignmentsLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Run Info */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">
                  Optimización #{selectedRun.id}
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Asignaciones</p>
                    <p className="font-medium">{assignments.length}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Tiempo (seg)</p>
                    <p className="font-medium">{selectedRun.solve_time?.toFixed(2) || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Valor Objetivo</p>
                    <p className="font-medium">{selectedRun.objective_value?.toFixed(2) || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Estado</p>
                    <p className="font-medium">{selectedRun.status}</p>
                  </div>
                </div>
              </div>

              {/* Assignments Table */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">
                  Asignaciones ({assignments.length})
                </h4>
                <div className="overflow-x-auto">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Empleado</th>
                        <th>Turno</th>
                        <th>Fecha</th>
                        <th>Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {assignments.map((assignment) => (
                        <tr key={assignment.id}>
                          <td>
                            <div className="flex items-center">
                              <User className="h-4 w-4 text-gray-400 mr-2" />
                              {assignment.employee_name || 'N/A'}
                            </div>
                          </td>
                          <td>
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 text-gray-400 mr-2" />
                              {assignment.shift_name || 'N/A'}
                            </div>
                          </td>
                          <td>{new Date(assignment.date).toLocaleDateString()}</td>
                          <td>
                            <span
                              className={`px-2 py-1 text-xs rounded-full ${
                                assignment.status === 'assigned'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {assignment.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
