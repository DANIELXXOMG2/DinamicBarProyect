import { Package, AlertTriangle } from 'lucide-react';

import { Product } from '../types/index';
import {
  ProductUtils as ProductUtilities,
  FormatUtils as FormatUtilities,
} from '../utils';
import { Card, CardContent } from '@/components/ui/card';

interface InventoryStatsProperties {
  readonly products: readonly Product[];
}

export function InventoryStats({ products }: InventoryStatsProperties) {
  const lowStockItems = products.filter((product) =>
    ProductUtilities.isLowStock(product)
  ).length;
  const totalValue = products.reduce(
    (accumulator, product) =>
      accumulator + ProductUtilities.getTotalValue(product),
    0
  );
  const totalUnits = products.reduce(
    (accumulator, product) => accumulator + product.stock,
    0
  );

  return (
    <div className="mb-6 grid grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Package className="size-5 text-blue-600" />
            <div>
              <div className="text-sm text-gray-500">Total Productos</div>
              <div className="text-2xl font-bold">{products.length}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="size-5 text-red-600" />
            <div>
              <div className="text-sm text-gray-500">Stock Bajo</div>
              <div className="text-2xl font-bold text-red-600">
                {lowStockItems}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div>
            <div className="text-sm text-gray-500">Valor Total</div>
            <div className="text-2xl font-bold">
              {FormatUtilities.formatCurrency(totalValue)}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div>
            <div className="text-sm text-gray-500">Unidades Totales</div>
            <div className="text-2xl font-bold">{totalUnits}</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
