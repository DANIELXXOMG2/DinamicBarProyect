export interface PurchaseItem {
  productId: string
  productName: string
  productImage?: string
  quantity: number
  purchasePrice: number
  salePrice: number
  iva?: number
  total: number
}

export interface Purchase {
  id: string
  date: string
  time: string
  supplierId: string
  supplierName: string
  companyImage?: string
  items: PurchaseItem[]
  subtotal: number
  totalIva: number
  grandTotal: number
  createdAt: string
}

export interface Product {
  id: string
  name: string
  image?: string
}

export interface Supplier {
  id: string
  name: string
  phone?: string
  image?: string
  nit?: string
  address?: string
}