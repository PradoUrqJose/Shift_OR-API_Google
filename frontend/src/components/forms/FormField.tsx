import { useState, forwardRef } from 'react'
import { Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react'

interface FormFieldProps {
  label: string
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'date' | 'time' | 'datetime-local'
  placeholder?: string
  value: string
  onChange: (value: string) => void
  error?: string
  success?: string
  required?: boolean
  disabled?: boolean
  className?: string
  icon?: React.ReactNode
  helpText?: string
}

export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  ({ 
    label, 
    type = 'text', 
    placeholder, 
    value, 
    onChange, 
    error, 
    success, 
    required = false, 
    disabled = false,
    className = '',
    icon,
    helpText
  }, ref) => {
    const [showPassword, setShowPassword] = useState(false)
    const [isFocused, setIsFocused] = useState(false)

    const inputType = type === 'password' && showPassword ? 'text' : type
    const hasError = !!error
    const hasSuccess = !!success && !hasError

    return (
      <div className={`space-y-2 ${className}`}>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        
        <div className="relative">
          {icon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <div className="text-gray-400 dark:text-gray-500">
                {icon}
              </div>
            </div>
          )}
          
          <input
            ref={ref}
            type={inputType}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            disabled={disabled}
            className={`
              w-full px-3 py-2 border rounded-lg transition-all duration-200
              ${icon ? 'pl-10' : 'pl-3'}
              ${type === 'password' ? 'pr-10' : 'pr-3'}
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
                : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white'
              }
              focus:outline-none focus:ring-2 focus:ring-offset-2
              dark:focus:ring-offset-gray-800
            `}
          />
          
          {type === 'password' && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          )}
          
          {hasError && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <AlertCircle className="h-4 w-4 text-red-500" />
            </div>
          )}
          
          {hasSuccess && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <CheckCircle className="h-4 w-4 text-green-500" />
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
)

FormField.displayName = 'FormField'
