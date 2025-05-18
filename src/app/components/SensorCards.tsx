"use client";
// Remove unused imports
import { motion } from "framer-motion";
import { 
  Thermometer, 
  Droplets, 
  Sprout, 
  Droplet,
  BadgeCheck,
  AlertTriangle,
  Loader
} from "lucide-react";

type Sensor = {
  temperature: number;
  humidity: number;
  soilMoisture: number;
  pumpStatus: number;
};

export default function SensorCards({ latest }: { latest: Sensor | null }) {
  // Using null checks to determine if data is loading
  const isLoading = !latest;
  
  // Helper functions for determining status and color
  const getTempStatus = (temp: number) => {
    if (temp > 30) return { label: "Terlalu Panas", color: "text-red-400", alert: true, bg: "bg-red-400/10", border: "border-red-400/30" };
    if (temp < 20) return { label: "Terlalu Dingin", color: "text-blue-400", alert: true, bg: "bg-blue-400/10", border: "border-blue-400/30" };
    return { label: "Optimal", color: "text-emerald-400", alert: false, bg: "bg-emerald-400/10", border: "border-emerald-400/30" };
  };
  
  const getHumidityStatus = (humidity: number) => {
    if (humidity > 80) return { label: "Sangat Lembap", color: "text-blue-400", alert: true, bg: "bg-blue-400/10", border: "border-blue-400/30" };
    if (humidity < 40) return { label: "Terlalu Kering", color: "text-amber-400", alert: true, bg: "bg-amber-400/10", border: "border-amber-400/30" };
    return { label: "Optimal", color: "text-emerald-400", alert: false, bg: "bg-emerald-400/10", border: "border-emerald-400/30" };
  };
  
  const getSoilStatus = (soil: number) => {
    if (soil > 80) return { label: "Terlalu Basah", color: "text-blue-400", alert: true, bg: "bg-blue-400/10", border: "border-blue-400/30" };
    if (soil < 30) return { label: "Terlalu Kering", color: "text-amber-400", alert: true, bg: "bg-amber-400/10", border: "border-amber-400/30" };
    return { label: "Optimal", color: "text-emerald-400", alert: false, bg: "bg-emerald-400/10", border: "border-emerald-400/30" };
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {/* Temperature Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        whileHover={{ y: -2 }}
        className="sensor-card-container"
      >
        <div className="glass-card-modern bg-gradient-to-br from-white/30 to-white/10 backdrop-blur-md text-white border border-white/20 shadow-lg transition-all duration-300 h-full relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 w-20 h-20 rounded-full bg-gradient-to-r from-red-500/20 to-orange-500/20 blur-xl"></div>
          <div className="absolute -left-4 -top-4 w-16 h-16 rounded-full bg-gradient-to-l from-red-400/10 to-orange-400/10 blur-xl"></div>
          
          <div className="p-5 relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-red-500/30 to-orange-500/30 backdrop-blur-md border border-white/10 shadow-lg">
                  <Thermometer className="h-5 w-5 text-red-300" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-white/80">Suhu</h3>
                  {isLoading ? (
                    <div className="h-7 w-20 bg-white/10 rounded animate-pulse"></div>
                  ) : (
                    <div className="text-xl font-bold text-white">
                      {latest.temperature} °C
                    </div>
                  )}
                </div>
              </div>
              
              {!isLoading && (
                <div className={`px-2.5 py-1 rounded-lg text-xs font-medium border ${
                  latest.temperature > 30 
                    ? 'bg-red-500/20 text-red-300 border-red-500/30' 
                    : latest.temperature < 20 
                      ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                      : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                }`}>
                  {latest.temperature > 30 
                    ? 'Tinggi' 
                    : latest.temperature < 20 
                      ? 'Rendah'
                      : 'Normal'}
                </div>
              )}
            </div>
            
            {!isLoading && (
              <>
                <div className="mt-3 h-2 w-full bg-white/10 rounded-full overflow-hidden backdrop-blur-md">
                  <motion.div 
                    className={`h-full ${
                      latest.temperature > 30 
                      ? 'bg-gradient-to-r from-orange-400/80 to-red-500/80' 
                      : latest.temperature < 20 
                        ? 'bg-gradient-to-r from-blue-400/80 to-blue-600/80'
                        : 'bg-gradient-to-r from-emerald-400/80 to-emerald-600/80'
                    }`}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(latest.temperature * 2.5, 100)}%` }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                  />
                </div>
                
                <div className="mt-4 flex items-center gap-1.5">
                  {getTempStatus(latest.temperature).alert ? (
                    <AlertTriangle size={14} className={getTempStatus(latest.temperature).color} />
                  ) : (
                    <BadgeCheck size={14} className={getTempStatus(latest.temperature).color} />
                  )}
                  <span className={`text-xs ${getTempStatus(latest.temperature).color}`}>
                    {getTempStatus(latest.temperature).label}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      </motion.div>

      {/* Humidity Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        whileHover={{ y: -2 }}
        className="sensor-card-container"
      >
        <div className="glass-card-modern bg-gradient-to-br from-white/30 to-white/10 backdrop-blur-md text-white border border-white/20 shadow-lg transition-all duration-300 h-full relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 w-20 h-20 rounded-full bg-gradient-to-r from-blue-500/20 to-cyan-500/20 blur-xl"></div>
          <div className="absolute -left-4 -top-4 w-16 h-16 rounded-full bg-gradient-to-l from-blue-400/10 to-cyan-400/10 blur-xl"></div>
          
          <div className="p-5 relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-blue-500/30 to-cyan-500/30 backdrop-blur-md border border-white/10 shadow-lg">
                  <motion.div
                    animate={{ 
                      y: [0, -2, 0] 
                    }}
                    transition={{ 
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <Droplets className="h-5 w-5 text-blue-300" />
                  </motion.div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-white/80">Kelembapan</h3>
                  {isLoading ? (
                    <div className="h-7 w-20 bg-white/10 rounded animate-pulse"></div>
                  ) : (
                    <div className="text-xl font-bold text-white">
                      {latest.humidity} %
                    </div>
                  )}
                </div>
              </div>
              
              {!isLoading && (
                <div className={`px-2.5 py-1 rounded-lg text-xs font-medium border ${
                  latest.humidity > 80 
                    ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' 
                    : latest.humidity < 40 
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                }`}>
                  {latest.humidity > 80 
                    ? 'Tinggi' 
                    : latest.humidity < 40 
                      ? 'Rendah'
                      : 'Normal'}
                </div>
              )}
            </div>
            
            {!isLoading && (
              <>
                <div className="mt-3 h-2 w-full bg-white/10 rounded-full overflow-hidden backdrop-blur-md">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-blue-400/80 to-blue-600/80"
                    initial={{ width: 0 }}
                    animate={{ width: `${latest.humidity}%` }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                  />
                </div>
                
                <div className="mt-4 flex items-center gap-1.5">
                  {getHumidityStatus(latest.humidity).alert ? (
                    <AlertTriangle size={14} className={getHumidityStatus(latest.humidity).color} />
                  ) : (
                    <BadgeCheck size={14} className={getHumidityStatus(latest.humidity).color} />
                  )}
                  <span className={`text-xs ${getHumidityStatus(latest.humidity).color}`}>
                    {getHumidityStatus(latest.humidity).label}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      </motion.div>

      {/* Soil Moisture Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        whileHover={{ y: -2 }}
        className="sensor-card-container"
      >
        <div className="glass-card-modern bg-gradient-to-br from-white/30 to-white/10 backdrop-blur-md text-white border border-white/20 shadow-lg transition-all duration-300 h-full relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 w-20 h-20 rounded-full bg-gradient-to-r from-emerald-500/20 to-green-500/20 blur-xl"></div>
          <div className="absolute -left-4 -top-4 w-16 h-16 rounded-full bg-gradient-to-l from-emerald-400/10 to-green-400/10 blur-xl"></div>
          
          <div className="p-5 relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-emerald-500/30 to-green-500/30 backdrop-blur-md border border-white/10 shadow-lg">
                  <motion.div
                    animate={{ 
                      rotate: [0, 2, 0, -2, 0] 
                    }}
                    transition={{ 
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <Sprout className="h-5 w-5 text-emerald-300" />
                  </motion.div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-white/80">Kelembapan Tanah</h3>
                  {isLoading ? (
                    <div className="h-7 w-20 bg-white/10 rounded animate-pulse"></div>
                  ) : (
                    <div className="text-xl font-bold text-white">
                      {latest.soilMoisture} %
                    </div>
                  )}
                </div>
              </div>
              
              {!isLoading && (
                <div className={`px-2.5 py-1 rounded-lg text-xs font-medium border ${
                  latest.soilMoisture > 80 
                    ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' 
                    : latest.soilMoisture < 30 
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                }`}>
                  {latest.soilMoisture > 80 
                    ? 'Basah' 
                    : latest.soilMoisture < 30 
                      ? 'Kering'
                      : 'Normal'}
                </div>
              )}
            </div>
            
            {!isLoading && (
              <>
                <div className="mt-3 h-2 w-full bg-white/10 rounded-full overflow-hidden backdrop-blur-md">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-emerald-400/80 to-emerald-600/80"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(latest.soilMoisture, 100)}%` }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                  />
                </div>
                
                <div className="mt-4 flex items-center gap-1.5">
                  {getSoilStatus(latest.soilMoisture).alert ? (
                    <AlertTriangle size={14} className={getSoilStatus(latest.soilMoisture).color} />
                  ) : (
                    <BadgeCheck size={14} className={getSoilStatus(latest.soilMoisture).color} />
                  )}
                  <span className={`text-xs ${getSoilStatus(latest.soilMoisture).color}`}>
                    {getSoilStatus(latest.soilMoisture).label}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      </motion.div>

      {/* Pump Status Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        whileHover={{ y: -2 }}
        className="sensor-card-container"
      >
        <div className={`glass-card-modern bg-gradient-to-br from-white/30 to-white/10 backdrop-blur-md text-white border border-white/20 shadow-lg transition-all duration-300 h-full relative overflow-hidden ${
          latest?.pumpStatus === 1 ? 'shadow-green-500/20' : ''
        }`}>
          {/* Decorative elements */}
          {latest?.pumpStatus === 1 ? (
            <div className="absolute inset-0">
              <motion.div 
                className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full bg-gradient-to-r from-emerald-500/20 to-green-500/20 blur-xl"
                animate={{ 
                  scale: [1, 1.1, 1],
                  opacity: [0.3, 0.4, 0.3]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <motion.div 
                className="absolute -left-4 -top-4 w-20 h-20 rounded-full bg-gradient-to-l from-emerald-400/10 to-green-400/10 blur-xl"
                animate={{ 
                  scale: [1, 1.1, 1],
                  opacity: [0.2, 0.3, 0.2]
                }}
                transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
              />
            </div>
          ) : (
            <div className="absolute -right-4 -bottom-4 w-20 h-20 rounded-full bg-gradient-to-r from-gray-500/10 to-slate-500/10 blur-xl"></div>
          )}
          
          <div className="p-5 relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center backdrop-blur-md border border-white/10 shadow-lg ${
                  latest?.pumpStatus === 1 
                    ? 'bg-gradient-to-br from-emerald-500/30 to-green-500/30' 
                    : 'bg-gradient-to-br from-gray-500/30 to-slate-500/30'
                }`}>
                  {isLoading ? (
                    <Loader className="h-5 w-5 text-white/70 animate-spin" />
                  ) : (
                    <Droplet className={`h-5 w-5 ${
                      latest?.pumpStatus === 1 
                        ? 'text-emerald-300' 
                        : 'text-gray-400'
                    }`} />
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-medium text-white/80">Status Pompa</h3>
                  {isLoading ? (
                    <div className="h-7 w-20 bg-white/10 rounded animate-pulse"></div>
                  ) : (
                    <div className="text-xl font-bold text-white">
                      {latest.pumpStatus === 1 ? "Aktif" : "Tidak Aktif"}
                    </div>
                  )}
                </div>
              </div>
              
              {!isLoading && (
                <div className={`px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1 border ${
                  latest.pumpStatus === 1 
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' 
                    : 'bg-gray-500/20 text-gray-300 border-gray-500/20'
                }`}>
                  <motion.span 
                    className={`w-2 h-2 rounded-full ${
                      latest.pumpStatus === 1 ? 'bg-emerald-400' : 'bg-gray-400'
                    }`}
                    animate={{ 
                      opacity: latest.pumpStatus === 1 ? [0.6, 1, 0.6] : 0.7
                    }}
                    transition={{ 
                      duration: 1.5,
                      repeat: latest.pumpStatus === 1 ? Infinity : 0
                    }}
                  ></motion.span>
                  {latest.pumpStatus === 1 ? "ON" : "OFF"}
                </div>
              )}
            </div>
            
            {!isLoading && (
              <div className="mt-3">
                <div className={`rounded-lg p-3 text-xs flex items-center justify-center backdrop-blur-md border ${
                  latest.pumpStatus === 1 
                    ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30' 
                    : 'bg-gray-500/10 text-gray-300 border-gray-500/20'
                }`}>
                  {latest.pumpStatus === 1 
                    ? (
                      <div className="flex items-center gap-2">
                        <motion.div 
                          animate={{ 
                            rotate: 360
                          }}
                          transition={{ 
                            repeat: Infinity, 
                            duration: 3,
                            ease: "linear" 
                          }}
                        >
                          <Droplet size={14} className="text-blue-400" />
                        </motion.div>
                        <span>Pompa sedang menyiram tanaman</span>
                      </div>
                    ) 
                    : "Pompa dalam keadaan tidak aktif"}
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}