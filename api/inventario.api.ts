import { GetApiFunctionParams } from '@/types/api';
import { http } from './api';
import { Inventoryreponse, ProductsListReponse } from '@/types/inventario';

export { getProductsList, getInventory, getInventoryReport };

async function getProductsList(
  params: GetApiFunctionParams
): Promise<ProductsListReponse> {
  return await http<ProductsListReponse>({
    method: 'GET',
    path: 'inventory/products',
    params: params.params,
  });
}

async function getInventory(id: number): Promise<Inventoryreponse> {
  return await http<Inventoryreponse>({
    method: 'GET',
    path: `inventory/product/${id}`,
  });
}

async function getInventoryReport(): Promise<Blob> {
  return await http<Blob>({
    method: 'GET',
    path: `reports/inventory`,
    responseType: 'blob',
  });
}
