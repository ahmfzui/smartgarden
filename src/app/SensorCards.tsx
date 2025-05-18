"use client";
import { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Thermometer, 
  Droplets, 
  Sprout, 
  Droplet,
  Loader,
  Wind
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
  
  // Fix: Ubah tipe ref menjadi HTMLDivElement
  const cardRefs = [
    useRef<HTMLDivElement>(null), 
    useRef<HTMLDivElement>(null), 
    useRef<HTMLDivElement>(null), 
    useRef<HTMLDivElement>(null)
  ];

  // 3D card effect on mouse move
  useEffect(() => {
    const cards = cardRefs.map(ref => ref.current);
    
    const handleMouseMove = (e: MouseEvent, card: HTMLDivElement | null, index: number) => {
      if (!card) return;
      
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const rotateX = (y - centerY) / 10 * -1;
      const rotateY = (x - centerX) / 10;
      
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
      
      // Show glare effect
      const glare = card.querySelector('.card-glare');
      if (glare) {
        const percentX = x / rect.width;
        const percentY = y / rect.height;
        (glare as HTMLElement).style.background = `radial-gradient(circle at ${percentX * 100}% ${percentY * 100}%, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0) 70%)`;
      }
    };
    
    const handleMouseLeave = (card: HTMLDivElement | null) => {
      if (!card) return;
      card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
      
      const glare = card.querySelector('.card-glare');
      if (glare) {
        (glare as HTMLElement).style.background = 'none';
      }
    };
    
    cards.forEach((card, index) => {
      if (card) {
        card.addEventListener('mousemove', (e: MouseEvent) => handleMouseMove(e, card, index));
        card.addEventListener('mouseleave', () => handleMouseLeave(card));
      }
    });
    
    return () => {
      cards.forEach((card) => {
        if (card) {
          card.removeEventListener('mousemove', (e: MouseEvent) => handleMouseMove(e, card, 0));
          card.removeEventListener('mouseleave', () => handleMouseLeave(card));
        }
      });
    };
  }, [latest]);

  return (
    <motion.div 
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
      variants={container}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={item}>
        <div className="glass-card group" ref={cardRefs[0]}>
          <div className="card-glare absolute inset-0 pointer-events-none"></div>
          <div className="stat-card-inner p-6">
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
              <div className="bg-gradient-to-br from-garden-50 to-garden-100 p-3 rounded-xl shadow-md">
                <motion.div
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  animate={{ 
                    rotateZ: [0, 2, 0, -2, 0] 
                  }}
                  transition={{ 
                    repeat: Infinity, 
                    duration: 5,
                    ease: "easeInOut"
                  }}
                >
                  <Thermometer className="h-6 w-6 text-garden-600" />
                </motion.div>
              </div>
            </div>
            
            {!isLoading && (
              <>
                <div className="mt-5 h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-blue-300 to-red-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(latest.temperature * 2, 100)}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </div>
                
                <div className="mt-3 flex justify-between text-xs text-gray-500">
                  <span>Dingin</span>
                  <span>Normal</span>
                  <span>Panas</span>
                </div>
                
                <div className="mt-4">
                  <motion.div 
                    className="flex items-center gap-2 text-xs font-medium"
                    animate={{
                      color: latest.temperature > 30 
                        ? ["#ff6b6b", "#ef4444"] 
                        : latest.temperature < 20 
                          ? ["#60a5fa", "#3b82f6"] 
                          : ["#10b981", "#059669"]
                    }}
                    transition={{ duration: 1, repeat: Infinity, repeatType: "reverse" }}
                  >
                    <span>Status:</span>
                    <span>{
                      latest.temperature > 30 
                        ? "Terlalu Panas" 
                        : latest.temperature < 20 
                          ? "Terlalu Dingin" 
                          : "Optimal"
                    }</span>
                  </motion.div>
                </div>
                
                {/* Background decoration */}
                <motion.div 
                  className="absolute bottom-0 right-0 -z-10 opacity-20"
                  animate={{ rotate: [0, 10, 0] }}
                  transition={{ duration: 10, repeat: Infinity }}
                >
                  <Thermometer className="h-24 w-24 text-red-400" />
                </motion.div>
              </>
            )}
          </div>
        </div>
      </motion.div>

      <motion.div variants={item}>
        <div className="glass-card group" ref={cardRefs[1]}>
          <div className="card-glare absolute inset-0 pointer-events-none"></div>
          <div className="stat-card-inner p-6">
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
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 rounded-xl shadow-md">
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
              <>
                <div className="mt-5 h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-blue-200 to-blue-600"
                    initial={{ width: 0 }}
                    animate={{ width: `${latest.humidity}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </div>
                
                <div className="mt-3 flex justify-between text-xs text-gray-500">
                  <span>Kering</span>
                  <span>Normal</span>
                  <span>Lembap</span>
                </div>
                
                <div className="mt-4">
                  <motion.div 
                    className="flex items-center gap-2 text-xs font-medium"
                    animate={{
                      color: latest.humidity > 80 
                        ? ["#60a5fa", "#3b82f6"] 
                        : latest.humidity < 40 
                          ? ["#f59e0b", "#d97706"] 
                          : ["#10b981", "#059669"]
                    }}
                    transition={{ duration: 1, repeat: Infinity, repeatType: "reverse" }}
                  >
                    <span>Status:</span>
                    <span>{
                      latest.humidity > 80 
                        ? "Sangat Lembap" 
                        : latest.humidity < 40 
                          ? "Terlalu Kering" 
                          : "Optimal"
                    }</span>
                  </motion.div>
                </div>
                
                {/* Water drop animations */}
                <div className="absolute right-6 bottom-6 h-16 w-8 opacity-20 pointer-events-none">
                  <motion.div 
                    className="water-drop"
                    style={{ left: '0px', animationDelay: '0s' }}
                  />
                  <motion.div 
                    className="water-drop"
                    style={{ left: '5px', animationDelay: '0.5s' }}
                  />
                  <motion.div 
                    className="water-drop"
                    style={{ left: '2px', animationDelay: '1s' }}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </motion.div>

      <motion.div variants={item}>
        <div className="glass-card group" ref={cardRefs[2]}>
          <div className="card-glare absolute inset-0 pointer-events-none"></div>
          <div className="stat-card-inner p-6">
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
              <div className="bg-gradient-to-br from-garden-50 to-garden-100 p-3 rounded-xl shadow-md">
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
              <>
                <div className="mt-5 h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-garden-200 to-garden-600"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(latest.soilMoisture, 100)}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </div>
                
                <div className="mt-3 flex justify-between text-xs text-gray-500">
                  <span>Kering</span>
                  <span>Normal</span>
                  <span>Basah</span>
                </div>
                
                <div className="mt-4">
                  <motion.div 
                    className="flex items-center gap-2 text-xs font-medium"
                    animate={{
                      color: latest.soilMoisture > 80 
                        ? ["#60a5fa", "#3b82f6"] 
                        : latest.soilMoisture < 30 
                          ? ["#f59e0b", "#d97706"] 
                          : ["#10b981", "#059669"]
                    }}
                    transition={{ duration: 1, repeat: Infinity, repeatType: "reverse" }}
                  >
                    <span>Status:</span>
                    <span>{
                      latest.soilMoisture > 80 
                        ? "Terlalu Basah" 
                        : latest.soilMoisture < 30 
                          ? "Terlalu Kering" 
                          : "Optimal"
                    }</span>
                  </motion.div>
                </div>
                
                {/* Background decoration */}
                <motion.div 
                  className="absolute bottom-2 right-4 -z-10 opacity-20"
                  animate={{ 
                    rotate: [0, 3, 0, -3, 0],
                    scale: [1, 1.05, 1],
                  }}
                  transition={{ duration: 10, repeat: Infinity }}
                >
                  <Sprout className="h-16 w-16 text-garden-600" />
                </motion.div>
              </>
            )}
          </div>
        </div>
      </motion.div>

      <motion.div variants={item}>
        <div className={`glass-card group ${latest?.pumpStatus === 1 ? 'glow-border shadow-[0_0_15px_rgba(34,197,94,0.3)]' : ''}`} ref={cardRefs[3]}>
          <div className="card-glare absolute inset-0 pointer-events-none"></div>
          <div className="stat-card-inner p-6">
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
                  ? 'bg-gradient-to-br from-garden-100 to-garden-200 text-garden-600 ripple-container' 
                  : 'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-400'
              } p-3 rounded-xl relative overflow-hidden shadow-md`}>
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
            
            {!isLoading && (
              <>
                <div className="mt-5">
                  <span className={`status-badge ${latest.pumpStatus === 1 ? "on" : "off"}`}>
                    {latest.pumpStatus === 1 ? "ON" : "OFF"}
                  </span>
                  
                  {latest.pumpStatus === 1 && (
                    <motion.div 
                      className="mt-2 text-xs text-garden-600 flex items-center gap-1"
                      animate={{ opacity: [0.7, 1, 0.7] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Wind size={12} />
                      <span>Sistem penyiraman sedang aktif</span>
                    </motion.div>
                  )}
                </div>
                
                {/* Water animations when pump is on */}
                {latest.pumpStatus === 1 && (
                  <div className="mt-5 relative h-20 overflow-hidden rounded-xl">
                    <motion.div 
                      className="absolute inset-0 bg-gradient-to-b from-blue-100 to-blue-300 opacity-20"
                      animate={{ 
                        y: ["-100%", "0%"] 
                      }}
                      transition={{ 
                        repeat: Infinity, 
                        duration: 2,
                        ease: "easeInOut",
                        repeatType: "mirror"
                      }}
                    />
                    <motion.div 
                      className="absolute bottom-0 left-0 right-0 h-5 bg-gradient-to-r from-blue-400/40 to-blue-300/40 rounded-t-full"
                      animate={{ 
                        y: [5, -5, 5],
                        scaleX: [1, 1.05, 1] 
                      }}
                      transition={{ 
                        repeat: Infinity, 
                        duration: 2,
                        ease: "easeInOut"
                      }}
                    />
                    <motion.div
                      className="absolute top-0 left-0 w-full h-full"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      {[...Array(10)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="absolute bg-white rounded-full"
                          style={{
                            width: Math.random() * 6 + 2 + 'px',
                            height: Math.random() * 6 + 2 + 'px',
                            left: Math.random() * 100 + '%',
                            top: Math.random() * 100 + '%',
                            opacity: Math.random() * 0.3 + 0.1,
                          }}
                          animate={{
                            y: [0, 10, 0],
                            opacity: [0.1, 0.3, 0.1],
                          }}
                          transition={{
                            repeat: Infinity,
                            duration: 1 + Math.random() * 2,
                            delay: Math.random() * 2,
                          }}
                        />
                      ))}
                    </motion.div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}