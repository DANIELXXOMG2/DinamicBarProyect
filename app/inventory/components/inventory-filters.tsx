import { Filter, Tag, X } from 'lucide-react';

import { Category } from '../types/index';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface InventoryFiltersProperties {
  readonly categories: readonly Category[];
  readonly selectedCategory: string | null;
  readonly searchQuery: string;
  readonly onCategorySelect: (categoryId: string | null) => void;
  readonly onSearchChange: (query: string) => void;
  readonly onResetFilters: () => void;
  readonly getCategoryProductCount: Record<string, number>;
  readonly totalProductsCount: number;
  readonly hasActiveFilters: boolean;
}

export function InventoryFilters({
  categories,
  selectedCategory,
  searchQuery,
  onCategorySelect,
  onSearchChange,
  onResetFilters,
  getCategoryProductCount,
  totalProductsCount,
  hasActiveFilters,
}: InventoryFiltersProperties) {
  return (
    <div className="mb-6">
      <div className="mb-3 flex items-start justify-between">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <Filter className="size-5 text-gray-600" />
          Filtrar por categoría
        </h2>

        {/* Barra de búsqueda */}
        <div className="w-64">
          <div className="relative">
            <Input
              placeholder="Buscar producto..."
              value={searchQuery}
              onChange={(event) => onSearchChange(event.target.value)}
              className="pl-8"
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            {searchQuery && (
              <button
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
                onClick={() => onSearchChange('')}
              >
                <X className="size-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Indicador de filtros activos */}
      {hasActiveFilters && (
        <div className="mb-3 flex items-center justify-between rounded-md bg-blue-50 p-2">
          <div className="flex items-center gap-2">
            <span className="text-sm text-blue-600">
              {(() => {
                if (selectedCategory && searchQuery) {
                  return 'Filtros activos: Categoría y Búsqueda';
                }
                if (selectedCategory) {
                  return 'Filtro activo: Categoría';
                }
                return 'Filtro activo: Búsqueda';
              })()}
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-blue-600 hover:text-blue-800"
            onClick={onResetFilters}
          >
            Limpiar filtros
          </Button>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <Button
          variant={selectedCategory === null ? 'default' : 'outline'}
          onClick={() => onCategorySelect(null)}
          className="mb-2 flex items-center gap-2 px-4 py-2"
        >
          <Tag className="size-4" />
          <span>Todas</span>
          <span className="ml-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
            {totalProductsCount}
          </span>
        </Button>
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? 'default' : 'outline'}
            onClick={() => onCategorySelect(category.id)}
            className="mb-2 flex items-center gap-2 px-4 py-2"
          >
            <span>{category.name}</span>
            <span
              className={`ml-1 px-2 py-0.5 ${selectedCategory === category.id ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-700'} rounded-full text-xs font-medium`}
            >
              {getCategoryProductCount[category.id] ?? 0}
            </span>
          </Button>
        ))}
      </div>
    </div>
  );
}
