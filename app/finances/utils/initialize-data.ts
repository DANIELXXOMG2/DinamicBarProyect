import { Supplier, Purchase, Voucher } from '@/app/finances/types/purchase';

// Función para inicializar datos de finanzas
export async function initializeFinancesData() {
  try {
    // Verificar si ya existen datos en las APIs
    const [suppliersResponse] = await Promise.all([
      fetch('/api/suppliers'),
      fetch('/api/purchases'),
      fetch('/api/vouchers'),
    ]);

    // Inicializar proveedor por defecto si no existe ninguno
    if (suppliersResponse.ok) {
      const { suppliers } = await suppliersResponse.json();
      if (!suppliers || suppliers.length === 0) {
        await fetch('/api/suppliers', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: 'Proveedor Ejemplo',
            phone: '+1234567890',
            email: 'proveedor@ejemplo.com',
            address: 'Calle Ejemplo 123',
          }),
        });
      }
    }

    console.log('Datos de finanzas inicializados desde APIs');
  } catch {
    console.error(
      'Error inicializando datos desde APIs, usando localStorage como fallback:'
    );

    // Fallback a localStorage si las APIs fallan
    const existingSuppliers = localStorage.getItem('suppliers');
    const existingPurchases = localStorage.getItem('purchases');
    const existingVouchers = localStorage.getItem('vouchers');

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
          updatedAt: new Date().toISOString(),
        },
      ];
      localStorage.setItem('suppliers', JSON.stringify(defaultSuppliers));
    }

    if (!existingPurchases) {
      localStorage.setItem('purchases', JSON.stringify([]));
    }

    if (!existingVouchers) {
      localStorage.setItem('vouchers', JSON.stringify([]));
    }

    console.log('Datos de finanzas inicializados desde localStorage');
  }
}

// Función para limpiar todos los datos de finanzas
export async function clearFinancesData() {
  try {
    // Intentar limpiar desde las APIs
    await Promise.all([
      fetch('/api/suppliers', { method: 'DELETE' }),
      fetch('/api/purchases', { method: 'DELETE' }),
      fetch('/api/vouchers', { method: 'DELETE' }),
    ]);
    console.log('Datos de finanzas limpiados desde APIs');
  } catch {
    console.error('Error limpiando datos desde APIs, usando localStorage:');
    // Fallback a localStorage
    localStorage.removeItem('suppliers');
    localStorage.removeItem('purchases');
    localStorage.removeItem('vouchers');
    console.log('Datos de finanzas limpiados desde localStorage');
  }
}

// Función para exportar datos de finanzas
export async function exportFinancesData() {
  try {
    // Intentar exportar desde las APIs
    const [suppliersResponse, purchasesResponse, vouchersResponse] =
      await Promise.all([
        fetch('/api/suppliers'),
        fetch('/api/purchases'),
        fetch('/api/vouchers'),
      ]);

    const suppliersData = await suppliersResponse.json();
    const suppliers = suppliersResponse.ok ? suppliersData.suppliers || [] : [];
    const purchasesData = await purchasesResponse.json();
    const purchases = purchasesResponse.ok ? purchasesData.purchases || [] : [];
    const vouchersData = await vouchersResponse.json();
    const vouchers = vouchersResponse.ok ? vouchersData.vouchers || [] : [];

    return {
      suppliers,
      purchases,
      vouchers,
      exportDate: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error exportando desde APIs, usando localStorage:', error);
    // Fallback a localStorage
    const suppliers = JSON.parse(localStorage.getItem('suppliers') || '[]');
    const purchases = JSON.parse(localStorage.getItem('purchases') || '[]');
    const vouchers = JSON.parse(localStorage.getItem('vouchers') || '[]');

    return {
      suppliers,
      purchases,
      vouchers,
      exportDate: new Date().toISOString(),
    };
  }
}

// Helper function to post data to a specific API endpoint
async function postData<T>(endpoint: string, items: T[] | undefined) {
  if (!items) return;
  for (const item of items) {
    await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    });
  }
}

// Helper function to save data to localStorage
function saveDataToLocalStorage<T>(key: string, items: T[] | undefined) {
  if (items) {
    localStorage.setItem(key, JSON.stringify(items));
  }
}

// Función para importar datos de finanzas
export async function importFinancesData(data: {
  suppliers?: Supplier[];
  purchases?: Purchase[];
  vouchers?: Voucher[];
}) {
  try {
    // Intentar importar a las APIs
    await Promise.all([
      postData('/api/suppliers', data.suppliers),
      postData('/api/purchases', data.purchases),
      postData('/api/vouchers', data.vouchers),
    ]);
    console.log('Datos de finanzas importados a APIs');
  } catch (error) {
    console.error('Error importando a APIs, usando localStorage:', error);
    // Fallback a localStorage
    saveDataToLocalStorage('suppliers', data.suppliers);
    saveDataToLocalStorage('purchases', data.purchases);
    saveDataToLocalStorage('vouchers', data.vouchers);
    console.log('Datos de finanzas importados a localStorage');
  }
}
