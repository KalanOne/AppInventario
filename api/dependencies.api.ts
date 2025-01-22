import { Almacen } from '@/types/dependencies';

import { http } from './api';

export { getWarehouses };

const searchPrefix = 'searchs';

async function getWarehouses(params?: any): Promise<Almacen[]> {
  return await http<Almacen[]>({
    method: 'GET',
    path: `${searchPrefix}/warehouses`,
    params: params,
  });
}
