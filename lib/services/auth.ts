import { prisma } from '@/lib/prisma'
import * as crypto from 'crypto'
import { UserRole } from '@prisma/client'

// Definiciones de tipo locales
interface User {
  id: string
  username: string
  password: string
  role: UserRole
  createdAt: Date
  updatedAt: Date
}

export interface CreateUserData {
  username: string
  password: string
  role: UserRole
}

export interface UpdateUserData {
  password?: string
  role?: UserRole
}

export interface LoginResponse {
  user: {
    id: string
    username: string
    role: UserRole
  }
  success: boolean
  message?: string
}

export class AuthService {
  // Hash de contraseñas (en un entorno real usaríamos bcrypt)
  static hashPassword(password: string): string {
    return crypto.createHash('sha256').update(password).digest('hex')
  }

  // Verificar contraseña
  static verifyPassword(password: string, hashedPassword: string): boolean {
    const hashed = this.hashPassword(password)
    return hashed === hashedPassword
  }

  // Iniciar sesión
  static async login(username: string, password: string): Promise<LoginResponse> {
    try {
      console.log(`🔍 Intentando login para usuario: ${username}`)
      
      // Usar Prisma Client
      const user = await prisma.user.findUnique({
        where: {
          username
        }
      })

      if (!user) {
        console.log(`❌ Usuario no encontrado: ${username}`)
        return {
          success: false,
          message: 'Usuario no encontrado',
          user: { id: '', username: '', role: 'WAITER' as UserRole }
        }
      }

      console.log(`✓ Usuario encontrado: ${username}`)
      console.log(`🔐 Contraseña proporcionada: ${password}`)
      console.log(`🔐 Contraseña almacenada (hash): ${user.password}`)

      const hashedInputPassword = this.hashPassword(password)
      console.log(`🔐 Contraseña ingresada (hash): ${hashedInputPassword}`)
      
      const passwordValid = hashedInputPassword === user.password
      console.log(`🔍 ¿Contraseñas coinciden?: ${passwordValid}`)

      if (!passwordValid) {
        return {
          success: false,
          message: 'Contraseña incorrecta',
          user: { id: '', username: '', role: 'WAITER' as UserRole }
        }
      }

      // Omitir el campo de contraseña en la respuesta
      const { password: _, ...userWithoutPassword } = user

      return {
        success: true,
        user: userWithoutPassword
      }
    } catch (error) {
      console.error('Error in login:', error)
      throw new Error('Error al iniciar sesión')
    }
  }

  // Crear un nuevo usuario
  static async createUser(data: CreateUserData): Promise<User> {
    try {
      // Verificar si el usuario ya existe usando Prisma Client
      const existingUser = await prisma.user.findUnique({
        where: {
          username: data.username
        }
      })
      
      if (existingUser) {
        throw new Error('El nombre de usuario ya está en uso')
      }

      const hashedPassword = this.hashPassword(data.password)

      // Crear nuevo usuario usando Prisma Client
      return await prisma.user.create({
        data: {
          username: data.username,
          password: hashedPassword,
          role: data.role
        }
      })
    } catch (error) {
      console.error('Error creating user:', error)
      throw error
    }
  }

  // Obtener todos los usuarios
  static async getUsers(): Promise<Omit<User, 'password'>[]> {
    try {
      const users = await prisma.user.findMany()
      
      return users.map(user => {
        const { password, ...userWithoutPassword } = user
        return userWithoutPassword
      })
    } catch (error) {
      console.error('Error getting users:', error)
      throw new Error('Error al obtener usuarios')
    }
  }

  // Actualizar usuario
  static async updateUser(id: string, data: UpdateUserData): Promise<Omit<User, 'password'>> {
    try {
      const updateData: any = {}
      
      if (data.password) {
        updateData.password = this.hashPassword(data.password)
      }
      
      if (data.role) {
        updateData.role = data.role
      }
      
      // Si no hay nada que actualizar, lanzar error
      if (Object.keys(updateData).length === 0) {
        throw new Error('No se proporcionaron datos para actualizar')
      }
      
      // Actualizar usuario usando Prisma Client
      const updatedUser = await prisma.user.update({
        where: { id },
        data: updateData
      })
      
      const { password, ...userWithoutPassword } = updatedUser
      return userWithoutPassword
    } catch (error) {
      console.error('Error updating user:', error)
      throw new Error('Error al actualizar usuario')
    }
  }

  // Eliminar usuario
  static async deleteUser(id: string): Promise<void> {
    try {
      await prisma.user.delete({
        where: { id }
      })
    } catch (error) {
      console.error('Error deleting user:', error)
      throw new Error('Error al eliminar usuario')
    }
  }

  // Verificar si un usuario tiene permisos para una acción específica
  static hasPermission(userRole: UserRole, requiredRole: UserRole): boolean {
    const roleHierarchy = {
      ADMIN: 3,
      CASHIER: 2,
      WAITER: 1
    }

    return roleHierarchy[userRole] >= roleHierarchy[requiredRole]
  }

  // Verificar si la operación requiere contraseña de gestión (para cajeros)
  static requiresManagementPassword(operation: string, userRole: UserRole): boolean {
    if (userRole === 'ADMIN') {
      return false // Los administradores no necesitan verificación adicional
    }

    // Operaciones que requieren contraseña para los cajeros
    const restrictedOperations = [
      'DELETE_PRODUCT_FROM_TAB',
      'DELETE_PRODUCT',
      'DELETE_CATEGORY',
      'REFUND',
      'VOID_SALE'
    ]

    return userRole === 'CASHIER' && restrictedOperations.includes(operation)
  }
} 