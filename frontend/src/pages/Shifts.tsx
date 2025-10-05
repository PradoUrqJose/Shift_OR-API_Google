import { useEffect, useState } from 'react'
import { Plus, Edit, Trash2, Clock } from 'lucide-react'
import { shiftService } from '../services/api'
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
          <h1 className="text-3xl font-bold text-gray-900">Turnos</h1>
          <p className="text-gray-600 mt-2">
            Configura los turnos de trabajo disponibles
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn btn-primary flex items-center"
        >
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Turno
        </button>
      </div>

      {/* Shifts Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Horario</th>
                <th>Día</th>
                <th>Personal</th>
                <th>Habilidades</th>
                <th>Multiplicador</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {shifts.map((shift) => (
                <tr key={shift.id}>
                  <td>
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                        <Clock className="h-4 w-4 text-primary-600" />
                      </div>
                      {shift.name}
                    </div>
                  </td>
                  <td>
                    <div className="text-sm">
                      <div className="font-medium">{shift.start_time} - {shift.end_time}</div>
                    </div>
                  </td>
                  <td>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                      {DAYS[shift.day_of_week]}
                    </span>
                  </td>
                  <td>
                    <div className="text-sm">
                      {shift.min_employees} - {shift.max_employees} empleados
                    </div>
                  </td>
                  <td>
                    <div className="flex flex-wrap gap-1">
                      {shift.required_skills.slice(0, 2).map((skill, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                        >
                          {skill}
                        </span>
                      ))}
                      {shift.required_skills.length > 2 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                          +{shift.required_skills.length - 2}
                        </span>
                      )}
                    </div>
                  </td>
                  <td>
                    <span className="text-sm font-medium">
                      {shift.cost_multiplier}x
                    </span>
                  </td>
                  <td>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        shift.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {shift.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setEditingShift(shift)}
                        className="text-primary-600 hover:text-primary-800"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(shift.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Shift Form Modal */}
      {showForm && (
        <ShiftForm
          shift={editingShift}
          onClose={() => {
            setShowForm(false)
            setEditingShift(null)
          }}
          onSave={() => {
            fetchShifts()
            setShowForm(false)
            setEditingShift(null)
          }}
        />
      )}
    </div>
  )
}

// Componente de formulario de turno
function ShiftForm({ 
  shift, 
  onClose, 
  onSave 
}: { 
  shift?: Shift | null
  onClose: () => void
  onSave: () => void
}) {
  const [formData, setFormData] = useState({
    name: shift?.name || '',
    start_time: shift?.start_time || '08:00',
    end_time: shift?.end_time || '16:00',
    day_of_week: shift?.day_of_week || 0,
    required_skills: shift?.required_skills.join(', ') || '',
    min_employees: shift?.min_employees || 1,
    max_employees: shift?.max_employees || 1,
    cost_multiplier: shift?.cost_multiplier || 1.0,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const data = {
        ...formData,
        required_skills: formData.required_skills.split(',').map(s => s.trim()).filter(Boolean),
      }

      if (shift) {
        await shiftService.update(shift.id, data)
        toast.success('Turno actualizado')
      } else {
        await shiftService.create(data)
        toast.success('Turno creado')
      }
      
      onSave()
    } catch (error) {
      toast.error('Error guardando turno')
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">
          {shift ? 'Editar Turno' : 'Nuevo Turno'}
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre del Turno
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input"
              placeholder="Turno Mañana"
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hora de Inicio
              </label>
              <input
                type="time"
                value={formData.start_time}
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                className="input"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hora de Fin
              </label>
              <input
                type="time"
                value={formData.end_time}
                onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                className="input"
                required
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Día de la Semana
            </label>
            <select
              value={formData.day_of_week}
              onChange={(e) => setFormData({ ...formData, day_of_week: parseInt(e.target.value) })}
              className="input"
              required
            >
              {DAYS.map((day, index) => (
                <option key={index} value={index}>
                  {day}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Habilidades Requeridas (separadas por comas)
            </label>
            <input
              type="text"
              value={formData.required_skills}
              onChange={(e) => setFormData({ ...formData, required_skills: e.target.value })}
              className="input"
              placeholder="Ventas, Atención al cliente"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mín. Empleados
              </label>
              <input
                type="number"
                value={formData.min_employees}
                onChange={(e) => setFormData({ ...formData, min_employees: parseInt(e.target.value) || 1 })}
                className="input"
                min="1"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Máx. Empleados
              </label>
              <input
                type="number"
                value={formData.max_employees}
                onChange={(e) => setFormData({ ...formData, max_employees: parseInt(e.target.value) || 1 })}
                className="input"
                min="1"
                required
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Multiplicador de Costo
            </label>
            <input
              type="number"
              step="0.1"
              value={formData.cost_multiplier}
              onChange={(e) => setFormData({ ...formData, cost_multiplier: parseFloat(e.target.value) || 1.0 })}
              className="input"
              min="0.1"
              required
            />
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary"
            >
              {shift ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
