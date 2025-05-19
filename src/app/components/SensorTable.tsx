"use client";
import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronDown, 
  ChevronUp, 
  Search, 
  Filter,
  CheckCircle2,
  X,
  Clock,
  Calendar,
  FileText,
  Download,
  Thermometer,
  Droplets,
  Sprout,
  Droplet,
  GaugeCircle,
  ArrowUpDown
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
  const [exporting, setExporting] = useState(false);
  
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
    
    // Convert analog soil moisture to percentage for filtering
    const soilMoisturePercent = Math.max(0, Math.min(100, Math.round(100 - (row.soilMoisture / 4095) * 100)));
    
    // Handle filter selection
    switch (selectedFilter) {
      case 'high-temp':
        return row.temperature > 30;
      case 'low-soil':
        return soilMoisturePercent < 30; // Use percentage for consistency
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
  
  // Convert analog soil moisture to percentage
  const getSoilMoisturePercent = (analogValue: number) => {
    return Math.max(0, Math.min(100, Math.round(100 - (analogValue / 4095) * 100)));
  };

  // Export to CSV function
  const exportToCSV = () => {
    if (!data || data.length === 0) return;
    
    setExporting(true);
    
    try {
      // Define which data to export (either filtered data or all data)
      const exportData = filteredData.length > 0 ? filteredData : data;
      
      // Create CSV header
      const header = ['Tanggal', 'Waktu', 'Suhu (°C)', 'Kelembapan (%)', 'Kelembapan Tanah (%)', 'Nilai Analog Tanah', 'Status Pompa'];
      
      // Create CSV rows
      const rows = exportData.map(row => {
        const formattedDate = formatDate(row.timestamp);
        const soilPercent = getSoilMoisturePercent(row.soilMoisture);
        
        return [
          formattedDate.date,
          formattedDate.time,
          row.temperature,
          row.humidity,
          soilPercent,
          row.soilMoisture,
          row.pumpStatus === 1 ? 'Aktif' : 'Nonaktif'
        ];
      });
      
      // Combine header and rows
      const csvContent = [
        header.join(','),
        ...rows.map(row => row.join(','))
      ].join('\n');
      
      // Create file for download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      
      // Set filename with current date and time
      const now = new Date();
      const fileName = `smart_garden_data_${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}-${String(now.getMinutes()).padStart(2, '0')}.csv`;
      
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Success message could be added here
      setTimeout(() => {
        setExporting(false);
      }, 1000);
    } catch (error) {
      console.error("Error exporting CSV:", error);
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-0 rounded-3xl relative overflow-hidden bg-gradient-to-br from-slate-800/60 to-slate-900/60 border border-white/10 shadow-lg">
        <div className="bg-gradient-to-r from-purple-900/60 via-fuchsia-800/60 to-violet-900/60 px-4 py-3 border-b border-white/10">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center">
                <Calendar className="h-3 w-3 text-purple-300" />
              </div>
              <span>Riwayat Data Sensor</span>
            </h3>
            
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 text-xs text-white/70 bg-white/5 px-3 py-1 rounded-lg border border-white/10">
                <Clock className="h-3.5 w-3.5" />
                <span>{data.length > 0 ? `${data.length} entri data` : "Tidak ada data"}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Control Bar */}
        <div className="p-4 flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-black/20">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <div className="flex items-center bg-white/5 hover:bg-white/10 transition-colors rounded-lg px-3 py-2 border border-white/10">
                <Search className="h-3.5 w-3.5 text-white/50 mr-2" />
                <input 
                  type="text"
                  placeholder="Cari tanggal atau waktu..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="outline-none text-sm bg-transparent w-full text-white placeholder:text-white/40"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="text-white/40 hover:text-white/80 transition-colors"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
            
            <div className="relative">
              <motion.button 
                className={`px-3 py-2 rounded-lg flex items-center gap-2 text-sm font-medium border transition-colors ${
                  selectedFilter !== 'all' 
                    ? "bg-purple-500/20 text-purple-300 border-purple-500/30" 
                    : "bg-white/5 text-white/70 border-white/10 hover:bg-white/10"
                }`}
                onClick={() => setShowFilters(!showFilters)}
                whileHover={{ y: -1 }}
                whileTap={{ y: 0 }}
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
                    className="absolute z-10 mt-1 left-0 bg-slate-800/90 backdrop-blur-md shadow-lg rounded-lg p-2 border border-white/10 w-52"
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <button 
                      className={`w-full px-3 py-2 text-left text-sm rounded-md mb-1 flex items-center gap-2 ${
                        selectedFilter === 'all' 
                          ? 'bg-purple-500/20 text-purple-300 font-medium' 
                          : 'hover:bg-white/10 text-white/70'
                      }`}
                      onClick={() => {
                        setSelectedFilter('all');
                        setShowFilters(false);
                      }}
                    >
                      {selectedFilter === 'all' && <CheckCircle2 size={14} className="text-purple-300" />}
                      <span>Semua Data</span>
                    </button>
                    <button 
                      className={`w-full px-3 py-2 text-left text-sm rounded-md mb-1 flex items-center gap-2 ${
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
                      <Thermometer className="h-3.5 w-3.5 text-red-300" />
                      <span>Suhu Tinggi (Over 30°C)</span>
                    </button>
                    <button 
                      className={`w-full px-3 py-2 text-left text-sm rounded-md mb-1 flex items-center gap-2 ${
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
                      <Sprout className="h-3.5 w-3.5 text-amber-300" />
                      <span>Tanah Kering (Under 30%)</span>
                    </button>
                    <button 
                      className={`w-full px-3 py-2 text-left text-sm rounded-md flex items-center gap-2 ${
                        selectedFilter === 'pump-on' 
                          ? 'bg-cyan-500/20 text-cyan-300 font-medium' 
                          : 'hover:bg-white/10 text-white/70'
                      }`}
                      onClick={() => {
                        setSelectedFilter('pump-on');
                        setShowFilters(false);
                      }}
                    >
                      {selectedFilter === 'pump-on' && <CheckCircle2 size={14} className="text-cyan-300" />}
                      <Droplet className="h-3.5 w-3.5 text-cyan-300" />
                      <span>Pompa Aktif</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {selectedFilter !== 'all' && (
              <motion.div 
                className={`px-3 py-2 rounded-lg text-sm flex items-center gap-2 border ${
                  selectedFilter === 'high-temp' 
                    ? 'bg-red-500/10 text-red-300 border-red-500/30' 
                    : selectedFilter === 'low-soil'
                      ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                      : 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30'
                }`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                {selectedFilter === 'high-temp' && <Thermometer className="h-3.5 w-3.5" />}
                {selectedFilter === 'low-soil' && <Sprout className="h-3.5 w-3.5" />}
                {selectedFilter === 'pump-on' && <Droplet className="h-3.5 w-3.5" />}
                
                <span className="font-medium">
                  {selectedFilter === 'high-temp' ? 'Suhu Tinggi' : 
                   selectedFilter === 'low-soil' ? 'Tanah Kering' : 
                   'Pompa Aktif'}
                </span>
                <button 
                  className="ml-1 hover:bg-white/10 p-0.5 rounded-full"
                  onClick={() => setSelectedFilter('all')}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </motion.div>
            )}
          </div>
          
          <motion.button 
            className="bg-gradient-to-r from-purple-600/80 to-fuchsia-600/80 hover:from-purple-600/90 hover:to-fuchsia-600/90 px-3 py-2 rounded-lg text-sm font-medium text-white flex items-center gap-2 shadow-lg shadow-purple-900/20 border border-purple-500/30 disabled:opacity-60 disabled:cursor-not-allowed"
            whileHover={{ y: -2 }}
            whileTap={{ y: 0 }}
            onClick={exportToCSV}
            disabled={exporting || filteredData.length === 0}
          >
            {exporting ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                  className="h-3.5 w-3.5"
                >
                  <FileText className="h-3.5 w-3.5" />
                </motion.div>
                <span>Mengekspor...</span>
              </>
            ) : (
              <>
                <Download className="h-3.5 w-3.5" />
                <span>Ekspor CSV</span>
              </>
            )}
          </motion.button>
        </div>
        
        {/* Filter info & stats */}
        <div className="px-4 py-2 border-b border-white/10 bg-black/10 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <GaugeCircle className="h-3.5 w-3.5 text-white/50" />
            <span className="text-xs text-white/50">
              Menampilkan {visibleData.length} dari {filteredData.length} data
              {selectedFilter !== 'all' && ` (filter aktif: ${
                selectedFilter === 'high-temp' ? 'Suhu Tinggi' : 
                selectedFilter === 'low-soil' ? 'Tanah Kering' : 
                'Pompa Aktif'
              })`}
            </span>
          </div>
          
          <div className="flex items-center gap-1.5 text-xs text-white/50">
            <Clock className="h-3.5 w-3.5" />
            <span>Terakhir diperbarui: {data.length > 0 ? formatDate(data[0].timestamp).time : '--:--'}</span>
          </div>
        </div>
      
        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                {/* Time column */}
                <th 
                  className="border-b border-white/10 bg-black/30"
                  onClick={() => handleSort('timestamp')}
                >
                  <div className="px-4 py-3 flex items-center gap-2 cursor-pointer hover:bg-white/5 transition-colors">
                    <div className="flex flex-col items-start">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-purple-300" />
                        <span className="font-medium text-white">Waktu</span>
                      </div>
                      <span className="text-[10px] text-white/60">Tanggal & jam</span>
                    </div>
                    <div className="ml-auto">
                      {sortConfig.key === 'timestamp' ? (
                        sortConfig.direction === 'ascending' ? (
                          <ChevronUp className="h-3.5 w-3.5 text-purple-300" />
                        ) : (
                          <ChevronDown className="h-3.5 w-3.5 text-purple-300" />
                        )
                      ) : (
                        <ArrowUpDown className="h-3.5 w-3.5 text-white/30" />
                      )}
                    </div>
                  </div>
                </th>
                
                {/* Temperature column */}
                <th 
                  className="border-b border-white/10 bg-black/30"
                  onClick={() => handleSort('temperature')}
                >
                  <div className="px-4 py-3 flex items-center gap-2 cursor-pointer hover:bg-white/5 transition-colors">
                    <div className="flex flex-col items-start">
                      <div className="flex items-center gap-1.5">
                        <Thermometer className="h-3.5 w-3.5 text-red-300" />
                        <span className="font-medium text-white">Suhu</span>
                      </div>
                      <span className="text-[10px] text-white/60">Derajat Celcius (°C)</span>
                    </div>
                    <div className="ml-auto">
                      {sortConfig.key === 'temperature' ? (
                        sortConfig.direction === 'ascending' ? (
                          <ChevronUp className="h-3.5 w-3.5 text-red-300" />
                        ) : (
                          <ChevronDown className="h-3.5 w-3.5 text-red-300" />
                        )
                      ) : (
                        <ArrowUpDown className="h-3.5 w-3.5 text-white/30" />
                      )}
                    </div>
                  </div>
                </th>
                
                {/* Humidity column */}
                <th 
                  className="border-b border-white/10 bg-black/30"
                  onClick={() => handleSort('humidity')}
                >
                  <div className="px-4 py-3 flex items-center gap-2 cursor-pointer hover:bg-white/5 transition-colors">
                    <div className="flex flex-col items-start">
                      <div className="flex items-center gap-1.5">
                        <Droplets className="h-3.5 w-3.5 text-blue-300" />
                        <span className="font-medium text-white">Kelembapan</span>
                      </div>
                      <span className="text-[10px] text-white/60">Persentase (%)</span>
                    </div>
                    <div className="ml-auto">
                      {sortConfig.key === 'humidity' ? (
                        sortConfig.direction === 'ascending' ? (
                          <ChevronUp className="h-3.5 w-3.5 text-blue-300" />
                        ) : (
                          <ChevronDown className="h-3.5 w-3.5 text-blue-300" />
                        )
                      ) : (
                        <ArrowUpDown className="h-3.5 w-3.5 text-white/30" />
                      )}
                    </div>
                  </div>
                </th>
                
                {/* Soil Moisture column */}
                <th 
                  className="border-b border-white/10 bg-black/30"
                  onClick={() => handleSort('soilMoisture')}
                >
                  <div className="px-4 py-3 flex items-center gap-2 cursor-pointer hover:bg-white/5 transition-colors">
                    <div className="flex flex-col items-start">
                      <div className="flex items-center gap-1.5">
                        <Sprout className="h-3.5 w-3.5 text-emerald-300" />
                        <span className="font-medium text-white">Tanah</span>
                      </div>
                      <span className="text-[10px] text-white/60">Kelembapan (%)</span>
                    </div>
                    <div className="ml-auto">
                      {sortConfig.key === 'soilMoisture' ? (
                        sortConfig.direction === 'ascending' ? (
                          <ChevronUp className="h-3.5 w-3.5 text-emerald-300" />
                        ) : (
                          <ChevronDown className="h-3.5 w-3.5 text-emerald-300" />
                        )
                      ) : (
                        <ArrowUpDown className="h-3.5 w-3.5 text-white/30" />
                      )}
                    </div>
                  </div>
                </th>
                
                {/* Pump status column */}
                <th 
                  className="border-b border-white/10 bg-black/30"
                  onClick={() => handleSort('pumpStatus')}
                >
                  <div className="px-4 py-3 flex items-center gap-2 cursor-pointer hover:bg-white/5 transition-colors">
                    <div className="flex flex-col items-start">
                      <div className="flex items-center gap-1.5">
                        <Droplet className="h-3.5 w-3.5 text-cyan-300" />
                        <span className="font-medium text-white">Pompa</span>
                      </div>
                      <span className="text-[10px] text-white/60">Status</span>
                    </div>
                    <div className="ml-auto">
                      {sortConfig.key === 'pumpStatus' ? (
                        sortConfig.direction === 'ascending' ? (
                          <ChevronUp className="h-3.5 w-3.5 text-cyan-300" />
                        ) : (
                          <ChevronDown className="h-3.5 w-3.5 text-cyan-300" />
                        )
                      ) : (
                        <ArrowUpDown className="h-3.5 w-3.5 text-white/30" />
                      )}
                    </div>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence mode="wait">
                {visibleData.length > 0 ? (
                  visibleData.map((row, i) => {
                    const formattedDate = formatDate(row.timestamp);
                    const soilPercent = getSoilMoisturePercent(row.soilMoisture);
                    
                    return (
                      <motion.tr 
                        key={row._id ?? i}
                        className="border-b border-white/5 hover:bg-white/5 transition-colors"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.2, delay: i * 0.03 }}
                        exit={{ opacity: 0 }}
                      >
                        {/* Time cell */}
                        <td className="border-r border-white/5">
                          <div className="px-4 py-3">
                            <div className="flex flex-col">
                              <span className="text-sm font-medium text-white">{formattedDate.time}</span>
                              <span className="text-xs text-white/60">{formattedDate.date}</span>
                            </div>
                          </div>
                        </td>
                        
                        {/* Temperature cell */}
                        <td className="border-r border-white/5">
                          <div className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className={`inline-flex items-center justify-center min-w-[40px] px-2 py-1 rounded-md text-sm font-medium border ${
                                row.temperature > 30 
                                  ? 'bg-red-500/20 text-red-300 border-red-500/30' 
                                  : row.temperature < 20 
                                    ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                              }`}>
                                {row.temperature}°C
                              </div>
                              
                              <div className="text-xs text-white/60">
                                {row.temperature > 30 
                                  ? "Terlalu panas" 
                                  : row.temperature < 20 
                                    ? "Terlalu dingin" 
                                    : "Optimal"}
                              </div>
                            </div>
                          </div>
                        </td>
                        
                        {/* Humidity cell */}
                        <td className="border-r border-white/5">
                          <div className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className={`inline-flex items-center justify-center min-w-[40px] px-2 py-1 rounded-md text-sm font-medium border ${
                                row.humidity > 80 
                                  ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' 
                                  : row.humidity < 40 
                                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                              }`}>
                                {row.humidity}%
                              </div>
                              
                              <div className="text-xs text-white/60">
                                {row.humidity > 80 
                                  ? "Sangat lembap" 
                                  : row.humidity < 40 
                                    ? "Kering" 
                                    : "Optimal"}
                              </div>
                            </div>
                          </div>
                        </td>
                        
                        {/* Soil Moisture cell */}
                        <td className="border-r border-white/5">
                          <div className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className={`inline-flex items-center justify-center min-w-[40px] px-2 py-1 rounded-md text-sm font-medium border ${
                                soilPercent < 30 
                                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' 
                                  : soilPercent > 70 
                                    ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                              }`}>
                                {soilPercent}%
                              </div>
                              
                              <div className="flex items-center gap-1">
                                <span className="text-xs text-white/60">
                                  {soilPercent < 30 
                                    ? "Kering" 
                                    : soilPercent > 70 
                                      ? "Basah" 
                                      : "Optimal"}
                                </span>
                                <span className="text-[10px] text-white/40">({row.soilMoisture})</span>
                              </div>
                            </div>
                          </div>
                        </td>
                        
                        {/* Pump Status cell */}
                        <td>
                          <div className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className={`inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${
                                row.pumpStatus === 1 
                                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' 
                                  : 'bg-gray-500/20 text-gray-300 border-gray-500/20'
                              }`}>
                                <motion.div 
                                  className={`w-2 h-2 rounded-full ${
                                    row.pumpStatus === 1 ? 'bg-cyan-400' : 'bg-gray-400'
                                  }`}
                                  animate={{ 
                                    opacity: row.pumpStatus === 1 ? [0.6, 1, 0.6] : 0.7
                                  }}
                                  transition={{ 
                                    duration: 1.5,
                                    repeat: row.pumpStatus === 1 ? Infinity : 0
                                  }}
                                />
                                {row.pumpStatus === 1 ? "AKTIF" : "NONAKTIF"}
                              </div>
                            </div>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })
                ) : (
                  <motion.tr
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <td colSpan={5} className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                          <Search className="h-5 w-5 text-white/20" />
                        </div>
                        <p className="text-white/40 text-sm">
                          {searchQuery || selectedFilter !== 'all' ? 
                            "Tidak ada data yang sesuai dengan filter" : 
                            "Tidak ada data sensor tersedia"}
                        </p>
                      </div>
                    </td>
                  </motion.tr>
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
        
        {/* Load more */}
        {filteredData.length > showAmount && (
          <div className="p-4 border-t border-white/10 bg-black/20 text-center">
            <motion.button 
              onClick={() => setShowAmount(prev => Math.min(prev + 5, filteredData.length))}
              className="bg-gradient-to-r from-slate-700/60 to-slate-800/60 hover:from-slate-700/80 hover:to-slate-800/80 px-4 py-2 rounded-lg border border-white/10 text-white/80 text-sm flex items-center justify-center gap-2 mx-auto transition-colors"
              whileHover={{ y: -2 }}
              whileTap={{ y: 0 }}
            >
              <ChevronDown className="h-4 w-4" />
              <span>Tampilkan {Math.min(5, filteredData.length - showAmount)} Data Lainnya</span>
            </motion.button>
          </div>
        )}
        
        {/* Empty state when no data */}
        {data.length === 0 && (
          <div className="p-8 flex flex-col items-center justify-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
              <Calendar className="h-8 w-8 text-white/20" />
            </div>
            <h3 className="text-lg font-medium text-white/70">Tidak Ada Data Sensor</h3>
            <p className="text-sm text-white/50 text-center max-w-md">
              Belum ada data sensor yang tersimpan. Data akan tampil di sini saat sistem mulai merekam pembacaan sensor.
            </p>
          </div>
        )}
      </div>
      
      {/* Stats Summary */}
      {data.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="p-0 rounded-3xl relative overflow-hidden bg-gradient-to-br from-slate-800/60 to-slate-900/60 border border-white/10 shadow-lg"
        >
          <div className="bg-gradient-to-r from-slate-700/60 via-slate-700/60 to-slate-800/60 px-4 py-3 border-b border-white/10">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
                  <GaugeCircle className="h-3 w-3 text-white/70" />
                </div>
                <span>Statistik Data</span>
              </h3>
              
              <div className="text-xs text-white/60">
                {filteredData.length} data terfilter dari {data.length} total
              </div>
            </div>
          </div>
          
          <div className="px-4 pt-4 pb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Temperature Stats */}
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-full bg-red-500/10 flex items-center justify-center">
                  <Thermometer className="h-3.5 w-3.5 text-red-300" />
                </div>
                <h3 className="text-sm font-medium text-white">Statistik Suhu</h3>
              </div>
              
              {filteredData.length > 0 ? (
                <div className="space-y-2">
                  {/* Min, Max, Avg */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-white/5 p-2 rounded-lg">
                      <div className="text-xs text-white/50 mb-1">Min</div>
                      <div className="text-sm font-medium text-white flex items-center gap-1">
                        <ArrowUpDown className="h-3 w-3 text-blue-400" />
                        {Math.min(...filteredData.map(d => d.temperature)).toFixed(1)}°C
                      </div>
                    </div>
                    <div className="bg-white/5 p-2 rounded-lg">
                      <div className="text-xs text-white/50 mb-1">Max</div>
                      <div className="text-sm font-medium text-white flex items-center gap-1">
                        <ArrowUpDown className="h-3 w-3 text-red-400" />
                        {Math.max(...filteredData.map(d => d.temperature)).toFixed(1)}°C
                      </div>
                    </div>
                    <div className="bg-white/5 p-2 rounded-lg">
                      <div className="text-xs text-white/50 mb-1">Rata-rata</div>
                      <div className="text-sm font-medium text-white">
                        {(filteredData.reduce((sum, d) => sum + d.temperature, 0) / filteredData.length).toFixed(1)}°C
                      </div>
                    </div>
                  </div>
                  
                  {/* Additional stats */}
                  <div className="flex justify-between items-center bg-white/5 p-2 rounded-lg text-xs">
                    <span className="text-white/60">Pembacaan di atas 30°C:</span>
                    <span className="font-medium text-white">
                      {filteredData.filter(d => d.temperature > 30).length} ({Math.round(filteredData.filter(d => d.temperature > 30).length / filteredData.length * 100)}%)
                    </span>
                  </div>
                </div>
              ) : (
                <div className="h-20 flex items-center justify-center text-white/30 text-sm">
                  Tidak ada data yang sesuai dengan filter
                </div>
              )}
            </div>
            
            {/* Humidity Stats */}
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <Droplets className="h-3.5 w-3.5 text-blue-300" />
                </div>
                <h3 className="text-sm font-medium text-white">Statistik Kelembapan</h3>
              </div>
              
              {filteredData.length > 0 ? (
                <div className="space-y-2">
                  {/* Min, Max, Avg */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-white/5 p-2 rounded-lg">
                      <div className="text-xs text-white/50 mb-1">Min</div>
                      <div className="text-sm font-medium text-white flex items-center gap-1">
                        <ArrowUpDown className="h-3 w-3 text-amber-400" />
                        {Math.min(...filteredData.map(d => d.humidity))}%
                      </div>
                    </div>
                    <div className="bg-white/5 p-2 rounded-lg">
                      <div className="text-xs text-white/50 mb-1">Max</div>
                      <div className="text-sm font-medium text-white flex items-center gap-1">
                        <ArrowUpDown className="h-3 w-3 text-blue-400" />
                        {Math.max(...filteredData.map(d => d.humidity))}%
                      </div>
                    </div>
                    <div className="bg-white/5 p-2 rounded-lg">
                      <div className="text-xs text-white/50 mb-1">Rata-rata</div>
                      <div className="text-sm font-medium text-white">
                        {(filteredData.reduce((sum, d) => sum + d.humidity, 0) / filteredData.length).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                  
                  {/* Additional stats */}
                  <div className="flex justify-between items-center bg-white/5 p-2 rounded-lg text-xs">
                    <span className="text-white/60">Rentang kelembapan:</span>
                    <span className="font-medium text-white">
                      {Math.min(...filteredData.map(d => d.humidity))}% - {Math.max(...filteredData.map(d => d.humidity))}%
                    </span>
                  </div>
                </div>
              ) : (
                <div className="h-20 flex items-center justify-center text-white/30 text-sm">
                  Tidak ada data yang sesuai dengan filter
                </div>
              )}
            </div>
            
            {/* Soil & Pump Stats */}
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-full bg-emerald-500/10 flex items-center justify-center">
                  <Sprout className="h-3.5 w-3.5 text-emerald-300" />
                </div>
                <h3 className="text-sm font-medium text-white">Statistik Tanah & Pompa</h3>
              </div>
              
              {filteredData.length > 0 ? (
                <div className="space-y-2">
                  {/* Soil stats */}
                  <div className="bg-white/5 p-2 rounded-lg flex justify-between items-center">
                    <span className="text-xs text-white/60">Rata-rata kelembapan tanah:</span>
                    <span className="text-sm font-medium text-white">
                      {(filteredData.reduce((sum, d) => sum + getSoilMoisturePercent(d.soilMoisture), 0) / filteredData.length).toFixed(1)}%
                    </span>
                  </div>
                  
                  {/* Pump stats */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-white/5 p-2 rounded-lg">
                      <div className="text-xs text-white/50 mb-1">Pompa Aktif</div>
                      <div className="text-sm font-medium text-white flex items-center gap-1">
                        <motion.div 
                          className="w-2 h-2 rounded-full bg-cyan-400"
                          animate={{ 
                            opacity: [0.6, 1, 0.6]
                          }}
                          transition={{ 
                            duration: 1.5,
                            repeat: Infinity
                          }}
                        />
                        {filteredData.filter(d => d.pumpStatus === 1).length} entri
                      </div>
                    </div>
                    <div className="bg-white/5 p-2 rounded-lg">
                      <div className="text-xs text-white/50 mb-1">Persentase</div>
                      <div className="text-sm font-medium text-white">
                        {Math.round(filteredData.filter(d => d.pumpStatus === 1).length / filteredData.length * 100)}%
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-20 flex items-center justify-center text-white/30 text-sm">
                  Tidak ada data yang sesuai dengan filter
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}