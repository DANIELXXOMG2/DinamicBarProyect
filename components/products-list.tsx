'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';

import { ProductCard } from '@/components/product-card';
import { toast } from '@/hooks/use-toast';

interface Product {
  id: string;
  name: string;
  purchasePrice: number;
  salePrice: number;
  stock: number;
  type: 'ALCOHOLIC' | 'NON_ALCOHOLIC';
  image?: string;
  category: {
    name: string;
  };
}

interface ProductsListProperties {
  readonly category?: string;
  readonly searchQuery?: string;
  readonly selectedTable?: string | null;
  readonly onProductsLoad?: (categoryCounts: Record<string, number>) => void;
}

export function ProductsList({
  category = 'Cervezas',
  searchQuery = '',
  selectedTable,
  onProductsLoad,
}: ProductsListProperties) {
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

        // Calcular conteos por categoría de forma segura
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Filtrado eficiente por búsqueda y categoría
  const filteredProducts = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();

    // Filtrado por búsqueda
    if (query) {
      return products.filter((product) => {
        const nameMatch = product.name.toLowerCase().includes(query);
        const categoryMatch = product.category.name
          .toLowerCase()
          .includes(query);
        const priceMatch = product.salePrice.toString().includes(query);
        return nameMatch || categoryMatch || priceMatch;
      });
    }

    // Filtrado por categoría
    if (category) {
      return products.filter((product) => product.category.name === category);
    }

    // Sin filtros, devolver todos los productos
    return products;
  }, [products, category, searchQuery]);

  const handleAddToTable = async (productId: string, quantity = 1) => {
    if (!selectedTable) {
      toast({
        title: 'Mesa no seleccionada',
        description:
          'Por favor selecciona una mesa antes de agregar productos.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const product = products.find((p) => p.id === productId);
      if (!product) {
        throw new Error('Producto no encontrado');
      }

      const response = await fetch(`/api/tables/${selectedTable}/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId,
          quantity,
        }),
      });

      if (response.ok) {
        toast({
          title: 'Producto agregado',
          description: `${product.name} agregado a la mesa.`,
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al agregar producto');
      }
    } catch (error) {
      console.error('Error adding product to table:', error);
      toast({
        title: 'Error',
        description:
          error instanceof Error
            ? error.message
            : 'Error al agregar producto a la mesa.',
        variant: 'destructive',
      });
    }
  };

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

  if (filteredProducts.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center">
        <div className="text-gray-500">
          {searchQuery.trim()
            ? `No se encontraron productos para la búsqueda: ${searchQuery}`
            : 'No hay productos en esta categoría'}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {searchQuery.trim() && (
        <div className="mb-3 text-sm text-gray-600">
          {filteredProducts.length} resultado
          {filteredProducts.length === 1 ? '' : 's'} para &apos;{searchQuery}
          &apos;
        </div>
      )}

      <div
        className={`grid gap-4 ${
          // Lógica de columnas dinámicas basada en el número de productos
          (() => {
            const productCount = filteredProducts.length;
            if (productCount <= 8)
              return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
            if (productCount <= 20)
              return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
            if (productCount <= 40)
              return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5';
            return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6';
          })()
        }`}
      >
        {filteredProducts.map((product) => (
          <ProductCard
            key={product.id}
            id={product.id}
            title={product.name}
            salePrice={product.salePrice}
            stock={product.stock}
            type={product.type === 'ALCOHOLIC' ? 'Alc' : 'NoAlc'}
            image={product.image}
            onAddToTable={handleAddToTable}
            canAddToTable={!!selectedTable}
          />
        ))}
      </div>
    </div>
  );
}
