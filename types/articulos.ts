export type { ArticulosResponse, Articulo, Producto };

type ArticulosResponse = [Articulo[], number];

interface Articulo {
  id: number;
  barcode: string;
  multiple: string;
  factor: number;
  createdAt: string;
  updatedAt: string;
  version: number;
  deletedDate: any;
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
