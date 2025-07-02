import type {
  Category,
  Product,
  Supplier,
  Purchase,
  PurchaseItem,
  Sale,
  SaleItem,
  CashRegister,
  CashTransaction,
  Voucher,
  Store,
  User,
  TableGroup,
  Table,
  TabItem,
} from '@prisma/client';

type PurchaseWithItems = Purchase & { items: PurchaseItem[] };
type SaleWithItems = Sale & { items: SaleItem[] };
type CashRegisterWithTransactions = CashRegister & {
  transactions: CashTransaction[];
};
type TableWithItems = Table & { items: TabItem[] };

export interface BackupData {
  categories: Category[];
  products: Product[];
  suppliers: Supplier[];
  purchases: PurchaseWithItems[];
  sales: SaleWithItems[];
  cashRegisters: CashRegisterWithTransactions[];
  vouchers: Voucher[];
  store: Store | null;
  users: User[];
  tableGroups: TableGroup[];
  tables: TableWithItems[];
  exportDate: string;
}
