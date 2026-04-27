import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Heart, AlertCircle } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'default' | 'danger' | 'success';
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'default'
}: ConfirmModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-begi-navy/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-sm bg-white border-4 border-begi-navy rounded-[32px] p-8 cartoon-shadow overflow-hidden"
          >
            {/* Background elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-begi-turquoise/10 rounded-full blur-2xl" />
            <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-begi-orange/10 rounded-full blur-2xl" />

            <div className="flex flex-col items-center text-center">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 border-4 border-begi-navy ${
                type === 'danger' ? 'bg-begi-pink' : type === 'success' ? 'bg-begi-turquoise' : 'bg-begi-yellow'
              } cartoon-shadow -rotate-3`}>
                {type === 'danger' ? (
                  <AlertCircle className="w-8 h-8 text-white" />
                ) : (
                  <Heart className="w-8 h-8 text-white fill-white" />
                )}
              </div>

              <h3 className="font-display text-2xl font-black text-begi-navy mb-3">
                {title}
              </h3>
              <p className="text-slate-500 font-medium leading-relaxed mb-8">
                {message}
              </p>

              <div className="grid grid-cols-2 gap-4 w-full">
                <button
                  onClick={onClose}
                  className="px-6 py-4 bg-slate-100 text-begi-navy rounded-2xl font-bold border-2 border-slate-200 hover:bg-slate-200 transition-colors"
                >
                  {cancelText}
                </button>
                <button
                  onClick={onConfirm}
                  className={`px-6 py-4 rounded-2xl font-black text-white border-4 border-begi-navy cartoon-shadow btn-pop ${
                    type === 'danger' ? 'bg-begi-pink' : 'bg-begi-turquoise'
                  }`}
                >
                  {confirmText}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
