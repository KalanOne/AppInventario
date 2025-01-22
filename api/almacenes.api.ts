import {
  CreateApiFunctionParams,
  GetApiFunctionParams,
  UpdateApiFunctionParams,
} from '@/types/api';

import { http } from './api';
import { AlmacenesResponse } from '@/types/almacenes';

export { getWarehouses, updateWarehouses, createWarehouses };

async function getWarehouses(
  params: GetApiFunctionParams
): Promise<AlmacenesResponse> {
  return await http<AlmacenesResponse>({
    method: 'GET',
    path: 'warehouses',
    params: params.params,
  });
}

async function updateWarehouses(params: UpdateApiFunctionParams<any>) {
  return await http({
    method: 'PATCH',
    path: `warehouses/${params.id}`,
    data: params.data,
  });
}

async function createWarehouses(params: CreateApiFunctionParams<any>) {
  return await http({
    method: 'POST',
    path: 'warehouses',
    data: params.data,
  });
}
