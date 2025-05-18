"use client";
import { motion } from "framer-motion";
import { 
  Thermometer, 
  Droplets, 
  Sprout, 
  Droplet, // Ganti PumpWater dengan Droplet (atau icon lain yang tersedia)
  Loader
} from "lucide-react";

type Sensor = {
  temperature: number;
  humidity: number;
  soilMoisture: number;
  pumpStatus: number;
};

export default function SensorCards({ latest }: { latest: Sensor | null }) {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { 
      y: 0, 
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 260,
        damping: 20
      }
    }
  };

  // Using null checks to determine if data is loading
  const isLoading = !latest;

  return (
    <motion.div 
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
      variants={container}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={item}>
        <div className="stat-card group">
          <div className="stat-card-inner">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-500 mb-1">Suhu</div>
                {isLoading ? (
                  <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
                ) : (
                  <div className="text-2xl font-bold text-gray-900">
                    {latest.temperature} °C
                  </div>
                )}
              </div>
              <div className="bg-garden-100 p-3 rounded-xl">
                <motion.div
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Thermometer className="h-6 w-6 text-garden-600" />
                </motion.div>
              </div>
            </div>
            {!isLoading && (
              <div className="mt-3 h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-gradient-to-r from-blue-300 to-red-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(latest.temperature * 2, 100)}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </div>
            )}
          </div>
        </div>
      </motion.div>

      <motion.div variants={item}>
        <div className="stat-card group">
          <div className="stat-card-inner">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-500 mb-1">Kelembapan</div>
                {isLoading ? (
                  <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
                ) : (
                  <div className="text-2xl font-bold text-gray-900">
                    {latest.humidity} %
                  </div>
                )}
              </div>
              <div className="bg-blue-100 p-3 rounded-xl">
                <motion.div
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  animate={{ 
                    y: [0, -5, 0],
                  }}
                  transition={{ 
                    repeat: Infinity, 
                    duration: 2,
                  }}
                >
                  <Droplets className="h-6 w-6 text-blue-600" />
                </motion.div>
              </div>
            </div>
            {!isLoading && (
              <div className="mt-3 h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-gradient-to-r from-blue-200 to-blue-600"
                  initial={{ width: 0 }}
                  animate={{ width: `${latest.humidity}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </div>
            )}
          </div>
        </div>
      </motion.div>

      <motion.div variants={item}>
        <div className="stat-card group">
          <div className="stat-card-inner">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-500 mb-1">Kelembapan Tanah</div>
                {isLoading ? (
                  <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
                ) : (
                  <div className="text-2xl font-bold text-gray-900">
                    {latest.soilMoisture}
                  </div>
                )}
              </div>
              <div className="bg-garden-100 p-3 rounded-xl">
                <motion.div
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  animate={{ rotate: [0, 2, 0, -2, 0] }}
                  transition={{ 
                    repeat: Infinity, 
                    duration: 5,
                    ease: "easeInOut"
                  }}
                >
                  <Sprout className="h-6 w-6 text-garden-600" />
                </motion.div>
              </div>
            </div>
            {!isLoading && (
              <div className="mt-3 h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-gradient-to-r from-garden-200 to-garden-600"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(latest.soilMoisture, 100)}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </div>
            )}
          </div>
        </div>
      </motion.div>

      <motion.div variants={item}>
        <div className={`stat-card ${latest?.pumpStatus === 1 ? 'shadow-[0_0_15px_rgba(34,197,94,0.3)]' : ''} group`}>
          <div className="stat-card-inner">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-500 mb-1">Status Pompa</div>
                {isLoading ? (
                  <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
                ) : (
                  <div className="text-2xl font-bold text-gray-900">
                    {latest.pumpStatus === 1 ? "Aktif" : "Tidak Aktif"}
                  </div>
                )}
              </div>
              <div className={`${
                latest?.pumpStatus === 1 
                  ? 'bg-garden-100 text-garden-600 ripple-container' 
                  : 'bg-gray-100 text-gray-400'
              } p-3 rounded-xl relative overflow-hidden`}>
                {isLoading ? (
                  <Loader className="h-6 w-6 animate-spin" />
                ) : (
                  <motion.div
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    animate={
                      latest?.pumpStatus === 1 
                        ? { 
                            scale: [1, 1.05, 1],
                          }
                        : {}
                    }
                    transition={{ 
                      repeat: latest?.pumpStatus === 1 ? Infinity : 0, 
                      duration: 1
                    }}
                  >
                    <Droplet className="h-6 w-6" />
                  </motion.div>
                )}
              </div>
            </div>
            <div className="mt-3">
              {isLoading ? (
                <div className="h-6 w-16 bg-gray-200 rounded animate-pulse"></div>
              ) : (
                <span className={`status-badge ${latest.pumpStatus === 1 ? "on" : "off"}`}>
                  {latest.pumpStatus === 1 ? "ON" : "OFF"}
                </span>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}