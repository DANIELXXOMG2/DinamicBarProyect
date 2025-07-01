'use client';

import { useState, useEffect, useCallback } from 'react';

import { Table, Waves } from 'lucide-react';

import { ProductCategories } from '@/components/product-categories';
import { ProductsList } from '@/components/products-list';
import { SearchBar } from '@/components/search-bar';
import { TableSelectionDialog } from '@/components/table-selection-dialog';
import { Button } from '@/components/ui/button';

interface TableData {
  id: string;
  name: string;
}

export default function ProductsPage() {
  const [activeCategory, setActiveCategory] = useState('Cervezas');
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>(
    {}
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTable, setSelectedTable] = useState<TableData | null>(null);
  const [isTableSelectionOpen, setTableSelectionOpen] = useState(false);

  // Verificar autenticación
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    console.log('🔍 Verificando autenticación en página de productos');

    if (!storedUser) {
      console.log('🚫 No hay usuario en localStorage, redirigiendo a login');
      globalThis.location.href = '/login';
      return;
    }

    try {
      const user = JSON.parse(storedUser);
      console.log('✅ Usuario autenticado:', user);
      setIsLoading(false);
    } catch (error) {
      console.error('❌ Error al procesar usuario:', error);
      localStorage.removeItem('user');
      globalThis.location.href = '/login';
    }
  }, []);

  // Atajos de teclado para categorías
  useEffect(() => {
    const handleCategoryShortcut = (event: Event) => {
      if (
        event instanceof CustomEvent &&
        event.detail &&
        typeof event.detail.categoryIndex === 'number'
      ) {
        const categoryIndex = event.detail.categoryIndex;
        const categories = [
          'Bebidas',
          'Snacks',
          'Aseo y Hogar',
          'Cuidado Personal',
          'Farmacia',
          'Ferretería y Papelería',
          'Desechables',
          'Cervezas',
          'Licores',
          'Cigarrería',
        ];
        const selectedCategory = categories.at(categoryIndex);
        if (selectedCategory) {
          setActiveCategory(selectedCategory);
        }
      }
    };

    globalThis.addEventListener('category-shortcut', handleCategoryShortcut);
    return () => {
      globalThis.removeEventListener(
        'category-shortcut',
        handleCategoryShortcut
      );
    };
  }, []);

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
  };

  const handleProductsLoad = useCallback((counts: Record<string, number>) => {
    setCategoryCounts(counts);
  }, []);

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  const handleSelectTable = (table: TableData) => {
    setSelectedTable(table);
    setTableSelectionOpen(false);
  };

  const handleClearTable = () => {
    setSelectedTable(null);
  };

  // Si está cargando, mostrar indicador
  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="text-center">
          <div className="mx-auto size-12 animate-spin rounded-full border-b-2 border-gray-900"></div>
          <p className="mt-4 text-gray-600">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <main className="flex-1 overflow-auto p-4">
        {/* Barra de búsqueda y selector de mesa */}
        <div className="mb-4 flex flex-col justify-between gap-2 md:flex-row md:items-center">
          <SearchBar
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Buscar productos..."
            className="flex-1"
          />

          {/* Botón para seleccionar mesa */}
          <div className="flex items-center gap-2">
            {selectedTable ? (
              <div className="flex items-center gap-2 rounded-md bg-green-100 p-2 text-green-800">
                <Table className="size-5" />
                <span className="font-semibold">
                  Mesa: {selectedTable.name}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearTable}
                  className="text-green-800 hover:bg-green-200"
                >
                  Cambiar
                </Button>
              </div>
            ) : (
              <Button
                onClick={() => setTableSelectionOpen(true)}
                className="flex items-center gap-2"
              >
                <Waves className="size-5" />
                Seleccionar Mesa
              </Button>
            )}
          </div>
        </div>

        {/* Categorías de productos */}
        <ProductCategories
          activeCategory={activeCategory}
          onCategoryChange={handleCategoryChange}
          categoryCounts={categoryCounts}
        />

        {/* Lista de productos */}
        <ProductsList
          category={activeCategory}
          searchQuery={searchQuery}
          onProductsLoad={handleProductsLoad}
          selectedTable={selectedTable?.id ?? null}
        />

        {/* Diálogo para seleccionar mesa */}
        <TableSelectionDialog
          isOpen={isTableSelectionOpen}
          onOpenChange={setTableSelectionOpen}
          onSelectTable={handleSelectTable}
        />
      </main>
    </div>
  );
}
