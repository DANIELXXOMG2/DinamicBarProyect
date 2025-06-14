import { useState, useEffect, useCallback } from 'react'

interface FormState {
  [key: string]: any
}

interface PersistedFormData {
  formData: FormState
  timestamp: number
  expiresAt: number
}

const EXPIRATION_TIME = 60 * 60 * 1000 // 1 hora en milisegundos

export function useFormPersistence(formKey: string, initialState: FormState = {}) {
  const [formData, setFormData] = useState<FormState>(initialState)
  const [isExpired, setIsExpired] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState<number>(0)

  // Cargar datos persistidos al inicializar
  useEffect(() => {
    const savedData = localStorage.getItem(`form_${formKey}`)
    if (savedData) {
      try {
        const parsed: PersistedFormData = JSON.parse(savedData)
        const now = Date.now()
        
        if (now < parsed.expiresAt) {
          setFormData(parsed.formData)
          setTimeRemaining(parsed.expiresAt - now)
        } else {
          // Datos expirados, limpiar
          localStorage.removeItem(`form_${formKey}`)
          setIsExpired(true)
        }
      } catch (error) {
        console.error('Error parsing persisted form data:', error)
        localStorage.removeItem(`form_${formKey}`)
      }
    }
  }, [formKey])

  // Actualizar contador de tiempo restante
  useEffect(() => {
    if (timeRemaining <= 0) return

    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        const newTime = prev - 1000
        if (newTime <= 0) {
          setIsExpired(true)
          localStorage.removeItem(`form_${formKey}`)
          return 0
        }
        return newTime
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [timeRemaining, formKey])

  // Persistir datos cuando cambien
  const persistFormData = useCallback((data: FormState) => {
    const now = Date.now()
    const persistedData: PersistedFormData = {
      formData: data,
      timestamp: now,
      expiresAt: now + EXPIRATION_TIME
    }
    
    localStorage.setItem(`form_${formKey}`, JSON.stringify(persistedData))
    setFormData(data)
    setTimeRemaining(EXPIRATION_TIME)
    setIsExpired(false)
  }, [formKey])

  // Limpiar datos persistidos
  const clearPersistedData = useCallback(() => {
    localStorage.removeItem(`form_${formKey}`)
    setFormData(initialState)
    setTimeRemaining(0)
    setIsExpired(false)
  }, [formKey, initialState])

  // Verificar si hay datos pendientes
  const hasPendingData = useCallback(() => {
    const savedData = localStorage.getItem(`form_${formKey}`)
    if (!savedData) return false
    
    try {
      const parsed: PersistedFormData = JSON.parse(savedData)
      return Date.now() < parsed.expiresAt
    } catch {
      return false
    }
  }, [formKey])

  // Formatear tiempo restante
  const formatTimeRemaining = useCallback(() => {
    if (timeRemaining <= 0) return '00:00'
    
    const minutes = Math.floor(timeRemaining / (1000 * 60))
    const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000)
    
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }, [timeRemaining])

  // Métodos de compatibilidad con nombres alternativos
  const saveFormData = persistFormData
  const loadFormData = useCallback(() => {
    const savedData = localStorage.getItem(`form_${formKey}`)
    if (!savedData) return null
    
    try {
      const parsed: PersistedFormData = JSON.parse(savedData)
      if (Date.now() < parsed.expiresAt) {
        return parsed.formData
      } else {
        localStorage.removeItem(`form_${formKey}`)
        return null
      }
    } catch {
      localStorage.removeItem(`form_${formKey}`)
      return null
    }
  }, [formKey])
  const clearFormData = clearPersistedData

  return {
    formData,
    persistFormData,
    clearPersistedData,
    saveFormData,
    loadFormData,
    clearFormData,
    isExpired,
    timeRemaining,
    formatTimeRemaining,
    hasPendingData: hasPendingData()
  }
}

// Hook para verificar el estado global de formularios pendientes
export function useGlobalFormStatus() {
  const [pendingForms, setPendingForms] = useState<string[]>([])

  useEffect(() => {
    const checkPendingForms = () => {
      const pending: string[] = []
      const formKeys = ['income_voucher', 'expense_voucher', 'purchase']
      
      formKeys.forEach(key => {
        const savedData = localStorage.getItem(`form_${key}`)
        if (savedData) {
          try {
            const parsed: PersistedFormData = JSON.parse(savedData)
            if (Date.now() < parsed.expiresAt) {
              pending.push(key)
            } else {
              localStorage.removeItem(`form_${key}`)
            }
          } catch {
            localStorage.removeItem(`form_${key}`)
          }
        }
      })
      
      setPendingForms(pending)
    }

    // Verificar al cargar
    checkPendingForms()

    // Verificar cada 30 segundos
    const interval = setInterval(checkPendingForms, 30000)

    return () => clearInterval(interval)
  }, [])

  return { pendingForms }
}