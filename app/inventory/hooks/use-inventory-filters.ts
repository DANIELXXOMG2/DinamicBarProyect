import { useState, useMemo } from 'react';

import { Product } from '../types/index';
import { ProductUtils as ProductUtilities } from '../utils';

export function useInventoryFilters(products: Product[]) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProducts = useMemo(() => {
    return ProductUtilities.filterProducts(
      products,
      selectedCategory || '',
      searchQuery
    );
  }, [products, selectedCategory, searchQuery]);

  const handleCategorySelect = (categoryId: string | null) => {
    setSelectedCategory(categoryId === selectedCategory ? null : categoryId);
  };

  const resetFilters = () => {
    setSelectedCategory(null);
    setSearchQuery('');
  };

  const getProductCountByCategory = useMemo(() => {
    return ProductUtilities.getProductCountByCategory(products);
  }, [products]);

  const hasActiveFilters =
    selectedCategory !== null || searchQuery.trim() !== '';

  return {
    selectedCategory,
    searchQuery,
    filteredProducts,
    getProductCountByCategory,
    hasActiveFilters,
    setSearchQuery,
    handleCategorySelect,
    resetFilters,
  };
}
