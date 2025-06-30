export interface PurchaseItem {
  id?: string;
  productId: string;
  quantity: number;
  purchasePrice: number;
  salePrice: number;
  iva?: number;
  total: number;
  product: Product;
}

export interface Purchase {
  id: string;
  date: string;
  time: string;
  supplierId: string;
  supplierName: string;
  companyImage?: string;
  items: PurchaseItem[];
  subtotal: number;
  totalIva: number;
  grandTotal: number;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
}

export interface Product {
  id: string;
  name: string;
  image?: string;
  purchasePrice: number;
  salePrice: number;
  stock: number;
  type: 'ALCOHOLIC' | 'NON_ALCOHOLIC';
  categoryId: string;
  category: Category;
  createdAt: string;
  updatedAt: string;
}

export interface Supplier {
  id: string;
  name: string;
  phone?: string;
  image?: string;
  nit?: string;
  address?: string;
}

export interface Voucher {
  id: string;
  type: 'INCOME' | 'EXPENSE';
  amount: number;
  description: string;
  date: string;
  createdAt: string;
}
