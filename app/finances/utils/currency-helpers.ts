// Utilidades para formateo de moneda y cálculos financieros

// Función para formatear moneda en pesos colombianos
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Función para calcular el total de una lista de elementos con amount
export const calculateTotal = <T extends { amount: number }>(
  items: T[]
): number => {
  return items.reduce((sum, item) => sum + item.amount, 0);
};

// Función para calcular totales de compras (subtotal, IVA, total)
export const calculatePurchaseTotals = (
  items: Array<{
    quantity: number;
    purchasePrice: number;
    iva?: number;
  }>
): { subtotal: number; totalIva: number; grandTotal: number } => {
  const subtotal = items.reduce(
    (sum, item) => sum + item.quantity * item.purchasePrice,
    0
  );

  const totalIva = items.reduce(
    (sum, item) =>
      sum + (item.quantity * item.purchasePrice * (item.iva || 0)) / 100,
    0
  );

  const grandTotal = subtotal + totalIva;

  return { subtotal, totalIva, grandTotal };
};

// Función para calcular el total de un ítem individual
export const calculateItemTotal = (item: {
  quantity: number;
  purchasePrice: number;
  iva?: number;
}): number => {
  const subtotal = item.quantity * item.purchasePrice;
  const ivaAmount = (subtotal * (item.iva || 0)) / 100;
  return subtotal + ivaAmount;
};
