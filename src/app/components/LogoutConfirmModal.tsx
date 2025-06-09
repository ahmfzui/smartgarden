"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, AlertCircle } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

export default function ConfirmModal({ isOpen, onClose, onConfirm, title, message }: ConfirmModalProps) {
  // Close on escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);
  
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);
  
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          
          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              className="bg-gradient-to-br from-slate-800/95 to-slate-900/95 border border-white/10 rounded-lg shadow-xl w-full max-w-md overflow-hidden"
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              {/* Header */}
              <div className="px-4 py-3 bg-gradient-to-r from-slate-900/80 to-slate-800/80 border-b border-white/10 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <AlertCircle className="text-red-400 h-5 w-5" />
                  <h3 className="font-medium text-white">{title}</h3>
                </div>
                <button onClick={onClose} className="text-white/70 hover:text-white p-1 rounded-full hover:bg-white/10">
                  <X className="h-4 w-4" />
                </button>
              </div>
              
              {/* Body */}
              <div className="p-4">
                <p className="text-white/80 text-sm">{message}</p>
              </div>
              
              {/* Footer */}
              <div className="p-4 flex justify-end gap-3 border-t border-white/5 bg-black/20">
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-white/10 hover:bg-white/15 text-white/80 hover:text-white rounded-lg text-sm transition-colors"
                >
                  Batal
                </button>
                <motion.button
                  onClick={onConfirm}
                  className="px-4 py-2 bg-red-600/80 hover:bg-red-500/80 text-white rounded-lg text-sm border border-red-500/30"
                  whileHover={{ y: -1 }}
                  whileTap={{ y: 1 }}
                >
                  Logout
                </motion.button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}