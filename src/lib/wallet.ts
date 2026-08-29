export type WalletTransactionView = {
  id: string;
  type: string;
  amount: number;
  balanceAfter: number;
  status: string;
  reference: string | null;
  createdAt: string;
  completedAt: string | null;
};
