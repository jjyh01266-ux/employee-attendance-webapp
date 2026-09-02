import React from 'react';
import { AlertTriangle, CheckCircle, HelpCircle } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  subMessage?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  type?: 'info' | 'warning' | 'danger' | 'success';
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  subMessage,
  confirmLabel = '확인',
  cancelLabel = '취소',
  isDestructive = false,
  type = isDestructive ? 'danger' : 'info',
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        id="confirm-modal-box"
        className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border-2 border-[#cbd5e1] overflow-hidden p-7 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start space-x-4">
          <div className="shrink-0 pt-1">
            {type === 'danger' && (
              <div className="w-12 h-12 rounded-xl bg-rose-100 border-2 border-rose-300 text-rose-600 flex items-center justify-center">
                <AlertTriangle className="w-7 h-7" />
              </div>
            )}
            {type === 'warning' && (
              <div className="w-12 h-12 rounded-xl bg-amber-100 border-2 border-amber-300 text-amber-600 flex items-center justify-center">
                <AlertTriangle className="w-7 h-7" />
              </div>
            )}
            {type === 'success' && (
              <div className="w-12 h-12 rounded-xl bg-emerald-100 border-2 border-emerald-300 text-emerald-600 flex items-center justify-center">
                <CheckCircle className="w-7 h-7" />
              </div>
            )}
            {type === 'info' && (
              <div className="w-12 h-12 rounded-xl bg-blue-100 border-2 border-blue-300 text-[#1d4ed8] flex items-center justify-center">
                <HelpCircle className="w-7 h-7" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-2xl font-black text-[#1e293b] tracking-tight mb-1.5">
              {title}
            </h3>
            <p className="text-lg text-slate-700 leading-relaxed font-semibold">
              {message}
            </p>
            {subMessage && (
              <p className="mt-2 text-sm font-medium text-rose-700 bg-rose-50 p-2.5 rounded-xl border border-rose-200">
                {subMessage}
              </p>
            )}
          </div>
        </div>

        {/* Buttons */}
        <div className="mt-6 flex items-center justify-end space-x-3">
          <button
            id="btn-confirm-cancel"
            type="button"
            onClick={onClose}
            className="min-h-12 px-6 py-2.5 rounded-xl bg-[#e2e8f0] hover:bg-[#cbd5e1] active:bg-slate-300 text-[#1e293b] text-base font-bold transition-colors cursor-pointer border border-slate-300"
          >
            {cancelLabel}
          </button>
          <button
            id="btn-confirm-ok"
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`min-h-12 px-6 py-2.5 rounded-xl text-white text-base font-bold transition-colors cursor-pointer shadow-md ${
              isDestructive
                ? 'bg-rose-600 hover:bg-rose-700 active:bg-rose-800 border-b-4 border-rose-900'
                : 'bg-[#1d4ed8] hover:bg-[#1e40af] active:bg-blue-900 border-b-4 border-[#1e3a8a]'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );

};
