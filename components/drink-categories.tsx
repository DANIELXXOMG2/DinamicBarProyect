import { Beer, Wine, Sandwich, Coffee, Package, Cigarette, Wrench } from "lucide-react"
import { useState, useEffect } from "react"

interface DrinkCategoriesProps {
  activeCategory: string
  onCategoryChange: (category: string) => void
  categoryCounts: Record<string, number>
}

const categories = [
  { icon: Beer, label: "Cervezas", shortcut: "1" },
  { icon: Wine, label: "Licores", shortcut: "2" },
  { icon: Sandwich, label: "Snaks", shortcut: "3" },
  { icon: Coffee, label: "Gaseosas", shortcut: "4" },
  { icon: Package, label: "Miscelánea", shortcut: "5" },
  { icon: Cigarette, label: "Cigarrería", shortcut: "6" },
  { icon: Wrench, label: "Cacharrería", shortcut: "7" },
]

export function DrinkCategories({ activeCategory, onCategoryChange, categoryCounts }: DrinkCategoriesProps) {
  return (
    <div className="flex gap-3 mb-4 overflow-x-auto pb-2">
      {categories.map((category, index) => {
        const isActive = activeCategory === category.label
        const itemCount = categoryCounts[category.label] || 0
        
        return (
          <div
            key={index}
            className={`flex flex-col items-center p-3 rounded-xl min-w-[100px] ${
              isActive ? "bg-green-50 text-green-600" : "bg-white"
            } border cursor-pointer hover:bg-green-50 transition-colors`}
            data-shortcut={category.shortcut}
            onClick={() => onCategoryChange(category.label)}
          >
            <category.icon className="h-6 w-6 mb-1" />
            <span className="text-sm font-medium">{category.label}</span>
            <span className="text-xs text-gray-500">{itemCount} Items</span>
            <span className="text-xs text-gray-400 mt-1">Alt+{category.shortcut}</span>
          </div>
        )
      })}
    </div>
  )
}
