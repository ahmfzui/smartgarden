"use client";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronDown, 
  ChevronUp, 
  Search, 
  Download, 
  Filter,
  CheckCircle2,
  X,
  Clock,
  Calendar,
  FileText
} from "lucide-react";

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
  }>({ key: 'timestamp', direction: 'descending' });
  
  const [showAmount, setShowAmount] = useState(5);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'high-temp' | 'low-soil' | 'pump-on'>('all');
  
  const tableRef = useRef<HTMLDivElement>(null);
  
  // Handle sort
  const handleSort = (key: keyof Sensor) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    
    if (sortConfig.key === key) {
      direction = sortConfig.direction === 'ascending' ? 'descending' : 'ascending';
    }
    
    setSortConfig({ key, direction });
  };
  
  // Filter data based on search query and selected filter
  const filteredData = data.filter(row => {
    // Handle search query - filter based on date/time
    if (searchQuery) {
      const date = new Date(row.timestamp).toLocaleDateString();
      const time = new Date(row.timestamp).toLocaleTimeString();
      const dateTimeString = `${date} ${time}`;
      
      if (!dateTimeString.toLowerCase().includes(searchQuery.toLowerCase())) {
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
  
  // Sort data
  const sortedData = [...filteredData].sort((a, b) => {
    const key = sortConfig.key;
    
    if (key === 'timestamp') {
      return sortConfig.direction === 'ascending' 
        ? new Date(a[key]).getTime() - new Date(b[key]).getTime()
        : new Date(b[key]).getTime() - new Date(a[key]).getTime();
    }
    
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
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }),
      time: date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    };
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-full bg-gradient-to-r from-emerald-500/30 to-green-600/30 backdrop-blur-md">
            <Calendar className="h-5 w-5 text-white" />
          </div>
          <h2 className="text-lg font-medium text-white">Riwayat Data Sensor</h2>
        </div>
        
        <motion.button 
          className="glass-button-sm flex items-center gap-1.5 bg-white/10 text-white border border-white/20 hover:bg-white/20"
          whileHover={{ y: -1 }}
          whileTap={{ y: 0 }}
        >
          <FileText className="h-3.5 w-3.5" />
          <span>Export CSV</span>
        </motion.button>
      </div>
      
      <div 
        className="glass-card-modern bg-gradient-to-br from-white/30 to-white/10 backdrop-blur-lg text-white border border-white/20 shadow-lg transition-all duration-300 relative overflow-hidden"
        ref={tableRef}
      >
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-gradient-to-r from-purple-500/20 to-fuchsia-500/20 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-60 h-60 rounded-full bg-gradient-to-r from-cyan-500/10 to-blue-500/10 blur-3xl"></div>
        
        {/* Search and filters */}
        <div className="p-3 border-b border-white/10 bg-white/5 flex flex-wrap gap-2 items-center justify-between relative z-10">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <div className="flex items-center bg-white/10 rounded-lg px-2 py-1.5 border border-white/20">
                <Search className="h-3.5 w-3.5 text-white/70 mr-1.5" />
                <input 
                  type="text"
                  placeholder="Cari tanggal..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="outline-none text-sm bg-transparent w-full text-white placeholder:text-white/50"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="text-white/50 hover:text-white/80"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
            
            <div className="relative">
              <motion.button 
                className={`p-1.5 rounded-lg flex items-center gap-1.5 text-xs font-medium border ${
                  selectedFilter !== 'all' 
                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" 
                    : "bg-white/10 text-white border-white/20 hover:bg-white/20"
                }`}
                onClick={() => setShowFilters(!showFilters)}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <Filter className="h-3.5 w-3.5" />
                <span>Filter</span>
                <motion.span
                  animate={showFilters ? { rotate: 180 } : { rotate: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="h-3.5 w-3.5" />
                </motion.span>
              </motion.button>
              
              <AnimatePresence>
                {showFilters && (
                  <motion.div 
                    className="absolute z-10 mt-1 left-0 bg-black/70 backdrop-blur-md shadow-lg rounded-lg p-2 border border-white/20 w-44"
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <button 
                      className={`w-full px-3 py-1.5 text-left text-sm rounded-md mb-1 flex items-center gap-2 ${
                        selectedFilter === 'all' 
                          ? 'bg-emerald-500/20 text-emerald-300 font-medium' 
                          : 'hover:bg-white/10 text-white/70'
                      }`}
                      onClick={() => {
                        setSelectedFilter('all');
                        setShowFilters(false);
                      }}
                    >
                      {selectedFilter === 'all' && <CheckCircle2 size={14} />}
                      <span>Semua Data</span>
                    </button>
                    <button 
                      className={`w-full px-3 py-1.5 text-left text-sm rounded-md mb-1 flex items-center gap-2 ${
                        selectedFilter === 'high-temp' 
                          ? 'bg-red-500/20 text-red-300 font-medium' 
                          : 'hover:bg-white/10 text-white/70'
                      }`}
                      onClick={() => {
                        setSelectedFilter('high-temp');
                        setShowFilters(false);
                      }}
                    >
                      {selectedFilter === 'high-temp' && <CheckCircle2 size={14} className="text-red-300" />}
                      <span>Suhu Tinggi (30°C)</span>
                    </button>
                    <button 
                      className={`w-full px-3 py-1.5 text-left text-sm rounded-md mb-1 flex items-center gap-2 ${
                        selectedFilter === 'low-soil' 
                          ? 'bg-amber-500/20 text-amber-300 font-medium' 
                          : 'hover:bg-white/10 text-white/70'
                      }`}
                      onClick={() => {
                        setSelectedFilter('low-soil');
                        setShowFilters(false);
                      }}
                    >
                      {selectedFilter === 'low-soil' && <CheckCircle2 size={14} className="text-amber-300" />}
                      <span>Tanah Kering (30%)</span>
                    </button>
                    <button 
                      className={`w-full px-3 py-1.5 text-left text-sm rounded-md flex items-center gap-2 ${
                        selectedFilter === 'pump-on' 
                          ? 'bg-emerald-500/20 text-emerald-300 font-medium' 
                          : 'hover:bg-white/10 text-white/70'
                      }`}
                      onClick={() => {
                        setSelectedFilter('pump-on');
                        setShowFilters(false);
                      }}
                    >
                      {selectedFilter === 'pump-on' && <CheckCircle2 size={14} />}
                      <span>Pompa Aktif</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {selectedFilter !== 'all' && (
              <div className="px-2 py-1 bg-emerald-500/10 rounded-lg text-xs text-emerald-300 flex items-center gap-1.5 border border-emerald-500/30">
                <span>Filter:</span>
                <span className="font-medium">
                  {selectedFilter === 'high-temp' ? 'Suhu Tinggi' : 
                   selectedFilter === 'low-soil' ? 'Tanah Kering' : 
                   'Pompa Aktif'}
                </span>
                <button 
                  className="ml-1 text-emerald-300 hover:text-white"
                  onClick={() => setSelectedFilter('all')}
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>
          
          <div className="text-xs text-white/60">
            {filteredData.length} data ditemukan
          </div>
        </div>
        
        {/* Table */}
        <div className="overflow-x-auto relative z-10">
          <table className="w-full">
            <thead>
              <tr>
                <th 
                  className="px-4 py-2.5 text-left cursor-pointer"
                  onClick={() => handleSort('timestamp')}
                  style={{
                    background: "linear-gradient(to right, rgba(16, 185, 129, 0.7), rgba(5, 150, 105, 0.7))"
                  }}
                >
                  <div className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    <span>Waktu</span>
                    {sortConfig.key === 'timestamp' && (
                      sortConfig.direction === 'ascending' 
                        ? <ChevronUp className="h-3.5 w-3.5" /> 
                        : <ChevronDown className="h-3.5 w-3.5" />
                    )}
                  </div>
                </th>
                <th 
                  className="px-4 py-2.5 text-left cursor-pointer"
                  onClick={() => handleSort('temperature')}
                  style={{
                    background: "linear-gradient(to right, rgba(16, 185, 129, 0.7), rgba(5, 150, 105, 0.7))"
                  }}
                >
                  <div className="flex items-center gap-1">
                    <span>Suhu (°C)</span>
                    {sortConfig.key === 'temperature' && (
                      sortConfig.direction === 'ascending' 
                        ? <ChevronUp className="h-3.5 w-3.5" /> 
                        : <ChevronDown className="h-3.5 w-3.5" />
                    )}
                  </div>
                </th>
                <th 
                  className="px-4 py-2.5 text-left cursor-pointer"
                  onClick={() => handleSort('humidity')}
                  style={{
                    background: "linear-gradient(to right, rgba(16, 185, 129, 0.7), rgba(5, 150, 105, 0.7))"
                  }}
                >
                  <div className="flex items-center gap-1">
                    <span>Kelembapan (%)</span>
                    {sortConfig.key === 'humidity' && (
                      sortConfig.direction === 'ascending' 
                        ? <ChevronUp className="h-3.5 w-3.5" /> 
                        : <ChevronDown className="h-3.5 w-3.5" />
                    )}
                  </div>
                </th>
                <th 
                  className="px-4 py-2.5 text-left cursor-pointer"
                  onClick={() => handleSort('soilMoisture')}
                  style={{
                    background: "linear-gradient(to right, rgba(16, 185, 129, 0.7), rgba(5, 150, 105, 0.7))"
                  }}
                >
                  <div className="flex items-center gap-1">
                    <span>Tanah (%)</span>
                    {sortConfig.key === 'soilMoisture' && (
                      sortConfig.direction === 'ascending' 
                        ? <ChevronUp className="h-3.5 w-3.5" /> 
                        : <ChevronDown className="h-3.5 w-3.5" />
                    )}
                  </div>
                </th>
                <th 
                  className="px-4 py-2.5 text-left cursor-pointer"
                  onClick={() => handleSort('pumpStatus')}
                  style={{
                    background: "linear-gradient(to right, rgba(16, 185, 129, 0.7), rgba(5, 150, 105, 0.7))"
                  }}
                >
                  <div className="flex items-center gap-1">
                    <span>Pompa</span>
                    {sortConfig.key === 'pumpStatus' && (
                      sortConfig.direction === 'ascending' 
                        ? <ChevronUp className="h-3.5 w-3.5" /> 
                        : <ChevronDown className="h-3.5 w-3.5" />
                    )}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {visibleData.length > 0 ? (
                  visibleData.map((row, i) => {
                    const formattedDate = formatDate(row.timestamp);
                    
                    return (
                      <motion.tr 
                        key={row._id ?? i}
                        className="border-b border-white/10 hover:bg-white/5 transition-colors"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.2, delay: i * 0.03 }}
                      >
                        <td className="px-4 py-3">
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-white">{formattedDate.time}</span>
                            <span className="text-xs text-white/60">{formattedDate.date}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className={`inline-flex items-center justify-center min-w-[40px] px-2 py-1 rounded-md text-sm font-medium border ${
                            row.temperature > 30 
                              ? 'bg-red-500/20 text-red-300 border-red-500/30' 
                              : row.temperature < 20 
                                ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                                : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          }`}>
                            {row.temperature}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className={`inline-flex items-center justify-center min-w-[40px] px-2 py-1 rounded-md text-sm font-medium border ${
                            row.humidity > 80 
                              ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' 
                              : row.humidity < 40 
                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                                : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          }`}>
                            {row.humidity}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className={`inline-flex items-center justify-center min-w-[40px] px-2 py-1 rounded-md text-sm font-medium border ${
                            row.soilMoisture > 80 
                              ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' 
                              : row.soilMoisture < 30 
                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                                : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          }`}>
                            {row.soilMoisture}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className={`inline-flex items-center justify-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${
                            row.pumpStatus === 1 
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' 
                              : 'bg-gray-500/20 text-gray-300 border-gray-500/20'
                          }`}>
                            <div className={`w-2 h-2 rounded-full ${
                              row.pumpStatus === 1 ? 'bg-emerald-400' : 'bg-gray-400'
                            }`}></div>
                            {row.pumpStatus === 1 ? "ON" : "OFF"}
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-white/50">
                      {searchQuery || selectedFilter !== 'all' ? 
                        "Tidak ada data yang sesuai dengan filter" : 
                        "Tidak ada data sensor tersedia"}
                    </td>
                  </tr>
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
        
        {/* Load more */}
        {filteredData.length > showAmount && (
          <div className="p-3 border-t border-white/10 bg-white/5 text-center relative z-10">
            <motion.button 
              onClick={() => setShowAmount(prev => Math.min(prev + 5, filteredData.length))}
              className="text-emerald-300 hover:text-white text-sm font-medium flex items-center justify-center gap-1 mx-auto"
              whileHover={{ y: -1 }}
              whileTap={{ y: 0 }}
            >
              <ChevronDown className="h-4 w-4" />
              <span>Tampilkan {Math.min(5, filteredData.length - showAmount)} Data Lainnya</span>
            </motion.button>
          </div>
        )}
      </div>
    </div>
  );
}