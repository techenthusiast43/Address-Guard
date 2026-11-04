import React, { useState } from 'react';
import Header from './components/Header';
import StatsBar from './components/StatsBar';
import AddressVerificationPanel from './components/AddressVerificationPanel';
import AddressList from './components/AddressList';
import AddAddressModal from './components/AddAddressModal';
import TxNotification from './components/TxNotification';
import { useAddressGuard } from './hooks/useAddressGuard';
import { Shield, ShieldAlert, Sparkles, ExternalLink, BookMarked } from 'lucide-react';
import { useAppKit } from '@reown/appkit/react';

export default function App() {
  const { open } = useAppKit();
  const {
    userAddress,
    isConnected,
    isCorrectNetwork,
    switchChain,
    contractAddress,
    setContractAddress,
    addresses,
    isLoading,
    addAddress,
    removeAddress,
    updateLabel,
    verifyAddress,
    notification,
    dismissNotification,
    isWritePending,
  } = useAddressGuard();

  const [activeCategory, setActiveCategory] = useState('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [prefillAddress, setPrefillAddress] = useState('');

  const handleQuickAdd = (address) => {
    setPrefillAddress(address);
    setIsAddModalOpen(true);
  };

  const handleOpenAddModal = () => {
    setPrefillAddress('');
    setIsAddModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#080c14] text-slate-100 selection:bg-teal-500/20 selection:text-teal-200">
      {/* Navigation Header */}
      <Header
        contractAddress={contractAddress}
        setContractAddress={setContractAddress}
        isCorrectNetwork={isCorrectNetwork}
        switchChain={switchChain}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Not connected alert / intro banner */}
        {!isConnected ? (
          <div className="relative rounded-3xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 p-8 sm:p-12 text-center shadow-2xl overflow-hidden">
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="max-w-2xl mx-auto space-y-4 relative">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-300 text-xs font-medium">
                <Sparkles className="w-3.5 h-3.5" />
                <span>EVM Wallet Security on BOT Chain</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
                Never send crypto to the wrong address again.
              </h1>

              <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
                <strong className="text-slate-200">AddressGuard</strong> is your personal on-chain address book. Save verified destination wallets, organize contacts by category, and instantly verify recipient addresses before making transactions on BOT Chain.
              </p>

              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={() => open()}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 font-bold text-sm shadow-lg shadow-teal-500/25 transition-all active:scale-95"
                >
                  Connect MetaMask / EVM Wallet
                </button>
                <a
                  href="https://scan.bohr.life/"
                  target="_blank"
                  rel="noreferrer"
                  className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-700/80 flex items-center justify-center gap-2 transition"
                >
                  <span>Explore BOT Chain</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        ) : !isCorrectNetwork ? (
          <div className="p-6 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <ShieldAlert className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-amber-300">
                  Connected to the wrong network
                </h3>
                <p className="text-xs text-amber-200/80 mt-0.5">
                  AddressGuard operates on BOT Chain Testnet (Chain ID 968). Please switch networks to view and manage your addresses.
                </p>
              </div>
            </div>
            <button
              onClick={switchChain}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs shadow transition active:scale-95"
            >
              Switch to BOT Chain
            </button>
          </div>
        ) : null}

        {/* Verification Tool (Always available) */}
        <section>
          <AddressVerificationPanel
            verifyAddress={verifyAddress}
            onQuickAdd={handleQuickAdd}
          />
        </section>

        {/* Dashboard Panels (When connected & on correct network) */}
        {isConnected && isCorrectNetwork && (
          <>
            {/* Quick Stats Bar */}
            <section>
              <StatsBar
                addresses={addresses}
                onSelectCategory={setActiveCategory}
                activeCategory={activeCategory}
              />
            </section>

            {/* Trusted Addresses Explorer */}
            <section>
              <AddressList
                addresses={addresses}
                isLoading={isLoading}
                onOpenAdd={handleOpenAddModal}
                onRemove={removeAddress}
                onUpdateLabel={updateLabel}
                activeCategory={activeCategory}
                onSelectCategory={setActiveCategory}
                isWritePending={isWritePending}
              />
            </section>
          </>
        )}
      </main>

      {/* Add Address Modal */}
      <AddAddressModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={addAddress}
        existingAddresses={addresses}
        prefillAddress={prefillAddress}
      />

      {/* Transaction Status Notification */}
      <TxNotification
        notification={notification}
        onDismiss={dismissNotification}
      />

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800/80 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-400">AddressGuard</span>
            <span>&bull;</span>
            <span>BOT Chain Testnet (Chain ID: 968)</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-mono text-slate-400">Total Supply: 150M BOT</span>
            <span>&bull;</span>
            <a
              href="https://scan.bohr.life/"
              target="_blank"
              rel="noreferrer"
              className="text-teal-400 hover:text-teal-300 transition flex items-center gap-1"
            >
              <span>BohrScan Explorer</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

