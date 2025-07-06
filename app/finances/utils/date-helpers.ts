// Utilidades para formateo de fechas
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

// Función para obtener la fecha actual en formato ISO
export const getCurrentDateISO = (): string => {
  return new Date().toISOString().split('T')[0];
};

// Función para filtrar elementos por fecha
export const filterByDate = <T extends { date: string }>(
  items: T[],
  selectedDate: string
): T[] => {
  if (!selectedDate) return items;
  return items.filter((item) => item.date.split('T')[0] === selectedDate);
};

// Función para ordenar elementos por fecha de creación (más recientes primero)
export const sortByCreatedAt = <T extends { createdAt: string }>(
  items: T[]
): T[] => {
  return [...items].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
};
