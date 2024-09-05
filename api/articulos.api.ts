import { GetApiFunctionParams } from '@/types/api';
import { ArticulosResponse } from '@/types/articulos';
import { http } from './api';

export { getArticulos };

async function getArticulos(
  params: GetApiFunctionParams
): Promise<ArticulosResponse> {
  return await http<ArticulosResponse>({
    method: 'GET',
    path: 'articles',
    params: params.params,
  });
}
