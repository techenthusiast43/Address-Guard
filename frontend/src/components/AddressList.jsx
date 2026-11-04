import React, { useState, useMemo } from 'react';
import {
  Search,
  Copy,
  Check,
  Edit2,
  Trash2,
  ExternalLink,
  Plus,
  Loader2,
  FolderOpen,
  Filter,
} from 'lucide-react';

const CATEGORY_COLORS = {
  Personal: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  Friends: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  Exchanges: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  Projects: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  Other: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
};

export default function AddressList({
  addresses = [],
  isLoading,
  onOpenAdd,
  onRemove,
  onUpdateLabel,
  activeCategory,
  onSelectCategory,
  isWritePending,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedAddress, setCopiedAddress] = useState(null);

  // Edit Label Modal State
  const [editingItem, setEditingItem] = useState(null);
  const [newLabelText, setNewLabelText] = useState('');
  const [editError, setEditError] = useState('');

  // Delete Confirmation State
  const [deletingItem, setDeletingItem] = useState(null);

  const handleCopy = (address) => {
    navigator.clipboard.writeText(address);
    setCopiedAddress(address);
    setTimeout(() => setCopiedAddress(null), 2000);
  };

  const handleStartEdit = (item) => {
    setEditingItem(item);
    setNewLabelText(item.label);
    setEditError('');
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!newLabelText.trim()) {
      setEditError('Label cannot be empty.');
      return;
    }
    try {
      await onUpdateLabel(editingItem.wallet, newLabelText.trim());
      setEditingItem(null);
    } catch (err) {
      setEditError(err?.shortMessage || err?.message || 'Failed to update label.');
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingItem) return;
    try {
      await onRemove(deletingItem.wallet);
      setDeletingItem(null);
    } catch (err) {
      console.error(err);
    }
  };

  // Filtered and searched list
  const filteredAddresses = useMemo(() => {
    return addresses.filter((item) => {
      // Category filter
      const matchesCategory =
        activeCategory === 'All' ||
        (item.category || 'Other').toLowerCase() === activeCategory.toLowerCase();

      // Search filter
      const query = searchQuery.trim().toLowerCase();
      if (!query) return matchesCategory;

      const matchesSearch =
        item.label.toLowerCase().includes(query) ||
        item.wallet.toLowerCase().includes(query) ||
        (item.category || '').toLowerCase().includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [addresses, activeCategory, searchQuery]);

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl">
      {/* Top Bar: Search, Category Filter, and Add Button */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span>Trusted Address Book</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-teal-400 font-mono font-medium border border-slate-700">
              {filteredAddresses.length} {filteredAddresses.length === 1 ? 'Entry' : 'Entries'}
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Your verified contacts and safe destination addresses on BOT Chain.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Search bar */}
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search label, address..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-teal-500 transition"
            />
          </div>

          <button
            onClick={onOpenAdd}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold text-xs shadow-md shadow-teal-500/20 transition active:scale-95 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Add Address</span>
          </button>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-3 mb-4 scrollbar-none border-b border-slate-800/60">
        <span className="text-xs text-slate-500 flex items-center gap-1 mr-1">
          <Filter className="w-3.5 h-3.5" />
          Filter:
        </span>
        {['All', 'Personal', 'Friends', 'Exchanges', 'Projects', 'Other'].map((cat) => (
          <button
            key={cat}
            onClick={() => onSelectCategory(cat)}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition whitespace-nowrap ${
              activeCategory === cat
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                : 'bg-slate-950/60 text-slate-400 hover:text-slate-200 border border-transparent'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Address Items */}
      {isLoading ? (
        <div className="py-16 text-center text-slate-500 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-teal-400" />
          <span className="text-xs">Loading addresses from BOT Chain...</span>
        </div>
      ) : filteredAddresses.length === 0 ? (
        <div className="py-16 text-center text-slate-500 flex flex-col items-center justify-center gap-3 border border-dashed border-slate-800 rounded-xl bg-slate-950/30">
          <FolderOpen className="w-8 h-8 text-slate-600" />
          <div>
            <p className="text-sm font-medium text-slate-400">
              {addresses.length === 0
                ? 'No trusted addresses saved yet'
                : 'No addresses match your filter/search criteria'}
            </p>
            <p className="text-xs text-slate-600 mt-1">
              {addresses.length === 0
                ? 'Add your frequently used recipient addresses to verify them before sending funds.'
                : 'Try adjusting your search query or category filter.'}
            </p>
          </div>
          {addresses.length === 0 && (
            <button
              onClick={onOpenAdd}
              className="mt-2 px-4 py-2 rounded-lg bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 text-xs font-semibold border border-teal-500/30 transition"
            >
              Add First Address
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {filteredAddresses.map((item) => {
            const cat = item.category || 'Other';
            const catStyle = CATEGORY_COLORS[cat] || CATEGORY_COLORS.Other;
            const isCopied = copiedAddress === item.wallet;

            return (
              <div
                key={item.wallet}
                className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 hover:bg-slate-950/90 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group"
              >
                {/* Info */}
                <div className="flex items-start gap-3.5 min-w-0">
                  <div className="h-10 w-10 rounded-xl bg-slate-800 flex items-center justify-center font-mono font-bold text-xs text-teal-400 border border-slate-700/60 shrink-0 mt-0.5">
                    {item.label.slice(0, 2).toUpperCase()}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-slate-100 text-sm truncate">
                        {item.label}
                      </span>
                      <span
                        className={`text-[11px] px-2 py-0.5 rounded-full font-medium border ${catStyle}`}
                      >
                        {cat}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mt-1.5 font-mono text-xs text-slate-400">
                      <span className="truncate max-w-[220px] sm:max-w-[360px] lg:max-w-none text-slate-300">
                        {item.wallet}
                      </span>

                      {/* Copy Address Button */}
                      <button
                        onClick={() => handleCopy(item.wallet)}
                        className="p-1 hover:text-white rounded hover:bg-slate-800 transition"
                        title="Copy Address"
                      >
                        {isCopied ? (
                          <Check className="w-3.5 h-3.5 text-teal-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5 text-slate-400" />
                        )}
                      </button>

                      {/* Explorer Link */}
                      <a
                        href={`https://scan.bohr.life/address/${item.wallet}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition"
                        title="View on BohrScan"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                  <button
                    onClick={() => handleStartEdit(item)}
                    disabled={isWritePending}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs border border-slate-800 transition disabled:opacity-50"
                    title="Edit Label"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Edit</span>
                  </button>

                  <button
                    onClick={() => setDeletingItem(item)}
                    disabled={isWritePending}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 text-xs border border-slate-800 hover:border-rose-900/50 transition disabled:opacity-50"
                    title="Remove Address"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Remove</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Inline Edit Label Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-1">Update Label</h3>
            <p className="text-xs text-slate-400 mb-4 font-mono break-all">
              {editingItem.wallet}
            </p>

            {editError && (
              <p className="text-xs text-rose-400 mb-3 bg-rose-500/10 p-2 rounded border border-rose-500/20">
                {editError}
              </p>
            )}

            <form onSubmit={handleSaveEdit}>
              <input
                type="text"
                value={newLabelText}
                onChange={(e) => setNewLabelText(e.target.value)}
                maxLength={64}
                autoFocus
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-teal-500 transition mb-4"
              />

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold text-xs rounded-xl shadow transition"
                >
                  Save Label
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-2">Remove Trusted Address</h3>
            <p className="text-xs text-slate-300 mb-3">
              Are you sure you want to remove <span className="font-semibold text-white">"{deletingItem.label}"</span> from your trusted list?
            </p>
            <div className="p-3 bg-slate-950 rounded-lg text-xs font-mono text-slate-400 break-all mb-4 border border-slate-800">
              {deletingItem.wallet}
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeletingItem(null)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs rounded-xl shadow transition"
              >
                Remove from Blockchain
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

