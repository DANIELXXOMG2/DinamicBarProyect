import { Plus, Minus, Package, AlertTriangle, Edit, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Product } from "../types/index"
import { ProductUtils, FormatUtils } from "../utils"

interface ProductsTableProps {
  products: Product[]
  loading: boolean
  onStockChange: (id: string, change: number) => void
  onEditImage: (productId: string, currentImage?: string) => void
  onDeleteImage: (productId: string) => void
  hasFilters: boolean
}

export function ProductsTable({
  products,
  loading,
  onStockChange,
  onEditImage,
  onDeleteImage,
  hasFilters
}: ProductsTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Inventario Actual</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Imagen</TableHead>
              <TableHead>Producto</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Stock Mín.</TableHead>
              <TableHead>Precio Compra</TableHead>
              <TableHead>Valor Total</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Precio Venta</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-8">
                  Cargando productos...
                </TableCell>
              </TableRow>
            ) : products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-8 text-gray-500">
                  {hasFilters
                    ? "No hay productos que coincidan con los filtros" 
                    : "No hay productos en el inventario"}
                </TableCell>
              </TableRow>
            ) : (
              products.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="relative group">
                      {item.image ? (
                        <>
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-12 h-12 object-cover rounded-md border"
                            onError={(e) => {
                              e.currentTarget.src = '/placeholder-product.png'
                            }}
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-md flex items-center justify-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-white hover:bg-white hover:bg-opacity-20"
                              onClick={() => onEditImage(item.id, item.image || undefined)}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-white hover:bg-white hover:bg-opacity-20"
                              onClick={() => onDeleteImage(item.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </>
                      ) : (
                        <div 
                          className="w-12 h-12 bg-gray-200 rounded-md border flex items-center justify-center cursor-pointer hover:bg-gray-300 transition-colors"
                          onClick={() => onEditImage(item.id)}
                        >
                          <Package className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{item.category.name}</TableCell>
                  <TableCell>
                    <span className={item.stock <= (item.minStock || 0) ? "text-red-600 font-bold" : ""}>
                      {item.stock}
                    </span>
                  </TableCell>
                  <TableCell>{item.minStock || 0}</TableCell>
                  <TableCell>{ProductUtils.formatPrice(item.purchasePrice)}</TableCell>
                  <TableCell>{FormatUtils.formatCurrency(ProductUtils.getTotalValue(item))}</TableCell>
                  <TableCell>
                    {ProductUtils.getStockStatus(item) === 'low' ? (
                      <span className="text-red-600 font-medium flex items-center gap-1">
                        <AlertTriangle className="h-4 w-4" />
                        Bajo
                      </span>
                    ) : (
                      <span className="text-green-600 font-medium">Normal</span>
                    )}
                  </TableCell>
                  <TableCell>{ProductUtils.formatPrice(item.salePrice)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => onStockChange(item.id, -1)}
                        disabled={item.stock <= 0}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => onStockChange(item.id, 1)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}