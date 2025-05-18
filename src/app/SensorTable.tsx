"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, Calendar, RefreshCw } from "lucide-react";

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

  const handleSort = (key: keyof Sensor) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    
    if (sortConfig && sortConfig.key === key) {
      direction = sortConfig.direction === 'ascending' ? 'descending' : 'ascending';
    }
    
    setSortConfig({ key, direction });
  };
  
  const sortedData = [...data].sort((a, b) => {
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

  const handleRefresh = () => {
    setIsRefreshing(true);
    // Simulate refresh delay
    setTimeout(() => setIsRefreshing(false), 600);
  };

  const visibleData = sortedData.slice(0, showAmount);

  return (
    <motion.div 
      className="table-container mb-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <div className="p-4 bg-white flex justify-between items-center border-b border-garden-200">
        <h2 className="text-lg font-semibold text-garden-800 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-garden-600" />
          Riwayat Data Sensor
        </h2>
        <button 
          className="text-garden-600 hover:text-garden-700 flex items-center gap-1"
          onClick={handleRefresh}
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span className="text-sm">Refresh</span>
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="table-header">
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
              {visibleData.map((row, i) => (
                <motion.tr 
                  key={row._id ?? i}
                  className="table-row"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2, delay: i * 0.05 }}
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
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
      
      {data.length > showAmount && (
        <div className="p-3 border-t border-garden-100 bg-garden-50 text-center">
          <button 
            onClick={() => setShowAmount(prev => Math.min(prev + 5, data.length))}
            className="text-garden-600 hover:text-garden-800 font-medium text-sm"
          >
            Tampilkan Lebih Banyak
          </button>
        </div>
      )}
    </motion.div>
  );
}