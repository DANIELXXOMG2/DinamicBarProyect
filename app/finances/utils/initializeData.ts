// Función para inicializar datos de finanzas
export async function initializeFinancesData() {
  try {
    // Verificar si ya existen datos en las APIs
    const [suppliersResponse, purchasesResponse, vouchersResponse] = await Promise.all([
      fetch('/api/suppliers'),
      fetch('/api/purchases'),
      fetch('/api/vouchers')
    ])

    // Inicializar proveedor por defecto si no existe ninguno
    if (suppliersResponse.ok) {
      const { suppliers } = await suppliersResponse.json()
      if (!suppliers || suppliers.length === 0) {
        await fetch('/api/suppliers', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: 'Proveedor Ejemplo',
            phone: '+1234567890',
            email: 'proveedor@ejemplo.com',
            address: 'Calle Ejemplo 123'
          })
        })
      }
    }

    console.log('Datos de finanzas inicializados desde APIs')
  } catch (error) {
    console.error('Error inicializando datos desde APIs, usando localStorage como fallback:', error)
    
    // Fallback a localStorage si las APIs fallan
    const existingSuppliers = localStorage.getItem('suppliers')
    const existingPurchases = localStorage.getItem('purchases')
    const existingVouchers = localStorage.getItem('vouchers')

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

    if (!existingPurchases) {
      localStorage.setItem('purchases', JSON.stringify([]))
    }

    if (!existingVouchers) {
      localStorage.setItem('vouchers', JSON.stringify([]))
    }

    console.log('Datos de finanzas inicializados desde localStorage')
  }
}

// Función para limpiar todos los datos de finanzas
export async function clearFinancesData() {
  try {
    // Intentar limpiar desde las APIs
    await Promise.all([
      fetch('/api/suppliers', { method: 'DELETE' }),
      fetch('/api/purchases', { method: 'DELETE' }),
      fetch('/api/vouchers', { method: 'DELETE' })
    ])
    console.log('Datos de finanzas limpiados desde APIs')
  } catch (error) {
    console.error('Error limpiando datos desde APIs, usando localStorage:', error)
    // Fallback a localStorage
    localStorage.removeItem('suppliers')
    localStorage.removeItem('purchases')
    localStorage.removeItem('vouchers')
    console.log('Datos de finanzas limpiados desde localStorage')
  }
}

// Función para exportar datos de finanzas
export async function exportFinancesData() {
  try {
    // Intentar exportar desde las APIs
    const [suppliersResponse, purchasesResponse, vouchersResponse] = await Promise.all([
      fetch('/api/suppliers'),
      fetch('/api/purchases'),
      fetch('/api/vouchers')
    ])

    const suppliers = suppliersResponse.ok ? (await suppliersResponse.json()).suppliers || [] : []
    const purchases = purchasesResponse.ok ? (await purchasesResponse.json()).purchases || [] : []
    const vouchers = vouchersResponse.ok ? (await vouchersResponse.json()).vouchers || [] : []
    
    return {
      suppliers,
      purchases,
      vouchers,
      exportDate: new Date().toISOString()
    }
  } catch (error) {
    console.error('Error exportando desde APIs, usando localStorage:', error)
    // Fallback a localStorage
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
}

// Función para importar datos de finanzas
export async function importFinancesData(data: {
  suppliers?: any[]
  purchases?: any[]
  vouchers?: any[]
}) {
  try {
    // Intentar importar a las APIs
    if (data.suppliers) {
      for (const supplier of data.suppliers) {
        await fetch('/api/suppliers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(supplier)
        })
      }
    }
    
    if (data.purchases) {
      for (const purchase of data.purchases) {
        await fetch('/api/purchases', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(purchase)
        })
      }
    }
    
    if (data.vouchers) {
      for (const voucher of data.vouchers) {
        await fetch('/api/vouchers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(voucher)
        })
      }
    }
    
    console.log('Datos de finanzas importados a APIs')
  } catch (error) {
    console.error('Error importando a APIs, usando localStorage:', error)
    // Fallback a localStorage
    if (data.suppliers) {
      localStorage.setItem('suppliers', JSON.stringify(data.suppliers))
    }
    
    if (data.purchases) {
      localStorage.setItem('purchases', JSON.stringify(data.purchases))
    }
    
    if (data.vouchers) {
      localStorage.setItem('vouchers', JSON.stringify(data.vouchers))
    }
    
    console.log('Datos de finanzas importados a localStorage')
  }
}