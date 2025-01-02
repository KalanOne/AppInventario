export type { TransactionCreate, Unit };

interface TransactionCreate {
  transactionDate: string;
  emitter: string;
  type: 'ENTRY' | 'EXIT';
  folio: string;
  units: Unit[];
}

interface Unit {
  name: string;
  description: string;
  barcode: string;
  multiple: string;
  factor: number;
  quantity: number;
  afectation: boolean;
  productId?: number | undefined;
  articleId?: number | undefined;
  serial?: string | undefined;
}
