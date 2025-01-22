import { CreateApiFunctionParams } from '@/types/api';
import { http } from './api';
import { Transaction, TransactionCreate } from '@/types/transacciones';

export { createTransactions, getTransaction, getTransactionReport };

async function createTransactions(
  params: CreateApiFunctionParams<TransactionCreate>
) {
  return await http<Transaction>({
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

async function getTransactionReport(id: number): Promise<Blob> {
  return await http<Blob>({
    method: 'GET',
    path: `reports/transaction/${id}`,
    responseType: 'blob',
  });
}
