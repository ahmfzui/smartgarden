"use client";
import { motion } from "framer-motion";
import { 
  Thermometer, 
  Droplets, 
  Sprout, 
  Droplet,
  BadgeCheck,
  AlertTriangle,
  Loader,
  GaugeCircle,
  Clock
} from "lucide-react";

type Sensor = {
  temperature: number;
  humidity: number;
  soilMoisture: number;
  pumpStatus: number;
  timestamp?: string;
};

export default function SensorCards({ latest }: { latest: Sensor | null }) {
  // Using null checks to determine if data is loading
  const isLoading = !latest;
  
  // Helper functions for determining status and color
  const getTempStatus = (temp: number) => {
    if (temp > 30) return { label: "Terlalu Panas", color: "text-red-400", alert: true, badge: "Tinggi", bg: "bg-red-500/20", border: "border-red-500/30", badgeBg: "bg-red-500/20", badgeText: "text-red-300", badgeBorder: "border-red-500/30" };
    if (temp < 20) return { label: "Terlalu Dingin", color: "text-blue-400", alert: true, badge: "Rendah", bg: "bg-blue-500/20", border: "border-blue-500/30", badgeBg: "bg-blue-500/20", badgeText: "text-blue-300", badgeBorder: "border-blue-500/30" };
    return { label: "Optimal", color: "text-emerald-400", alert: false, badge: "Normal", bg: "bg-emerald-500/20", border: "border-emerald-500/30", badgeBg: "bg-emerald-500/20", badgeText: "text-emerald-300", badgeBorder: "border-emerald-500/30" };
  };
  
  const getHumidityStatus = (humidity: number) => {
    if (humidity > 80) return { label: "Sangat Lembap", color: "text-blue-400", alert: true, badge: "Tinggi", bg: "bg-blue-500/20", border: "border-blue-500/30", badgeBg: "bg-blue-500/20", badgeText: "text-blue-300", badgeBorder: "border-blue-500/30" };
    if (humidity < 40) return { label: "Terlalu Kering", color: "text-amber-400", alert: true, badge: "Rendah", bg: "bg-amber-500/20", border: "border-amber-500/30", badgeBg: "bg-amber-500/20", badgeText: "text-amber-300", badgeBorder: "border-amber-500/30" };
    return { label: "Optimal", color: "text-emerald-400", alert: false, badge: "Normal", bg: "bg-emerald-500/20", border: "border-emerald-500/30", badgeBg: "bg-emerald-500/20", badgeText: "text-emerald-300", badgeBorder: "border-emerald-500/30" };
  };
  
  // Modified soil status to account for analog sensor values
  const getSoilStatus = (soil: number) => {
    if (soil < 1000) return { label: "Sangat Basah", color: "text-blue-400", alert: true, badge: "Basah", bg: "bg-blue-500/20", border: "border-blue-500/30", badgeBg: "bg-blue-500/20", badgeText: "text-blue-300", badgeBorder: "border-blue-500/30" };
    if (soil >= 1000 && soil < 2000) return { label: "Optimal", color: "text-emerald-400", alert: false, badge: "Normal", bg: "bg-emerald-500/20", border: "border-emerald-500/30", badgeBg: "bg-emerald-500/20", badgeText: "text-emerald-300", badgeBorder: "border-emerald-500/30" };
    if (soil >= 2000) return { label: "Kering", color: "text-amber-400", alert: true, badge: "Kering", bg: "bg-amber-500/20", border: "border-amber-500/30", badgeBg: "bg-amber-500/20", badgeText: "text-amber-300", badgeBorder: "border-amber-500/30" };
    return { label: "Tidak Diketahui", color: "text-gray-400", alert: true, badge: "Error", bg: "bg-gray-500/20", border: "border-gray-500/30", badgeBg: "bg-gray-500/20", badgeText: "text-gray-300", badgeBorder: "border-gray-500/30" };
  };
  
  // Convert soil moisture to percentage display (inverse relationship)
  const getSoilPercentage = (soil: number) => {
    // Min = 0 (wet), Max = 4095 (dry) for analog sensor
    // Inverse mapping: Higher values mean drier soil
    return Math.max(0, Math.min(100, Math.round(100 - (soil / 4095) * 100)));
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {/* Temperature Card */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="sensor-card-container"
      >
        <div className="p-0 rounded-3xl relative overflow-hidden bg-gradient-to-br from-slate-800/60 to-slate-900/60 border border-white/10 shadow-lg h-full">
          {/* Header Bar */}
          <div className="bg-gradient-to-r from-red-900/60 via-orange-800/60 to-amber-900/60 px-4 py-3 border-b border-white/10">
            <h3 className="font-bold text-white flex items-center gap-2">
              <Thermometer className="h-4 w-4 text-orange-300" />
              <span>Suhu Udara</span>
            </h3>
          </div>
          
          <div className="p-4">
            <div className="flex flex-col">
              {isLoading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="flex items-center justify-center h-16 w-16 rounded-full bg-slate-800/60">
                    <Loader className="h-6 w-6 text-white/60 animate-spin" />
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-center mb-3">
                    <div className="text-3xl font-bold text-white flex items-end">
                      {latest.temperature}
                      <span className="text-lg text-white/70 ml-1">°C</span>
                    </div>
                    
                    <div className={`px-2.5 py-1 rounded-lg text-xs font-medium border ${getTempStatus(latest.temperature).badgeBg} ${getTempStatus(latest.temperature).badgeText} ${getTempStatus(latest.temperature).badgeBorder}`}>
                      {getTempStatus(latest.temperature).badge}
                    </div>
                  </div>
                  
                  <div className="space-y-2 mt-2">
                    <div className="flex justify-between text-xs text-white/70">
                      <span>Dingin</span>
                      <span>Optimal</span>
                      <span>Panas</span>
                    </div>
                    
                    <div className="h-2.5 w-full bg-gradient-to-r from-blue-500/30 via-emerald-500/30 to-red-500/30 rounded-full relative">
                      <motion.div 
                        className="absolute top-0 w-3.5 h-3.5 rounded-full bg-white border-2 border-white/80 shadow-lg"
                        style={{ 
                          left: `calc(${Math.min(Math.max((latest.temperature - 10) * 3, 0), 100)}% - 7px)`,
                          top: '-2px' 
                        }}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.4 }}
                      />
                    </div>
                    
                    {/* Status indicator */}
                    <div className="flex items-center gap-1.5 mt-1">
                      {getTempStatus(latest.temperature).alert ? (
                        <AlertTriangle size={14} className={getTempStatus(latest.temperature).color} />
                      ) : (
                        <BadgeCheck size={14} className={getTempStatus(latest.temperature).color} />
                      )}
                      <span className={`text-xs ${getTempStatus(latest.temperature).color} font-medium`}>
                        {getTempStatus(latest.temperature).label}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-3 bg-gradient-to-br from-slate-700/30 to-slate-700/20 rounded-lg p-3 border border-white/5">
                    <div className="flex items-center gap-2">
                      <GaugeCircle className="h-4 w-4 text-orange-300/70" />
                      <span className="text-xs text-white/80">
                        {latest.temperature > 30 
                          ? 'Pertimbangkan untuk menambah peneduh atau ventilasi' 
                          : latest.temperature < 20 
                            ? 'Suhu rendah bisa memperlambat pertumbuhan'
                            : 'Suhu ideal untuk pertumbuhan tanaman'}
                      </span>
                    </div>
                  </div>
                  
                  {/* Tambahan status di bawah untuk memaksimalkan ruang */}
                  <div className="mt-3 flex justify-between items-center pt-2 border-t border-white/10">
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-white/50" />
                      <span className="text-xs text-white/50">
                        {new Date().toLocaleTimeString('id-ID', { 
                          hour: '2-digit', 
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    
                    <div className="px-2 py-0.5 rounded-full bg-white/10 text-white/60 text-[10px]">
                      Pembaruan Terakhir
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Humidity Card */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="sensor-card-container"
      >
        <div className="p-0 rounded-3xl relative overflow-hidden bg-gradient-to-br from-slate-800/60 to-slate-900/60 border border-white/10 shadow-lg h-full">
          {/* Header Bar */}
          <div className="bg-gradient-to-r from-blue-900/60 via-cyan-800/60 to-indigo-900/60 px-4 py-3 border-b border-white/10">
            <h3 className="font-bold text-white flex items-center gap-2">
              <Droplets className="h-4 w-4 text-blue-300" />
              <span>Kelembapan Udara</span>
            </h3>
          </div>
          
          <div className="p-4">
            <div className="flex flex-col">
              {isLoading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="flex items-center justify-center h-16 w-16 rounded-full bg-slate-800/60">
                    <Loader className="h-6 w-6 text-white/60 animate-spin" />
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-center mb-3">
                    <div className="text-3xl font-bold text-white flex items-end">
                      {latest.humidity}
                      <span className="text-lg text-white/70 ml-1">%</span>
                    </div>
                    
                    <div className={`px-2.5 py-1 rounded-lg text-xs font-medium border ${getHumidityStatus(latest.humidity).badgeBg} ${getHumidityStatus(latest.humidity).badgeText} ${getHumidityStatus(latest.humidity).badgeBorder}`}>
                      {getHumidityStatus(latest.humidity).badge}
                    </div>
                  </div>
                  
                  <div className="space-y-2 mt-2">
                    <div className="flex justify-between text-xs text-white/70">
                      <span>Kering</span>
                      <span>Optimal</span>
                      <span>Lembap</span>
                    </div>
                    
                    <div className="h-2.5 w-full bg-gradient-to-r from-amber-500/30 via-emerald-500/30 to-blue-500/30 rounded-full relative">
                      <motion.div 
                        className="absolute top-0 w-3.5 h-3.5 rounded-full bg-white border-2 border-white/80 shadow-lg"
                        style={{ 
                          left: `calc(${latest.humidity}% - 7px)`,
                          top: '-2px'
                        }}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.4 }}
                      />
                    </div>
                    
                    {/* Status indicator */}
                    <div className="flex items-center gap-1.5 mt-1">
                      {getHumidityStatus(latest.humidity).alert ? (
                        <AlertTriangle size={14} className={getHumidityStatus(latest.humidity).color} />
                      ) : (
                        <BadgeCheck size={14} className={getHumidityStatus(latest.humidity).color} />
                      )}
                      <span className={`text-xs ${getHumidityStatus(latest.humidity).color} font-medium`}>
                        {getHumidityStatus(latest.humidity).label}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-3 bg-gradient-to-br from-slate-700/30 to-slate-700/20 rounded-lg p-3 border border-white/5">
                    <div className="flex items-center gap-2">
                      <GaugeCircle className="h-4 w-4 text-blue-300/70" />
                      <span className="text-xs text-white/80">
                        {latest.humidity > 80 
                          ? 'Kelembapan tinggi dapat memicu munculnya jamur' 
                          : latest.humidity < 40 
                            ? 'Kelembapan rendah bisa menyebabkan dehidrasi'
                            : 'Kelembapan ideal untuk pertumbuhan tanaman'}
                      </span>
                    </div>
                  </div>
                  
                  {/* Tambahan status di bawah untuk memaksimalkan ruang */}
                  <div className="mt-3 flex justify-between items-center pt-2 border-t border-white/10">
                    <div className="flex items-center gap-1.5">
                      <motion.div
                        animate={{ 
                          y: [0, -2, 0] 
                        }}
                        transition={{ 
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      >
                        <Droplets className="h-3.5 w-3.5 text-blue-400/70" />
                      </motion.div>
                      <span className="text-xs text-blue-400/70">
                        {latest.humidity > 70 ? 'Udara sangat lembap' : 
                         latest.humidity < 40 ? 'Udara cukup kering' : 'Kelembapan seimbang'}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Soil Moisture Card - Updated for Analog Sensor (higher values = drier) */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="sensor-card-container"
      >
        <div className="p-0 rounded-3xl relative overflow-hidden bg-gradient-to-br from-slate-800/60 to-slate-900/60 border border-white/10 shadow-lg h-full">
          {/* Header Bar */}
          <div className="bg-gradient-to-r from-emerald-900/60 via-green-800/60 to-teal-900/60 px-4 py-3 border-b border-white/10">
            <h3 className="font-bold text-white flex items-center gap-2">
              <Sprout className="h-4 w-4 text-emerald-300" />
              <span>Kelembapan Tanah</span>
            </h3>
          </div>
          
          <div className="p-4">
            <div className="flex flex-col">
              {isLoading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="flex items-center justify-center h-16 w-16 rounded-full bg-slate-800/60">
                    <Loader className="h-6 w-6 text-white/60 animate-spin" />
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-center mb-3">
                    <div className="text-3xl font-bold text-white flex items-end gap-3">
                      <span>{latest.soilMoisture}</span>
                      <div className="flex flex-col items-start">
                        <span className="text-xs text-emerald-400/70">~{getSoilPercentage(latest.soilMoisture)}%</span>
                        <span className="text-[10px] text-white/50">Nilai Analog</span>
                      </div>
                    </div>
                    
                    <div className={`px-2.5 py-1 rounded-lg text-xs font-medium border ${getSoilStatus(latest.soilMoisture).badgeBg} ${getSoilStatus(latest.soilMoisture).badgeText} ${getSoilStatus(latest.soilMoisture).badgeBorder}`}>
                      {getSoilStatus(latest.soilMoisture).badge}
                    </div>
                  </div>
                  
                  <div className="space-y-2 mt-2">
                    <div className="flex justify-between text-xs text-white/70">
                      <span>Basah</span>
                      <span>Optimal</span>
                      <span>Kering</span>
                    </div>
                    
                    <div className="h-2.5 w-full bg-gradient-to-r from-blue-500/30 via-emerald-500/30 to-amber-500/30 rounded-full relative">
                      <motion.div 
                        className="absolute top-0 w-3.5 h-3.5 rounded-full bg-white border-2 border-white/80 shadow-lg"
                        style={{ 
                          // 0-4095 range mapped to 0-100%
                          left: `calc(${Math.min(latest.soilMoisture / 4095 * 100, 100)}% - 7px)`,
                          top: '-2px'
                        }}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.4 }}
                      />
                    </div>
                    
                    {/* Status indicator */}
                    <div className="flex items-center gap-1.5 mt-1">
                      {getSoilStatus(latest.soilMoisture).alert ? (
                        <AlertTriangle size={14} className={getSoilStatus(latest.soilMoisture).color} />
                      ) : (
                        <BadgeCheck size={14} className={getSoilStatus(latest.soilMoisture).color} />
                      )}
                      <span className={`text-xs ${getSoilStatus(latest.soilMoisture).color} font-medium`}>
                        {getSoilStatus(latest.soilMoisture).label}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-3 bg-gradient-to-br from-slate-700/30 to-slate-700/20 rounded-lg p-3 border border-white/5">
                    <div className="flex items-center gap-2">
                      <GaugeCircle className="h-4 w-4 text-emerald-300/70" />
                      <span className="text-xs text-white/80">
                        {latest.soilMoisture < 1000
                          ? 'Tanah terlalu basah, kurangi penyiraman' 
                          : latest.soilMoisture >= 2000
                            ? 'Tanah terlalu kering, tanaman membutuhkan air'
                            : 'Kelembapan tanah ideal untuk pertumbuhan'}
                      </span>
                    </div>
                  </div>
                  
                  {/* Tambahan status di bawah untuk memaksimalkan ruang */}
                  <div className="mt-3 flex justify-between items-center pt-2 border-t border-white/10">
                    <div className="flex items-center gap-1.5">
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
                        <Sprout className="h-3.5 w-3.5 text-emerald-400/70" />
                      </motion.div>
                      
                      <div className="flex items-center">
                        <span className="text-xs text-emerald-400/70 mr-1.5">Kualitas:</span>
                        <div className="flex">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <div 
                              key={i} 
                              className={`w-1 h-4 mx-0.5 rounded-sm ${
                                latest.soilMoisture < 1000 ? (i < 3 ? 'bg-emerald-500/70' : 'bg-white/10') :
                                latest.soilMoisture >= 2000 ? (i < 2 ? 'bg-emerald-500/70' : 'bg-white/10') : 
                                (i < 5 ? 'bg-emerald-500/70' : 'bg-white/10')
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Pump Status Card */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="sensor-card-container"
      >
        <div className="p-0 rounded-3xl relative overflow-hidden bg-gradient-to-br from-slate-800/60 to-slate-900/60 border border-white/10 shadow-lg h-full">
          {/* Header Bar */}
          <div className="bg-gradient-to-r from-cyan-900/60 via-blue-800/60 to-indigo-900/60 px-4 py-3 border-b border-white/10">
            <h3 className="font-bold text-white flex items-center gap-2">
              <Droplet className="h-4 w-4 text-cyan-300" />
              <span>Status Pompa</span>
            </h3>
          </div>
          
          <div className="p-4">
            <div className="flex flex-col">
              {isLoading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="flex items-center justify-center h-16 w-16 rounded-full bg-slate-800/60">
                    <Loader className="h-6 w-6 text-white/60 animate-spin" />
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-center mb-4">
                    <div className="text-2xl font-bold text-white">
                      {latest.pumpStatus === 1 ? "Aktif" : "Nonaktif"}
                    </div>
                    
                    <div className={`px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 border ${
                      latest.pumpStatus === 1 
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' 
                        : 'bg-gray-500/20 text-gray-300 border-gray-500/20'
                    }`}>
                      <motion.div 
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
                      />
                      {latest.pumpStatus === 1 ? "ON" : "OFF"}
                    </div>
                  </div>
                  
                  {/* Pump indicator - more centralized and bigger */}
                  <div className="flex justify-center py-2">
                    <div className="relative">
                      {latest.pumpStatus === 1 && (
                        <>
                          <motion.div
                            className="absolute -inset-4 rounded-full bg-blue-500/10 blur-md"
                            animate={{ 
                              scale: [1, 1.2, 1],
                              opacity: [0.3, 0.6, 0.3]
                            }}
                            transition={{ duration: 2, repeat: Infinity }}
                          />
                          <motion.div
                            className="absolute -inset-2 rounded-full bg-blue-500/5 blur-sm"
                            animate={{ 
                              scale: [1, 1.15, 1],
                              opacity: [0.2, 0.4, 0.2]
                            }}
                            transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
                          />
                        </>
                      )}
                      
                      <div className={`relative w-28 h-28 rounded-full flex items-center justify-center border-2 ${
                        latest.pumpStatus === 1 
                          ? 'border-blue-500/50 bg-blue-900/30' 
                          : 'border-slate-600/30 bg-slate-800/40'
                      }`}>
                        {latest.pumpStatus === 1 && (
                          <motion.div 
                            className="absolute inset-0 rounded-full"
                            animate={{ 
                              boxShadow: ['0 0 0 rgba(59, 130, 246, 0)', '0 0 25px rgba(59, 130, 246, 0.4)', '0 0 0 rgba(59, 130, 246, 0)']
                            }}
                            transition={{ 
                              duration: 2,
                              repeat: Infinity,
                              ease: "easeInOut"
                            }}
                          />
                        )}
                        
                        <motion.div
                          animate={latest.pumpStatus === 1 ? {
                            y: [0, -2, 0, -2, 0],
                            scale: [1, 1.05, 1, 1.05, 1]
                          } : {}}
                          transition={{ 
                            duration: latest.pumpStatus === 1 ? 2 : 0,
                            repeat: latest.pumpStatus === 1 ? Infinity : 0,
                            ease: "easeInOut"
                          }}
                        >
                          <Droplet className={`h-14 w-14 ${
                            latest.pumpStatus === 1 ? 'text-blue-400' : 'text-slate-500/50'
                          }`} />
                        </motion.div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-3 bg-gradient-to-br from-slate-700/30 to-slate-700/20 rounded-lg p-3 border border-white/5">
                    <div className="flex items-center gap-2">
                      <div className={`h-3 w-3 rounded-full ${
                        latest.pumpStatus === 1 ? 'bg-emerald-500' : 'bg-slate-500'
                      }`} />
                      <span className="text-xs text-white/80">
                        {latest.pumpStatus === 1 
                          ? 'Pompa sedang menyiram tanaman'
                          : 'Tidak ada aktivitas penyiraman'}
                      </span>
                    </div>
                  </div>
                  
                  {/* Tambahan detail untuk memaksimalkan ruang */}
                  <div className="mt-3 flex flex-col gap-2 pt-2 border-t border-white/10">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-white/40" />
                        <span className="text-[10px] text-white/40">Waktu Operasi</span>
                      </div>
                      <span className="text-xs font-medium text-white/70">
                        {latest.timestamp ? new Date(latest.timestamp).toLocaleTimeString('id-ID', {hour: '2-digit', minute: '2-digit'}) : '--:--'}
                      </span>
                    </div>
                    
                    <div className="bg-white/5 rounded-md px-3 py-1.5 flex items-center justify-between">
                      <span className="text-xs text-white/70">Status:</span>
                      <span className={`text-xs font-medium ${latest.pumpStatus === 1 ? 'text-emerald-400' : 'text-white/60'}`}>
                        {latest.pumpStatus === 1 ? 'Sistem Aktif' : 'Standby'}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}