import { NextRequest, NextResponse } from 'next/server'

// Definir rutas públicas que no requieren autenticación
const publicRoutes = [
  '/login',
  '/(auth)/login',
  '/api/auth',
  '/favicon.ico'
]

// Definir rutas que requieren roles específicos
const adminRoutes = [
  '/settings/users',
  '/api/users'
]

// Verificar si una ruta coincide con un patrón
const matchesPattern = (path: string, patterns: string[]): boolean => {
  return patterns.some(pattern => {
    // Rutas exactas
    if (path === pattern) return true
    
    // Rutas con parámetros dinámicos
    if (pattern.includes('[') && path.startsWith(pattern.split('[')[0])) return true
    
    // Rutas que comienzan con el patrón
    if (path.startsWith(`${pattern}/`)) return true
    
    return false
  })
}

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Permitir acceso a rutas públicas sin autenticación
  if (matchesPattern(path, publicRoutes)) {
    return NextResponse.next()
  }

  // Para rutas API, permitir todas las solicitudes sin verificación de middleware
  // El control de acceso se debe manejar en cada endpoint API
  if (path.startsWith('/api/')) {
    return NextResponse.next()
  }

  // Para rutas de páginas, verificar autenticación
  // Esto permite que el código del lado del cliente maneje la autenticación
  // mediante localStorage, ya que el middleware no puede acceder a localStorage
  
  // Código opcional por si quieres implementar cookies más adelante:
  // const userCookie = request.cookies.get('user')?.value
  // if (userCookie) {
  //   try {
  //     const user = JSON.parse(userCookie)
  //     return NextResponse.next()
  //   } catch (error) {
  //     // Ignorar errores de parsing
  //   }
  // }

  // Por ahora, permita que el cliente maneje la autenticación
  // y las redirecciones basadas en localStorage
  return NextResponse.next()
}

// Configurar qué rutas deben ser procesadas por el middleware
export const config = {
  matcher: [
    /*
     * Match all paths except for:
     * 1. /api/auth (authentication routes)
     * 2. /_next/static (static files)
     * 3. /_next/image (image optimization files)
     * 4. /favicon.ico (favicon file)
     * 5. /logo.png (logo file)
     * 6. /placeholder.svg (placeholder image)
     */
    '/((?!_next/static|_next/image|favicon.ico|logo.png|placeholder.svg).*)',
  ],
} 