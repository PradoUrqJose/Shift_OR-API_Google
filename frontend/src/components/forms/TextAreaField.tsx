import { forwardRef } from 'react'
import { AlertCircle, CheckCircle } from 'lucide-react'

interface TextAreaFieldProps {
  label: string
  placeholder?: string
  value: string
  onChange: (value: string) => void
  error?: string
  success?: string
  required?: boolean
  disabled?: boolean
  className?: string
  helpText?: string
  rows?: number
  maxLength?: number
  resize?: 'none' | 'both' | 'horizontal' | 'vertical'
}

export const TextAreaField = forwardRef<HTMLTextAreaElement, TextAreaFieldProps>(
  ({ 
    label, 
    placeholder, 
    value, 
    onChange, 
    error, 
    success, 
    required = false, 
    disabled = false,
    className = '',
    helpText,
    rows = 4,
    maxLength,
    resize = 'vertical'
  }, ref) => {
    const hasError = !!error
    const hasSuccess = !!success && !hasError

    return (
      <div className={`space-y-2 ${className}`}>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        
        <div className="relative">
          <textarea
            ref={ref}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            rows={rows}
            maxLength={maxLength}
            style={{ resize }}
            className={`
              w-full px-3 py-2 border rounded-lg transition-all duration-200
              ${hasError 
                ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                : hasSuccess 
                ? 'border-green-500 focus:ring-green-500 focus:border-green-500'
                : 'border-gray-300 dark:border-gray-600 focus:ring-primary-500 focus:border-primary-500'
              }
              ${disabled 
                ? 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white'
              }
              focus:outline-none focus:ring-2 focus:ring-offset-2
              dark:focus:ring-offset-gray-800
            `}
          />
          
          {hasError && (
            <div className="absolute top-2 right-2">
              <AlertCircle className="h-4 w-4 text-red-500" />
            </div>
          )}
          
          {hasSuccess && (
            <div className="absolute top-2 right-2">
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
        
        {maxLength && (
          <p className="text-xs text-gray-500 dark:text-gray-400 text-right">
            {value.length}/{maxLength}
          </p>
        )}
      </div>
    )
  }
)

TextAreaField.displayName = 'TextAreaField'
