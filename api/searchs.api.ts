import { http } from './api';
import { ProductSearchResponse } from '@/types/searchs';

export { getProductsSearch };

async function getProductsSearch(): Promise<ProductSearchResponse> {
  return await http<ProductSearchResponse>({
    method: 'GET',
    path: 'searchs/products',
  });
}
