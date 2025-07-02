import { useState, useMemo } from 'react';
import { Product, SortConfig } from '../types';
import { ProductUtils } from '../utils';

export function useSortableData(
  products: readonly Product[],
  initialConfig: SortConfig | null = null
) {
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(
    initialConfig
  );

  const sortedProducts = useMemo(() => {
    const sortableProducts = [...products];
    if (sortConfig !== null) {
      sortableProducts.sort((a, b) => {
        let aValue: string | number;
        let bValue: string | number;

        switch (sortConfig.key) {
          case 'name': {
            aValue = a.name;
            bValue = b.name;
            break;
          }
          case 'stock': {
            aValue = a.stock;
            bValue = b.stock;
            break;
          }
          case 'totalValue': {
            aValue = ProductUtils.getTotalValue(a);
            bValue = ProductUtils.getTotalValue(b);
            break;
          }
          case 'salePrice': {
            aValue = a.salePrice;
            bValue = b.salePrice;
            break;
          }
          default: {
            return 0;
          }
        }

        if (aValue < bValue) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableProducts;
  }, [products, sortConfig]);

  const requestSort = (key: keyof Product | 'totalValue') => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === 'ascending'
    ) {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  return { sortedProducts, requestSort, sortConfig };
}
