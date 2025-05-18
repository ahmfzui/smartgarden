"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Droplet, Settings, Power } from "lucide-react"; // Ganti PumpWater dengan Droplet

// Definisi komponen Switch sederhana karena komponen asli bermasalah dengan TypeScript
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
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-garden-600 focus:ring-offset-2 ${
        checked ? 'bg-garden-600' : 'bg-gray-200'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      onClick={() => onChange(!checked)}
    >
      <span
        className={`${
          checked ? 'translate-x-6' : 'translate-x-1'
        } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
      />
    </button>
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
      className="flex flex-col sm:flex-row items-center justify-center gap-6 rounded-2xl bg-white p-6 shadow-lg transition-all duration-300 hover:shadow-xl mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
        <div className="flex items-center gap-2 text-gray-700">
          <Settings className="w-5 h-5" />
          <span className="font-medium">Mode Kontrol:</span>
        </div>

        <div className="flex items-center gap-2">
          <span className={`text-sm ${!manual ? 'text-garden-600 font-medium' : 'text-gray-500'}`}>
            Otomatis
          </span>
          <Switch 
            checked={manual} 
            onChange={(checked) => handleModeChange(checked)} 
            disabled={loading} 
          />
          <span className={`text-sm ${manual ? 'text-garden-600 font-medium' : 'text-gray-500'}`}>
            Manual
          </span>
        </div>
      </div>

      <div className="mt-4 sm:mt-0 sm:ml-8 flex items-center gap-4">
        <motion.button
          className={`relative overflow-hidden flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
            !manual || loading
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : pump === 1
              ? "bg-garden-600 text-white hover:bg-garden-700"
              : "bg-white text-garden-700 border-2 border-garden-600 hover:bg-garden-50"
          }`}
          onClick={handlePumpToggle}
          disabled={!manual || loading}
          whileHover={!manual || loading ? {} : { scale: 1.03 }}
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
              )}
            </>
          )}
        </motion.button>

        <div className="flex items-center">
          <div
            className={`relative flex h-11 w-11 items-center justify-center rounded-full ${
              pump === 1
                ? "bg-garden-100 text-garden-600"
                : "bg-gray-100 text-gray-400"
            }`}
          >
            <Droplet className="h-6 w-6" />
            {pump === 1 && (
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
            )}
          </div>
          <span
            className={`ml-2 text-sm font-medium ${
              pump === 1 ? "text-garden-600" : "text-gray-500"
            }`}
          >
            {pump === 1 ? "ON" : "OFF"}
          </span>
        </div>
      </div>
    </motion.div>
  );
}