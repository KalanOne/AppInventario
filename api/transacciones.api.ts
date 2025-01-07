import { CreateApiFunctionParams } from '@/types/api';
import { http } from './api';
import { Transaction, TransactionCreate } from '@/types/transacciones';

export { createTransactions, getTransaction };

async function createTransactions(
  params: CreateApiFunctionParams<TransactionCreate>
) {
  return await http<TransactionCreate>({
    method: 'POST',
    path: 'transactions/create',
    data: params.data,
  });
}

async function getTransaction(id: number) {
  return await http<Transaction>({
    method: 'GET',
    path: `transactions/${id}`,
  });
}
