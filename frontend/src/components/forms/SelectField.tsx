import { useState, forwardRef } from 'react'
import { ChevronDown, AlertCircle, CheckCircle } from 'lucide-react'

interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

interface SelectFieldProps {
  label: string
  options: SelectOption[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  error?: string
  success?: string
  required?: boolean
  disabled?: boolean
  className?: string
  helpText?: string
  searchable?: boolean
}

export const SelectField: React.FC<SelectFieldProps> = ({
  label, 
  options, 
  value, 
  onChange, 
  placeholder = 'Seleccionar...',
  error, 
  success, 
  required = false, 
  disabled = false,
  className = '',
  helpText,
  searchable = false
}) => {
    const [isOpen, setIsOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [isFocused, setIsFocused] = useState(false)

    const hasError = !!error
    const hasSuccess = !!success && !hasError

    const filteredOptions = searchable 
      ? options.filter(option => 
          option.label.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : options

    const selectedOption = options.find(option => option.value === value)

    return (
      <div className={`space-y-2 ${className}`}>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        
        <div className="relative">
          <button
            type="button"
            onClick={() => !disabled && setIsOpen(!isOpen)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            disabled={disabled}
            className={`
              w-full px-3 py-2 border rounded-lg transition-all duration-200
              text-left flex items-center justify-between
              ${hasError 
                ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                : hasSuccess 
                ? 'border-green-500 focus:ring-green-500 focus:border-green-500'
                : isFocused
                ? 'border-primary-500 focus:ring-primary-500 focus:border-primary-500'
                : 'border-gray-300 dark:border-gray-600'
              }
              ${disabled 
                ? 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:border-gray-400 dark:hover:border-gray-500'
              }
              focus:outline-none focus:ring-2 focus:ring-offset-2
              dark:focus:ring-offset-gray-800
            `}
          >
            <span className={selectedOption ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}>
              {selectedOption ? selectedOption.label : placeholder}
            </span>
            <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
          </button>
          
          {hasError && (
            <div className="absolute inset-y-0 right-8 flex items-center">
              <AlertCircle className="h-4 w-4 text-red-500" />
            </div>
          )}
          
          {hasSuccess && (
            <div className="absolute inset-y-0 right-8 flex items-center">
              <CheckCircle className="h-4 w-4 text-green-500" />
            </div>
          )}
          
          {isOpen && (
            <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-auto">
              {searchable && (
                <div className="p-2 border-b border-gray-200 dark:border-gray-700">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar..."
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              )}
              
              {filteredOptions.length === 0 ? (
                <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                  No se encontraron opciones
                </div>
              ) : (
                filteredOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      onChange(option.value)
                      setIsOpen(false)
                      setSearchTerm('')
                    }}
                    disabled={option.disabled}
                    className={`
                      w-full px-3 py-2 text-left text-sm transition-colors duration-200
                      ${option.disabled
                        ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                        : 'text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                      }
                      ${option.value === value 
                        ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300' 
                        : ''
                      }
                    `}
                  >
                    {option.label}
                  </button>
                ))
              )}
            </div>
          )}
        </div>
        
        {helpText && !hasError && !hasSuccess && (
          <p className="text-xs text-gray-500 dark:text-gray-400">{helpText}</p>
        )}
        
        {hasError && (
          <p className="text-xs text-red-600 dark:text-red-400 flex items-center">
            <AlertCircle className="h-3 w-3 mr-1" />
            {error}
          </p>
        )}
        
        {hasSuccess && (
          <p className="text-xs text-green-600 dark:text-green-400 flex items-center">
            <CheckCircle className="h-3 w-3 mr-1" />
            {success}
          </p>
        )}
      </div>
    )
  }
