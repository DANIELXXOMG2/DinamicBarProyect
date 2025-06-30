'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { type Table } from '@/lib/services/tables';

interface Product {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export default function TableDetailsPage() {
  const [table, setTable] = useState<Table | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [adminPassword, setAdminPassword] = useState('');
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
          // Simulación de productos de la mesa
          setProducts([
            { id: '1', name: 'Cerveza', price: 5000, quantity: 2 },
            { id: '2', name: 'Papas Fritas', price: 8000, quantity: 1 },
          ]);
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

  const handleRemoveProduct = (productId: string) => {
    // Lógica para eliminar producto con contraseña
    console.log(
      `Eliminar producto ${productId} con contraseña ${adminPassword}`
    );
  };

  const total = products.reduce(
    (acc, product) => acc + product.price * product.quantity,
    0
  );

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
    <div className="flex h-full flex-col p-4">
      <h1 className="mb-4 text-2xl font-bold">Mesa: {table.name}</h1>

      {/* Lista de productos */}
      <div className="flex-1 overflow-y-auto">
        {products.map((product) => (
          <div
            key={product.id}
            className="mb-2 flex items-center justify-between rounded-lg bg-gray-100 p-2"
          >
            <div>
              <p className="font-semibold">{product.name}</p>
              <p className="text-sm text-gray-600">
                {product.quantity} x ${product.price.toLocaleString()}
              </p>
            </div>
            <p className="font-semibold">
              ${(product.price * product.quantity).toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      {/* Eliminar producto */}
      <div className="my-4 flex items-center gap-2">
        <Input
          type="password"
          placeholder="Contraseña de administrador"
          value={adminPassword}
          onChange={(e) => setAdminPassword(e.target.value)}
        />
        <Button
          onClick={() => handleRemoveProduct('some-product-id')}
          disabled={!adminPassword}
        >
          Eliminar Producto
        </Button>
      </div>

      {/* Total y acciones */}
      <div className="border-t pt-4">
        <div className="mb-4 flex justify-between text-xl font-bold">
          <span>Total:</span>
          <span>${total.toLocaleString()}</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <Button variant="outline">Precuenta</Button>
          <Button variant="outline">Dividir Cuenta</Button>
          <Button>Cerrar Cuenta</Button>
        </div>
      </div>
    </div>
  );
}
