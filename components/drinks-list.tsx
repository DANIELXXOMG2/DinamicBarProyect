import { useState, useEffect, useCallback } from 'react';

import { CompactItemCard } from './compact-item-card';

interface Product {
  id: string;
  name: string;
  salePrice: number;
  stock: number;
  type: 'ALCOHOLIC' | 'NON_ALCOHOLIC';
  image?: string;
  category: {
    name: string;
  };
}

interface DrinksListProperties {
  readonly category?: string;
  readonly onProductsLoad?: (categoryCounts: Record<string, number>) => void;
}

export function DrinksList({
  category = 'Cervezas',
  onProductsLoad,
}: DrinksListProperties) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/inventory/products');
      if (response.ok) {
        const { products } = await response.json();
        setProducts(products);

        // Calcular conteos por categoría
        const categoryCounts = new Map<string, number>();
        for (const product of products) {
          const categoryName = product.category.name;
          const currentCount = categoryCounts.get(categoryName) || 0;
          categoryCounts.set(categoryName, currentCount + 1);
        }

        onProductsLoad?.(Object.fromEntries(categoryCounts));
      } else {
        setError('Error al cargar los productos');
      }
    } catch (error) {
      console.error('Error loading products:', error);
      setError('Error al cargar los productos');
    } finally {
      setLoading(false);
    }
  }, [onProductsLoad]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  if (loading) {
    return (
      <div className="flex h-32 items-center justify-center">
        <div className="text-gray-500">Cargando productos...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-32 items-center justify-center">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  const filteredProducts = products.filter(
    (product) => product.category.name === category
  );

  if (filteredProducts.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center">
        <div className="text-gray-500">No hay productos en esta categoría</div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {filteredProducts.map((product) => (
        <CompactItemCard
          key={product.id}
          title={product.name}
          price={product.salePrice}
          stock={product.stock}
          type={product.type === 'ALCOHOLIC' ? 'Alc' : 'NoAlc'}
        />
      ))}
    </div>
  );
}
