import { useState, useEffect } from "react"
import { PendingAction } from "../types/index"
import { InventoryService } from "../services/inventoryService"

export function useAdminAuth() {
  const [showAdminAuth, setShowAdminAuth] = useState(false)
  const [adminPassword, setAdminPassword] = useState("")
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null)
  const [authError, setAuthError] = useState<string | null>(null)
  const [isVerifying, setIsVerifying] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    // Verificar si el usuario tiene rol de administrador
    const storedUser = localStorage.getItem('user')
    
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser)
        setIsAdmin(user.role === 'ADMIN')
      } catch (error) {
        console.error("Error parsing user:", error)
        setIsAdmin(false)
      }
    } else {
      setIsAdmin(false)
    }
  }, [])

  const requireAdminAuth = (action: PendingAction) => {
    if (isAdmin) {
      return false // No necesita autenticación
    }
    
    setPendingAction(action)
    setShowAdminAuth(true)
    return true // Necesita autenticación
  }

  const verifyAdminPassword = async (): Promise<boolean> => {
    setIsVerifying(true)
    setAuthError(null)
    
    try {
      const isValid = await InventoryService.verifyAdminPassword(adminPassword)
      
      if (isValid) {
        // Contraseña correcta
        setShowAdminAuth(false)
        setAdminPassword("")
        setPendingAction(null)
        setAuthError(null)
        return true
      } else {
        setAuthError("Contraseña de administrador incorrecta")
        return false
      }
    } catch (error) {
      console.error('Error verifying admin password:', error)
      setAuthError(error instanceof Error ? error.message : "Error al verificar la contraseña")
      return false
    } finally {
      setIsVerifying(false)
    }
  }

  const cancelAuth = () => {
    setShowAdminAuth(false)
    setAdminPassword("")
    setPendingAction(null)
    setAuthError(null)
  }

  return {
    isAdmin,
    showAdminAuth,
    adminPassword,
    setAdminPassword,
    pendingAction,
    authError,
    isVerifying,
    requireAdminAuth,
    verifyAdminPassword,
    cancelAuth
  }
}