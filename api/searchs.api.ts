import { http } from './api';
import { ArticleSearchResponse, ProductSearchResponse } from '@/types/searchs';

export { getProductsSearch, getArticlesSearch };

async function getProductsSearch(): Promise<ProductSearchResponse> {
  return await http<ProductSearchResponse>({
    method: 'GET',
    path: 'searchs/products',
  });
}

async function getArticlesSearch(): Promise<ArticleSearchResponse> {
  return await http<ArticleSearchResponse>({
    method: 'GET',
    path: 'searchs/articles',
  });
}
