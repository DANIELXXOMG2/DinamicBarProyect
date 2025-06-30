'use client';

import { useState, useEffect, useCallback } from 'react';

import { Header } from '@/components/header';
import { ProductCategories } from '@/components/product-categories';
import { ProductsList } from '@/components/products-list';
import { SearchBar } from '@/components/search-bar';
import { TableSelector } from '@/components/table-selector';

export default function ProductsPage() {
  const [activeCategory, setActiveCategory] = useState('Cervezas');
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>(
    {}
  );
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [selectedTableName, setSelectedTableName] = useState<string | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [showTableSelector, setShowTableSelector] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

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

  // Atajos de teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Atajos de categorías (Alt + número)
      if (
        e.altKey &&
        !Number.isNaN(Number.parseInt(e.key)) &&
        Number.parseInt(e.key) >= 1 &&
        Number.parseInt(e.key) <= 7
      ) {
        const categories = [
          'Cervezas',
          'Licores',
          'Snaks',
          'Gaseosas',
          'Miscelánea',
          'Cigarrería',
          'Cacharrería',
        ];
        const selectedCategory = categories[Number.parseInt(e.key) - 1];
        if (selectedCategory) {
          setActiveCategory(selectedCategory);
        }
      }

      // Atajo para enfocar búsqueda (Alt + F)
      if (e.altKey && e.key === 'f') {
        e.preventDefault();
        const searchInput = document.querySelector(
          '#product-search'
        ) as HTMLElement;
        if (searchInput) {
          searchInput.focus();
        }
      }
    };

    globalThis.addEventListener('keydown', handleKeyDown);
    return () => globalThis.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
  };

  const handleProductsLoad = useCallback((counts: Record<string, number>) => {
    setCategoryCounts(counts);
  }, []);

  const handleTableSelect = (tableId: string, tableName: string) => {
    setSelectedTable(tableId);
    setSelectedTableName(tableName);
    setShowTableSelector(false);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
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
      <Header />
      <main className="flex-1 overflow-auto p-4">
        {/* Barra de búsqueda y selector de mesa */}
        <div className="mb-4 flex flex-col justify-between gap-2 md:flex-row md:items-center">
          <SearchBar
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Buscar productos..."
            className="flex-1"
          />

          {/* Selector de mesa */}
          <div className="mb-4 flex items-center gap-2">
            <button
              onClick={() => setShowTableSelector(true)}
              className="rounded-lg bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600"
            >
              {selectedTable
                ? `Mesa: ${selectedTableName}`
                : 'Seleccionar Mesa'}
            </button>
            {selectedTable && (
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <span className="size-2 rounded-full bg-green-500"></span>
                Mesa activa
              </div>
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
          selectedTable={selectedTable}
          onProductsLoad={handleProductsLoad}
        />
      </main>

      {/* Modal selector de mesa */}
      {showTableSelector && (
        <TableSelector
          onSelect={handleTableSelect}
          onClose={() => setShowTableSelector(false)}
        />
      )}
    </div>
  );
}
