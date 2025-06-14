// Función para inicializar datos de finanzas
export function initializeFinancesData() {
  // Verificar si ya existen datos en localStorage
  const existingSuppliers = localStorage.getItem('suppliers')
  const existingPurchases = localStorage.getItem('purchases')
  const existingVouchers = localStorage.getItem('vouchers')

  // Inicializar proveedores si no existen
  if (!existingSuppliers) {
    const defaultSuppliers = [
      {
        id: '1',
        name: 'Proveedor Ejemplo',
        phone: '+1234567890',
        email: 'proveedor@ejemplo.com',
        address: 'Calle Ejemplo 123',
        image: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ]
    localStorage.setItem('suppliers', JSON.stringify(defaultSuppliers))
  }

  // Inicializar compras si no existen
  if (!existingPurchases) {
    localStorage.setItem('purchases', JSON.stringify([]))
  }

  // Inicializar comprobantes si no existen
  if (!existingVouchers) {
    localStorage.setItem('vouchers', JSON.stringify([]))
  }

  console.log('Datos de finanzas inicializados')
}

// Función para limpiar todos los datos de finanzas
export function clearFinancesData() {
  localStorage.removeItem('suppliers')
  localStorage.removeItem('purchases')
  localStorage.removeItem('vouchers')
  console.log('Datos de finanzas limpiados')
}

// Función para exportar datos de finanzas
export function exportFinancesData() {
  const suppliers = JSON.parse(localStorage.getItem('suppliers') || '[]')
  const purchases = JSON.parse(localStorage.getItem('purchases') || '[]')
  const vouchers = JSON.parse(localStorage.getItem('vouchers') || '[]')

  return {
    suppliers,
    purchases,
    vouchers,
    exportDate: new Date().toISOString()
  }
}

// Función para importar datos de finanzas
export function importFinancesData(data: any) {
  try {
    if (data.suppliers) {
      localStorage.setItem('suppliers', JSON.stringify(data.suppliers))
    }
    if (data.purchases) {
      localStorage.setItem('purchases', JSON.stringify(data.purchases))
    }
    if (data.vouchers) {
      localStorage.setItem('vouchers', JSON.stringify(data.vouchers))
    }
    console.log('Datos de finanzas importados exitosamente')
    return true
  } catch (error) {
    console.error('Error al importar datos de finanzas:', error)
    return false
  }
}