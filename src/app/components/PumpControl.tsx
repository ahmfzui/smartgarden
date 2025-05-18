"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Droplet, Settings, Power, Clock, AlertCircle, CheckCircle, Activity, Info, Zap } from "lucide-react";

// Modern Switch component
const Switch = ({ 
  checked, 
  onChange, 
  disabled 
}: { 
  checked: boolean; 
  onChange: (checked: boolean) => void; 
  disabled?: boolean 
}) => {
  const springConfig = { type: "spring", stiffness: 500, damping: 30 };
  
  return (
    <motion.button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-200 focus:outline-none ${
        checked 
          ? 'bg-gradient-to-r from-emerald-500 to-green-600 shadow-inner shadow-emerald-700/20' 
          : 'bg-gradient-to-r from-gray-500 to-slate-600 shadow-inner shadow-gray-900/20'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      onClick={() => onChange(!checked)}
    >
      <motion.span
        className="inline-block h-4 w-4 transform rounded-full bg-white shadow-md"
        layout
        transition={springConfig}
        animate={{
          x: checked ? 20 : 2,
          boxShadow: checked 
            ? '0 0 8px rgba(16, 185, 129, 0.6)' 
            : '0 0 0px rgba(0, 0, 0, 0.1)'
        }}
      />
    </motion.button>
  );
};

type NotificationType = 'success' | 'error' | null;

export default function PumpControl({
  initialStatus,
  initialManual,
  onSuccess,
}: {
  initialStatus: number;
  initialManual: boolean;
  onSuccess: () => void;
}) {
  const [manual, setManual] = useState(initialManual);
  const [pump, setPump] = useState(initialStatus);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<NotificationType>(null);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [showTips, setShowTips] = useState(false);

  useEffect(() => {
    setPump(initialStatus);
    setManual(initialManual);
  }, [initialStatus, initialManual]);

  const showNotification = (type: NotificationType, message: string) => {
    setNotification(type);
    setNotificationMessage(message);
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  const handleModeChange = async (checked: boolean) => {
    setLoading(true);
    try {
      setManual(checked);
      await updatePump(pump, checked);
      showNotification('success', `Mode ${checked ? 'Manual' : 'Otomatis'} berhasil diaktifkan`);
    } catch (error) {
      showNotification('error', 'Gagal mengubah mode kontrol');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handlePumpToggle = async () => {
    if (!manual || loading) return;
    
    setLoading(true);
    try {
      const newPump = pump === 1 ? 0 : 1;
      setPump(newPump);
      await updatePump(newPump, manual);
      showNotification('success', `Pompa berhasil ${newPump === 1 ? 'dinyalakan' : 'dimatikan'}`);
    } catch (error) {
      showNotification('error', 'Gagal mengubah status pompa');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  async function updatePump(pumpVal: number, manualVal: boolean) {
    await fetch("/api/pump-control", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pumpStatus: pumpVal, manual: manualVal }),
    });
    if (onSuccess) onSuccess();
  }

  return (
    <motion.div
      className="mb-8 relative"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            className={`absolute -top-12 left-1/2 transform -translate-x-1/2 z-20 px-4 py-2 rounded-full shadow-lg
              ${notification === 'success' ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white' : 'bg-gradient-to-r from-red-500 to-rose-600 text-white'}
              flex items-center gap-2`}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {notification === 'success' ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <span className="text-sm font-medium">{notificationMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Card */}
      <div className="glass-card-modern bg-gradient-to-br from-white/30 to-white/10 backdrop-blur-lg text-white border border-white/20 shadow-lg transition-all duration-300 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-1/2 right-0 w-40 h-40 rounded-full bg-gradient-to-r from-emerald-500/20 to-green-500/20 blur-3xl"></div>
        <div className="absolute bottom-0 left-1/4 w-40 h-40 rounded-full bg-gradient-to-r from-blue-500/20 to-cyan-500/20 blur-3xl"></div>
        <div className="absolute top-0 left-1/3 w-32 h-32 rounded-full bg-gradient-to-r from-purple-500/10 to-fuchsia-500/10 blur-xl"></div>
        
        {/* Card Header */}
        <div className="p-5 border-b border-white/10 relative z-10">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-500/70 to-green-600/70 shadow-md border border-white/10">
              <Settings className="h-5 w-5 text-white" />
            </div>
            
            <h2 className="text-lg font-medium text-white">Kontrol Pompa Air</h2>
            
            {/* Status LED */}
            <div className="ml-auto flex items-center">
              <motion.div 
                className={`w-2 h-2 rounded-full mr-1.5 ${pump === 1 ? 'bg-emerald-400' : 'bg-gray-400'}`}
                animate={{
                  opacity: pump === 1 ? [0.7, 1, 0.7] : 0.7,
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity
                }}
              />
              <span className="text-xs text-white/70">
                {pump === 1 ? 'Aktif' : 'Nonaktif'}
              </span>
            </div>
          </div>
        </div>
        
        {/* Card Content */}
        <div className="relative z-10">
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Mode selection */}
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-5 border border-white/20 shadow-lg flex flex-col h-full relative overflow-hidden">
                {/* Decorative background glow */}
                <div className="absolute -right-10 -bottom-10 w-24 h-24 rounded-full bg-blue-500/10 blur-xl"></div>
                <div className="absolute -left-10 -top-10 w-24 h-24 rounded-full bg-blue-500/10 blur-xl"></div>
                
                <div className="flex items-center gap-3 mb-4 relative z-10">
                  <div className="p-2 rounded-lg bg-blue-500/20 border border-blue-500/30">
                    <Clock className="w-5 h-5 text-blue-300" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-white">Mode Kontrol</h3>
                    <p className="text-xs text-white/60">Pilih mode kerja pompa air</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 rounded-lg bg-white/10 backdrop-blur-md border border-white/10 mb-4 relative z-10">
                  <div className="flex flex-col">
                    <span className={`text-sm ${!manual ? 'text-emerald-300 font-medium' : 'text-white/60'}`}>Mode Otomatis</span>
                    <span className="text-xs text-white/50">Sistem mengontrol</span>
                  </div>
                  
                  <Switch 
                    checked={manual} 
                    onChange={(checked) => handleModeChange(checked)}
                    disabled={loading}
                  />
                  
                  <div className="flex flex-col items-end">
                    <span className={`text-sm ${manual ? 'text-emerald-300 font-medium' : 'text-white/60'}`}>Mode Manual</span>
                    <span className="text-xs text-white/50">Kontrol sendiri</span>
                  </div>
                </div>
                
                <div className="mt-auto flex items-start gap-2 bg-white/5 backdrop-blur-md p-3 rounded-lg border border-white/10 relative z-10">
                  <AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-blue-300" />
                  <p className="text-xs text-white/70">
                    {!manual 
                      ? 'Pompa akan otomatis aktif ketika kelembaban tanah rendah.' 
                      : 'Anda dapat mengontrol pompa secara manual dengan tombol di samping.'}
                  </p>
                </div>
                
                {/* Stats section */}
                <div className="mt-4 grid grid-cols-2 gap-2 relative z-10">
                  <div className="bg-white/5 p-2 rounded-lg border border-white/10 flex flex-col items-center">
                    <span className="text-xs text-white/60">Mode Saat Ini</span>
                    <span className="text-sm font-medium text-white">
                      {manual ? 'Manual' : 'Otomatis'}
                    </span>
                  </div>
                  <div className="bg-white/5 p-2 rounded-lg border border-white/10 flex flex-col items-center">
                    <span className="text-xs text-white/60">Terakhir Diubah</span>
                    <span className="text-sm font-medium text-white">
                      {new Date().toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Pump control */}
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-5 border border-white/20 shadow-lg flex flex-col h-full relative overflow-hidden">
                {/* Decorative background glow */}
                <div className="absolute -right-10 -bottom-10 w-24 h-24 rounded-full bg-emerald-500/10 blur-xl"></div>
                <div className="absolute -left-10 -top-10 w-24 h-24 rounded-full bg-emerald-500/10 blur-xl"></div>
                
                <div className="flex items-center gap-3 mb-4 relative z-10">
                  <div className={`p-2 rounded-lg ${pump === 1 ? 'bg-emerald-500/20 border border-emerald-500/30' : 'bg-gray-500/20 border border-gray-500/20'}`}>
                    <Droplet className={`w-5 h-5 ${pump === 1 ? 'text-emerald-300' : 'text-gray-300'}`} />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-white">Status Pompa</h3>
                    <p className="text-xs text-white/60">
                      {pump === 1 ? 'Pompa air sedang aktif' : 'Pompa air tidak aktif'}
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-col items-center justify-center p-4 rounded-lg bg-white/5 backdrop-blur-md border border-white/10 flex-1 relative z-10">
                  {/* Pump status display */}
                  <div className="mb-4 relative">
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center ${
                      pump === 1 
                        ? 'bg-gradient-to-br from-emerald-500/30 to-green-600/30 border border-emerald-500/40' 
                        : 'bg-gradient-to-br from-gray-500/30 to-slate-600/30 border border-gray-500/30'
                    }`}>
                      {pump === 1 ? (
                        <motion.div
                          animate={{ 
                            rotate: [0, 360],
                            scale: [1, 1.05, 1]
                          }}
                          transition={{ 
                            rotate: { repeat: Infinity, duration: 8, ease: "linear" },
                            scale: { repeat: Infinity, duration: 2, ease: "easeInOut" }
                          }}
                        >
                          <Droplet className="w-10 h-10 text-emerald-300" />
                        </motion.div>
                      ) : (
                        <Droplet className="w-10 h-10 text-gray-400" />
                      )}
                    </div>
                    
                    {/* Water ripple effect for active pump */}
                    {pump === 1 && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <motion.div 
                          className="absolute inset-0 rounded-full border-2 border-emerald-400/60"
                          animate={{ 
                            scale: [1, 1.5],
                            opacity: [0.8, 0]
                          }}
                          transition={{
                            repeat: Infinity,
                            duration: 2,
                            ease: "easeOut"
                          }}
                        />
                        <motion.div 
                          className="absolute inset-0 rounded-full border-2 border-emerald-400/40"
                          animate={{ 
                            scale: [1, 1.8],
                            opacity: [0.6, 0]
                          }}
                          transition={{
                            repeat: Infinity,
                            duration: 2.5,
                            delay: 0.5,
                            ease: "easeOut"
                          }}
                        />
                      </div>
                    )}
                    
                    {/* Status indicator */}
                    <motion.div 
                      className={`absolute -top-1 -right-1 flex items-center justify-center h-6 w-6 rounded-full ${
                        pump === 1 
                          ? 'bg-emerald-500 text-white' 
                          : 'bg-gray-500 text-white/80'
                      }`}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 500, damping: 25 }}
                    >
                      <Power className="h-3 w-3" />
                    </motion.div>
                  </div>
                  
                  <div className={`py-1.5 px-4 rounded-full text-xs font-medium border ${
                    pump === 1 
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' 
                      : 'bg-gray-500/20 text-gray-300 border-gray-500/20'
                  }`}>
                    {pump === 1 ? 'AKTIF' : 'NONAKTIF'}
                  </div>
                  
                  <motion.button
                    className={`mt-4 w-full py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                      !manual || loading
                        ? "bg-gray-500/20 text-gray-400 cursor-not-allowed border border-gray-500/20"
                        : pump === 1
                        ? "bg-gradient-to-r from-green-600 to-emerald-500 text-white shadow-md shadow-emerald-500/30 border border-emerald-500/50"
                        : "bg-white/10 text-white border border-white/30 hover:bg-white/20"
                    }`}
                    onClick={handlePumpToggle}
                    disabled={!manual || loading}
                    whileHover={!manual || loading ? {} : { y: -1 }}
                    whileTap={!manual || loading ? {} : { y: 0 }}
                  >
                    {loading ? (
                      <motion.div 
                        className="h-4 w-4 rounded-full border-2 border-current border-t-transparent" 
                        animate={{ rotate: 360 }}
                        transition={{ 
                          repeat: Infinity, 
                          duration: 1,
                          ease: "linear"
                        }}
                      />
                    ) : (
                      <>
                        <Power className="w-4 h-4" />
                        <span>{pump === 1 ? "Matikan Pompa" : "Nyalakan Pompa"}</span>
                      </>
                    )}
                  </motion.button>
                </div>
                
                {/* Energy stats */}
                <div className="mt-4 grid grid-cols-2 gap-2 relative z-10">
                  <div className="bg-white/5 p-2 rounded-lg border border-white/10 flex flex-col items-center">
                    <span className="text-xs text-white/60">Status</span>
                    <span className={`text-sm font-medium ${pump === 1 ? 'text-emerald-300' : 'text-gray-300'}`}>
                      {pump === 1 ? 'Menyala' : 'Mati'}
                    </span>
                  </div>
                  <div className="bg-white/5 p-2 rounded-lg border border-white/10 flex items-center justify-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-xs text-white">
                      {pump === 1 ? 'Menggunakan daya' : 'Hemat energi'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Bottom monitoring section */}
            <div className="mt-5 p-4 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 relative overflow-hidden">
              {/* Decorative element */}
              <motion.div 
                className="absolute right-0 bottom-0 w-32 h-32 rounded-full bg-gradient-to-r from-emerald-500/10 to-green-500/10 blur-xl"
                animate={{ 
                  scale: [1, 1.1, 1],
                  opacity: [0.4, 0.6, 0.4]
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              <motion.div 
                className="absolute left-1/4 top-0 w-24 h-24 rounded-full bg-gradient-to-r from-purple-500/10 to-fuchsia-500/10 blur-xl"
                animate={{ 
                  scale: [1, 1.15, 1],
                  opacity: [0.3, 0.5, 0.3]
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1
                }}
              />
              
              <div className="flex flex-wrap items-center gap-3 mb-2 relative z-10">
                <Activity className="w-4 h-4 text-emerald-300" />
                <h3 className="text-sm font-medium text-white">Status Sistem Pompa</h3>
                <div className="ml-auto">
                  <button
                    className="text-xs text-white/60 hover:text-white flex items-center gap-1.5"
                    onClick={() => setShowTips(!showTips)}
                  >
                    <Info className="w-3.5 h-3.5" />
                    <span>{showTips ? 'Sembunyikan tips' : 'Tampilkan tips'}</span>
                  </button>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-3 mt-3 relative z-10">
                <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
                  <motion.div 
                    className={`w-2 h-2 rounded-full ${manual ? 'bg-amber-400' : 'bg-emerald-400'}`}
                    animate={{
                      opacity: [0.7, 1, 0.7]
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity
                    }}
                  />
                  <span className="text-xs text-white">Mode: {manual ? 'Manual' : 'Otomatis'}</span>
                </div>
                
                <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
                  <motion.div 
                    className={`w-2 h-2 rounded-full ${pump === 1 ? 'bg-emerald-400' : 'bg-gray-400'}`}
                    animate={{
                      opacity: pump === 1 ? [0.7, 1, 0.7] : 0.7
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity
                    }}
                  />
                  <span className="text-xs text-white">Pompa: {pump === 1 ? 'Menyala' : 'Mati'}</span>
                </div>
                
                <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
                  <motion.div 
                    className="w-2 h-2 rounded-full bg-emerald-400"
                    animate={{
                      opacity: [0.7, 1, 0.7]
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity
                    }}
                  />
                  <span className="text-xs text-white">Sistem: Online</span>
                </div>
                
                <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
                  <motion.div 
                    className="w-2 h-2 rounded-full bg-blue-400"
                    animate={{
                      opacity: [0.7, 1, 0.7]
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      delay: 0.5
                    }}
                  />
                  <span className="text-xs text-white">Koneksi: Aktif</span>
                </div>
              </div>
              
              {/* Tips & Info */}
              <AnimatePresence>
                {showTips && (
                  <motion.div
                    className="mt-4 bg-white/5 p-3 rounded-lg border border-blue-500/30"
                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                    animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h4 className="flex items-center gap-1.5 text-xs font-medium text-blue-300 mb-2">
                      <Info className="w-3.5 h-3.5" />
                      <span>Tips Penggunaan</span>
                    </h4>
                    <ul className="text-xs text-white/80 space-y-1.5 pl-5 list-disc">
                      <li>Mode Otomatis akan mengaktifkan pompa saat kelembaban tanah rendah</li>
                      <li>Gunakan Mode Manual hanya saat perlu melakukan penyiraman khusus</li>
                      <li>Periksa status pompa secara berkala untuk memastikan sistem bekerja dengan baik</li>
                      <li>Jangan lupa matikan pompa secara manual jika telah selesai menggunakannya</li>
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {/* Date & time display */}
            <div className="mt-3 text-xs text-white/50 text-right">
              <span>Pembaruan terakhir: {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}