export type {
  ProductSearchResponse,
  Product,
  ArticleSearchResponse,
  Article,
  FormattedArticle,
};

type ProductSearchResponse = Product[];

type ArticleSearchResponse = Article[];

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
