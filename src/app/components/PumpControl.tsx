"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Droplet, 
  Settings, 
  Power, 
  Clock, 
  AlertCircle, 
  CheckCircle, 
  Activity, 
  Info, 
  Zap, 
  CircleCheck,
  GaugeCircle,
  CircleDot
} from "lucide-react";
import { ModeSwitch } from "./ModeSwitch";

function StatusIndicator({ active }: { active: boolean }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className={`relative w-3 h-3 rounded-full ${active ? 'bg-emerald-500' : 'bg-slate-500/50'}`}>
        {active && (
          <motion.div
            className="absolute inset-0 rounded-full bg-emerald-500 z-0"
            animate={{ scale: [1, 1.5, 1], opacity: [0.8, 0, 0.8] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}
      </div>
      <span className={`text-xs ${active ? 'text-emerald-400 font-medium' : 'text-white/50'}`}>
        {active ? 'Aktif' : 'Nonaktif'}
      </span>
    </div>
  );
}

function PumpToggle({ 
  checked, 
  onChange, 
  disabled 
}: { 
  checked: boolean; 
  onChange: (checked: boolean) => void; 
  disabled: boolean;
}) {
  return (
    <div className={`relative w-full h-20 rounded-xl transition-colors duration-300 ${disabled ? 'opacity-60' : ''} ${checked ? 'bg-gradient-to-r from-blue-600/20 to-blue-700/20' : 'bg-slate-700/20'}`}>
      <motion.button
        whileTap={{ scale: disabled ? 1 : 0.97 }}
        onClick={() => !disabled && onChange(!checked)}
        disabled={disabled}
        className={`
          absolute inset-0 rounded-xl flex items-center justify-between px-5
          ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}
          border ${checked ? 'border-blue-500/30' : 'border-white/10'}
          transition-all duration-300
        `}
      >
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            checked ? 'bg-blue-500' : 'bg-white/10'
          }`}>
            <motion.div
              animate={checked ? {
                y: [0, -2, 0],
                scale: [1, 1.05, 1]
              } : {}}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <Power className={`h-5 w-5 ${checked ? 'text-white' : 'text-white/60'}`} />
            </motion.div>
          </div>
          
          <div className="flex flex-col items-start">
            <span className="text-sm font-medium text-white">Status Pompa</span>
            <StatusIndicator active={checked} />
          </div>
        </div>
        
        <div>
          <div className={`w-14 h-8 rounded-full ${checked ? 'bg-blue-500/80' : 'bg-slate-700/80'} flex items-center transition-all duration-300 px-1`}>
            <motion.div 
              animate={{ 
                x: checked ? 24 : 0,
                backgroundColor: checked ? 'rgb(255, 255, 255)' : 'rgba(255, 255, 255, 0.7)'
              }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="w-6 h-6 rounded-full shadow-md flex items-center justify-center"
            >
              {checked ? (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <CircleCheck className="h-4 w-4 text-blue-500" />
                </motion.div>
              ) : (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                >
                  <Power className="h-4 w-4 text-slate-400" strokeWidth={3} />
                </motion.div>
              )}
            </motion.div>
          </div>
        </div>
      </motion.button>
    </div>
  );
}

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

  // Update state when props change
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
    // Send API request
    await fetch("/api/pump-control", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pumpStatus: pumpVal, manual: manualVal }),
    });
    
    // Trigger immediate revalidation through SWR
    if (onSuccess) onSuccess();
  }

  return (
    <div className="mt-8 mb-4">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="rounded-3xl relative overflow-hidden bg-gradient-to-br from-slate-800/60 to-slate-900/60 border border-white/10 shadow-lg"
      >
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-blue-900/80 via-blue-800/80 to-indigo-900/80 px-4 py-3 border-b border-white/10">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center">
                <Droplet className="h-3 w-3 text-blue-300" />
              </div>
              <span>Sistem Irigasi Pintar</span>
            </h3>
            
            <div className={`px-3 py-1 rounded-full text-xs flex items-center gap-1.5 ${manual ? 'bg-blue-500/20 border border-blue-500/30 text-blue-300' : 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-300'}`}>
              <motion.div 
                className={`w-1.5 h-1.5 rounded-full ${manual ? 'bg-blue-400' : 'bg-emerald-400'}`}
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <span>{manual ? 'Mode Manual' : 'Mode Otomatis'}</span>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          {/* Main info panel */}
          <div className="bg-slate-700/30 border border-white/10 rounded-2xl p-4 mb-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                <Info className="h-4 w-4 text-blue-300/80" />
              </div>
              <div className="text-sm text-white/80">
                Panel kontrol ini memungkinkan Anda mengelola sistem irigasi tanaman secara otomatis atau manual sesuai kebutuhan.
              </div>
            </div>
            
            <div className="flex items-center gap-2.5 bg-blue-900/30 rounded-lg p-3 border border-blue-500/20">
              <CircleDot className="h-4 w-4 text-blue-300/80" />
              <span className="text-xs text-white/80">
                Mode saat ini: <span className="font-medium text-white">{manual ? 'Manual - Pompa dikontrol oleh pengguna' : 'Otomatis - Sistem mengatur pompa berdasarkan sensor'}</span>
              </span>
            </div>
          </div>
          
          {/* Main control panel */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6">
              {/* Mode control */}
              <div className="bg-gradient-to-br from-slate-700/40 to-slate-800/40 rounded-xl p-5 border border-white/10">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500/20 to-blue-600/20 flex items-center justify-center border border-white/10">
                    <Settings className="h-5 w-5 text-blue-300" />
                  </div>
                  <div>
                    <h4 className="font-medium text-white">Mode Kontrol</h4>
                    <p className="text-xs text-white/60">Alihkan antara mode otomatis dan manual</p>
                  </div>
                </div>
                
                <div className="bg-slate-800/50 rounded-lg px-4 py-4 border border-white/5">
                  <ModeSwitch 
                    checked={manual}
                    onChange={handleModeChange}
                    disabled={loading}
                  />
                </div>
                
                {/* Mode description - Remove since now it's inside ModeSwitch */}
              </div>
              
              {/* Pump control button (only active in manual mode) */}
              <div className={`bg-gradient-to-br from-slate-700/40 to-slate-800/40 rounded-xl p-5 border ${manual ? 'border-white/10' : 'border-white/5 opacity-90'}`}>
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full ${manual ? 'bg-gradient-to-br from-blue-500/20 to-blue-600/20' : 'bg-slate-700/50'} flex items-center justify-center border border-white/10`}>
                      <Power className={`h-5 w-5 ${manual ? 'text-blue-300' : 'text-white/40'}`} />
                    </div>
                    <div>
                      <h4 className={`font-medium ${manual ? 'text-white' : 'text-white/70'}`}>Kontrol Pompa</h4>
                      <p className={`text-xs ${manual ? 'text-white/60' : 'text-white/40'}`}>Aktifkan atau nonaktifkan pompa air</p>
                    </div>
                  </div>
                </div>
                
                <PumpToggle 
                  checked={pump === 1}
                  onChange={handlePumpToggle}
                  disabled={!manual || loading}
                />
              </div>
            </div>
            
            {/* Pump status display */}
            <div className="bg-gradient-to-br from-slate-700/40 to-slate-800/40 rounded-xl p-5 border border-white/10 flex flex-col items-center justify-center">
              {/* Status display */}
              <div className="text-center mb-6">
                <h3 className="text-white/80 font-medium mb-2">Status Pompa</h3>
                <motion.div 
                  className={`text-2xl font-bold mb-1 ${pump === 1 ? 'text-blue-400' : 'text-white/70'}`}
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  key={pump}
                >
                  {pump === 1 ? 'AKTIF' : 'NONAKTIF'}
                </motion.div>
                <div className="text-xs text-white/50">{manual ? 'Mode Kontrol Manual' : 'Mode Kontrol Otomatis'}</div>
              </div>
              
              {/* Pump visualization */}
              <div className="relative w-44 h-44">
                {/* Background glow */}
                <AnimatePresence>
                  {pump === 1 && (
                    <motion.div 
                      className="absolute inset-0"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <div className="absolute inset-0 rounded-full bg-blue-500/10 blur-xl"></div>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                {/* Main pump indicator */}
                <div 
                  className={`relative w-40 h-40 mx-auto rounded-full flex items-center justify-center border-4 ${
                    pump === 1 
                      ? 'border-blue-500/40 bg-gradient-to-br from-blue-900/40 to-cyan-800/40' 
                      : 'border-slate-600/20 bg-gradient-to-br from-slate-800/20 to-slate-700/20'
                  } transition-all duration-500`}
                >
                  {/* Water level animation */}
                  <div className="absolute inset-0 rounded-full overflow-hidden">
                    {pump === 1 && (
                      <motion.div
                        className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-blue-600/40 to-cyan-500/30"
                        initial={{ height: "0%" }}
                        animate={{ height: ["20%", "70%", "20%"] }}
                        transition={{
                          duration: 5,
                          ease: "easeInOut",
                          repeat: Infinity,
                          repeatType: "loop"
                        }}
                      />
                    )}
                  </div>
                  
                  {/* Inner circle */}
                  <div 
                    className={`relative z-10 w-28 h-28 rounded-full flex flex-col items-center justify-center transition-all duration-500 ${
                      pump === 1 
                        ? 'bg-gradient-to-br from-blue-600 to-blue-800 text-white shadow-lg shadow-blue-900/30' 
                        : 'bg-gradient-to-br from-slate-700 to-slate-800 text-white/70'
                    }`}
                  >
                    <motion.div
                      animate={pump === 1 ? {
                        y: [0, -4, 0],
                        scale: [1, 1.05, 1]
                      } : {}}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      <Droplet className={`h-12 w-12 transition-colors duration-500 ${pump === 1 ? 'text-white' : 'text-blue-300/30'}`} />
                    </motion.div>
                    
                    {/* Pulse effect */}
                    {pump === 1 && (
                      <>
                        <motion.div 
                          className="absolute inset-0 rounded-full border-2 border-white/30"
                          animate={{ scale: [1, 1.1, 1], opacity: [0.8, 0, 0.8] }}
                          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        />
                        <motion.div 
                          className="absolute inset-0 rounded-full border border-white/20"
                          animate={{ scale: [1, 1.2, 1], opacity: [0.6, 0, 0.6] }}
                          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
                        />
                      </>
                    )}
                  </div>
                </div>
                
                {/* Radiating circles for active pump */}
                {pump === 1 && (
                  <>
                    <motion.div
                      className="absolute inset-0 rounded-full border border-blue-400/20"
                      animate={{ scale: [1, 1.4], opacity: [0.4, 0] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
                    />
                    <motion.div
                      className="absolute inset-0 rounded-full border border-blue-400/10"
                      animate={{ scale: [1, 1.6], opacity: [0.3, 0] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeOut", delay: 0.5 }}
                    />
                  </>
                )}
              </div>
              
              {/* Status info */}
              <div className="mt-6 w-full">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg">
                    <Clock className="h-3.5 w-3.5 text-blue-300/70" />
                    <span className="text-xs text-white/70">
                      {new Date().toLocaleTimeString('id-ID', { 
                        hour: '2-digit', 
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${
                    pump === 1 
                      ? 'bg-blue-500/10 text-blue-300' 
                      : 'bg-slate-700/20 text-slate-300'
                  }`}>
                    <Activity className="h-3.5 w-3.5" />
                    <span className="text-xs">{pump === 1 ? 'Aktif' : 'Standby'}</span>
                  </div>
                </div>
                
                <div className="p-3 bg-slate-800/60 rounded-lg border border-white/5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-white/50">Status Operasi:</span>
                    <span className={`font-medium ${pump === 1 ? 'text-blue-400' : 'text-white/70'}`}>
                      {pump === 1 ? 'Penyiraman Aktif' : 'Tidak Ada Aktivitas'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Tips section toggle */}
          <div className="mt-6">
            <button 
              onClick={() => setShowTips(!showTips)}
              className="w-full bg-gradient-to-br from-slate-700/40 to-slate-800/40 rounded-xl px-4 py-3 border border-white/10 flex items-center gap-3 hover:bg-gradient-to-br hover:from-blue-900/20 hover:to-blue-800/20 transition-all"
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${showTips ? 'bg-blue-500/20' : 'bg-white/10'}`}>
                <Info className="h-4 w-4 text-blue-300" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-white/90 text-left">{showTips ? 'Sembunyikan Tips' : 'Tampilkan Tips'}</h3>
                <p className="text-xs text-white/60 text-left">Panduan penggunaan sistem irigasi</p>
              </div>
              <motion.div
                className="ml-auto"
                animate={{ rotate: showTips ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/60">
                  <path d="m6 9 6 6 6-6"/>
                </svg>
              </motion.div>
            </button>
          </div>
          
          {/* Tips Accordion */}
          <AnimatePresence>
            {showTips && (
              <motion.div 
                className="mt-4"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="bg-gradient-to-br from-blue-900/20 to-blue-800/20 rounded-xl p-5 border border-blue-500/20">
                  <h3 className="font-medium text-blue-300 mb-3 flex items-center">
                    <Zap className="h-4 w-4 mr-2" />
                    <span>Tips Penggunaan Sistem Irigasi</span>
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white/5 rounded-lg p-3">
                      <h4 className="font-medium text-white/90 text-sm mb-2">Mode Otomatis</h4>
                      <p className="text-xs text-white/70 leading-relaxed">
                        Pompa akan aktif saat kelembaban tanah kurang dari ambang batas (30%). Sistem akan memonitor dan mengontrol irigasi secara otomatis tanpa intervensi.
                      </p>
                    </div>
                    
                    <div className="bg-white/5 rounded-lg p-3">
                      <h4 className="font-medium text-white/90 text-sm mb-2">Mode Manual</h4>
                      <p className="text-xs text-white/70 leading-relaxed">
                        Anda dapat mengaktifkan atau menonaktifkan pompa kapan saja. Mode ini berguna untuk pengairan terjadwal atau saat Anda ingin mengendalikan sistem secara langsung.
                      </p>
                    </div>
                    
                    <div className="bg-white/5 rounded-lg p-3">
                      <h4 className="font-medium text-white/90 text-sm mb-2">Waktu Pengairan Optimal</h4>
                      <p className="text-xs text-white/70 leading-relaxed">
                        Waktu irigasi terbaik adalah pagi (06:00-08:00) atau sore hari (16:00-18:00) untuk mengurangi penguapan dan memaksimalkan penyerapan nutrisi.
                      </p>
                    </div>
                    
                    <div className="bg-white/5 rounded-lg p-3">
                      <h4 className="font-medium text-white/90 text-sm mb-2">Peringatan Penting</h4>
                      <p className="text-xs text-white/70 leading-relaxed">
                        Hindari menyalakan pompa terlalu lama untuk mencegah genangan air berlebih yang dapat menyebabkan akar tanaman membusuk dan pemborosan air.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* Status Bar */}
        <div className="px-4 py-2 border-t border-white/10 bg-black/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <motion.div 
              className={`w-2 h-2 rounded-full ${manual ? 'bg-blue-400' : 'bg-emerald-400'}`}
              animate={{ 
                opacity: [0.7, 1, 0.7] 
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            <span className="text-xs text-white/70">
              Status: <span className="font-medium">{manual ? 'Kontrol Manual' : 'Kontrol Otomatis'}</span>
            </span>
          </div>
          
          <div className="text-xs text-white/50">
            Diperbarui: {new Date().toLocaleTimeString().substring(0, 5)}
          </div>
        </div>
        
        {/* Notification Alert */}
        <AnimatePresence>
          {notification && (
            <motion.div 
              className={`fixed bottom-4 right-4 px-4 py-3 rounded-lg ${
                notification === 'success' 
                  ? 'bg-gradient-to-r from-green-600 to-emerald-700' 
                  : 'bg-gradient-to-r from-red-600 to-rose-700'
              } text-white shadow-lg z-20 flex items-center gap-3 min-w-[250px]`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                notification === 'success' ? 'bg-green-500' : 'bg-red-500'
              }`}>
                {notification === 'success' ? <CheckCircle className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
              </div>
              <div>
                <div className="text-sm font-medium">{notification === 'success' ? 'Sukses' : 'Gagal'}</div>
                <div className="text-xs opacity-90">{notificationMessage}</div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}