import React, { useState } from 'react';
import { useAccount, useDisconnect } from 'wagmi';
import { useAppKit } from '@reown/appkit/react';
import { Shield, ShieldAlert, Settings, ExternalLink, LogOut, Check, Copy } from 'lucide-react';

export default function Header({
  contractAddress,
  setContractAddress,
  isCorrectNetwork,
  switchChain,
  explorerUrl = 'https://scan.botchain.ai',
  isMainnet = true,
  chainId,
}) {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { open } = useAppKit();
  const [showConfig, setShowConfig] = useState(false);
  const [tempAddr, setTempAddr] = useState(contractAddress);
  const [copiedAddr, setCopiedAddr] = useState(false);

  const formatShort = (addr) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const handleCopyUser = () => {
    if (!address) return;
    navigator.clipboard.writeText(address);
    setCopiedAddr(true);
    setTimeout(() => setCopiedAddr(false), 2000);
  };

  const handleSaveContract = (e) => {
    e.preventDefault();
    setContractAddress(tempAddr);
    setShowConfig(false);
  };

  return (
    <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-xl bg-gradient-to-tr from-teal-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-teal-500/20 text-slate-950 font-bold">
            <Shield className="w-6 h-6 text-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight text-white">AddressGuard</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-400 font-mono font-medium border border-teal-500/20">
                BOT Chain
              </span>
            </div>
            <p className="text-xs text-slate-400">Personal Trusted Wallet Address Manager</p>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Network Indicator */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs">
            <span
              className={`w-2 h-2 rounded-full ${isConnected
                ? isCorrectNetwork
                  ? 'bg-emerald-400 shadow-sm shadow-emerald-400 ring-2 ring-emerald-500/20'
                  : 'bg-amber-400 animate-pulse'
                : 'bg-slate-500'
                }`}
            />
            <span className="text-slate-300 font-mono font-medium">
              {isConnected
                ? isCorrectNetwork
                  ? chainId === 31337
                    ? 'Localhost (31337)'
                    : 'BOT Chain (677)'
                  : 'Wrong Network'
                : 'BOT Chain (677)'}
            </span>
          </div>

          {/* Contract Settings Trigger */}
          <button
            onClick={() => {
              setTempAddr(contractAddress);
              setShowConfig(!showConfig);
            }}
            title="Contract Settings"
            className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700/60 transition-colors"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Wallet Button */}
          {isConnected ? (
            <div className="flex items-center gap-2">
              {!isCorrectNetwork && (
                <button
                  onClick={switchChain}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-medium hover:bg-amber-500/30 transition-all"
                >
                  <ShieldAlert className="w-4 h-4" />
                  <span>Switch to BOT Chain</span>
                </button>
              )}
              <div className="flex items-center bg-slate-800/90 border border-slate-700 rounded-lg p-1 pl-3 text-xs">
                <span className="font-mono text-slate-200 mr-2">{formatShort(address)}</span>
                <button
                  onClick={handleCopyUser}
                  className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-700/60 transition"
                  title="Copy Connected Address"
                >
                  {copiedAddr ? (
                    <Check className="w-3.5 h-3.5 text-teal-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
                <a
                  href={`${explorerUrl}/address/${address}`}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-700/60 transition"
                  title="View on Explorer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <button
                  onClick={() => disconnect()}
                  className="p-1.5 text-rose-400 hover:text-rose-300 rounded hover:bg-rose-500/10 transition ml-1"
                  title="Disconnect"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => open()}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 font-semibold text-sm shadow-md shadow-teal-500/20 transition-all active:scale-95"
            >
              Connect Wallet
            </button>
          )}
        </div>
      </div>

      {/* Contract Settings Modal Dropdown */}
      {showConfig && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 bg-slate-950/90 border-t border-slate-800/80">
          <form
            onSubmit={handleSaveContract}
            className="flex flex-col sm:flex-row items-center gap-3 text-xs"
          >
            <div className="text-slate-400 whitespace-nowrap font-medium">
              Active AddressGuard Contract:
            </div>
            <input
              type="text"
              value={tempAddr}
              onChange={(e) => setTempAddr(e.target.value)}
              placeholder="0x..."
              className="flex-1 w-full bg-slate-900 border border-slate-700 rounded-md px-3 py-1.5 font-mono text-teal-300 focus:outline-none focus:border-teal-500"
            />
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="submit"
                className="px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded font-medium transition"
              >
                Update
              </button>
              <a
                href={`${explorerUrl}/address/${contractAddress}`}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-medium flex items-center gap-1 transition"
              >
                <span>Explorer</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <button
                type="button"
                onClick={() => setShowConfig(false)}
                className="px-2 py-1.5 text-slate-400 hover:text-white"
              >
                Close
              </button>
            </div>
          </form>
        </div>
      )}
    </header>
  );
}
