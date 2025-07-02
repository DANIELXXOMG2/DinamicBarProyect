import {
  Beer,
  Wine,
  Sandwich,
  GlassWater,
  Cigarette,
  Wrench,
  SprayCan,
  HeartPulse,
  Trash2,
  ShoppingBag,
} from 'lucide-react';

import { Category } from '@/lib/services/inventory';

interface ProductCategoriesProperties {
  readonly categories: readonly Category[];
  readonly activeCategory: string;
  readonly onCategoryChange: (category: string) => void;
  readonly categoryCounts: Record<string, number>;
}

const ICONS: Record<string, React.ElementType> = {
  Bebidas: GlassWater,
  Snacks: Sandwich,
  'Aseo y Hogar': SprayCan,
  'Cuidado Personal': ShoppingBag,
  Farmacia: HeartPulse,
  'Ferretería y Papelería': Wrench,
  Desechables: Trash2,
  Cervezas: Beer,
  Licores: Wine,
  Cigarrería: Cigarette,
  default: ShoppingBag,
};

export function ProductCategories({
  categories,
  activeCategory,
  onCategoryChange,
  categoryCounts,
}: ProductCategoriesProperties) {
  const sortedCategories = [...categories].sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  return (
    <div className="mb-4 flex gap-3 overflow-x-auto pb-2">
      {sortedCategories.map((category) => {
        const isActive = activeCategory === category.name;
        const itemCount = categoryCounts[category.name] || 0;
        const Icon = ICONS[category.name] || ICONS.default;

        return (
          <button
            key={category.id}
            type="button"
            className={`flex min-w-[100px] flex-col items-center rounded-xl p-3 ${
              isActive
                ? 'scale-105 bg-green-500 text-white shadow-lg'
                : 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
            } cursor-pointer transition-all duration-200 ease-in-out`}
            onClick={() => onCategoryChange(category.name)}
          >
            <Icon
              className={`mb-2 size-6 ${isActive ? 'text-white' : 'text-gray-600'}`}
            />
            <span className="text-center text-sm font-medium">
              {category.name}
            </span>
            <span
              className={`mt-1 text-xs ${isActive ? 'text-green-100' : 'text-gray-500'}`}
            >
              {itemCount} Items
            </span>
          </button>
        );
      })}
    </div>
  );
}
