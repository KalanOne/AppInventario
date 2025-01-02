import { CreateApiFunctionParams } from '@/types/api';
import { http } from './api';
import { TransactionCreate } from '@/types/transacciones';

export { createTransactions };

async function createTransactions(
  params: CreateApiFunctionParams<TransactionCreate>
) {
  return await http<TransactionCreate>({
    method: 'POST',
    path: 'transactions/create',
    data: params.data,
  });
}
