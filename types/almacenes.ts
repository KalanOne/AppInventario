export type { AlmacenesResponse, Almacen };

type AlmacenesResponse = [Almacen[], number];

interface Almacen {
  createdAt: string;
  deletedDate: any;
  id: number;
  name: string;
  updatedAt: string;
  version: number;
}
