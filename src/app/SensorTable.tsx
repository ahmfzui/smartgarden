"use client";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, Calendar, RefreshCw, Search, SlidersHorizontal, Filter, Check } from "lucide-react";

type Sensor = {
  temperature: number;
  humidity: number;
  soilMoisture: number;
  pumpStatus: number;
  timestamp: string;
  _id?: string;
};

export default function SensorTable({ data }: { data: Sensor[] }) {
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Sensor;
    direction: 'ascending' | 'descending';
  } | null>(null);
  
  const [showAmount, setShowAmount] = useState(5);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'high-temp' | 'low-soil' | 'pump-on'>('all');
  
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
      
      // Reduce intensity for very subtle effect
      const rotateX = (y - centerY) / 30 * -1;
      const rotateY = (x - centerX) / 30;
      
      // Fix: Menggunakan type assertion untuk HTMLElement
      (card as HTMLElement).style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.005, 1.005, 1.005)`;
      
      // Show glare effect
      const glare = card.querySelector('.card-glare');
      if (glare) {
        const percentX = x / rect.width;
        const percentY = y / rect.height;
        // Fix: Menggunakan type assertion untuk HTMLElement
        (glare as HTMLElement).style.background = `radial-gradient(circle at ${percentX * 100}% ${percentY * 100}%, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0) 70%)`;
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

  const handleSort = (key: keyof Sensor) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    
    if (sortConfig && sortConfig.key === key) {
      direction = sortConfig.direction === 'ascending' ? 'descending' : 'ascending';
    }
    
    setSortConfig({ key, direction });
  };
  
  const handleRefresh = () => {
    setIsRefreshing(true);
    // Simulate refresh delay
    setTimeout(() => setIsRefreshing(false), 600);
  };
  
  // Filter data based on search term and selected filter
  const filteredData = data.filter(row => {
    // Handle search term
    if (searchTerm) {
      const date = new Date(row.timestamp).toLocaleDateString();
      const time = new Date(row.timestamp).toLocaleTimeString();
      const dateTimeString = `${date} ${time}`;
      
      if (!dateTimeString.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
    }
    
    // Handle filter selection
    switch (selectedFilter) {
      case 'high-temp':
        return row.temperature > 30;
      case 'low-soil':
        return row.soilMoisture < 30;
      case 'pump-on':
        return row.pumpStatus === 1;
      default:
        return true;
    }
  });
  
  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortConfig) return 0;
    
    const key = sortConfig.key;
    
    if (key === 'timestamp') {
      return sortConfig.direction === 'ascending' 
        ? new Date(a[key]).getTime() - new Date(b[key]).getTime()
        : new Date(b[key]).getTime() - new Date(a[key]).getTime();
    }
    
    // Fix untuk TypeScript error - pastikan nilai selalu ada
    const aValue = a[key] !== undefined ? a[key] : 0;
    const bValue = b[key] !== undefined ? b[key] : 0;
    
    if (aValue < bValue) {
      return sortConfig.direction === 'ascending' ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortConfig.direction === 'ascending' ? 1 : -1;
    }
    return 0;
  });

  const visibleData = sortedData.slice(0, showAmount);

  return (
    <motion.div 
      className="glass-card mb-6 overflow-hidden card-3d"
      ref={cardRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <div className="card-glare absolute inset-0 pointer-events-none"></div>
      
      {/* Decorative elements */}
      <motion.div 
        className="absolute -top-20 -right-20 w-40 h-40 bg-garden-100/20 rounded-full blur-xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.2, 0.1],
        }}
        transition={{
          repeat: Infinity,
          duration: 10,
          ease: "easeInOut"
        }}
      />
      
      <motion.div 
        className="absolute -bottom-20 -left-20 w-40 h-40 bg-garden-200/20 rounded-full blur-xl"
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.1, 0.15, 0.1],
        }}
        transition={{
          repeat: Infinity,
          duration: 12,
          delay: 2,
          ease: "easeInOut"
        }}
      />
      
      <div className="p-4 bg-white/40 backdrop-blur-sm flex justify-between items-center border-b border-garden-200/50">
        <h2 className="text-lg font-semibold text-garden-800 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-garden-600" />
          Riwayat Data Sensor
        </h2>
        
        <div className="flex items-center gap-3">
          <motion.div 
            className="relative"
            animate={showFilters ? { width: "220px" } : { width: "32px" }}
            transition={{ duration: 0.3 }}
          >
            <motion.button 
              className={`p-2 rounded-full ${showFilters ? "bg-garden-100 text-garden-600" : "text-garden-600 hover:bg-garden-50"}`}
              onClick={() => setShowFilters(!showFilters)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              animate={showFilters ? { rotate: 180 } : { rotate: 0 }}
              transition={{ duration: 0.3 }}
            >
              <SlidersHorizontal className="h-4 w-4" />
            </motion.button>
            
            <AnimatePresence>
              {showFilters && (
                <motion.div 
                  className="absolute inset-y-0 left-0 ml-10 flex items-center gap-2"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <button 
                    className={`px-2 py-1 text-xs rounded-full flex items-center gap-1 ${selectedFilter === 'all' ? 'bg-garden-500 text-white' : 'bg-garden-50 text-garden-600 hover:bg-garden-100'}`}
                    onClick={() => setSelectedFilter('all')}
                  >
                    {selectedFilter === 'all' && <Check size={10} />}
                    Semua
                  </button>
                  <button 
                    className={`px-2 py-1 text-xs rounded-full flex items-center gap-1 ${selectedFilter === 'high-temp' ? 'bg-red-500 text-white' : 'bg-red-50 text-red-600 hover:bg-red-100'}`}
                    onClick={() => setSelectedFilter('high-temp')}
                  >
                    {selectedFilter === 'high-temp' && <Check size={10} />}
                    Suhu Tinggi
                  </button>
                  <button 
                    className={`px-2 py-1 text-xs rounded-full flex items-center gap-1 ${selectedFilter === 'low-soil' ? 'bg-amber-500 text-white' : 'bg-amber-50 text-amber-600 hover:bg-amber-100'}`}
                    onClick={() => setSelectedFilter('low-soil')}
                  >
                    {selectedFilter === 'low-soil' && <Check size={10} />}
                    Tanah Kering
                  </button>
                  <button 
                    className={`px-2 py-1 text-xs rounded-full flex items-center gap-1 ${selectedFilter === 'pump-on' ? 'bg-garden-500 text-white' : 'bg-garden-50 text-garden-600 hover:bg-garden-100'}`}
                    onClick={() => setSelectedFilter('pump-on')}
                  >
                    {selectedFilter === 'pump-on' && <Check size={10} />}
                    Pompa Aktif
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
          
          <div className="relative">
            <input
              type="text"
              placeholder="Cari berdasarkan tanggal..."
              className="pl-8 pr-3 py-1.5 text-sm rounded-lg bg-white/70 border border-garden-200/50 focus:outline-none focus:ring-2 focus:ring-garden-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="h-3.5 w-3.5 text-garden-500 absolute left-2.5 top-1/2 transform -translate-y-1/2" />
          </div>
          
          <motion.button 
            className="text-garden-600 hover:text-garden-700 flex items-center gap-1 bg-white/70 p-1.5 rounded-lg border border-garden-200/50"
            onClick={handleRefresh}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="text-sm">Refresh</span>
          </motion.button>
        </div>
      </div>
      
      <div className="overflow-x-auto backdrop-blur-sm bg-white/30">
        <table className="w-full">
          <thead>
            <tr className="bg-gradient-to-r from-garden-600 to-garden-700 text-white">
              <th 
                className="px-4 py-3 text-left cursor-pointer transition-colors hover:bg-garden-700"
                onClick={() => handleSort('timestamp')}
              >
                <div className="flex items-center gap-1">
                  Waktu
                  {sortConfig?.key === 'timestamp' && (
                    sortConfig.direction === 'ascending' 
                      ? <ChevronUp className="h-4 w-4" /> 
                      : <ChevronDown className="h-4 w-4" />
                  )}
                </div>
              </th>
              <th 
                className="px-4 py-3 text-left cursor-pointer transition-colors hover:bg-garden-700"
                onClick={() => handleSort('temperature')}
              >
                <div className="flex items-center gap-1">
                  Suhu (°C)
                  {sortConfig?.key === 'temperature' && (
                    sortConfig.direction === 'ascending' 
                      ? <ChevronUp className="h-4 w-4" /> 
                      : <ChevronDown className="h-4 w-4" />
                  )}
                </div>
              </th>
              <th 
                className="px-4 py-3 text-left cursor-pointer transition-colors hover:bg-garden-700"
                onClick={() => handleSort('humidity')}
              >
                <div className="flex items-center gap-1">
                  Kelembapan (%)
                  {sortConfig?.key === 'humidity' && (
                    sortConfig.direction === 'ascending' 
                      ? <ChevronUp className="h-4 w-4" /> 
                      : <ChevronDown className="h-4 w-4" />
                  )}
                </div>
              </th>
              <th 
                className="px-4 py-3 text-left cursor-pointer transition-colors hover:bg-garden-700"
                onClick={() => handleSort('soilMoisture')}
              >
                <div className="flex items-center gap-1">
                  Tanah
                  {sortConfig?.key === 'soilMoisture' && (
                    sortConfig.direction === 'ascending' 
                      ? <ChevronUp className="h-4 w-4" /> 
                      : <ChevronDown className="h-4 w-4" />
                  )}
                </div>
              </th>
              <th 
                className="px-4 py-3 text-left cursor-pointer transition-colors hover:bg-garden-700"
                onClick={() => handleSort('pumpStatus')}
              >
                <div className="flex items-center gap-1">
                  Pompa
                  {sortConfig?.key === 'pumpStatus' && (
                    sortConfig.direction === 'ascending' 
                      ? <ChevronUp className="h-4 w-4" /> 
                      : <ChevronDown className="h-4 w-4" />
                  )}
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {visibleData.length > 0 ? (
                visibleData.map((row, i) => (
                  <motion.tr 
                    key={row._id ?? i}
                    className="table-row backdrop-blur-sm border-b border-garden-100/30 hover:bg-garden-50/50 transition-colors duration-150"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2, delay: i * 0.05 }}
                    whileHover={{ backgroundColor: "rgba(220, 241, 220, 0.3)" }}
                  >
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {new Date(row.timestamp).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className={
                        row.temperature > 30 
                          ? 'text-red-600 font-medium' 
                          : row.temperature < 20 
                            ? 'text-blue-600 font-medium'
                            : 'text-garden-600 font-medium'
                      }>
                        {row.temperature}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={
                        row.humidity > 80 
                          ? 'text-blue-600 font-medium' 
                          : row.humidity < 40 
                            ? 'text-amber-600 font-medium'
                            : 'text-garden-600 font-medium'
                      }>
                        {row.humidity}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={
                        row.soilMoisture > 80 
                          ? 'text-blue-600 font-medium' 
                          : row.soilMoisture < 30 
                            ? 'text-amber-600 font-medium'
                            : 'text-garden-600 font-medium'
                      }>
                        {row.soilMoisture}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`status-badge ${row.pumpStatus === 1 ? "on" : "off"}`}>
                        {row.pumpStatus === 1 ? "ON" : "OFF"}
                      </span>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <motion.tr
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                    {searchTerm || selectedFilter !== 'all' ? 
                      "Tidak ada data yang sesuai dengan filter" : 
                      "Tidak ada data sensor tersedia"}
                  </td>
                </motion.tr>
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
      
      {filteredData.length > showAmount && (
        <div className="p-3 border-t border-garden-100/30 bg-garden-50/50 text-center backdrop-blur-sm">
          <motion.button 
            onClick={() => setShowAmount(prev => Math.min(prev + 5, filteredData.length))}
            className="text-garden-600 hover:text-garden-800 font-medium text-sm"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="flex items-center justify-center gap-1">
              <span>Tampilkan {Math.min(5, filteredData.length - showAmount)} Data Lainnya</span>
              <ChevronDown className="h-4 w-4" />
            </div>
          </motion.button>
        </div>
      )}
    </motion.div>
  );
}