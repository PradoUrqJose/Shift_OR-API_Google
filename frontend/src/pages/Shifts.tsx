import { useEffect, useState } from 'react'
import { Plus, Edit, Trash2, Clock, Calendar, Users, DollarSign, Settings, Search, Filter, Download } from 'lucide-react'
import { shiftService } from '../services/api'
import { DataTable } from '../components/tables/DataTable'
import { FormField } from '../components/forms/FormField'
import { SelectField } from '../components/forms/SelectField'
import { LoadingTable, LoadingSpinner } from '../components/LoadingStates'
import toast from 'react-hot-toast'

interface Shift {
  id: number
  name: string
  start_time: string
  end_time: string
  day_of_week: number
  required_skills: string[]
  min_employees: number
  max_employees: number
  cost_multiplier: number
  is_active: boolean
  created_at: string
}

const DAYS = [
  'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'
]

export function Shifts() {
  const [shifts, setShifts] = useState<Shift[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingShift, setEditingShift] = useState<Shift | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    start_time: '',
    end_time: '',
    day_of_week: '',
    required_skills: '',
    min_employees: '',
    max_employees: '',
    cost_multiplier: ''
  })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchShifts()
  }, [])

  const fetchShifts = async () => {
    try {
      setLoading(true)
      const response = await shiftService.getAll()
      setShifts(response.data)
    } catch (error) {
      toast.error('Error cargando turnos')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar este turno?')) return

    try {
      await shiftService.delete(id)
      toast.success('Turno eliminado')
      fetchShifts()
    } catch (error) {
      toast.error('Error eliminando turno')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setFormErrors({})

    try {
      const shiftData = {
        ...formData,
        day_of_week: parseInt(formData.day_of_week),
        required_skills: formData.required_skills.split(',').map(s => s.trim()).filter(Boolean),
        min_employees: parseInt(formData.min_employees),
        max_employees: parseInt(formData.max_employees),
        cost_multiplier: parseFloat(formData.cost_multiplier)
      }

      if (editingShift) {
        await shiftService.update(editingShift.id, shiftData)
        toast.success('Turno actualizado')
      } else {
        await shiftService.create(shiftData)
        toast.success('Turno creado')
      }

      setShowForm(false)
      setEditingShift(null)
      setFormData({ 
        name: '', start_time: '', end_time: '', day_of_week: '', 
        required_skills: '', min_employees: '', max_employees: '', cost_multiplier: '' 
      })
      fetchShifts()
    } catch (error: any) {
      if (error.response?.data?.errors) {
        setFormErrors(error.response.data.errors)
      } else {
        toast.error('Error guardando turno')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (shift: Shift) => {
    setEditingShift(shift)
    setFormData({
      name: shift.name,
      start_time: shift.start_time,
      end_time: shift.end_time,
      day_of_week: shift.day_of_week.toString(),
      required_skills: shift.required_skills.join(', '),
      min_employees: shift.min_employees.toString(),
      max_employees: shift.max_employees.toString(),
      cost_multiplier: shift.cost_multiplier.toString()
    })
    setShowForm(true)
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingShift(null)
    setFormData({ 
      name: '', start_time: '', end_time: '', day_of_week: '', 
      required_skills: '', min_employees: '', max_employees: '', cost_multiplier: '' 
    })
    setFormErrors({})
  }

  const handleExport = () => {
    toast.success('Exportando datos...')
  }

  const columns = [
    {
      key: 'name' as keyof Shift,
      label: 'Turno',
      render: (value: string, row: Shift) => (
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
            <Clock className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="font-medium text-gray-900 dark:text-white">{value}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {row.start_time} - {row.end_time}
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'day_of_week' as keyof Shift,
      label: 'Día',
      render: (value: number) => (
        <span className="badge badge-info">
          {DAYS[value]}
        </span>
      )
    },
    {
      key: 'min_employees' as keyof Shift,
      label: 'Personal',
      render: (value: number, row: Shift) => (
        <div className="flex items-center space-x-2">
          <Users className="h-4 w-4 text-gray-400" />
          <span className="text-sm">
            {row.min_employees} - {row.max_employees}
          </span>
        </div>
      )
    },
    {
      key: 'required_skills' as keyof Shift,
      label: 'Habilidades',
      render: (value: string[]) => (
        <div className="flex flex-wrap gap-1">
          {value.slice(0, 2).map((skill, index) => (
            <span key={index} className="badge badge-warning">
              {skill}
            </span>
          ))}
          {value.length > 2 && (
            <span className="badge badge-gray">
              +{value.length - 2}
            </span>
          )}
        </div>
      )
    },
    {
      key: 'cost_multiplier' as keyof Shift,
      label: 'Multiplicador',
      render: (value: number) => (
        <div className="flex items-center space-x-2">
          <DollarSign className="h-4 w-4 text-green-500" />
          <span className="font-medium text-green-600 dark:text-green-400">
            {value}x
          </span>
        </div>
      )
    },
    {
      key: 'is_active' as keyof Shift,
      label: 'Estado',
      render: (value: boolean) => (
        <span className={`badge ${value ? 'badge-success' : 'badge-danger'}`}>
          {value ? 'Activo' : 'Inactivo'}
        </span>
      )
    }
  ]

  const dayOptions = DAYS.map((day, index) => ({
    value: index.toString(),
    label: day
  }))

  if (loading) {
    return <LoadingTable />
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white transition-colors duration-300">
            Turnos
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2 transition-colors duration-300">
            Configura los turnos de trabajo disponibles
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn btn-primary flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Nuevo Turno</span>
        </button>
      </div>

      {/* Data Table */}
      <DataTable
        data={shifts}
        columns={columns}
        searchable={true}
        sortable={true}
        pagination={true}
        pageSize={10}
        onRowClick={handleEdit}
        onExport={handleExport}
        emptyMessage="No hay turnos configurados"
      />

      {/* Shift Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-bounce-in">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {editingShift ? 'Editar Turno' : 'Nuevo Turno'}
                </h3>
                <button
                  onClick={handleCancel}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    label="Nombre del Turno"
                    value={formData.name}
                    onChange={(value) => setFormData({ ...formData, name: value })}
                    error={formErrors.name}
                    required
                    icon={<Clock className="h-4 w-4" />}
                    placeholder="Turno Mañana"
                  />
                  
                  <SelectField
                    label="Día de la Semana"
                    options={dayOptions}
                    value={formData.day_of_week}
                    onChange={(value) => setFormData({ ...formData, day_of_week: value })}
                    error={formErrors.day_of_week}
                    required
                    placeholder="Seleccionar día"
                  />
                  
                  <FormField
                    label="Hora de Inicio"
                    type="time"
                    value={formData.start_time}
                    onChange={(value) => setFormData({ ...formData, start_time: value })}
                    error={formErrors.start_time}
                    required
                    icon={<Calendar className="h-4 w-4" />}
                  />
                  
                  <FormField
                    label="Hora de Fin"
                    type="time"
                    value={formData.end_time}
                    onChange={(value) => setFormData({ ...formData, end_time: value })}
                    error={formErrors.end_time}
                    required
                    icon={<Calendar className="h-4 w-4" />}
                  />
                  
                  <FormField
                    label="Mínimo de Empleados"
                    type="number"
                    value={formData.min_employees}
                    onChange={(value) => setFormData({ ...formData, min_employees: value })}
                    error={formErrors.min_employees}
                    required
                    icon={<Users className="h-4 w-4" />}
                    placeholder="1"
                  />
                  
                  <FormField
                    label="Máximo de Empleados"
                    type="number"
                    value={formData.max_employees}
                    onChange={(value) => setFormData({ ...formData, max_employees: value })}
                    error={formErrors.max_employees}
                    required
                    icon={<Users className="h-4 w-4" />}
                    placeholder="5"
                  />
                  
                  <FormField
                    label="Habilidades Requeridas"
                    value={formData.required_skills}
                    onChange={(value) => setFormData({ ...formData, required_skills: value })}
                    error={formErrors.required_skills}
                    helpText="Separar habilidades con comas"
                    placeholder="Almacen, Ventas, Atención al Cliente"
                  />
                  
                  <FormField
                    label="Multiplicador de Costo"
                    type="number"
                    value={formData.cost_multiplier}
                    onChange={(value) => setFormData({ ...formData, cost_multiplier: value })}
                    error={formErrors.cost_multiplier}
                    required
                    icon={<DollarSign className="h-4 w-4" />}
                    placeholder="1.0"
                    helpText="Factor de costo del turno (1.0 = normal, 1.5 = 50% más caro)"
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
                    disabled={submitting}
                    className="btn btn-primary flex items-center space-x-2"
                  >
                    {submitting && <LoadingSpinner size="sm" />}
                    <span>{editingShift ? 'Actualizar' : 'Crear'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

