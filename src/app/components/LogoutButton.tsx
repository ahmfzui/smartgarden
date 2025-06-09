"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import LogoutConfirmModal from "./LogoutConfirmModal";

export default function LogoutButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { logout, loading } = useAuth();
  
  const handleLogout = async () => {
    await logout();
    setIsModalOpen(false);
  };
  
  return (
    <>
      <motion.button
        onClick={() => setIsModalOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-rose-600/80 hover:bg-rose-500/80 text-white text-xs border border-rose-500/30"
        whileHover={{ y: -1 }}
        whileTap={{ y: 1 }}
        disabled={loading}
      >
        {loading ? (
          <motion.div
            className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        ) : (
          <LogOut className="h-3.5 w-3.5" />
        )}
        Logout
      </motion.button>
      
      <LogoutConfirmModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleLogout}
        title="Konfirmasi Logout"
        message="Apakah Anda yakin ingin keluar dari sistem?"
      />
    </>
  );
}