import React, { useState } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  AlertOctagon,
  Copy,
  Check,
  PlusCircle,
  X,
  Search,
  ExternalLink,
} from 'lucide-react';

export default function AddressVerificationPanel({
  verifyAddress,
  onQuickAdd,
  explorerUrl = 'https://scan.botchain.ai',
}) {
  const [inputAddress, setInputAddress] = useState('');
  const [copied, setCopied] = useState(false);

  const result = verifyAddress(inputAddress);

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) setInputAddress(text.trim());
    } catch (err) {
      console.error('Failed to read clipboard', err);
    }
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
      {/* Decorative gradient blur */}
      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-40 h-40 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="p-1 rounded-md bg-teal-500/20 text-teal-400">
              <ShieldCheck className="w-5 h-5" />
            </span>
            Address Verification Tool
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Paste any recipient address before sending cryptocurrency to verify its validity and trust status.
          </p>
        </div>

        {inputAddress && (
          <button
            onClick={() => setInputAddress('')}
            className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 border border-slate-700 transition"
          >
            <X className="w-3.5 h-3.5" />
            Clear
          </button>
        )}
      </div>

      {/* Input box */}
      <div className="relative mb-5">
        <input
          type="text"
          value={inputAddress}
          onChange={(e) => setInputAddress(e.target.value)}
          placeholder="Paste address to verify (e.g. 0x71C...3a9)"
          className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl px-4 py-3.5 pr-24 font-mono text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition shadow-inner"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
          {!inputAddress && (
            <button
              onClick={handlePaste}
              className="px-2.5 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
            >
              Paste
            </button>
          )}
        </div>
      </div>

      {/* Verification Results */}
      {result.status === 'EMPTY' && (
        <div className="p-4 rounded-xl border border-dashed border-slate-800 bg-slate-950/40 text-center">
          <p className="text-xs text-slate-500">
            Enter or paste a wallet address above to check its validity and whether it is in your AddressGuard trusted list.
          </p>
        </div>
      )}

      {/* 🟢 Valid and Trusted */}
      {result.status === 'TRUSTED' && (
        <div className="p-5 rounded-xl border border-emerald-500/30 bg-emerald-950/20 shadow-lg">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 mt-0.5">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-emerald-300 tracking-wide uppercase">
                    Valid &amp; Trusted Address
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-medium">
                    {result.entry.category}
                  </span>
                </div>
                <div className="text-lg font-semibold text-white mt-1">
                  {result.entry.label}
                </div>
                <div className="flex items-center gap-2 mt-1.5 font-mono text-xs text-slate-300">
                  <span className="break-all">{result.address}</span>
                  <button
                    onClick={() => handleCopy(result.address)}
                    className="p-1 hover:text-white rounded hover:bg-emerald-500/20 transition"
                    title="Copy Address"
                  >
                    {copied ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                  <a
                    href={`${explorerUrl}/address/${result.address}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1 hover:text-white rounded hover:bg-emerald-500/20 transition"
                    title="View on Explorer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
                {result.entry.addedAt > 0 && (
                  <p className="text-[11px] text-slate-400 mt-2">
                    Saved on {new Date(result.entry.addedAt).toLocaleDateString()} at{' '}
                    {new Date(result.entry.addedAt).toLocaleTimeString()}
                  </p>
                )}
              </div>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500 text-slate-950">
              Safe to send
            </span>
          </div>
        </div>
      )}

      {/* 🟡 Valid but NOT Saved */}
      {result.status === 'NOT_SAVED' && (
        <div className="p-5 rounded-xl border border-amber-500/30 bg-amber-950/20 shadow-lg">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 mt-0.5">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-amber-300 tracking-wide uppercase">
                    Valid Address — Not in Trusted List
                  </span>
                </div>
                <p className="text-xs text-amber-200/80 mt-1">
                  This is a syntactically valid EVM address, but it has not been saved in your personal AddressGuard list. Verify the recipient before transferring funds.
                </p>
                <div className="flex items-center gap-2 mt-2 font-mono text-xs text-slate-300">
                  <span className="break-all">{result.address}</span>
                  <button
                    onClick={() => handleCopy(result.address)}
                    className="p-1 hover:text-white rounded hover:bg-amber-500/20 transition"
                    title="Copy Address"
                  >
                    {copied ? (
                      <Check className="w-3.5 h-3.5 text-amber-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                  <a
                    href={`${explorerUrl}/address/${result.address}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1 hover:text-white rounded hover:bg-amber-500/20 transition"
                    title="View on Explorer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>

            <button
              onClick={() => onQuickAdd(result.address)}
              className="whitespace-nowrap flex items-center gap-2 px-3.5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs shadow-md transition active:scale-95 self-end sm:self-center"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add to AddressGuard</span>
            </button>
          </div>
        </div>
      )}

      {/* 🔴 Invalid Address Format */}
      {result.status === 'INVALID' && (
        <div className="p-5 rounded-xl border border-rose-500/30 bg-rose-950/20 shadow-lg">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 mt-0.5">
              <AlertOctagon className="w-6 h-6" />
            </div>
            <div>
              <span className="text-sm font-bold text-rose-300 tracking-wide uppercase">
                Invalid EVM Address
              </span>
              <p className="text-xs text-rose-200/80 mt-1">
                {result.message}
              </p>
              <p className="text-xs text-rose-300 font-semibold mt-2">
                ⚠️ Caution: Never attempt to send cryptocurrency to an invalid or malformed address string.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

