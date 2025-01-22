export type {
  ProductsListReponse,
  Inventoryreponse,
  Product,
  Article,
  Transaction,
  User,
  TransactionDetail,
  Almacen,
};

type ProductsListReponse = [Product[], number];

interface Product {
  id: number;
  name: string;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
  version: number;
  deletedDate?: string | null;
}

interface Inventoryreponse {
  total: string;
  totalAvailable: string;
  totalOutsideCountingInventory: string;
  product: Product;
  articles: Article[];
  transactions: Transaction[];
}

interface Article {
  id: number;
  barcode: string;
  multiple: string;
  factor: number;
  warehouse: Almacen;
  createdAt: string;
  updatedAt: string;
  version: number;
  deletedDate: any;
  product: Product;
}

interface Almacen {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
  version: number;
  deletedDate: any;
}

interface Transaction {
  id: number;
  transaction_type: 'ENTRY' | 'EXIT';
  transaction_date: string;
  folio_number: string;
  person_name: string;
  createdAt: string;
  updatedAt: string;
  version: number;
  deletedDate: any;
  user: User;
  transactionDetails: TransactionDetail[];
}

interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
  version: number;
  deletedDate: any;
  roles: any[];
}

interface TransactionDetail {
  id: number;
  serialNumber: string;
  afectation: boolean;
  quantity: number;
  price: number;
  createdAt: string;
  updatedAt: string;
  version: number;
  deletedDate: any;
  article: Article;
}
