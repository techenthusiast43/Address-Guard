import React from 'react';
import { Loader2, CheckCircle2, AlertCircle, ExternalLink, X } from 'lucide-react';

export default function TxNotification({ notification, onDismiss }) {
  if (!notification) return null;

  const { type, title, message, hash } = notification;

  const isPending = type === 'pending' || type === 'confirming';
  const isSuccess = type === 'success';
  const isError = type === 'error';

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-sm w-full animate-slideUp">
      <div
        className={`p-4 rounded-2xl border shadow-2xl backdrop-blur-md flex items-start gap-3 relative ${
          isPending
            ? 'bg-slate-900/95 border-teal-500/40 text-teal-300'
            : isSuccess
            ? 'bg-slate-900/95 border-emerald-500/40 text-emerald-300'
            : 'bg-slate-900/95 border-rose-500/40 text-rose-300'
        }`}
      >
        <button
          onClick={onDismiss}
          className="absolute top-3 right-3 text-slate-400 hover:text-white transition"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="mt-0.5 shrink-0">
          {isPending && <Loader2 className="w-5 h-5 animate-spin text-teal-400" />}
          {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
          {isError && <AlertCircle className="w-5 h-5 text-rose-400" />}
        </div>

        <div className="pr-4">
          <h4 className="text-xs font-bold text-white tracking-wide uppercase">
            {title}
          </h4>
          <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
            {message}
          </p>

          {hash && (
            <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center gap-1.5">
              <span className="text-[11px] font-mono text-slate-400">
                Tx: {hash.slice(0, 10)}...{hash.slice(-8)}
              </span>
              <a
                href={`https://scan.bohr.life/tx/${hash}`}
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-teal-400 hover:text-teal-300 flex items-center gap-0.5 ml-auto font-medium"
              >
                <span>View on BohrScan</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

