import { Beer, Wine, Sandwich, Coffee, Package, Cigarette, Wrench } from "lucide-react"

interface ProductCategoriesProps {
  activeCategory: string
  onCategoryChange: (category: string) => void
  categoryCounts: Record<string, number>
}

const categories = [
  { label: "Cervezas", icon: Beer },
  { label: "Licores", icon: Wine },
  { label: "Snaks", icon: Sandwich },
  { label: "Gaseosas", icon: Coffee },
  { label: "Miscelánea", icon: Package },
  { label: "Cigarrería", icon: Cigarette },
  { label: "Cacharrería", icon: Wrench },
]

export function ProductCategories({ activeCategory, onCategoryChange, categoryCounts }: ProductCategoriesProps) {
  return (
    <div className="flex gap-3 mb-4 overflow-x-auto pb-2">
      {categories.map((category, index) => {
        const isActive = activeCategory === category.label
        const itemCount = categoryCounts[category.label] || 0
        
        return (
          <div
            key={index}
            className={`flex flex-col items-center p-3 rounded-xl min-w-[100px] ${
              isActive
                ? "bg-green-500 text-white shadow-lg transform scale-105"
                : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
            } cursor-pointer transition-all duration-200 ease-in-out`}
            onClick={() => onCategoryChange(category.label)}
          >
            <category.icon className={`h-6 w-6 mb-2 ${isActive ? "text-white" : "text-gray-600"}`} />
            <span className="text-sm font-medium text-center">{category.label}</span>
            <span className={`text-xs mt-1 ${isActive ? "text-green-100" : "text-gray-500"}`}>
              {itemCount} Items
            </span>
            <span className={`text-xs ${isActive ? "text-green-100" : "text-gray-400"}`}>
              Alt+{index + 1}
            </span>
          </div>
        )
      })}
    </div>
  )
}