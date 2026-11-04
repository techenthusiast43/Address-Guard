import React, { useState, useEffect } from 'react';
import { isAddress, getAddress } from 'viem';
import { PlusCircle, X, Loader2, AlertCircle, Check } from 'lucide-react';

const CATEGORIES = ['Personal', 'Friends', 'Exchanges', 'Projects', 'Other'];

export default function AddAddressModal({
  isOpen,
  onClose,
  onAdd,
  existingAddresses = [],
  prefillAddress = '',
}) {
  const [wallet, setWallet] = useState(prefillAddress);
  const [label, setLabel] = useState('');
  const [category, setCategory] = useState('Personal');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (prefillAddress) {
      setWallet(prefillAddress);
    }
  }, [prefillAddress]);

  if (!isOpen) return null;

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) setWallet(text.trim());
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const trimmedWallet = wallet.trim();
    const trimmedLabel = label.trim();

    if (!trimmedWallet) {
      setError('Please provide a wallet address.');
      return;
    }

    if (!isAddress(trimmedWallet)) {
      setError('Invalid EVM address format. Must begin with 0x and have 40 hexadecimal characters.');
      return;
    }

    if (!trimmedLabel) {
      setError('Please enter a label for this address.');
      return;
    }

    const checksummed = getAddress(trimmedWallet);

    // Duplicate check client-side
    const duplicate = existingAddresses.some(
      (item) => item.wallet.toLowerCase() === checksummed.toLowerCase()
    );

    if (duplicate) {
      setError('This address is already in your AddressGuard trusted list.');
      return;
    }

    try {
      setIsSubmitting(true);
      await onAdd(checksummed, trimmedLabel, category);
      // Clean up on success
      setWallet('');
      setLabel('');
      setCategory('Personal');
      onClose();
    } catch (err) {
      setError(err?.shortMessage || err?.message || 'Failed to submit transaction.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="p-2.5 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
            <PlusCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Add Trusted Address</h3>
            <p className="text-xs text-slate-400">
              Save a new verified wallet to your personal BOT Chain address book.
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Wallet Address <span className="text-rose-400">*</span>
              </label>
              <button
                type="button"
                onClick={handlePaste}
                className="text-[11px] text-teal-400 hover:text-teal-300 transition"
              >
                Paste from clipboard
              </button>
            </div>
            <input
              type="text"
              value={wallet}
              onChange={(e) => setWallet(e.target.value)}
              placeholder="0x..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-teal-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Custom Label <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. My Ledger Cold Storage, Alice Binance..."
              maxLength={64}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-teal-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Category
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`py-2 px-2 text-xs font-medium rounded-lg border text-center transition ${
                    category === cat
                      ? 'bg-teal-500/20 text-teal-300 border-teal-500/40'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 disabled:opacity-50 text-slate-950 font-semibold text-xs shadow-md shadow-teal-500/20 transition active:scale-95"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Signing &amp; Saving...</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Save to Blockchain</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

