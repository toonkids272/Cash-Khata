export type TransactionType = 'in' | 'out';

export type PaymentMode = 'Cash' | 'Online/UPI' | 'Bank Transfer' | 'Cheque';

export interface Account {
  id: string;
  name: string;
  type: 'cash' | 'bank' | 'personal' | 'business';
  color: string;
  initialBalance: number;
  createdAt: string;
  isDefault?: boolean;
}

export interface Transaction {
  id: string;
  accountId: string;
  type: TransactionType;
  amount: number;
  partyName: string;
  category: string;
  paymentMode: PaymentMode;
  date: string; // YYYY-MM-DD
  time: string; // e.g. 08:48 AM
  remarks?: string;
  createdAt: string;
  updatedAt: string;
  isDeleted?: boolean;
  deletedAt?: string;
  transferId?: string;
}

export interface InterAccountTransfer {
  id: string;
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  date: string;
  time: string;
  remarks?: string;
  createdAt: string;
}

export interface NoteItem {
  id: string;
  title: string;
  content: string;
  date: string;
  isPinned?: boolean;
  isDone?: boolean;
}

export interface DenominationCounts {
  [key: number]: number;
}

export interface BusinessSettings {
  businessName: string;
  ownerName: string;
  phone: string;
  address: string;
  gstNumber?: string;
  currencySymbol: string;
  dateFormat: 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD';
  signatureTitle: string;
  showSignatureInPdf: boolean;
  enablePinLock: boolean;
  pinCode?: string;
}

export type TimeFilter = 'all' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';

export type ActiveView =
  | 'ledger'
  | 'summary'
  | 'account_summary'
  | 'transactions_all'
  | 'accounts'
  | 'transfer'
  | 'report_all'
  | 'transaction_names'
  | 'notebook'
  | 'calendar'
  | 'cash_calculator'
  | 'backup_restore'
  | 'settings'
  | 'deleted_transactions'
  | 'help';

export interface ReportExportData {
  accountName: string;
  transactions: Transaction[];
  dateRangeLabel: string;
  settings: BusinessSettings;
  totalCashIn: number;
  totalCashOut: number;
  netBalance: number;
  openingBalance: number;
}

export interface PreviewDoc {
  type: 'pdf' | 'excel';
  blob: Blob;
  fileName: string;
  url?: string;
  reportData?: ReportExportData;
}

export type SubscriptionPlan = 'free' | 'monthly_49' | 'yearly_399';
export type PaymentMethod = 'google_play' | 'upi';

export interface SubscriptionState {
  isPro: boolean;
  plan: SubscriptionPlan;
  activatedAt: string | null;
  expiryDate: string | null;
  paymentMethod?: PaymentMethod;
  transactionId?: string;
}

export interface MerchantSettings {
  upiId: string;
  payeeName: string;
  merchantCode?: string;
}
