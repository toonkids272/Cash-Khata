import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CashBookProvider, useCashBook } from './context/CashBookContext';
import { TopAppBar } from './components/TopAppBar';
import { NavigationDrawer } from './components/NavigationDrawer';
import { ExportModal } from './components/ExportModal';
import { TransactionModal } from './components/TransactionModal';
import { TransactionDetailModal } from './components/TransactionDetailModal';
import { DocumentPreviewModal } from './components/DocumentPreviewModal';
import { AddAccountModal } from './components/AddAccountModal';
import { AndroidInstallModal } from './components/AndroidInstallModal';
import { ShareAppModal } from './components/ShareAppModal';
import { SubscriptionModal } from './components/SubscriptionModal';
import { AppOpenAd } from './components/AppOpenAd';
import { LoginView } from './views/LoginView';

// Views
import { LedgerView } from './views/LedgerView';
import { SummaryView } from './views/SummaryView';
import { AccountSummaryView } from './views/AccountSummaryView';
import { AllAccountsTransactionsView } from './views/AllAccountsTransactionsView';
import { AccountsManagerView } from './views/AccountsManagerView';
import { TransferModal } from './views/TransferModal';
import { CashCalculatorView } from './views/CashCalculatorView';
import { CalendarView } from './views/CalendarView';
import { NotebookView } from './views/NotebookView';
import { TransactionNamesView } from './views/TransactionNamesView';
import { BackupRestoreView } from './views/BackupRestoreView';
import { SettingsView } from './views/SettingsView';
import { DeletedTransactionsView } from './views/DeletedTransactionsView';
import { HelpView } from './views/HelpView';

const MainContent: React.FC = () => {
  const {
    activeView,
    setActiveView,
    isAddAccountModalOpen,
    setIsAddAccountModalOpen,
    isInstallModalOpen,
    setIsInstallModalOpen,
    isShareModalOpen,
    setIsShareModalOpen,
    isCashInModalOpen,
    setIsCashInModalOpen,
    isCashOutModalOpen,
    setIsCashOutModalOpen,
    setIsExportModalOpen,
    isSubscriptionModalOpen,
    setIsSubscriptionModalOpen,
  } = useCashBook();

  const { user } = useAuth();

  // Listen for PWA shortcut deep links (e.g., /?action=cash_in, /?action=upgrade_pro)
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const action = params.get('action');
    const view = params.get('view') as any;

    if (view) {
      setActiveView(view);
    }
    if (action === 'cash_in') {
      setIsCashInModalOpen(true);
    } else if (action === 'cash_out') {
      setIsCashOutModalOpen(true);
    } else if (action === 'export_reports') {
      setIsExportModalOpen(true);
    } else if (action === 'upgrade_pro' || action === 'ad_free') {
      setIsSubscriptionModalOpen(true);
    }

    if (action || view) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [
    setActiveView,
    setIsCashInModalOpen,
    setIsCashOutModalOpen,
    setIsExportModalOpen,
    setIsSubscriptionModalOpen,
  ]);

  const renderActiveView = () => {
    switch (activeView) {
      case 'ledger':
        return <LedgerView />;
      case 'summary':
        return <SummaryView />;
      case 'account_summary':
        return <AccountSummaryView />;
      case 'transactions_all':
        return <AllAccountsTransactionsView />;
      case 'accounts':
        return <AccountsManagerView />;
      case 'transfer':
        return <TransferModal />;
      case 'report_all':
        return <LedgerView />;
      case 'transaction_names':
        return <TransactionNamesView />;
      case 'notebook':
        return <NotebookView />;
      case 'calendar':
        return <CalendarView />;
      case 'cash_calculator':
        return <CashCalculatorView />;
      case 'backup_restore':
        return <BackupRestoreView />;
      case 'settings':
        return <SettingsView />;
      case 'deleted_transactions':
        return <DeletedTransactionsView />;
      case 'help':
        return <HelpView />;
      default:
        return <LedgerView />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-900 max-w-2xl mx-auto shadow-2xl relative">
      {/* Top App Bar shown on ledger view */}
      {activeView === 'ledger' && <TopAppBar />}

      {/* Main Active View */}
      <main className="flex-1 flex flex-col">{renderActiveView()}</main>

      {/* Navigation Drawer Overlay */}
      <NavigationDrawer />

      {/* Export Report Modal (PDF & Excel) */}
      <ExportModal />

      {/* Transaction Entry Bottom Sheets */}
      <TransactionModal
        type="in"
        isOpen={isCashInModalOpen}
        onClose={() => setIsCashInModalOpen(false)}
      />
      <TransactionModal
        type="out"
        isOpen={isCashOutModalOpen}
        onClose={() => setIsCashOutModalOpen(false)}
      />

      {/* Single Transaction Detail & Edit Modal */}
      <TransactionDetailModal />

      {/* In-App Document Preview Modal */}
      <DocumentPreviewModal />

      {/* Add New Cash Book / Account Modal */}
      <AddAccountModal
        isOpen={isAddAccountModalOpen}
        onClose={() => setIsAddAccountModalOpen(false)}
      />

      {/* Android Phone Testing & Install Modal */}
      <AndroidInstallModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
      />

      {/* Share with Friends & Download APK Modal */}
      <ShareAppModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
      />

      {/* Paid Ad-Free Pro Subscription Modal */}
      <SubscriptionModal />
    </div>
  );
};

const AppGatekeeper: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-50 to-slate-100 flex flex-col items-center justify-center p-4">
        <img
          src="/app-icon.png"
          alt="Cash Khata"
          className="w-18 h-18 rounded-3xl object-cover shadow-xl shadow-emerald-900/20 animate-pulse border-2 border-white"
        />
        <p className="text-sm font-bold text-slate-800 mt-4 tracking-tight">
          Opening Cash Khata...
        </p>
        <p className="text-xs text-slate-500 mt-1">Verifying Google account</p>
      </div>
    );
  }

  if (!user) {
    return <LoginView />;
  }

  return <MainContent />;
};

export default function App() {
  return (
    <AuthProvider>
      <CashBookProvider>
        <AppOpenAd />
        <AppGatekeeper />
      </CashBookProvider>
    </AuthProvider>
  );
}
