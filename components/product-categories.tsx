import {
  Beer,
  Wine,
  Sandwich,
  Coffee,
  Package,
  Cigarette,
  Wrench,
} from 'lucide-react';

interface ProductCategoriesProperties {
  readonly activeCategory: string;
  readonly onCategoryChange: (category: string) => void;
  readonly categoryCounts: Record<string, number>;
}

const categories = [
  { label: 'Cervezas', icon: Beer },
  { label: 'Licores', icon: Wine },
  { label: 'Snaks', icon: Sandwich },
  { label: 'Gaseosas', icon: Coffee },
  { label: 'Miscelánea', icon: Package },
  { label: 'Cigarrería', icon: Cigarette },
  { label: 'Cacharrería', icon: Wrench },
];

export function ProductCategories({
  activeCategory,
  onCategoryChange,
  categoryCounts,
}: ProductCategoriesProperties) {
  return (
    <div className="mb-4 flex gap-3 overflow-x-auto pb-2">
      {categories.map((category, index) => {
        const isActive = activeCategory === category.label;
        const itemCount = categoryCounts[category.label] || 0;

        return (
          <button
            key={index}
            type="button"
            className={`flex min-w-[100px] flex-col items-center rounded-xl p-3 ${
              isActive
                ? 'scale-105 bg-green-500 text-white shadow-lg'
                : 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
            } cursor-pointer transition-all duration-200 ease-in-out`}
            onClick={() => onCategoryChange(category.label)}
          >
            <category.icon
              className={`mb-2 size-6 ${isActive ? 'text-white' : 'text-gray-600'}`}
            />
            <span className="text-center text-sm font-medium">
              {category.label}
            </span>
            <span
              className={`mt-1 text-xs ${isActive ? 'text-green-100' : 'text-gray-500'}`}
            >
              {itemCount} Items
            </span>
            <span
              className={`text-xs ${isActive ? 'text-green-100' : 'text-gray-400'}`}
            >
              Alt+{index + 1}
            </span>
          </button>
        );
      })}
    </div>
  );
}
