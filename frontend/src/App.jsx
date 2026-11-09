import React, { useState } from 'react';
import Header from './components/Header';
import StatsBar from './components/StatsBar';
import AddressVerificationPanel from './components/AddressVerificationPanel';
import AddressList from './components/AddressList';
import AddAddressModal from './components/AddAddressModal';
import TxNotification from './components/TxNotification';
import { useAddressGuard } from './hooks/useAddressGuard';
import {
  Shield,
  ShieldAlert,
  Sparkles,
  ExternalLink,
  Layers,
  CheckCircle2,
} from 'lucide-react';
import { useAppKit } from '@reown/appkit/react';

export default function App() {
  const { open } = useAppKit();
  const {
    userAddress,
    isConnected,
    isCorrectNetwork,
    isMainnet,
    chainId,
    explorerUrl,
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
        explorerUrl={explorerUrl}
        isMainnet={isMainnet}
        chainId={chainId}
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
                  href="https://botchain.ai"
                  target="_blank"
                  rel="noreferrer"
                  className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-700/80 flex items-center justify-center gap-2 transition hover:border-teal-500/50"
                >
                  <img
                    src="/botchain-logo.png"
                    alt="BOT Chain Logo"
                    className="w-4 h-4 rounded-full object-contain shrink-0"
                  />
                  <span>BOT Chain Website</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
                <a
                  href="https://scan.botchain.ai"
                  target="_blank"
                  rel="noreferrer"
                  className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-700/80 flex items-center justify-center gap-2 transition hover:border-cyan-500/50"
                >
                  <img
                    src="/botchain-logo.png"
                    alt="BOT Chain Logo"
                    className="w-4 h-4 rounded-full object-contain shrink-0"
                  />
                  <span>BOT Chain Explorer</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
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
                  AddressGuard operates on BOT Chain (Chain ID 677). Please switch networks to view and manage your addresses.
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
            explorerUrl={explorerUrl}
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
                explorerUrl={explorerUrl}
              />
            </section>
          </>
        )}

        {/* BOT Chain Ecosystem Showcase Section */}
        <section className="rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-slate-950 p-6 sm:p-8 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-teal-500/10 border border-teal-500/20 text-teal-400">
                  <Layers className="w-4 h-4" />
                </span>
                <span className="text-xs font-semibold tracking-wider uppercase text-teal-400">
                  BOT Chain Ecosystem Project
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                Powered natively by BOT Chain
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                AddressGuard leverages BOT Chain's high-throughput, EVM-compatible infrastructure (Chain ID: 677) to execute fast, gas-efficient address verification and decentralized address book management.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <a
                href="https://botchain.ai"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700/80 text-white text-xs font-semibold border border-slate-700 transition shadow-sm hover:border-teal-500/50"
              >
                <img
                  src="/botchain-logo.png"
                  alt="BOT Chain Logo"
                  className="w-4 h-4 rounded-full object-contain shrink-0"
                />
                <span>BOT Chain Website</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>

              <a
                href="https://scan.botchain.ai"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 text-xs font-semibold border border-teal-500/30 transition shadow-sm hover:border-teal-400/60"
              >
                <img
                  src="/botchain-logo.png"
                  alt="BOT Chain Logo"
                  className="w-4 h-4 rounded-full object-contain shrink-0"
                />
                <span>BOT Chain Explorer</span>
                <ExternalLink className="w-3 h-3 text-teal-400" />
              </a>

              <a
                href="https://scan.botchain.ai/address/0xbC40237702cCA86cC09231c3951271e47DDCC1Aa"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700/80 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700 transition shadow-sm"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Verified Contract</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>
            </div>
          </div>
        </section>
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
        explorerUrl={explorerUrl}
      />

      {/* Footer with BOT Chain branding and required ecosystem links */}
      <footer className="mt-auto border-t border-slate-800/80 bg-slate-950 py-8 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-slate-800/60">
            {/* Left: Brand & Network */}
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-teal-500 to-cyan-400 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-teal-500/20">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-sm">AddressGuard</span>
                  <span className="px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-400 text-[10px] font-mono border border-teal-500/20">
                    BOT Chain (677)
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Decentralized Personal Trusted Address Manager &amp; Verification Protocol
                </p>
              </div>
            </div>

            {/* Right: Required BOT Chain Links & Explorer with official logo at the front */}
            <div className="flex flex-wrap items-center gap-6 text-xs">
              <a
                href="https://botchain.ai"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 text-slate-300 hover:text-teal-400 transition font-medium group"
              >
                <img
                  src="/botchain-logo.png"
                  alt="BOT Chain Logo"
                  className="w-4 h-4 rounded-full object-contain shrink-0 group-hover:scale-110 transition-transform"
                />
                <span>BOT Chain Website</span>
                <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-teal-400" />
              </a>

              <a
                href="https://scan.botchain.ai"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 text-slate-300 hover:text-cyan-400 transition font-medium group"
              >
                <img
                  src="/botchain-logo.png"
                  alt="BOT Chain Logo"
                  className="w-4 h-4 rounded-full object-contain shrink-0 group-hover:scale-110 transition-transform"
                />
                <span>BOT Chain Explorer</span>
                <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-cyan-400" />
              </a>

              <a
                href="https://github.com/techenthusiast43/Address-Guard"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 text-slate-300 hover:text-white transition"
              >
                <span>GitHub Source</span>
                <ExternalLink className="w-3 h-3 text-slate-500" />
              </a>
            </div>
          </div>

          {/* Bottom Copyright & Token Specs */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
            <div>
              &copy; {new Date().getFullYear()} AddressGuard. Built natively for the BOT Chain ecosystem.
            </div>
            <div className="flex items-center gap-3">
              <span className="font-mono">Native Token: BOT</span>
              <span>&bull;</span>
              <span className="font-mono">Total Supply: 150,000,000 BOT</span>
              <span>&bull;</span>
              <span className="font-mono">Chain ID: 677</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
