export type {
  TransactionCreate,
  Unit,
  Transaction,
  UserTransaction,
  TransactionDetail,
  Article,
  Product,
};

interface TransactionCreate {
  transactionDate: string;
  emitter: string;
  type: 'ENTRY' | 'EXIT';
  folio: string;
  units: Unit[];
}

interface Unit {
  name: string;
  description: string;
  barcode: string;
  multiple: string;
  factor: number;
  almacen: string | undefined;
  quantity: number;
  afectation: boolean;
  productId?: number | undefined;
  articleId?: number | undefined;
  serial?: string | undefined;
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
  deletedDate: string | null;
  user: UserTransaction;
  transactionDetails: TransactionDetail[];
}

interface UserTransaction {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
  version: number;
  deletedDate: string | null;
  roles: string[];
}

interface TransactionDetail {
  id: number;
  serialNumber: string | null;
  afectation: boolean;
  quantity: number;
  price: number;
  createdAt: string;
  updatedAt: string;
  version: number;
  deletedDate: string | null;
  article: Article;
}

interface Article {
  id: number;
  barcode: string;
  multiple: string;
  factor: number;
  almacen: string | null;
  createdAt: string;
  updatedAt: string;
  version: number;
  deletedDate: string | null;
  product: Product;
}

interface Product {
  id: number;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  version: number;
  deletedDate: string | null;
}
