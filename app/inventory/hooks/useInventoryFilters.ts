import { useState, useEffect, useMemo } from "react"
import { Product, Category } from "../types/index"
import { ProductUtils } from "../utils"

export function useInventoryFilters(products: Product[]) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  const filteredProducts = useMemo(() => {
    return ProductUtils.filterProducts(products, selectedCategory || '', searchQuery)
  }, [products, selectedCategory, searchQuery])

  const handleCategorySelect = (categoryId: string | null) => {
    setSelectedCategory(categoryId === selectedCategory ? null : categoryId)
  }

  const resetFilters = () => {
    setSelectedCategory(null)
    setSearchQuery("")
  }

  const getProductCountByCategory = useMemo(() => {
    return ProductUtils.getProductCountByCategory(products)
  }, [products])

  const hasActiveFilters = selectedCategory !== null || searchQuery.trim() !== ""

  return {
    selectedCategory,
    searchQuery,
    setSearchQuery,
    filteredProducts,
    handleCategorySelect,
    resetFilters,
    getProductCountByCategory,
    hasActiveFilters
  }
}