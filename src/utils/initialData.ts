import { Account, Transaction, BusinessSettings, NoteItem } from '../types';

/**
 * Clean default initial state for production.
 * Fresh installations start with a completely empty database:
 * - 0 Cash Books
 * - 0 Transactions
 * - 0 Notes
 * - 0 Presets
 */
export const INITIAL_ACCOUNTS: Account[] = [];

export const INITIAL_TRANSACTIONS: Transaction[] = [];

export const INITIAL_NOTES: NoteItem[] = [];

export const INITIAL_SETTINGS: BusinessSettings = {
  businessName: '',
  ownerName: '',
  phone: '',
  address: '',
  gstNumber: '',
  currencySymbol: '₹',
  dateFormat: 'DD/MM/YYYY',
  signatureTitle: 'Authorized Signatory',
  showSignatureInPdf: false,
  enablePinLock: false,
};

export const INITIAL_PRESET_NAMES: string[] = [];

/**
 * Production build: No demo accounts or test records bundled.
 */
export const DEMO_SAMPLE_ACCOUNTS: Account[] = [];

export const DEMO_SAMPLE_TRANSACTIONS: Transaction[] = [];
