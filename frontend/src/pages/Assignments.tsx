import { useEffect, useState } from 'react'
import { User, Clock, Calendar, Users, TrendingUp, BarChart3, Download, Filter, Search, Eye, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { solverService } from '../services/api'
import { LoadingTable, LoadingSpinner } from '../components/LoadingStates'
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
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortBy, setSortBy] = useState<'date' | 'employee' | 'shift'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4" />
      case 'failed':
        return <XCircle className="h-4 w-4" />
      case 'running':
        return <AlertCircle className="h-4 w-4" />
      default:
        return <AlertCircle className="h-4 w-4" />
    }
  }

  const filteredAssignments = assignments.filter(assignment => {
    const matchesSearch = assignment.employee_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assignment.shift_name?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || assignment.status === statusFilter
    return matchesSearch && matchesStatus
  }).sort((a, b) => {
    let aValue, bValue
    
    switch (sortBy) {
      case 'date':
        aValue = new Date(a.date).getTime()
        bValue = new Date(b.date).getTime()
        break
      case 'employee':
        aValue = a.employee_name || ''
        bValue = b.employee_name || ''
        break
      case 'shift':
        aValue = a.shift_name || ''
        bValue = b.shift_name || ''
        break
      default:
        return 0
    }
    
    if (sortOrder === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
    }
  })

  const exportAssignments = () => {
    if (!selectedRun || assignments.length === 0) return

    const data = assignments.map(assignment => ({
      'Empleado': assignment.employee_name || 'N/A',
      'Turno': assignment.shift_name || 'N/A',
      'Fecha': new Date(assignment.date).toLocaleDateString(),
      'Estado': assignment.status
    }))

    const csvContent = [
      Object.keys(data[0]).join(','),
      ...data.map(row => Object.values(row).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `asignaciones_${selectedRun.run_id}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
    
    toast.success('Archivo CSV exportado')
  }

  if (loading) {
    return <LoadingTable />
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white transition-colors duration-300">
            Asignaciones de Turnos
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2 transition-colors duration-300">
            Visualiza las asignaciones generadas por el optimizador
          </p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
          <Users className="h-4 w-4" />
          <span>Gestión Avanzada</span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Runs List */}
        <div className="xl:col-span-1">
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Ejecuciones Disponibles
              </h3>
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <BarChart3 className="h-4 w-4" />
                <span>{runs.length} total</span>
              </div>
            </div>
            
            {runs.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="h-8 w-8 text-gray-400" />
                </div>
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No hay ejecuciones disponibles
                </h4>
                <p className="text-gray-600 dark:text-gray-400">
                  Ejecuta optimizaciones para generar asignaciones
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {runs.map((run) => (
                  <div
                    key={run.id}
                    className={`p-4 border rounded-xl cursor-pointer transition-all duration-200 group ${
                      selectedRun?.id === run.id
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 shadow-lg'
                        : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:shadow-md'
                    }`}
                    onClick={() => handleViewAssignments(run)}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          Optimización #{run.id}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {new Date(run.created_at).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        <span className={`badge ${getStatusColor(run.status)} flex items-center space-x-1`}>
                          {getStatusIcon(run.status)}
                          <span>{getStatusText(run.status)}</span>
                        </span>
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          {run.assignments_count} asignaciones
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Assignments Details */}
        <div className="xl:col-span-2">
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Detalles de Asignaciones
              </h3>
              {selectedRun && assignments.length > 0 && (
                <button
                  onClick={exportAssignments}
                  className="btn btn-success flex items-center space-x-2"
                >
                  <Download className="h-4 w-4" />
                  <span>Exportar CSV</span>
                </button>
              )}
            </div>
            
            {!selectedRun ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Eye className="h-8 w-8 text-gray-400" />
                </div>
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Selecciona una ejecución
                </h4>
                <p className="text-gray-600 dark:text-gray-400">
                  Elige una optimización para ver sus asignaciones
                </p>
              </div>
            ) : assignmentsLoading ? (
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : (
              <div className="space-y-6">
                {/* Run Info */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-blue-700 dark:text-blue-300">
                      Optimización #{selectedRun.id}
                    </h4>
                    <span className={`badge ${getStatusColor(selectedRun.status)}`}>
                      {getStatusText(selectedRun.status)}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <p className="text-sm text-blue-600 dark:text-blue-400">Asignaciones</p>
                      <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                        {assignments.length}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-blue-600 dark:text-blue-400">Tiempo (seg)</p>
                      <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                        {selectedRun.solve_time?.toFixed(2) || 'N/A'}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-blue-600 dark:text-blue-400">Valor Objetivo</p>
                      <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                        {selectedRun.objective_value?.toFixed(2) || 'N/A'}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-blue-600 dark:text-blue-400">Eficiencia</p>
                      <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                        {selectedRun.solve_time && selectedRun.solve_time < 30 ? 'Rápida' : 
                         selectedRun.solve_time && selectedRun.solve_time < 60 ? 'Media' : 'Lenta'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Filters and Search */}
                {assignments.length > 0 && (
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Buscar por empleado o turno..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="input pl-10"
                        />
                      </div>
                      <div className="relative">
                        <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <select
                          value={statusFilter}
                          onChange={(e) => setStatusFilter(e.target.value)}
                          className="input pl-10"
                        >
                          <option value="all">Todos los estados</option>
                          <option value="assigned">Asignado</option>
                          <option value="pending">Pendiente</option>
                          <option value="completed">Completado</option>
                        </select>
                      </div>
                      <div className="flex space-x-2">
                        <select
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value as any)}
                          className="input flex-1"
                        >
                          <option value="date">Ordenar por fecha</option>
                          <option value="employee">Ordenar por empleado</option>
                          <option value="shift">Ordenar por turno</option>
                        </select>
                        <button
                          onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                          className="btn btn-secondary px-3"
                        >
                          <TrendingUp className={`h-4 w-4 ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Assignments Table */}
                {assignments.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users className="h-8 w-8 text-gray-400" />
                    </div>
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      No hay asignaciones
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400">
                      Esta ejecución no generó asignaciones
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Asignaciones ({filteredAssignments.length})
                      </h4>
                      <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                        <Calendar className="h-4 w-4" />
                        <span>Filtradas y ordenadas</span>
                      </div>
                    </div>
                    
                    <div className="overflow-x-auto">
                      <table className="table table-striped">
                        <thead>
                          <tr>
                            <th>Empleado</th>
                            <th>Turno</th>
                            <th>Fecha</th>
                            <th>Estado</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredAssignments.map((assignment) => (
                            <tr key={assignment.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                              <td>
                                <div className="flex items-center space-x-3">
                                  <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
                                    <User className="h-4 w-4 text-white" />
                                  </div>
                                  <span className="font-medium text-gray-900 dark:text-white">
                                    {assignment.employee_name || 'N/A'}
                                  </span>
                                </div>
                              </td>
                              <td>
                                <div className="flex items-center space-x-2">
                                  <Clock className="h-4 w-4 text-gray-400" />
                                  <span>{assignment.shift_name || 'N/A'}</span>
                                </div>
                              </td>
                              <td>
                                <div className="flex items-center space-x-2">
                                  <Calendar className="h-4 w-4 text-gray-400" />
                                  <span>{new Date(assignment.date).toLocaleDateString()}</span>
                                </div>
                              </td>
                              <td>
                                <span className={`badge ${
                                  assignment.status === 'assigned' ? 'badge-success' : 
                                  assignment.status === 'completed' ? 'badge-success' :
                                  assignment.status === 'pending' ? 'badge-warning' : 'badge-gray'
                                }`}>
                                  {assignment.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
