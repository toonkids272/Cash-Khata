import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  writeBatch,
  deleteField,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from './AuthContext';
import {
  Account,
  Transaction,
  BusinessSettings,
  NoteItem,
  TimeFilter,
  ActiveView,
  PreviewDoc,
  SubscriptionPlan,
  PaymentMethod,
  SubscriptionState,
  MerchantSettings,
} from '../types';
import {
  INITIAL_ACCOUNTS,
  INITIAL_TRANSACTIONS,
  INITIAL_SETTINGS,
  INITIAL_PRESET_NAMES,
  INITIAL_NOTES,
  DEMO_SAMPLE_ACCOUNTS,
  DEMO_SAMPLE_TRANSACTIONS,
} from '../utils/initialData';

interface CashBookContextType {
  accounts: Account[];
  currentAccountId: string;
  currentAccount: Account;
  setCurrentAccountId: (id: string) => void;
  transactions: Transaction[];
  deletedTransactions: Transaction[];
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  isDrawerOpen: boolean;
  setIsDrawerOpen: (open: boolean) => void;
  timeFilter: TimeFilter;
  setTimeFilter: (filter: TimeFilter) => void;
  customDateRange: { start: string; end: string };
  setCustomDateRange: (range: { start: string; end: string }) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  settings: BusinessSettings;
  updateSettings: (newSettings: Partial<BusinessSettings>) => void;
  presetNames: string[];
  addPresetName: (name: string) => void;
  deletePresetName: (name: string) => void;
  notes: NoteItem[];
  addNote: (note: { title: string; content: string }) => void;
  updateNote: (id: string, updates: Partial<NoteItem>) => void;
  deleteNote: (id: string) => void;
  addTransaction: (tx: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  softDeleteTransaction: (id: string) => void;
  restoreTransaction: (id: string) => void;
  permanentDeleteTransaction: (id: string) => void;
  clearAllDeleted: () => void;
  addAccount: (acc: Omit<Account, 'id' | 'createdAt'>) => void;
  updateAccount: (id: string, updates: Partial<Account>) => void;
  deleteAccount: (id: string) => void;
  deleteAllAccounts: () => void;
  executeTransfer: (transfer: {
    fromAccountId: string;
    toAccountId: string;
    amount: number;
    date: string;
    time: string;
    remarks?: string;
  }) => void;
  // Categories
  categories: { in: string[]; out: string[] };
  addCategory: (type: 'in' | 'out', name: string) => void;
  // Modals & Sheets
  isAddAccountModalOpen: boolean;
  setIsAddAccountModalOpen: (open: boolean) => void;
  isInstallModalOpen: boolean;
  setIsInstallModalOpen: (open: boolean) => void;
  isShareModalOpen: boolean;
  setIsShareModalOpen: (open: boolean) => void;
  isExportModalOpen: boolean;
  setIsExportModalOpen: (open: boolean) => void;
  isCashInModalOpen: boolean;
  setIsCashInModalOpen: (open: boolean) => void;
  isCashOutModalOpen: boolean;
  setIsCashOutModalOpen: (open: boolean) => void;
  selectedTransaction: Transaction | null;
  setSelectedTransaction: (tx: Transaction | null) => void;
  previewDoc: PreviewDoc | null;
  setPreviewDoc: (doc: PreviewDoc | null) => void;
  // Cloud Sync
  isCloudSyncing: boolean;
  lastSyncedAt: Date | null;
  // Subscription & Ad-Free Pro
  subscription: SubscriptionState;
  isPro: boolean;
  merchantSettings: MerchantSettings;
  updateMerchantSettings: (settings: Partial<MerchantSettings>) => void;
  activateProSubscription: (plan: SubscriptionPlan, method: PaymentMethod, txId?: string) => void;
  cancelSubscription: () => void;
  isSubscriptionModalOpen: boolean;
  setIsSubscriptionModalOpen: (open: boolean) => void;
  // Backup / Restore / Sample data
  resetToInitialData: () => void;
  loadDemoData: () => void;
  importFullDatabase: (jsonData: string) => { success: boolean; error?: string };
  exportFullDatabase: () => string;
}

const CashBookContext = createContext<CashBookContextType | undefined>(undefined);

export const DEFAULT_CATEGORIES = {
  in: ['Sales', 'Customer Payment', 'Commission', 'Loan Taken', 'Capital', 'Refund', 'Other Income'],
  out: [
    'Rent / Kiraya',
    'Salary',
    'Vendor Payment',
    'Electricity Bill',
    'Tea & Snacks',
    'Fuel / Travel',
    'Shop Maintenance',
    'Office Supplies',
    'Other Expense',
  ],
};

const STORAGE_KEYS = {
  ACCOUNTS: 'cashbook_accounts_v2',
  CURRENT_ACCOUNT: 'cashbook_current_acc_v2',
  TRANSACTIONS: 'cashbook_transactions_v2',
  SETTINGS: 'cashbook_settings_v2',
  PRESETS: 'cashbook_presets_v2',
  NOTES: 'cashbook_notes_v2',
  CATEGORIES: 'cashbook_categories_v2',
  SUBSCRIPTION: 'cashbook_subscription_v2',
  MERCHANT_SETTINGS: 'cashbook_merchant_v2',
};

const DEFAULT_SUBSCRIPTION: SubscriptionState = {
  isPro: false,
  plan: 'free',
  activatedAt: null,
  expiryDate: null,
};

const DEFAULT_MERCHANT_SETTINGS: MerchantSettings = {
  upiId: 'zamura.digt@ybl',
  payeeName: 'Zamura Digital',
  merchantCode: '5411',
};

export const CashBookProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  // Cloud Sync State
  const [isCloudSyncing, setIsCloudSyncing] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);

  // 1. Accounts
  const [accounts, setAccounts] = useState<Account[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ACCOUNTS);
      return saved ? JSON.parse(saved) : INITIAL_ACCOUNTS;
    } catch {
      return INITIAL_ACCOUNTS;
    }
  });

  const [currentAccountId, setCurrentAccountId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_ACCOUNT);
      return saved || INITIAL_ACCOUNTS[0]?.id || '';
    } catch {
      return INITIAL_ACCOUNTS[0]?.id || '';
    }
  });

  // 2. Transactions
  const [allTransactions, setAllTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
    } catch {
      return INITIAL_TRANSACTIONS;
    }
  });

  // 3. Settings
  const [settings, setSettings] = useState<BusinessSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
    } catch {
      return INITIAL_SETTINGS;
    }
  });

  // 4. Presets & Notes
  const [presetNames, setPresetNames] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PRESETS);
      return saved ? JSON.parse(saved) : INITIAL_PRESET_NAMES;
    } catch {
      return INITIAL_PRESET_NAMES;
    }
  });

  const [notes, setNotes] = useState<NoteItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.NOTES);
      return saved ? JSON.parse(saved) : INITIAL_NOTES;
    } catch {
      return INITIAL_NOTES;
    }
  });

  // Categories
  const [categories, setCategories] = useState<{ in: string[]; out: string[] }>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      return saved ? JSON.parse(saved) : DEFAULT_CATEGORIES;
    } catch {
      return DEFAULT_CATEGORIES;
    }
  });

  // Local storage caching effects
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
  }, [accounts]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CURRENT_ACCOUNT, currentAccountId);
  }, [currentAccountId]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(allTransactions));
  }, [allTransactions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PRESETS, JSON.stringify(presetNames));
  }, [presetNames]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
  }, [notes]);

  // UI Navigation states
  const [activeView, setActiveView] = useState<ActiveView>('ledger');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
  const [customDateRange, setCustomDateRange] = useState({ start: '', end: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Modals
  const [isAddAccountModalOpen, setIsAddAccountModalOpen] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isCashInModalOpen, setIsCashInModalOpen] = useState(false);
  const [isCashOutModalOpen, setIsCashOutModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [previewDoc, setPreviewDoc] = useState<PreviewDoc | null>(null);
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);

  // Subscription state (Free vs Pro micro-pass)
  const [subscription, setSubscription] = useState<SubscriptionState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SUBSCRIPTION);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.expiryDate && new Date(parsed.expiryDate).getTime() < Date.now()) {
          return { isPro: false, plan: 'free', activatedAt: null, expiryDate: null };
        }
        return parsed;
      }
      return DEFAULT_SUBSCRIPTION;
    } catch {
      return DEFAULT_SUBSCRIPTION;
    }
  });

  const [merchantSettings, setMerchantSettings] = useState<MerchantSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.MERCHANT_SETTINGS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (!parsed.upiId || parsed.upiId === 'toonkids272@okhdfcbank') {
          parsed.upiId = 'zamura.digt@ybl';
          parsed.payeeName = 'Zamura Digital';
        }
        return parsed;
      }
      return DEFAULT_MERCHANT_SETTINGS;
    } catch {
      return DEFAULT_MERCHANT_SETTINGS;
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SUBSCRIPTION, JSON.stringify(subscription));
  }, [subscription]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MERCHANT_SETTINGS, JSON.stringify(merchantSettings));
  }, [merchantSettings]);

  const isPro = useMemo(() => {
    if (!subscription.isPro) return false;
    if (subscription.expiryDate && new Date(subscription.expiryDate).getTime() < Date.now()) {
      return false;
    }
    return true;
  }, [subscription]);

  const activateProSubscription = (plan: SubscriptionPlan, method: PaymentMethod, txId?: string) => {
    const now = new Date();
    const expiry = new Date(now);
    if (plan === 'monthly_49') {
      expiry.setDate(expiry.getDate() + 30);
    } else if (plan === 'yearly_399') {
      expiry.setDate(expiry.getDate() + 365);
    } else {
      expiry.setDate(expiry.getDate() + 3650);
    }

    const newSub: SubscriptionState = {
      isPro: true,
      plan,
      activatedAt: now.toISOString(),
      expiryDate: expiry.toISOString(),
      paymentMethod: method,
      transactionId: txId || `TX-${Date.now().toString(36).toUpperCase()}`,
    };
    setSubscription(newSub);

    if (user) {
      const userDocRef = doc(db, 'users', user.uid);
      updateDoc(userDocRef, { subscription: newSub }).catch(() => {});
    }
  };

  const cancelSubscription = () => {
    const canceled: SubscriptionState = {
      isPro: false,
      plan: 'free',
      activatedAt: null,
      expiryDate: null,
    };
    setSubscription(canceled);
    if (user) {
      const userDocRef = doc(db, 'users', user.uid);
      updateDoc(userDocRef, { subscription: canceled }).catch(() => {});
    }
  };

  const updateMerchantSettings = (newSettings: Partial<MerchantSettings>) => {
    setMerchantSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        updateDoc(userDocRef, { merchantSettings: updated }).catch(() => {});
      }
      return updated;
    });
  };

  // ==========================================
  // REAL-TIME FIRESTORE SYNC WITH GOOGLE USER
  // ==========================================
  useEffect(() => {
    if (!user) return;

    setIsCloudSyncing(true);

    // 1. Sync User Profile / Settings
    const userDocRef = doc(db, 'users', user.uid);
    const unsubUser = onSnapshot(
      userDocRef,
      (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          if (data.settings) setSettings(data.settings);
          if (data.categories) setCategories(data.categories);
          if (data.presetNames) setPresetNames(data.presetNames);
          if (data.subscription) setSubscription(data.subscription);
          if (data.merchantSettings) setMerchantSettings(data.merchantSettings);
        } else {
          // Initialize empty profile in Firestore
          setDoc(
            userDocRef,
            {
              displayName: user.displayName || 'Business Owner',
              email: user.email || '',
              photoURL: user.photoURL || '',
              updatedAt: new Date().toISOString(),
              settings,
              categories,
              presetNames,
              subscription,
              merchantSettings,
            },
            { merge: true }
          ).catch(console.error);
        }
      },
      (err) => {
        console.warn('Firestore user doc sync notice:', err.message);
      }
    );

    // 2. Sync Accounts Subcollection
    const accountsColRef = collection(db, 'users', user.uid, 'accounts');
    const unsubAccounts = onSnapshot(
      accountsColRef,
      (snapshot) => {
        const cloudAccounts: Account[] = [];
        snapshot.forEach((d) => {
          cloudAccounts.push(d.data() as Account);
        });
        cloudAccounts.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        setAccounts(cloudAccounts);
        if (cloudAccounts.length > 0) {
          setCurrentAccountId((prev) => {
            if (prev && cloudAccounts.some((a) => a.id === prev)) return prev;
            return cloudAccounts[0].id;
          });
        }
      },
      (err) => {
        console.warn('Firestore accounts sync notice:', err.message);
      }
    );

    // 3. Sync Transactions Subcollection
    const txColRef = collection(db, 'users', user.uid, 'transactions');
    const unsubTx = onSnapshot(
      txColRef,
      (snapshot) => {
        const cloudTx: Transaction[] = [];
        snapshot.forEach((d) => {
          cloudTx.push(d.data() as Transaction);
        });
        cloudTx.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setAllTransactions(cloudTx);
        setIsCloudSyncing(false);
        setLastSyncedAt(new Date());
      },
      (err) => {
        console.warn('Firestore transactions sync notice:', err.message);
        setIsCloudSyncing(false);
      }
    );

    // 4. Sync Notes Subcollection
    const notesColRef = collection(db, 'users', user.uid, 'notes');
    const unsubNotes = onSnapshot(
      notesColRef,
      (snapshot) => {
        const cloudNotes: NoteItem[] = [];
        snapshot.forEach((d) => {
          cloudNotes.push(d.data() as NoteItem);
        });
        cloudNotes.sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime());
        setNotes(cloudNotes);
      },
      (err) => {
        console.warn('Firestore notes sync notice:', err.message);
      }
    );

    return () => {
      unsubUser();
      unsubAccounts();
      unsubTx();
      unsubNotes();
    };
  }, [user]);

  // ==========================================
  // LOCAL DATA MIGRATION CHECK ON LOGIN
  // ==========================================
  // ==========================================
  // AUTOMATIC SILENT LOCAL & CLOUD DATA MERGE (NO PERMISSION PROMPT)
  // ==========================================
  useEffect(() => {
    if (!user) return;

    const performAutomaticMerge = async () => {
      try {
        setIsCloudSyncing(true);

        const localAccStr = localStorage.getItem(STORAGE_KEYS.ACCOUNTS);
        const localTxStr = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
        const localNotesStr = localStorage.getItem(STORAGE_KEYS.NOTES);

        const localAccounts: Account[] = localAccStr ? JSON.parse(localAccStr) : [];
        const localTransactions: Transaction[] = localTxStr ? JSON.parse(localTxStr) : [];
        const localNotes: NoteItem[] = localNotesStr ? JSON.parse(localNotesStr) : [];

        // If there is any local data, seamlessly merge it into the user's Cloud Firestore
        if (localAccounts.length > 0 || localTransactions.length > 0 || localNotes.length > 0) {
          const batch = writeBatch(db);

          localAccounts.forEach((acc) => {
            const ref = doc(db, 'users', user.uid, 'accounts', acc.id);
            batch.set(ref, acc, { merge: true });
          });

          localTransactions.forEach((tx) => {
            const ref = doc(db, 'users', user.uid, 'transactions', tx.id);
            batch.set(ref, tx, { merge: true });
          });

          localNotes.forEach((note) => {
            const ref = doc(db, 'users', user.uid, 'notes', note.id);
            batch.set(ref, note, { merge: true });
          });

          await batch.commit();
          setLastSyncedAt(new Date());
        }
      } catch (err) {
        console.warn('Silent local & cloud merge sync notice:', err);
      } finally {
        setIsCloudSyncing(false);
      }
    };

    performAutomaticMerge();
  }, [user]);

  // Current Account Fallback
  const currentAccount = useMemo<Account>(() => {
    return (
      accounts.find((a) => a.id === currentAccountId) ||
      accounts[0] || {
        id: 'acc_none',
        name: 'No Cash Book',
        type: 'cash' as const,
        color: '#0288D1',
        initialBalance: 0,
        createdAt: new Date().toISOString(),
      }
    );
  }, [accounts, currentAccountId]);

  const transactions = useMemo(() => {
    return allTransactions.filter((t) => !t.isDeleted);
  }, [allTransactions]);

  const deletedTransactions = useMemo(() => {
    return allTransactions.filter((t) => t.isDeleted);
  }, [allTransactions]);

  // Transaction mutations
  const addTransaction = (tx: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newTx: Transaction = {
      ...tx,
      id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      createdAt: now,
      updatedAt: now,
      isDeleted: false,
    };
    setAllTransactions((prev) => [newTx, ...prev]);
    if (user) {
      setDoc(doc(db, 'users', user.uid, 'transactions', newTx.id), newTx).catch(console.error);
    }
  };

  const updateTransaction = (id: string, updates: Partial<Transaction>) => {
    const now = new Date().toISOString();
    setAllTransactions((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates, updatedAt: now } : t))
    );
    if (user) {
      updateDoc(doc(db, 'users', user.uid, 'transactions', id), {
        ...updates,
        updatedAt: now,
      }).catch(console.error);
    }
  };

  const softDeleteTransaction = (id: string) => {
    const now = new Date().toISOString();
    setAllTransactions((prev) =>
      prev.map((t) => (t.id === id ? { ...t, isDeleted: true, deletedAt: now } : t))
    );
    if (user) {
      updateDoc(doc(db, 'users', user.uid, 'transactions', id), {
        isDeleted: true,
        deletedAt: now,
      }).catch(console.error);
    }
  };

  const restoreTransaction = (id: string) => {
    setAllTransactions((prev) =>
      prev.map((t) => (t.id === id ? { ...t, isDeleted: false, deletedAt: undefined } : t))
    );
    if (user) {
      updateDoc(doc(db, 'users', user.uid, 'transactions', id), {
        isDeleted: false,
        deletedAt: deleteField(),
      }).catch(console.error);
    }
  };

  const permanentDeleteTransaction = (id: string) => {
    setAllTransactions((prev) => prev.filter((t) => t.id !== id));
    if (user) {
      deleteDoc(doc(db, 'users', user.uid, 'transactions', id)).catch(console.error);
    }
  };

  const clearAllDeleted = () => {
    const toDelete = allTransactions.filter((t) => t.isDeleted);
    setAllTransactions((prev) => prev.filter((t) => !t.isDeleted));
    if (user && toDelete.length > 0) {
      const batch = writeBatch(db);
      toDelete.forEach((t) => {
        batch.delete(doc(db, 'users', user.uid, 'transactions', t.id));
      });
      batch.commit().catch(console.error);
    }
  };

  // Accounts Actions
  const addAccount = (acc: Omit<Account, 'id' | 'createdAt'>) => {
    const newAcc: Account = {
      ...acc,
      id: `acc_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      createdAt: new Date().toISOString(),
    };
    setAccounts((prev) => [...prev, newAcc]);
    setCurrentAccountId(newAcc.id);
    if (user) {
      setDoc(doc(db, 'users', user.uid, 'accounts', newAcc.id), newAcc).catch(console.error);
    }
  };

  const updateAccount = (id: string, updates: Partial<Account>) => {
    setAccounts((prev) => prev.map((a) => (a.id === id ? { ...a, ...updates } : a)));
    if (user) {
      updateDoc(doc(db, 'users', user.uid, 'accounts', id), updates).catch(console.error);
    }
  };

  const deleteAccount = (id: string) => {
    setAccounts((prev) => prev.filter((a) => a.id !== id));
    setAllTransactions((prev) => prev.filter((t) => t.accountId !== id));
    if (currentAccountId === id) {
      const remaining = accounts.filter((a) => a.id !== id);
      if (remaining.length > 0) {
        setCurrentAccountId(remaining[0].id);
      } else {
        setCurrentAccountId('');
      }
    }
    if (user) {
      deleteDoc(doc(db, 'users', user.uid, 'accounts', id)).catch(console.error);
    }
  };

  const deleteAllAccounts = () => {
    const currentAccs = [...accounts];
    const currentTxs = [...allTransactions];
    setAccounts([]);
    setAllTransactions([]);
    setCurrentAccountId('');
    if (user) {
      const batch = writeBatch(db);
      currentAccs.forEach((a) => batch.delete(doc(db, 'users', user.uid, 'accounts', a.id)));
      currentTxs.forEach((t) => batch.delete(doc(db, 'users', user.uid, 'transactions', t.id)));
      batch.commit().catch(console.error);
    }
  };

  // Dual-Entry Transfer
  const executeTransfer = (transfer: {
    fromAccountId: string;
    toAccountId: string;
    amount: number;
    date: string;
    time: string;
    remarks?: string;
  }) => {
    const transferId = `tr_${Date.now()}`;
    const now = new Date().toISOString();
    const fromAcc = accounts.find((a) => a.id === transfer.fromAccountId);
    const toAcc = accounts.find((a) => a.id === transfer.toAccountId);

    const fromTx: Transaction = {
      id: `tx_${Date.now()}_1`,
      accountId: transfer.fromAccountId,
      type: 'out',
      amount: transfer.amount,
      partyName: `Transfer to ${toAcc?.name || 'Account'}`,
      category: 'Inter-Account Transfer',
      paymentMode: 'Bank Transfer',
      date: transfer.date,
      time: transfer.time,
      remarks: transfer.remarks || `Transferred to ${toAcc?.name}`,
      transferId,
      createdAt: now,
      updatedAt: now,
      isDeleted: false,
    };

    const toTx: Transaction = {
      id: `tx_${Date.now()}_2`,
      accountId: transfer.toAccountId,
      type: 'in',
      amount: transfer.amount,
      partyName: `Received from ${fromAcc?.name || 'Account'}`,
      category: 'Inter-Account Transfer',
      paymentMode: 'Bank Transfer',
      date: transfer.date,
      time: transfer.time,
      remarks: transfer.remarks || `Received from ${fromAcc?.name}`,
      transferId,
      createdAt: now,
      updatedAt: now,
      isDeleted: false,
    };

    setAllTransactions((prev) => [fromTx, toTx, ...prev]);
    if (user) {
      setDoc(doc(db, 'users', user.uid, 'transactions', fromTx.id), fromTx).catch(console.error);
      setDoc(doc(db, 'users', user.uid, 'transactions', toTx.id), toTx).catch(console.error);
    }
  };

  const addCategory = (type: 'in' | 'out', name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setCategories((prev) => {
      const list = prev[type] || [];
      if (list.some((c) => c.toLowerCase() === trimmed.toLowerCase())) return prev;
      const updated = {
        ...prev,
        [type]: [...list, trimmed],
      };
      if (user) {
        setDoc(doc(db, 'users', user.uid), { categories: updated, updatedAt: new Date().toISOString() }, { merge: true }).catch(console.error);
      }
      return updated;
    });
  };

  const updateSettings = (newSettings: Partial<BusinessSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      if (user) {
        setDoc(doc(db, 'users', user.uid), { settings: updated, updatedAt: new Date().toISOString() }, { merge: true }).catch(console.error);
      }
      return updated;
    });
  };

  const addPresetName = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed || presetNames.includes(trimmed)) return;
    const updated = [...presetNames, trimmed];
    setPresetNames(updated);
    if (user) {
      setDoc(doc(db, 'users', user.uid), { presetNames: updated, updatedAt: new Date().toISOString() }, { merge: true }).catch(console.error);
    }
  };

  const deletePresetName = (name: string) => {
    const updated = presetNames.filter((n) => n !== name);
    setPresetNames(updated);
    if (user) {
      setDoc(doc(db, 'users', user.uid), { presetNames: updated, updatedAt: new Date().toISOString() }, { merge: true }).catch(console.error);
    }
  };

  const addNote = (note: { title: string; content: string }) => {
    const newNote: NoteItem = {
      id: `note_${Date.now()}`,
      title: note.title,
      content: note.content,
      date: new Date().toISOString(),
      isDone: false,
    };
    setNotes((prev) => [newNote, ...prev]);
    if (user) {
      setDoc(doc(db, 'users', user.uid, 'notes', newNote.id), newNote).catch(console.error);
    }
  };

  const updateNote = (id: string, updates: Partial<NoteItem>) => {
    setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, ...updates } : n)));
    if (user) {
      updateDoc(doc(db, 'users', user.uid, 'notes', id), updates).catch(console.error);
    }
  };

  const deleteNote = (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    if (user) {
      deleteDoc(doc(db, 'users', user.uid, 'notes', id)).catch(console.error);
    }
  };

  const resetToInitialData = () => {
    setAccounts(INITIAL_ACCOUNTS);
    setCurrentAccountId(INITIAL_ACCOUNTS[0]?.id || '');
    setAllTransactions(INITIAL_TRANSACTIONS);
    setSettings(INITIAL_SETTINGS);
    setPresetNames(INITIAL_PRESET_NAMES);
    setNotes(INITIAL_NOTES);
    Object.values(STORAGE_KEYS).forEach((k) => localStorage.removeItem(k));
    if (user) {
      deleteAllAccounts();
    }
  };

  const loadDemoData = () => {
    setAccounts(DEMO_SAMPLE_ACCOUNTS);
    setCurrentAccountId(DEMO_SAMPLE_ACCOUNTS[0]?.id || '');
    setAllTransactions(DEMO_SAMPLE_TRANSACTIONS);
    setActiveView('ledger');
    if (user) {
      const batch = writeBatch(db);
      DEMO_SAMPLE_ACCOUNTS.forEach((a) => {
        batch.set(doc(db, 'users', user.uid, 'accounts', a.id), a);
      });
      DEMO_SAMPLE_TRANSACTIONS.forEach((t) => {
        batch.set(doc(db, 'users', user.uid, 'transactions', t.id), t);
      });
      batch.commit().catch(console.error);
    }
  };

  const exportFullDatabase = () => {
    const data = {
      app: 'CashBookPro',
      version: '2.0',
      exportedAt: new Date().toISOString(),
      accounts,
      transactions: allTransactions,
      settings,
      presetNames,
      notes,
    };
    return JSON.stringify(data, null, 2);
  };

  const importFullDatabase = (jsonData: string): { success: boolean; error?: string } => {
    try {
      const data = JSON.parse(jsonData);
      if (!data.accounts || !data.transactions) {
        return { success: false, error: 'Invalid backup format: missing accounts or transactions' };
      }
      setAccounts(data.accounts);
      if (data.accounts.length > 0) {
        setCurrentAccountId(data.accounts[0]?.id || '');
      }
      setAllTransactions(data.transactions);
      if (data.settings) setSettings(data.settings);
      if (data.presetNames) setPresetNames(data.presetNames);
      if (data.notes) setNotes(data.notes);

      if (user) {
        const batch = writeBatch(db);
        data.accounts.forEach((a: Account) => {
          batch.set(doc(db, 'users', user.uid, 'accounts', a.id), a);
        });
        data.transactions.forEach((t: Transaction) => {
          batch.set(doc(db, 'users', user.uid, 'transactions', t.id), t);
        });
        batch.commit().catch(console.error);
      }
      return { success: true };
    } catch (err: unknown) {
      const error = err as Error;
      return { success: false, error: error.message || 'Failed to parse JSON file' };
    }
  };

  return (
    <CashBookContext.Provider
      value={{
        accounts,
        currentAccountId,
        currentAccount,
        setCurrentAccountId,
        transactions,
        deletedTransactions,
        activeView,
        setActiveView,
        isDrawerOpen,
        setIsDrawerOpen,
        timeFilter,
        setTimeFilter,
        customDateRange,
        setCustomDateRange,
        searchQuery,
        setSearchQuery,
        isSearchOpen,
        setIsSearchOpen,
        settings,
        updateSettings,
        presetNames,
        addPresetName,
        deletePresetName,
        notes,
        addNote,
        updateNote,
        deleteNote,
        addTransaction,
        updateTransaction,
        softDeleteTransaction,
        restoreTransaction,
        permanentDeleteTransaction,
        clearAllDeleted,
        addAccount,
        updateAccount,
        deleteAccount,
        deleteAllAccounts,
        executeTransfer,
        categories,
        addCategory,
        isAddAccountModalOpen,
        setIsAddAccountModalOpen,
        isInstallModalOpen,
        setIsInstallModalOpen,
        isShareModalOpen,
        setIsShareModalOpen,
        isExportModalOpen,
        setIsExportModalOpen,
        isCashInModalOpen,
        setIsCashInModalOpen,
        isCashOutModalOpen,
        setIsCashOutModalOpen,
        selectedTransaction,
        setSelectedTransaction,
        previewDoc,
        setPreviewDoc,
        isCloudSyncing,
        lastSyncedAt,
        subscription,
        isPro,
        merchantSettings,
        updateMerchantSettings,
        activateProSubscription,
        cancelSubscription,
        isSubscriptionModalOpen,
        setIsSubscriptionModalOpen,
        resetToInitialData,
        loadDemoData,
        importFullDatabase,
        exportFullDatabase,
      }}
    >
      {children}
    </CashBookContext.Provider>
  );
};

export const useCashBook = () => {
  const context = useContext(CashBookContext);
  if (!context) {
    throw new Error('useCashBook must be used within a CashBookProvider');
  }
  return context;
};
