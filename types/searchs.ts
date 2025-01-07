export type {
  ProductSearchResponse,
  Product,
  ArticleSearchResponse,
  Article,
  FormattedArticle,
  TransactionSearchResponse,
  TransactionSearch,
  UserSearch,
  FormattedTransaction,
};

type ProductSearchResponse = Product[];

type ArticleSearchResponse = Article[];

type TransactionSearchResponse = TransactionSearch[];

interface Product {
  id: number;
  createdAt: string;
  deletedDate: any;
  description?: string | null;
  name: string;
  updatedAt: string;
  version: number;
}

interface Article {
  id: number;
  barcode: string;
  createdAt: string;
  deletedDate: any;
  factor: number;
  multiple: string;
  product: Product;
  updatedAt: string;
  version: number;
}

interface FormattedArticle {
  name: string;
  id: number;
  barcode: string;
  createdAt: string;
  deletedDate: any;
  factor: number;
  multiple: string;
  product: Product;
  updatedAt: string;
  version: number;
}

interface TransactionSearch {
  createdAt: string;
  deletedDate: any;
  folio_number: string;
  id: number;
  person_name: string;
  transaction_date: string;
  transaction_type: 'ENTRY' | 'EXIT';
  updatedAt: string;
  user: UserSearch;
  version: number;
}

interface FormattedTransaction {
  createdAt: string;
  deletedDate: any;
  folio_number: string;
  id: number;
  person_name: string;
  transaction_date: string;
  transaction_type: string;
  updatedAt: string;
  user: UserSearch;
  version: number;
  name: string;
}

interface UserSearch {
  createdAt: string;
  deletedDate: any;
  email: string;
  first_name: string;
  id: number;
  last_name: string;
  updatedAt: string;
  version: number;
}
