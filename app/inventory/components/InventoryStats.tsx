import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, AlertTriangle } from "lucide-react"
import { Product } from "../types/index"
import { ProductUtils, FormatUtils } from "../utils"

interface InventoryStatsProps {
  products: Product[]
}

export function InventoryStats({ products }: InventoryStatsProps) {
  const lowStockItems = products.filter(ProductUtils.isLowStock).length
  const totalValue = products.reduce((acc, product) => acc + ProductUtils.getTotalValue(product), 0)
  const totalUnits = products.reduce((acc, product) => acc + product.stock, 0)

  return (
    <div className="grid grid-cols-4 gap-4 mb-6">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-blue-600" />
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
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <div>
              <div className="text-sm text-gray-500">Stock Bajo</div>
              <div className="text-2xl font-bold text-red-600">{lowStockItems}</div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div>
            <div className="text-sm text-gray-500">Valor Total</div>
            <div className="text-2xl font-bold">{FormatUtils.formatCurrency(totalValue)}</div>
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
  )
}