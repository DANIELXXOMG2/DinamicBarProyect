'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { type Table } from '@/lib/services/tables';

export default function TableDetailsPage() {
  const [table, setTable] = useState<Table | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const params = useParams();
  const { id } = params;

  useEffect(() => {
    const fetchTableData = async () => {
      if (id) {
        try {
          const response = await fetch(`/api/tables/${id as string}`);
          if (!response.ok) {
            throw new Error('Failed to fetch table details');
          }
          const data = await response.json();
          setTable(data);
        } catch (error_) {
          if (error_ instanceof Error) {
            setError(error_.message);
          }
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchTableData().catch((error) => {
      setError(error.message);
    });
  }, [id]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!table) {
    return <div>Table not found.</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Mesa: {table.name}</h1>
      {/* Aquí se mostrará el contenido de la mesa, como productos, total, etc. */}
      <div className="mt-4">
        <p>Contenido de la mesa (próximamente)...</p>
        <p>Total: (próximamente)...</p>
      </div>
    </div>
  );
}
