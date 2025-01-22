export type {
  ArticulosResponse,
  Articulo,
  Producto,
  ArticuloUpdate,
  ArticuloCreate,
};

type ArticulosResponse = [Articulo[], number];

interface Articulo {
  id: number;
  barcode: string;
  multiple: string;
  factor: number;
  warehouse: Almacen;
  createdAt: string;
  updatedAt: string;
  version: number;
  deletedDate: string | null;
  product: Producto;
}

interface Producto {
  id: number;
  name: string;
  description: any;
  createdAt: string;
  updatedAt: string;
  version: number;
  deletedDate: any;
}

interface ArticuloUpdate {
  name: string;
  description: string;
  barcode: string;
  multiple: string;
  factor: number;
  warehouse: number;
  productId: number;
  articleId: number;
}

interface ArticuloCreate {
  productId?: number;
  name: string;
  description: string;
  barcode: string;
  multiple: string;
  factor: number;
  warehouse: number;
}

interface Almacen {
  id: number;
  name: string;
  createdAt: string;
  deletedDate: any;
  updatedAt: string;
  version: number;
}
