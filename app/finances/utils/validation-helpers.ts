// Utilidades para validación de formularios

// Función para validar si un string no está vacío
export const isNotEmpty = (value: string): boolean => {
  return value.trim().length > 0;
};

// Función para validar si un número es positivo
export const isPositiveNumber = (value: number): boolean => {
  return value > 0;
};

// Función para validar campos requeridos de un objeto
export const validateRequiredFields = <T extends Record<string, unknown>>(
  obj: T,
  requiredFields: (keyof T)[]
): boolean => {
  return requiredFields.every((field) => {
    const value = obj[field];
    if (typeof value === 'string') {
      return isNotEmpty(value);
    }
    if (typeof value === 'number') {
      return isPositiveNumber(value);
    }
    return value != null;
  });
};

// Función para validar email
export const isValidEmail = (email: string): boolean => {
  return email.includes('@') && email.includes('.') && email.length > 5;
};

// Función para validar teléfono (formato colombiano)
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^3\d{9}$/;
  return phoneRegex.test(phone.replaceAll(' ', ''));
};

// Función para validar que un array no esté vacío
export const isNotEmptyArray = <T>(array: T[]): boolean => {
  return array.length > 0;
};

// Función para validar formulario de voucher
export const validateVoucherForm = (voucher: {
  description: string;
  amount: number;
  date: string;
  time: string;
}): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!isNotEmpty(voucher.description)) {
    errors.push('La descripción es requerida');
  }

  if (!isPositiveNumber(voucher.amount)) {
    errors.push('El monto debe ser mayor a 0');
  }

  if (!isNotEmpty(voucher.date)) {
    errors.push('La fecha es requerida');
  }

  if (!isNotEmpty(voucher.time)) {
    errors.push('La hora es requerida');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Función para validar formulario de compra
export const validatePurchaseForm = (purchase: {
  supplierId: string;
  items: unknown[];
}): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!isNotEmpty(purchase.supplierId)) {
    errors.push('Debe seleccionar un proveedor');
  }

  if (!isNotEmptyArray(purchase.items)) {
    errors.push('Debe agregar al menos un producto');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};
