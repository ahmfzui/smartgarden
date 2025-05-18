"use client";
import { useState } from "react"; // Removed useEffect
import { motion } from "framer-motion";
import { 
  BarChart as BarChartIcon, 
  LineChart as LineChartIcon,
  AreaChart as AreaChartIcon,  
  PieChart, 
  Thermometer, 
  Droplets, 
  Sprout,
  Droplet,
  Calendar
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";

type Sensor = {
  temperature: number;
  humidity: number;
  soilMoisture: number;
  pumpStatus: number;
  timestamp: string;
};

type TimeFilter = '24h' | '7d' | '30d' | 'all';

// Define type for tooltip props
interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  label?: string;
}

export default function SensorGraphs({ data }: { data: Sensor[] }) {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('24h');
  const [activeChart, setActiveChart] = useState<string | null>(null);
  
  // Process data based on time filter
  const getFilteredData = () => {
    if (!data.length) return [];
    
    const now = new Date();
    let filteredData = [...data];
    
    // Apply time filter
    if (timeFilter === '24h') {
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      filteredData = data.filter(item => new Date(item.timestamp) >= yesterday);
    } else if (timeFilter === '7d') {
      const lastWeek = new Date(now);
      lastWeek.setDate(lastWeek.getDate() - 7);
      filteredData = data.filter(item => new Date(item.timestamp) >= lastWeek);
    } else if (timeFilter === '30d') {
      const lastMonth = new Date(now);
      lastMonth.setDate(lastMonth.getDate() - 30);
      filteredData = data.filter(item => new Date(item.timestamp) >= lastMonth);
    }
    
    // Ensure data is in chronological order
    filteredData.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    
    // Format data for charts
    return filteredData.map(item => ({
      ...item,
      time: formatTime(item.timestamp),
      date: formatDate(item.timestamp)
    }));
  };
  
  // Get summary statistics
  const getSummaryStats = () => {
    if (!data.length) return {
      avgTemp: 0,
      avgHumidity: 0,
      avgSoil: 0,
      pumpOnTime: 0
    };
    
    const filteredData = getFilteredData();
    
    const avgTemp = filteredData.reduce((sum, item) => sum + item.temperature, 0) / filteredData.length;
    const avgHumidity = filteredData.reduce((sum, item) => sum + item.humidity, 0) / filteredData.length;
    const avgSoil = filteredData.reduce((sum, item) => sum + item.soilMoisture, 0) / filteredData.length;
    
    // Calculate approximate pump on time (in hours)
    // Assuming entries are 5 minutes apart and pump status of 1 means it was on for that period
    const pumpOnEntries = filteredData.filter(item => item.pumpStatus === 1).length;
    const pumpOnTime = (pumpOnEntries * 5) / 60; // convert to hours
    
    return {
      avgTemp: avgTemp.toFixed(1),
      avgHumidity: avgHumidity.toFixed(1),
      avgSoil: avgSoil.toFixed(1),
      pumpOnTime: pumpOnTime.toFixed(1)
    };
  };
  
  // Format time helper function
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  };
  
  // Format date helper function
  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit' });
  };
  
  const summary = getSummaryStats();
  const chartData = getFilteredData();
  
  // Configure tooltips - fixed any types
  const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-tooltip bg-black/80 backdrop-blur-md p-3 rounded-lg shadow-lg border border-white/20 text-sm text-white">
          <p className="font-medium">{`${label}`}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {`${entry.name}: ${entry.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-full bg-gradient-to-r from-purple-500/30 to-fuchsia-500/30 backdrop-blur-md">
            <PieChart className="h-5 w-5 text-white" />
          </div>
          <h2 className="text-lg font-medium text-white">Analisis Sensor</h2>
        </div>
        
        <div className="glass-tabs">
          <button 
            className={`py-1 px-3 rounded-lg text-xs font-medium transition-colors ${timeFilter === '24h' ? 'tab-active' : ''}`}
            onClick={() => setTimeFilter('24h')}
          >
            24 Jam
          </button>
          <button 
            className={`py-1 px-3 rounded-lg text-xs font-medium transition-colors ${timeFilter === '7d' ? 'tab-active' : ''}`}
            onClick={() => setTimeFilter('7d')}
          >
            7 Hari
          </button>
          <button 
            className={`py-1 px-3 rounded-lg text-xs font-medium transition-colors ${timeFilter === '30d' ? 'tab-active' : ''}`}
            onClick={() => setTimeFilter('30d')}
          >
            30 Hari
          </button>
          <button 
            className={`py-1 px-3 rounded-lg text-xs font-medium transition-colors ${timeFilter === 'all' ? 'tab-active' : ''}`}
            onClick={() => setTimeFilter('all')}
          >
            Semua
          </button>
        </div>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div 
          className="glass-card-modern bg-gradient-to-br from-white/30 to-white/10 backdrop-blur-md text-white border border-white/20 shadow-lg transition-all duration-300"
          whileHover={{ y: -2 }}
          onHoverStart={() => setActiveChart('temp')}
          onHoverEnd={() => setActiveChart(null)}
        >
          <div className="p-4 relative overflow-hidden">
            <div className="absolute -right-4 -bottom-4 w-20 h-20 rounded-full bg-gradient-to-r from-red-500/20 to-orange-500/20 blur-xl"></div>
            
            <div className="flex items-center justify-between mb-2 relative z-10">
              <h3 className="text-sm font-medium text-white/80">Rata-rata Suhu</h3>
              <div className="p-2 rounded-lg bg-red-500/20 backdrop-blur-md border border-red-500/30">
                <Thermometer className="w-4 h-4 text-red-300" />
              </div>
            </div>
            <div className="text-2xl font-bold text-white relative z-10">{summary.avgTemp}°C</div>
            <div className="text-xs text-white/70 mt-1 relative z-10">Periode {
              timeFilter === '24h' ? '24 jam terakhir' :
              timeFilter === '7d' ? '7 hari terakhir' :
              timeFilter === '30d' ? '30 hari terakhir' : 
              'keseluruhan data'
            }</div>
          </div>
        </motion.div>
        
        <motion.div 
          className="glass-card-modern bg-gradient-to-br from-white/30 to-white/10 backdrop-blur-md text-white border border-white/20 shadow-lg transition-all duration-300"
          whileHover={{ y: -2 }}
          onHoverStart={() => setActiveChart('humidity')}
          onHoverEnd={() => setActiveChart(null)}
        >
          <div className="p-4 relative overflow-hidden">
            <div className="absolute -right-4 -bottom-4 w-20 h-20 rounded-full bg-gradient-to-r from-blue-500/20 to-cyan-500/20 blur-xl"></div>
            
            <div className="flex items-center justify-between mb-2 relative z-10">
              <h3 className="text-sm font-medium text-white/80">Rata-rata Kelembapan</h3>
              <div className="p-2 rounded-lg bg-blue-500/20 backdrop-blur-md border border-blue-500/30">
                <Droplets className="w-4 h-4 text-blue-300" />
              </div>
            </div>
            <div className="text-2xl font-bold text-white relative z-10">{summary.avgHumidity}%</div>
            <div className="text-xs text-white/70 mt-1 relative z-10">Periode {
              timeFilter === '24h' ? '24 jam terakhir' :
              timeFilter === '7d' ? '7 hari terakhir' :
              timeFilter === '30d' ? '30 hari terakhir' : 
              'keseluruhan data'
            }</div>
          </div>
        </motion.div>
        
        <motion.div 
          className="glass-card-modern bg-gradient-to-br from-white/30 to-white/10 backdrop-blur-md text-white border border-white/20 shadow-lg transition-all duration-300"
          whileHover={{ y: -2 }}
          onHoverStart={() => setActiveChart('soil')}
          onHoverEnd={() => setActiveChart(null)}
        >
          <div className="p-4 relative overflow-hidden">
            <div className="absolute -right-4 -bottom-4 w-20 h-20 rounded-full bg-gradient-to-r from-emerald-500/20 to-green-500/20 blur-xl"></div>
            
            <div className="flex items-center justify-between mb-2 relative z-10">
              <h3 className="text-sm font-medium text-white/80">Rata-rata Kelembapan Tanah</h3>
              <div className="p-2 rounded-lg bg-emerald-500/20 backdrop-blur-md border border-emerald-500/30">
                <Sprout className="w-4 h-4 text-emerald-300" />
              </div>
            </div>
            <div className="text-2xl font-bold text-white relative z-10">{summary.avgSoil}%</div>
            <div className="text-xs text-white/70 mt-1 relative z-10">Periode {
              timeFilter === '24h' ? '24 jam terakhir' :
              timeFilter === '7d' ? '7 hari terakhir' :
              timeFilter === '30d' ? '30 hari terakhir' : 
              'keseluruhan data'
            }</div>
          </div>
        </motion.div>
        
        <motion.div 
          className="glass-card-modern bg-gradient-to-br from-white/30 to-white/10 backdrop-blur-md text-white border border-white/20 shadow-lg transition-all duration-300"
          whileHover={{ y: -2 }}
          onHoverStart={() => setActiveChart('pump')}
          onHoverEnd={() => setActiveChart(null)}
        >
          <div className="p-4 relative overflow-hidden">
            <div className="absolute -right-4 -bottom-4 w-20 h-20 rounded-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20 blur-xl"></div>
            
            <div className="flex items-center justify-between mb-2 relative z-10">
              <h3 className="text-sm font-medium text-white/80">Waktu Pompa Aktif</h3>
              <div className="p-2 rounded-lg bg-cyan-500/20 backdrop-blur-md border border-cyan-500/30">
                <Droplet className="w-4 h-4 text-cyan-300" />
              </div>
            </div>
            <div className="text-2xl font-bold text-white relative z-10">{summary.pumpOnTime} jam</div>
            <div className="text-xs text-white/70 mt-1 relative z-10">Total waktu pompa menyala</div>
          </div>
        </motion.div>
      </div>
      
      {/* Main charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Temperature & Humidity Chart */}
        <motion.div 
          className="glass-card-modern bg-gradient-to-br from-white/30 to-white/10 backdrop-blur-md text-white border border-white/20 shadow-lg p-4"
          whileHover={{ y: -2 }}
          animate={{
            boxShadow: activeChart === 'temp' || activeChart === 'humidity' ? '0 10px 30px rgba(255, 255, 255, 0.1)' : 'none'
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-white">Suhu & Kelembapan</h3>
            <LineChartIcon className="h-4 w-4 text-white/70" />
          </div>
          <div className="h-64 relative overflow-hidden rounded-md">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                  <XAxis 
                    dataKey="time" 
                    tick={{ fontSize: 12, fill: 'rgba(255, 255, 255, 0.7)' }} 
                    tickMargin={10} 
                    stroke="rgba(255, 255, 255, 0.3)"
                  />
                  <YAxis 
                    yAxisId="left" 
                    stroke="#ef4444" 
                    tick={{ fill: 'rgba(255, 255, 255, 0.7)' }}
                  />
                  <YAxis 
                    yAxisId="right" 
                    orientation="right" 
                    stroke="#3b82f6" 
                    tick={{ fill: 'rgba(255, 255, 255, 0.7)' }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="temperature"
                    name="Suhu (°C)"
                    stroke="#ef4444"
                    strokeWidth={2}
                    dot={{ r: 2 }}
                    activeDot={{ r: 5, strokeWidth: 0 }}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="humidity"
                    name="Kelembapan (%)"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ r: 2 }}
                    activeDot={{ r: 5, strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-white/60 bg-white/5 rounded-lg border border-white/10">
                Data tidak tersedia
              </div>
            )}
          </div>
        </motion.div>
        
        {/* Soil Moisture Chart */}
        <motion.div 
          className="glass-card-modern bg-gradient-to-br from-white/30 to-white/10 backdrop-blur-md text-white border border-white/20 shadow-lg p-4"
          whileHover={{ y: -2 }}
          animate={{
            boxShadow: activeChart === 'soil' ? '0 10px 30px rgba(255, 255, 255, 0.1)' : 'none'
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-white">Kelembapan Tanah</h3>
            <AreaChartIcon className="h-4 w-4 text-white/70" />
          </div>
          <div className="h-64 relative overflow-hidden rounded-md">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                  <XAxis 
                    dataKey="time" 
                    tick={{ fontSize: 12, fill: 'rgba(255, 255, 255, 0.7)' }} 
                    tickMargin={10}
                    stroke="rgba(255, 255, 255, 0.3)"
                  />
                  <YAxis 
                    stroke="rgba(255, 255, 255, 0.3)" 
                    tick={{ fill: 'rgba(255, 255, 255, 0.7)' }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <defs>
                    <linearGradient id="soilGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.2}/>
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="soilMoisture"
                    name="Kelembapan Tanah (%)"
                    stroke="#10b981"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#soilGradient)"
                    activeDot={{ r: 5, strokeWidth: 0 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-white/60 bg-white/5 rounded-lg border border-white/10">
                Data tidak tersedia
              </div>
            )}
          </div>
        </motion.div>
        
        {/* Pump Activity Chart */}
        <motion.div 
          className="glass-card-modern bg-gradient-to-br from-white/30 to-white/10 backdrop-blur-md text-white border border-white/20 shadow-lg p-4"
          whileHover={{ y: -2 }}
          animate={{
            boxShadow: activeChart === 'pump' ? '0 10px 30px rgba(255, 255, 255, 0.1)' : 'none'
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-white">Aktivitas Pompa</h3>
            <BarChartIcon className="h-4 w-4 text-white/70" />
          </div>
          <div className="h-64 relative overflow-hidden rounded-md">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                  <XAxis 
                    dataKey="time" 
                    tick={{ fontSize: 12, fill: 'rgba(255, 255, 255, 0.7)' }} 
                    tickMargin={10}
                    stroke="rgba(255, 255, 255, 0.3)"
                  />
                  <YAxis 
                    ticks={[0, 1]} 
                    domain={[0, 1]} 
                    stroke="rgba(255, 255, 255, 0.3)"
                    tick={{ fill: 'rgba(255, 255, 255, 0.7)' }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <defs>
                    <linearGradient id="pumpGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.6}/>
                    </linearGradient>
                  </defs>
                  <Bar 
                    dataKey="pumpStatus" 
                    name="Status Pompa" 
                    fill="url(#pumpGradient)" 
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-white/60 bg-white/5 rounded-lg border border-white/10">
                Data tidak tersedia
              </div>
            )}
          </div>
        </motion.div>
        
        {/* Combined Chart */}
        <motion.div 
          className="glass-card-modern bg-gradient-to-br from-white/30 to-white/10 backdrop-blur-md text-white border border-white/20 shadow-lg p-4"
          whileHover={{ y: -2 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-white">Semua Parameter</h3>
            <LineChartIcon className="h-4 w-4 text-white/70" />
          </div>
          <div className="h-64 relative overflow-hidden rounded-md">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                  <XAxis 
                    dataKey="time" 
                    tick={{ fontSize: 12, fill: 'rgba(255, 255, 255, 0.7)' }} 
                    tickMargin={10}
                    stroke="rgba(255, 255, 255, 0.3)"
                  />
                  <YAxis 
                    stroke="rgba(255, 255, 255, 0.3)"
                    tick={{ fill: 'rgba(255, 255, 255, 0.7)' }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="temperature"
                    name="Suhu (°C)"
                    stroke="#ef4444"
                    strokeWidth={2}
                    dot={{ r: 1 }}
                    activeDot={{ r: 5 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="humidity"
                    name="Kelembapan (%)"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ r: 1 }}
                    activeDot={{ r: 5 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="soilMoisture"
                    name="Kelembapan Tanah (%)"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={{ r: 1 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-white/60 bg-white/5 rounded-lg border border-white/10">
                Data tidak tersedia
              </div>
            )}
          </div>
        </motion.div>
      </div>
      
      <motion.div 
        className="glass-card-modern bg-gradient-to-br from-white/30 to-white/10 backdrop-blur-md text-white border border-white/20 shadow-lg p-5"
        whileHover={{ y: -2 }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="h-5 w-5 text-emerald-300" />
          <h3 className="text-lg font-medium text-white">Ringkasan Periode</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-white/5 backdrop-blur-md p-4 rounded-lg border border-white/10">
            <h4 className="text-sm font-medium text-white/70 mb-2">Periode Waktu</h4>
            <p className="text-sm text-white">{
              timeFilter === '24h' ? '24 jam terakhir' :
              timeFilter === '7d' ? '7 hari terakhir' :
              timeFilter === '30d' ? '30 hari terakhir' : 
              'Seluruh data'
            }</p>
          </div>
          
          <div className="bg-white/5 backdrop-blur-md p-4 rounded-lg border border-white/10">
            <h4 className="text-sm font-medium text-white/70 mb-2">Jumlah Data</h4>
            <p className="text-sm text-white">{chartData.length} entri data</p>
          </div>
          
          <div className="bg-white/5 backdrop-blur-md p-4 rounded-lg border border-white/10">
            <h4 className="text-sm font-medium text-white/70 mb-2">Data Terbaru</h4>
            {chartData.length > 0 ? (
              <p className="text-sm text-white">{new Date(chartData[chartData.length - 1].timestamp).toLocaleString()}</p>
            ) : (
              <p className="text-sm text-white/50">Tidak ada data</p>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}