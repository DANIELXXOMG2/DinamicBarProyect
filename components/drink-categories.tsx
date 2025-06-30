import {
  Beer,
  Wine,
  Sandwich,
  Coffee,
  Package,
  Cigarette,
  Wrench,
} from 'lucide-react';

interface DrinkCategoriesProperties {
  readonly activeCategory: string;
  readonly onCategoryChange: (category: string) => void;
  readonly categoryCounts: Record<string, number>;
}

const categories = [
  { icon: Beer, label: 'Cervezas', shortcut: '1' },
  { icon: Wine, label: 'Licores', shortcut: '2' },
  { icon: Sandwich, label: 'Snaks', shortcut: '3' },
  { icon: Coffee, label: 'Gaseosas', shortcut: '4' },
  { icon: Package, label: 'Miscelánea', shortcut: '5' },
  { icon: Cigarette, label: 'Cigarrería', shortcut: '6' },
  { icon: Wrench, label: 'Cacharrería', shortcut: '7' },
];

export function DrinkCategories({
  activeCategory,
  onCategoryChange,
  categoryCounts,
}: DrinkCategoriesProperties) {
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
              isActive ? 'bg-green-50 text-green-600' : 'bg-white'
            } cursor-pointer border transition-colors hover:bg-green-50`}
            data-shortcut={category.shortcut}
            onClick={() => onCategoryChange(category.label)}
          >
            <category.icon className="mb-1 size-6" />
            <span className="text-sm font-medium">{category.label}</span>
            <span className="text-xs text-gray-500">{itemCount} Items</span>
            <span className="mt-1 text-xs text-gray-400">
              Alt+{category.shortcut}
            </span>
          </button>
        );
      })}
    </div>
  );
}
