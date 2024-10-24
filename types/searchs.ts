export type { ProductSearchResponse, Product };

type ProductSearchResponse = Product[];

interface Product {
  createdAt: string;
  deletedDate: any;
  description?: string | null;
  id: number;
  name: string;
  updatedAt: string;
  version: number;
}
