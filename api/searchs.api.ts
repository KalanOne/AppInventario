import { http } from './api';
import {
  ArticleSearchResponse,
  ProductSearchResponse,
  TransactionSearchResponse,
} from '@/types/searchs';

export { getProductsSearch, getArticlesSearch, getTransactionsSearch };

const prefix = 'searchs';

async function getProductsSearch(): Promise<ProductSearchResponse> {
  return await http<ProductSearchResponse>({
    method: 'GET',
    path: `${prefix}/products`,
  });
}

async function getArticlesSearch(): Promise<ArticleSearchResponse> {
  return await http<ArticleSearchResponse>({
    method: 'GET',
    path: `${prefix}/articles`,
  });
}

async function getTransactionsSearch(): Promise<TransactionSearchResponse> {
  return await http<TransactionSearchResponse>({
    method: 'GET',
    path: `${prefix}/transactions/list`,
  });
}
