import {
  CreateApiFunctionParams,
  GetApiFunctionParams,
  UpdateApiFunctionParams,
} from '@/types/api';
import {
  ArticuloCreate,
  ArticulosResponse,
  ArticuloUpdate,
} from '@/types/articulos';
import { http } from './api';

export { getArticles, updateArticles, createArticles };

async function getArticles(
  params: GetApiFunctionParams
): Promise<ArticulosResponse> {
  return await http<ArticulosResponse>({
    method: 'GET',
    path: 'articles',
    params: params.params,
  });
}

async function updateArticles(params: UpdateApiFunctionParams<ArticuloUpdate>) {
  return await http({
    method: 'PATCH',
    path: 'articles',
    data: params.data,
  });
}

async function createArticles(params: CreateApiFunctionParams<ArticuloCreate>) {
  return await http({
    method: 'POST',
    path: 'articles',
    data: params.data,
  });
}
