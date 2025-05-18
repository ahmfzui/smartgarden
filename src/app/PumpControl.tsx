"use client";
import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Droplet, Settings, Power, Clock, ToggleLeft, ToggleRight } from "lucide-react";

// Definisi komponen Switch dengan animasi
const Switch = ({ 
  checked, 
  onChange, 
  disabled 
}: { 
  checked: boolean; 
  onChange: (checked: boolean) => void; 
  disabled?: boolean 
}) => {
  return (
    <motion.button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-garden-600 focus:ring-offset-2 ${
        checked ? 'bg-garden-600' : 'bg-gray-200'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      onClick={() => onChange(!checked)}
      whileHover={!disabled ? { scale: 1.05 } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
    >
      <motion.span
        className="inline-block h-4 w-4 transform rounded-full bg-white shadow-lg"
        layout
        transition={{ 
          type: "spring", 
          stiffness: 500, 
          damping: 30
        }}
        animate={{
          x: checked ? 20 : 2,
        }}
      />
    </motion.button>
  );
};

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
  
  // Reference for 3D card effect
  const cardRef = useRef<HTMLDivElement>(null);

  // 3D card effect on mouse move
  useEffect(() => {
    const card = cardRef.current;
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!card) return;
      
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      // Reduce intensity for subtle effect
      const rotateX = (y - centerY) / 20 * -1;
      const rotateY = (x - centerX) / 20;
      
      // Fix: Menggunakan type assertion untuk HTMLElement
      (card as HTMLElement).style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.01, 1.01, 1.01)`;
      
      // Show glare effect
      const glare = card.querySelector('.card-glare');
      if (glare) {
        const percentX = x / rect.width;
        const percentY = y / rect.height;
        // Fix: Menggunakan type assertion untuk HTMLElement
        (glare as HTMLElement).style.background = `radial-gradient(circle at ${percentX * 100}% ${percentY * 100}%, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0) 70%)`;
      }
    };
    
    const handleMouseLeave = () => {
      if (!card) return;
      // Fix: Menggunakan type assertion untuk HTMLElement
      (card as HTMLElement).style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
      
      const glare = card.querySelector('.card-glare');
      if (glare) {
        // Fix: Menggunakan type assertion untuk HTMLElement
        (glare as HTMLElement).style.background = 'none';
      }
    };
    
    if (card) {
      card.addEventListener('mousemove', handleMouseMove);
      card.addEventListener('mouseleave', handleMouseLeave);
    }
    
    return () => {
      if (card) {
        card.removeEventListener('mousemove', handleMouseMove);
        card.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, []);

  const handleModeChange = async (checked: boolean) => {
    setManual(checked);
    await updatePump(pump, checked);
  };

  const handlePumpToggle = async () => {
    const newPump = pump === 1 ? 0 : 1;
    setPump(newPump);
    await updatePump(newPump, manual);
  };

  async function updatePump(pumpVal: number, manualVal: boolean) {
    setLoading(true);
    await fetch("/api/pump-control", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pumpStatus: pumpVal, manual: manualVal }),
    });
    setLoading(false);
    if (onSuccess) onSuccess();
  }

  return (
    <motion.div
      className="glass-card relative overflow-hidden card-3d mb-8"
      ref={cardRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="card-glare absolute inset-0 pointer-events-none"></div>
      
      {/* Decorative circles */}
      <motion.div 
        className="absolute -right-20 -top-20 w-40 h-40 bg-garden-500/10 rounded-full blur-xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.2, 0.3, 0.2]
        }}
        transition={{
          repeat: Infinity,
          duration: 8,
          ease: "easeInOut"
        }}
      />
      
      <motion.div 
        className="absolute -left-20 -bottom-20 w-40 h-40 bg-garden-400/10 rounded-full blur-xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.2, 0.3, 0.2]
        }}
        transition={{
          repeat: Infinity,
          duration: 8,
          delay: 2,
          ease: "easeInOut"
        }}
      />
      
      <div className="p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10">
        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-8">
          <div className="flex items-center gap-3 mb-4 sm:mb-0">
            <div className="bg-garden-100/50 p-3 rounded-full shadow-sm">
              <Settings className="w-6 h-6 text-garden-600" />
            </div>
            <div className="text-lg font-medium text-garden-800">Kontrol Pompa Air</div>
          </div>
  
          <div className="flex items-center gap-6">
            <div className="flex flex-col items-center gap-1">
              <div className="flex items-center gap-2">
                <motion.div
                  animate={!manual ? {
                    scale: [1, 1.1, 1],
                    opacity: [0.8, 1, 0.8]
                  } : {}}
                  transition={{
                    repeat: !manual ? Infinity : 0,
                    duration: 2
                  }}
                >
                  <Clock className={`w-5 h-5 ${!manual ? 'text-garden-600' : 'text-gray-400'}`} />
                </motion.div>
                <span className={`text-sm ${!manual ? 'text-garden-600 font-medium' : 'text-gray-500'}`}>
                  Otomatis
                </span>
              </div>
              {!manual && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-xs text-garden-500"
                >
                  Aktif
                </motion.div>
              )}
            </div>
            
            <div className="relative">
              <Switch 
                checked={manual} 
                onChange={(checked) => handleModeChange(checked)} 
                disabled={loading} 
              />
              
              <motion.div
                className="absolute -top-1 left-0 w-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                {manual ? (
                  <motion.div 
                    className="absolute right-0 text-garden-600"
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: -16, opacity: 1 }}
                    exit={{ y: 10, opacity: 0 }}
                  >
                    <ToggleRight size={14} />
                  </motion.div>
                ) : (
                  <motion.div 
                    className="absolute left-0 text-garden-600"
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: -16, opacity: 1 }}
                    exit={{ y: 10, opacity: 0 }}
                  >
                    <ToggleLeft size={14} />
                  </motion.div>
                )}
              </motion.div>
            </div>
            
            <div className="flex flex-col items-center gap-1">
              <div className="flex items-center gap-2">
                <motion.div
                  animate={manual ? {
                    scale: [1, 1.1, 1],
                    opacity: [0.8, 1, 0.8]
                  } : {}}
                  transition={{
                    repeat: manual ? Infinity : 0,
                    duration: 2
                  }}
                >
                  <Power className={`w-5 h-5 ${manual ? 'text-garden-600' : 'text-gray-400'}`} />
                </motion.div>
                <span className={`text-sm ${manual ? 'text-garden-600 font-medium' : 'text-gray-500'}`}>
                  Manual
                </span>
              </div>
              {manual && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-xs text-garden-500"
                >
                  Aktif
                </motion.div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <motion.button
            className={`relative overflow-hidden flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
              !manual || loading
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : pump === 1
                ? "bg-gradient-to-br from-garden-500 to-garden-600 text-white hover:shadow-lg hover:shadow-garden-500/20"
                : "bg-white text-garden-700 border-2 border-garden-600 hover:bg-garden-50"
            }`}
            onClick={handlePumpToggle}
            disabled={!manual || loading}
            whileHover={!manual || loading ? {} : { scale: 1.03, y: -2 }}
            whileTap={!manual || loading ? {} : { scale: 0.97 }}
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-t-transparent border-garden-600" />
            ) : (
              <>
                <Power className="w-5 h-5" />
                <span>{pump === 1 ? "Matikan Pompa" : "Nyalakan Pompa"}</span>
                
                {/* Animated water effect for on state */}
                {pump === 1 && (
                  <>
                    <motion.div 
                      className="absolute inset-0 bg-blue-400/20"
                      initial={{ y: "100%" }}
                      animate={{ y: ["100%", "-100%"] }}
                      transition={{ 
                        repeat: Infinity, 
                        duration: 2,
                        ease: "linear"
                      }}
                    />
                    
                    <motion.div 
                      className="absolute inset-0 bg-blue-300/10"
                      initial={{ y: "100%" }}
                      animate={{ y: ["150%", "-50%"] }}
                      transition={{ 
                        repeat: Infinity, 
                        duration: 2.5,
                        ease: "linear",
                        delay: 0.3
                      }}
                    />
                  </>
                )}
              </>
            )}
          </motion.button>

          <div className="flex items-center">
            <div
              className={`relative flex h-14 w-14 items-center justify-center rounded-full ${
                pump === 1
                  ? "bg-gradient-to-br from-garden-100 to-garden-200 text-garden-600"
                  : "bg-gradient-to-br from-gray-100 to-gray-200 text-gray-400"
              } shadow-md`}
            >
              <Droplet className="h-7 w-7" />
              {pump === 1 && (
                <>
                  <motion.div
                    className="absolute inset-0 rounded-full border-2 border-garden-400"
                    initial={{ opacity: 1, scale: 1 }}
                    animate={{ opacity: 0, scale: 1.6 }}
                    transition={{
                      repeat: Infinity,
                      duration: 1.5,
                      ease: "easeOut",
                    }}
                  />
                  <motion.div
                    className="absolute inset-0 rounded-full border-2 border-garden-400"
                    initial={{ opacity: 1, scale: 1 }}
                    animate={{ opacity: 0, scale: 1.8 }}
                    transition={{
                      repeat: Infinity,
                      duration: 1.8,
                      ease: "easeOut",
                      delay: 0.3
                    }}
                  />
                </>
              )}
            </div>
            <div className="ml-2">
              <span
                className={`text-sm font-semibold ${
                  pump === 1 ? "text-garden-600" : "text-gray-500"
                }`}
              >
                {pump === 1 ? "AKTIF" : "NONAKTIF"}
              </span>
              
              {pump === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="text-xs text-garden-500 mt-1"
                >
                  Penyiraman berjalan
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}