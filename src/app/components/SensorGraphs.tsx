"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  BarChart as BarChartIcon, 
  LineChart as LineChartIcon,
  AreaChart as AreaChartIcon,  
  PieChart, 
  Thermometer, 
  Droplets, 
  Sprout,
  Droplet,
  Calendar,
  ArrowUp,
  ArrowDown,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  Clock,
  GaugeCircle,
  X
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
  Legend,
  ReferenceLine
} from "recharts";

type Sensor = {
  temperature: number;
  humidity: number;
  soilMoisture: number;
  pumpStatus: number;
  timestamp: string;
};

type TimeFilter = '24h' | '7d' | '30d' | 'all';
type ChartType = 'temperature' | 'humidity' | 'soil' | 'pump' | 'combined';

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
  const [activeChart, setActiveChart] = useState<ChartType | null>(null);
  const [expandedChart, setExpandedChart] = useState<ChartType | null>(null);
  const [chartType, setChartType] = useState<'line' | 'area' | 'bar'>('line');
  const [animateCharts, setAnimateCharts] = useState(true);
  
  // Get data min/max values for charts
  const [tempRange, setTempRange] = useState({ min: 0, max: 40 });
  const [humidityRange, setHumidityRange] = useState({ min: 0, max: 100 });
  const [soilRange, setSoilRange] = useState({ min: 0, max: 4095 });
  
  // Calculate data ranges when data or filter changes
  useEffect(() => {
    if (data && data.length > 0) {
      const filteredData = getFilteredData();
      
      if (filteredData.length > 0) {
        // Set temperature range
        const tempValues = filteredData.map(item => item.temperature);
        const tempMin = Math.floor(Math.min(...tempValues) - 2);
        const tempMax = Math.ceil(Math.max(...tempValues) + 2);
        setTempRange({ min: tempMin, max: tempMax });
        
        // Set humidity range
        const humidityValues = filteredData.map(item => item.humidity);
        const humidityMin = Math.max(0, Math.floor(Math.min(...humidityValues) - 5));
        const humidityMax = Math.min(100, Math.ceil(Math.max(...humidityValues) + 5));
        setHumidityRange({ min: humidityMin, max: humidityMax });
        
        // Set soil moisture range
        const soilValues = filteredData.map(item => item.soilMoisture);
        const soilMin = Math.floor(Math.min(...soilValues) - 100);
        const soilMax = Math.ceil(Math.max(...soilValues) + 100);
        setSoilRange({ min: soilMin > 0 ? soilMin : 0, max: soilMax });
      }
    }
  }, [data, timeFilter]);
  
  // Initialize animation after mounting
  useEffect(() => {
    // Disable animation after initial render for better performance
    const timer = setTimeout(() => {
      setAnimateCharts(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);

  // Re-enable animations when changing chart types
  useEffect(() => {
    setAnimateCharts(true);
    const timer = setTimeout(() => {
      setAnimateCharts(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [chartType, expandedChart]);
  
  // Process data based on time filter
  const getFilteredData = () => {
    if (!data || !data.length) return [];
    
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
      date: formatDate(item.timestamp),
      // Convert analog soil value to percentage for display consistency
      soilMoisturePercent: Math.max(0, Math.min(100, Math.round(100 - (item.soilMoisture / 4095) * 100)))
    }));
  };
  
  // Get summary statistics
  const getSummaryStats = () => {
    if (!data || !data.length) return {
      avgTemp: 0,
      minTemp: 0,
      maxTemp: 0,
      avgHumidity: 0,
      minHumidity: 0,
      maxHumidity: 0,
      avgSoil: 0,
      minSoil: 0,
      maxSoil: 0,
      pumpOnTime: 0,
      pumpOnPercentage: 0,
      dataPoints: 0
    };
    
    const filteredData = getFilteredData();
    
    const temperatures = filteredData.map(item => item.temperature);
    const humidities = filteredData.map(item => item.humidity);
    const soilValues = filteredData.map(item => item.soilMoisture);
    const soilPercents = filteredData.map(item => Math.max(0, Math.min(100, Math.round(100 - (item.soilMoisture / 4095) * 100))));
    
    const avgTemp = temperatures.reduce((sum, val) => sum + val, 0) / temperatures.length;
    const avgHumidity = humidities.reduce((sum, val) => sum + val, 0) / humidities.length;
    const avgSoil = soilPercents.reduce((sum, val) => sum + val, 0) / soilPercents.length;
    
    // Calculate approximate pump on time (in hours)
    const pumpOnEntries = filteredData.filter(item => item.pumpStatus === 1).length;
    const pumpOnTime = (pumpOnEntries * 5) / 60; // convert to hours, assuming 5 minute intervals
    const pumpOnPercentage = (pumpOnEntries / filteredData.length) * 100;
    
    return {
      avgTemp: avgTemp.toFixed(1),
      minTemp: Math.min(...temperatures).toFixed(1),
      maxTemp: Math.max(...temperatures).toFixed(1),
      avgHumidity: avgHumidity.toFixed(1),
      minHumidity: Math.min(...humidities).toFixed(1),
      maxHumidity: Math.max(...humidities).toFixed(1),
      avgSoil: avgSoil.toFixed(1),
      minSoil: Math.min(...soilPercents).toFixed(1),
      maxSoil: Math.max(...soilPercents).toFixed(1),
      pumpOnTime: pumpOnTime.toFixed(1),
      pumpOnPercentage: pumpOnPercentage.toFixed(1),
      dataPoints: filteredData.length
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
  
  // Get date range string
  const getDateRangeString = () => {
    if (!data || !data.length) return "Tidak ada data";
    
    const chartData = getFilteredData();
    if (chartData.length === 0) return "Tidak ada data";
    
    const firstDate = new Date(chartData[0].timestamp);
    const lastDate = new Date(chartData[chartData.length - 1].timestamp);
    
    return `${firstDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} - ${lastDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}`;
  };
  
  // Toggle expanded chart view
  const toggleExpandChart = (chartType: ChartType) => {
    setExpandedChart(expandedChart === chartType ? null : chartType);
    
    // Re-enable animations when changing expanded chart
    if (expandedChart !== chartType) {
      setAnimateCharts(true);
      setTimeout(() => setAnimateCharts(false), 1000);
    }
  };
  
  const summary = getSummaryStats();
  const chartData = getFilteredData();
  
  // Configure tooltips
  const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-tooltip bg-slate-800/90 backdrop-blur-md p-3 rounded-lg shadow-lg border border-white/10 text-sm">
          <p className="font-medium text-white mb-1">{`${label}`}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center justify-between gap-4">
              <span style={{ color: entry.color }}>{entry.name}:</span>
              <span className="font-medium text-white">{entry.value}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };
  
  // Get threshold values for different metrics
  const getThresholds = () => {
    return {
      temperature: { low: 20, high: 30 },
      humidity: { low: 40, high: 80 },
      soilMoisture: { dry: 2000, wet: 1000 }, // Analog values
    };
  };
  
  const thresholds = getThresholds();

  // Get chart title and color theme based on chart type
  const getChartConfig = (type: ChartType) => {
    switch (type) {
      case 'temperature':
        return {
          title: 'Suhu Udara',
          icon: <Thermometer className="h-4 w-4 text-red-300" />,
          gradientFrom: 'from-red-900/60',
          gradientVia: 'via-orange-800/60',
          gradientTo: 'to-amber-900/60',
          iconBg: 'bg-red-500/20',
          iconBorder: 'border-red-500/30',
          color: 'text-red-300'
        };
      case 'humidity':
        return {
          title: 'Kelembapan Udara',
          icon: <Droplets className="h-4 w-4 text-blue-300" />,
          gradientFrom: 'from-blue-900/60',
          gradientVia: 'via-blue-800/60',
          gradientTo: 'to-indigo-900/60',
          iconBg: 'bg-blue-500/20',
          iconBorder: 'border-blue-500/30',
          color: 'text-blue-300'
        };
      case 'soil':
        return {
          title: 'Kelembapan Tanah',
          icon: <Sprout className="h-4 w-4 text-emerald-300" />,
          gradientFrom: 'from-emerald-900/60',
          gradientVia: 'via-green-800/60',
          gradientTo: 'to-teal-900/60',
          iconBg: 'bg-emerald-500/20',
          iconBorder: 'border-emerald-500/30',
          color: 'text-emerald-300'
        };
      case 'pump':
        return {
          title: 'Aktivitas Pompa',
          icon: <Droplet className="h-4 w-4 text-cyan-300" />,
          gradientFrom: 'from-cyan-900/60',
          gradientVia: 'via-blue-800/60',
          gradientTo: 'to-blue-900/60',
          iconBg: 'bg-cyan-500/20',
          iconBorder: 'border-cyan-500/30',
          color: 'text-cyan-300'
        };
      case 'combined':
        return {
          title: 'Semua Parameter',
          icon: <LineChartIcon className="h-4 w-4 text-purple-300" />,
          gradientFrom: 'from-purple-900/60',
          gradientVia: 'via-fuchsia-800/60',
          gradientTo: 'to-violet-900/60',
          iconBg: 'bg-purple-500/20', 
          iconBorder: 'border-purple-500/30',
          color: 'text-purple-300'
        };
      default:
        return {
          title: 'Data Sensor',
          icon: <BarChartIcon className="h-4 w-4 text-white/70" />,
          gradientFrom: 'from-blue-900/60',
          gradientVia: 'via-blue-800/60',
          gradientTo: 'to-indigo-900/60',
          iconBg: 'bg-blue-500/20',
          iconBorder: 'border-blue-500/30',
          color: 'text-blue-300'
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with time filter */}
      <div className="p-0 rounded-3xl relative overflow-hidden bg-gradient-to-br from-slate-800/60 to-slate-900/60 border border-white/10 shadow-lg mb-6">
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-purple-900/60 via-fuchsia-800/60 to-violet-900/60 px-4 py-3 border-b border-white/10">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center">
                <BarChartIcon className="h-3 w-3 text-purple-300" />
              </div>
              <span>Analisis Data Sensor</span>
            </h3>
            
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 text-xs text-white/70 bg-white/5 px-3 py-1 rounded-lg border border-white/10">
                <Calendar className="h-3.5 w-3.5" />
                <span>{getDateRangeString()}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Time Filter */}
        <div className="px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs text-white/70">
              <Clock className="h-3.5 w-3.5" />
              <span>Filter Waktu:</span>
            </div>
          </div>
          
          <div className="flex gap-1.5">
            <button 
              onClick={() => setTimeFilter('24h')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                timeFilter === '24h' 
                ? 'bg-gradient-to-r from-purple-600/80 to-fuchsia-600/80 text-white' 
                : 'bg-white/5 text-white/70 hover:bg-white/10'
              }`}
            >
              24 Jam
            </button>
            <button 
              onClick={() => setTimeFilter('7d')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                timeFilter === '7d' 
                ? 'bg-gradient-to-r from-purple-600/80 to-fuchsia-600/80 text-white' 
                : 'bg-white/5 text-white/70 hover:bg-white/10'
              }`}
            >
              7 Hari
            </button>
            <button 
              onClick={() => setTimeFilter('30d')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                timeFilter === '30d' 
                ? 'bg-gradient-to-r from-purple-600/80 to-fuchsia-600/80 text-white' 
                : 'bg-white/5 text-white/70 hover:bg-white/10'
              }`}
            >
              30 Hari
            </button>
            <button 
              onClick={() => setTimeFilter('all')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                timeFilter === 'all' 
                ? 'bg-gradient-to-r from-purple-600/80 to-fuchsia-600/80 text-white' 
                : 'bg-white/5 text-white/70 hover:bg-white/10'
              }`}
            >
              Semua
            </button>
          </div>
          
          <div className="flex gap-1.5">
            <button 
              onClick={() => setChartType('line')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors ${
                chartType === 'line' 
                ? 'bg-white/10 text-white border border-purple-500/30' 
                : 'bg-white/5 text-white/70 hover:bg-white/10'
              }`}
            >
              <LineChartIcon className="h-3 w-3" />
              Line
            </button>
            <button 
              onClick={() => setChartType('area')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors ${
                chartType === 'area' 
                ? 'bg-white/10 text-white border border-purple-500/30' 
                : 'bg-white/5 text-white/70 hover:bg-white/10'
              }`}
            >
              <AreaChartIcon className="h-3 w-3" />
              Area
            </button>
            <button 
              onClick={() => setChartType('bar')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors ${
                chartType === 'bar' 
                ? 'bg-white/10 text-white border border-purple-500/30' 
                : 'bg-white/5 text-white/70 hover:bg-white/10'
              }`}
            >
              <BarChartIcon className="h-3 w-3" />
              Bar
            </button>
          </div>
        </div>

        {/* Summary Stats Info */}
        <div className="px-4 py-3 border-t border-white/10 bg-black/20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                <GaugeCircle className="h-4 w-4 text-purple-300" />
              </div>
              <div>
                <div className="text-xs text-white/60">Data Points</div>
                <div className="text-sm font-medium text-white">{summary.dataPoints}</div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                <Thermometer className="h-4 w-4 text-red-300" />
              </div>
              <div>
                <div className="text-xs text-white/60">Suhu Rata-rata</div>
                <div className="text-sm font-medium text-white">{summary.avgTemp}°C</div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                <Droplets className="h-4 w-4 text-blue-300" />
              </div>
              <div>
                <div className="text-xs text-white/60">Kelembapan</div>
                <div className="text-sm font-medium text-white">{summary.avgHumidity}%</div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                <Droplet className="h-4 w-4 text-cyan-300" />
              </div>
              <div>
                <div className="text-xs text-white/60">Pump Aktif</div>
                <div className="text-sm font-medium text-white">{summary.pumpOnPercentage}%</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Temperature Stats */}
        <motion.div 
          className="p-0 rounded-3xl overflow-hidden bg-gradient-to-br from-slate-800/60 to-slate-900/60 border border-white/10 shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          whileHover={{ y: -3, boxShadow: "0 10px 25px rgba(0, 0, 0, 0.3)" }}
          onHoverStart={() => setActiveChart('temperature')}
          onHoverEnd={() => setActiveChart(null)}
        >
          {/* Header Bar */}
          <div className="bg-gradient-to-r from-red-900/60 via-orange-800/60 to-amber-900/60 px-4 py-2 border-b border-white/10">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-sm text-white flex items-center gap-2">
                <Thermometer className="h-3.5 w-3.5 text-red-300" />
                <span>Suhu Udara</span>
              </h3>
              
              <div className="px-2 py-0.5 rounded-lg text-[10px] font-medium border bg-red-500/20 text-red-300 border-red-500/30">
                °C
              </div>
            </div>
          </div>
          
          <div className="p-4">
            <div className="flex justify-between items-center mb-2">
              <div className="text-2xl font-bold text-white">{summary.avgTemp}°</div>
              
              <div className="flex gap-2">
                <div className="flex items-center gap-1 bg-white/5 rounded px-2 py-1 text-white/70 text-xs">
                  <ArrowDown className="h-3 w-3 text-blue-400" />
                  <span>{summary.minTemp}°</span>
                </div>
                <div className="flex items-center gap-1 bg-white/5 rounded px-2 py-1 text-white/70 text-xs">
                  <ArrowUp className="h-3 w-3 text-red-400" />
                  <span>{summary.maxTemp}°</span>
                </div>
              </div>
            </div>
            
            <div className="text-xs text-white/70 mb-3">Rata-rata suhu</div>
            
            {/* Mini Sparkline */}
            <div className="h-12 w-full overflow-hidden">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                    <defs>
                      <linearGradient id="tempGradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#ef4444" stopOpacity={0.8} />
                        <stop offset="100%" stopColor="#f87171" stopOpacity={0.8} />
                      </linearGradient>
                    </defs>
                    <Line 
                      type="monotone" 
                      dataKey="temperature" 
                      stroke="url(#tempGradient)" 
                      strokeWidth={1.5} 
                      dot={false} 
                      isAnimationActive={animateCharts}
                      animationDuration={1500}
                      animationEasing="ease-in-out"
                    />
                    <ReferenceLine y={thresholds.temperature.high} stroke="#ef4444" strokeOpacity={0.3} strokeDasharray="3 3" />
                    <ReferenceLine y={thresholds.temperature.low} stroke="#3b82f6" strokeOpacity={0.3} strokeDasharray="3 3" />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full w-full flex items-center justify-center text-white/30 text-xs">
                  Tidak ada data
                </div>
              )}
            </div>
            
            {/* Action button */}
            <button 
              onClick={() => toggleExpandChart('temperature')}
              className="w-full mt-3 py-1.5 px-3 rounded-lg text-xs bg-gradient-to-r from-red-500/20 to-red-600/20 hover:from-red-500/30 hover:to-red-600/30 border border-red-500/20 text-white/80 transition-all duration-200 hover:shadow-md"
            >
              <div className="flex items-center justify-center gap-1.5">
                <Maximize2 className="h-3 w-3" />
                <span>Lihat Detail</span>
              </div>
            </button>
          </div>
        </motion.div>
        
        {/* Humidity Stats */}
        <motion.div 
          className="p-0 rounded-3xl overflow-hidden bg-gradient-to-br from-slate-800/60 to-slate-900/60 border border-white/10 shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          whileHover={{ y: -3, boxShadow: "0 10px 25px rgba(0, 0, 0, 0.3)" }}
          onHoverStart={() => setActiveChart('humidity')}
          onHoverEnd={() => setActiveChart(null)}
        >
          {/* Header Bar */}
          <div className="bg-gradient-to-r from-blue-900/60 via-blue-800/60 to-indigo-900/60 px-4 py-2 border-b border-white/10">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-sm text-white flex items-center gap-2">
                <Droplets className="h-3.5 w-3.5 text-blue-300" />
                <span>Kelembapan Udara</span>
              </h3>
              
              <div className="px-2 py-0.5 rounded-lg text-[10px] font-medium border bg-blue-500/20 text-blue-300 border-blue-500/30">
                %
              </div>
            </div>
          </div>
          
          <div className="p-4">
            <div className="flex justify-between items-center mb-2">
              <div className="text-2xl font-bold text-white">{summary.avgHumidity}%</div>
              
              <div className="flex gap-2">
                <div className="flex items-center gap-1 bg-white/5 rounded px-2 py-1 text-white/70 text-xs">
                  <ArrowDown className="h-3 w-3 text-amber-400" />
                  <span>{summary.minHumidity}%</span>
                </div>
                <div className="flex items-center gap-1 bg-white/5 rounded px-2 py-1 text-white/70 text-xs">
                  <ArrowUp className="h-3 w-3 text-blue-400" />
                  <span>{summary.maxHumidity}%</span>
                </div>
              </div>
            </div>
            
            <div className="text-xs text-white/70 mb-3">Rata-rata kelembapan udara</div>
            
            {/* Mini Sparkline */}
            <div className="h-12 w-full overflow-hidden">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                    <defs>
                      <linearGradient id="humidityGradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.8} />
                        <stop offset="100%" stopColor="#60a5fa" stopOpacity={0.8} />
                      </linearGradient>
                    </defs>
                    <Line 
                      type="monotone" 
                      dataKey="humidity" 
                      stroke="url(#humidityGradient)" 
                      strokeWidth={1.5} 
                      dot={false} 
                      isAnimationActive={animateCharts}
                      animationDuration={1500}
                      animationEasing="ease-in-out"
                    />
                    <ReferenceLine y={thresholds.humidity.high} stroke="#3b82f6" strokeOpacity={0.3} strokeDasharray="3 3" />
                    <ReferenceLine y={thresholds.humidity.low} stroke="#f59e0b" strokeOpacity={0.3} strokeDasharray="3 3" />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full w-full flex items-center justify-center text-white/30 text-xs">
                  Tidak ada data
                </div>
              )}
            </div>
            
            {/* Action button */}
            <button 
              onClick={() => toggleExpandChart('humidity')}
              className="w-full mt-3 py-1.5 px-3 rounded-lg text-xs bg-gradient-to-r from-blue-500/20 to-blue-600/20 hover:from-blue-500/30 hover:to-blue-600/30 border border-blue-500/20 text-white/80 transition-all duration-200 hover:shadow-md"
            >
              <div className="flex items-center justify-center gap-1.5">
                <Maximize2 className="h-3 w-3" />
                <span>Lihat Detail</span>
              </div>
            </button>
          </div>
        </motion.div>
        
        {/* Soil Moisture Stats */}
        <motion.div 
          className="p-0 rounded-3xl overflow-hidden bg-gradient-to-br from-slate-800/60 to-slate-900/60 border border-white/10 shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          whileHover={{ y: -3, boxShadow: "0 10px 25px rgba(0, 0, 0, 0.3)" }}
          onHoverStart={() => setActiveChart('soil')}
          onHoverEnd={() => setActiveChart(null)}
        >
          {/* Header Bar */}
          <div className="bg-gradient-to-r from-emerald-900/60 via-green-800/60 to-teal-900/60 px-4 py-2 border-b border-white/10">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-sm text-white flex items-center gap-2">
                <Sprout className="h-3.5 w-3.5 text-emerald-300" />
                <span>Kelembapan Tanah</span>
              </h3>
              
              <div className="px-2 py-0.5 rounded-lg text-[10px] font-medium border bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
                %
              </div>
            </div>
          </div>
          
          <div className="p-4">
            <div className="flex justify-between items-center mb-2">
              <div className="text-2xl font-bold text-white">{summary.avgSoil}%</div>
              
              <div className="flex items-center gap-0.5 text-white/50 text-xs">
                <span>~</span>
                <span>{(4095 - (parseInt(String(summary.avgSoil)) * 40.95)).toFixed(0)}</span>
                <span className="text-[10px]">analog</span>
              </div>
            </div>
            
            <div className="text-xs text-white/70 mb-3">Rata-rata kelembapan tanah</div>
            
            {/* Mini Sparkline */}
            <div className="h-12 w-full overflow-hidden">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                    <defs>
                      <linearGradient id="soilGradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#10b981" stopOpacity={0.8} />
                        <stop offset="100%" stopColor="#34d399" stopOpacity={0.8} />
                      </linearGradient>
                    </defs>
                    <Line 
                      type="monotone" 
                      dataKey="soilMoisturePercent" 
                      stroke="url(#soilGradient)" 
                      strokeWidth={1.5} 
                      dot={false} 
                      isAnimationActive={animateCharts}
                      animationDuration={1500}
                      animationEasing="ease-in-out"
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full w-full flex items-center justify-center text-white/30 text-xs">
                  Tidak ada data
                </div>
              )}
            </div>
            
            {/* Action button */}
            <button 
              onClick={() => toggleExpandChart('soil')}
              className="w-full mt-3 py-1.5 px-3 rounded-lg text-xs bg-gradient-to-r from-emerald-500/20 to-emerald-600/20 hover:from-emerald-500/30 hover:to-emerald-600/30 border border-emerald-500/20 text-white/80 transition-all duration-200 hover:shadow-md"
            >
              <div className="flex items-center justify-center gap-1.5">
                <Maximize2 className="h-3 w-3" />
                <span>Lihat Detail</span>
              </div>
            </button>
          </div>
        </motion.div>
        
        {/* Pump Activity Stats */}
        <motion.div 
          className="p-0 rounded-3xl overflow-hidden bg-gradient-to-br from-slate-800/60 to-slate-900/60 border border-white/10 shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          whileHover={{ y: -3, boxShadow: "0 10px 25px rgba(0, 0, 0, 0.3)" }}
          onHoverStart={() => setActiveChart('pump')}
          onHoverEnd={() => setActiveChart(null)}
        >
          {/* Header Bar */}
          <div className="bg-gradient-to-r from-cyan-900/60 via-blue-800/60 to-blue-900/60 px-4 py-2 border-b border-white/10">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-sm text-white flex items-center gap-2">
                <Droplet className="h-3.5 w-3.5 text-cyan-300" />
                <span>Aktivitas Pompa</span>
              </h3>
              
              <div className="px-2 py-0.5 rounded-lg text-[10px] font-medium border bg-cyan-500/20 text-cyan-300 border-cyan-500/30">
                jam
              </div>
            </div>
          </div>
          
          <div className="p-4">
            <div className="flex justify-between items-center mb-2">
              <div className="text-2xl font-bold text-white">{summary.pumpOnTime}</div>
              
              <div className="flex items-center gap-1 bg-white/5 rounded px-2 py-1 text-white/70 text-xs">
                <GaugeCircle className="h-3 w-3 text-cyan-400" />
                <span>{summary.pumpOnPercentage}% aktif</span>
              </div>
            </div>
            
            <div className="text-xs text-white/70 mb-3">Total waktu pompa aktif</div>
            
            {/* Mini Sparkline */}
            <div className="h-12 w-full overflow-hidden">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                    <defs>
                      <linearGradient id="pumpGradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.8} />
                        <stop offset="100%" stopColor="#22d3ee" stopOpacity={0.8} />
                      </linearGradient>
                    </defs>
                    <Bar 
                      dataKey="pumpStatus" 
                      fill="url(#pumpGradient)" 
                      isAnimationActive={animateCharts}
                      animationDuration={1500}
                      animationEasing="ease-in-out"
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full w-full flex items-center justify-center text-white/30 text-xs">
                  Tidak ada data
                </div>
              )}
            </div>
            
            {/* Action button */}
            <button 
              onClick={() => toggleExpandChart('pump')}
              className="w-full mt-3 py-1.5 px-3 rounded-lg text-xs bg-gradient-to-r from-cyan-500/20 to-cyan-600/20 hover:from-cyan-500/30 hover:to-cyan-600/30 border border-cyan-500/20 text-white/80 transition-all duration-200 hover:shadow-md"
            >
              <div className="flex items-center justify-center gap-1.5">
                <Maximize2 className="h-3 w-3" />
                <span>Lihat Detail</span>
              </div>
            </button>
          </div>
        </motion.div>
      </div>
      
      {/* Combined Chart Button - Only when no expanded chart */}
      {!expandedChart && (
        <motion.button
          className="w-full py-2 px-3 bg-gradient-to-r from-purple-900/30 to-fuchsia-900/30 hover:from-purple-900/40 hover:to-fuchsia-900/40 rounded-xl border border-purple-500/20 text-white/80 transition-colors"
          onClick={() => toggleExpandChart('combined')}
          whileHover={{ y: -2 }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center justify-center gap-2">
            <LineChartIcon className="h-4 w-4" />
            <span>Lihat Semua Parameter</span>
          </div>
        </motion.button>
      )}
      
      {/* Main charts */}
      <AnimatePresence mode="wait">
        {expandedChart ? (
          // Expanded Chart View
          <motion.div
            key="expanded-chart"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            className="p-0 rounded-3xl overflow-hidden bg-gradient-to-br from-slate-800/60 to-slate-900/60 border border-white/10 shadow-lg"
          >
            {/* Chart Header */}
            <div className={`bg-gradient-to-r ${getChartConfig(expandedChart).gradientFrom} ${getChartConfig(expandedChart).gradientVia} ${getChartConfig(expandedChart).gradientTo} px-4 py-3 border-b border-white/10`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-full ${getChartConfig(expandedChart).iconBg} border ${getChartConfig(expandedChart).iconBorder} flex items-center justify-center`}>
                    {getChartConfig(expandedChart).icon}
                  </div>
                  <h3 className="font-bold text-white">{getChartConfig(expandedChart).title}</h3>
                </div>
                
                <button 
                  onClick={() => setExpandedChart(null)}
                  className="p-1.5 rounded-full hover:bg-white/10 transition-colors"
                >
                  <X className="h-4 w-4 text-white/70" />
                </button>
              </div>
            </div>
            
            {/* Chart Content */}
            <div className="p-6">
              <div className="h-80 relative overflow-hidden rounded-md mb-4">
                {chartData.length > 0 ? (
                  expandedChart === 'temperature' ? (
                    <ResponsiveContainer width="100%" height="100%">
                      {chartType === 'line' ? (
                        <LineChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                          <XAxis 
                            dataKey="time" 
                            tick={{ fontSize: 12, fill: 'rgba(255, 255, 255, 0.7)' }} 
                            tickMargin={10} 
                            stroke="rgba(255, 255, 255, 0.3)"
                          />
                          <YAxis 
                            domain={[tempRange.min, tempRange.max]}
                            stroke="rgba(255, 255, 255, 0.3)" 
                            tick={{ fill: 'rgba(255, 255, 255, 0.7)' }}
                          />
                          <Tooltip content={<CustomTooltip />} />
                          <Legend />
                          <ReferenceLine y={thresholds.temperature.high} stroke="#ef4444" strokeDasharray="3 3" label={{ value: 'Terlalu Panas', position: 'right', fill: '#ef4444', fontSize: 12 }} />
                          <ReferenceLine y={thresholds.temperature.low} stroke="#3b82f6" strokeDasharray="3 3" label={{ value: 'Terlalu Dingin', position: 'right', fill: '#3b82f6', fontSize: 12 }} />
                          <Line
                            type="monotone"
                            dataKey="temperature"
                            name="Suhu (°C)"
                            stroke="#ef4444"
                            strokeWidth={2}
                            dot={{ r: 2 }}
                            activeDot={{ r: 6, strokeWidth: 0 }}
                            isAnimationActive={animateCharts}
                            animationDuration={1500}
                            animationEasing="ease-in-out"
                          />
                        </LineChart>
                      ) : chartType === 'area' ? (
                        <AreaChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                          <XAxis 
                            dataKey="time" 
                            tick={{ fontSize: 12, fill: 'rgba(255, 255, 255, 0.7)' }} 
                            tickMargin={10} 
                            stroke="rgba(255, 255, 255, 0.3)"
                          />
                          <YAxis 
                            domain={[tempRange.min, tempRange.max]}
                            stroke="rgba(255, 255, 255, 0.3)" 
                            tick={{ fill: 'rgba(255, 255, 255, 0.7)' }}
                          />
                          <Tooltip content={<CustomTooltip />} />
                          <Legend />
                          <ReferenceLine y={thresholds.temperature.high} stroke="#ef4444" strokeDasharray="3 3" label={{ value: 'Terlalu Panas', position: 'right', fill: '#ef4444', fontSize: 12 }} />
                          <ReferenceLine y={thresholds.temperature.low} stroke="#3b82f6" strokeDasharray="3 3" label={{ value: 'Terlalu Dingin', position: 'right', fill: '#3b82f6', fontSize: 12 }} />
                          <defs>
                            <linearGradient id="tempColorArea" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                              <stop offset="95%" stopColor="#ef4444" stopOpacity={0.2}/>
                            </linearGradient>
                          </defs>
                          <Area
                            type="monotone"
                            dataKey="temperature"
                            name="Suhu (°C)"
                            stroke="#ef4444"
                            fillOpacity={1}
                            fill="url(#tempColorArea)"
                            isAnimationActive={animateCharts}
                            animationDuration={1500}
                          />
                        </AreaChart>
                      ) : (
                        <BarChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                          <XAxis 
                            dataKey="time" 
                            tick={{ fontSize: 12, fill: 'rgba(255, 255, 255, 0.7)' }} 
                            tickMargin={10} 
                            stroke="rgba(255, 255, 255, 0.3)"
                          />
                          <YAxis 
                            domain={[tempRange.min, tempRange.max]}
                            stroke="rgba(255, 255, 255, 0.3)" 
                            tick={{ fill: 'rgba(255, 255, 255, 0.7)' }}
                          />
                          <Tooltip content={<CustomTooltip />} />
                          <Legend />
                          <ReferenceLine y={thresholds.temperature.high} stroke="#ef4444" strokeDasharray="3 3" label={{ value: 'Terlalu Panas', position: 'right', fill: '#ef4444', fontSize: 12 }} />
                          <ReferenceLine y={thresholds.temperature.low} stroke="#3b82f6" strokeDasharray="3 3" label={{ value: 'Terlalu Dingin', position: 'right', fill: '#3b82f6', fontSize: 12 }} />
                          <defs>
                            <linearGradient id="tempColorBar" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                              <stop offset="95%" stopColor="#ef4444" stopOpacity={0.5}/>
                            </linearGradient>
                          </defs>
                          <Bar
                            dataKey="temperature"
                            name="Suhu (°C)"
                            fill="url(#tempColorBar)"
                            radius={[4, 4, 0, 0]}
                            barSize={8}
                            isAnimationActive={animateCharts}
                            animationDuration={1500}
                          />
                        </BarChart>
                      )}
                    </ResponsiveContainer>
                  ) : expandedChart === 'humidity' ? (
                    <ResponsiveContainer width="100%" height="100%">
                      {chartType === 'line' ? (
                        <LineChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                          <XAxis 
                            dataKey="time" 
                            tick={{ fontSize: 12, fill: 'rgba(255, 255, 255, 0.7)' }} 
                            tickMargin={10} 
                            stroke="rgba(255, 255, 255, 0.3)"
                          />
                          <YAxis 
                            domain={[humidityRange.min, humidityRange.max]}
                            stroke="rgba(255, 255, 255, 0.3)" 
                            tick={{ fill: 'rgba(255, 255, 255, 0.7)' }}
                          />
                          <Tooltip content={<CustomTooltip />} />
                          <Legend />
                          <ReferenceLine y={thresholds.humidity.high} stroke="#3b82f6" strokeDasharray="3 3" label={{ value: 'Terlalu Lembap', position: 'right', fill: '#3b82f6', fontSize: 12 }} />
                          <ReferenceLine y={thresholds.humidity.low} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: 'Terlalu Kering', position: 'right', fill: '#f59e0b', fontSize: 12 }} />
                          <Line
                            type="monotone"
                            dataKey="humidity"
                            name="Kelembapan (%)"
                            stroke="#3b82f6"
                            strokeWidth={2}
                            dot={{ r: 2 }}
                            activeDot={{ r: 6 }}
                            isAnimationActive={animateCharts}
                            animationDuration={1500}
                          />
                        </LineChart>
                      ) : chartType === 'area' ? (
                        <AreaChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                          <XAxis 
                            dataKey="time" 
                            tick={{ fontSize: 12, fill: 'rgba(255, 255, 255, 0.7)' }} 
                            tickMargin={10} 
                            stroke="rgba(255, 255, 255, 0.3)"
                          />
                          <YAxis 
                            domain={[humidityRange.min, humidityRange.max]}
                            stroke="rgba(255, 255, 255, 0.3)" 
                            tick={{ fill: 'rgba(255, 255, 255, 0.7)' }}
                          />
                          <Tooltip content={<CustomTooltip />} />
                          <Legend />
                          <ReferenceLine y={thresholds.humidity.high} stroke="#3b82f6" strokeDasharray="3 3" label={{ value: 'Terlalu Lembap', position: 'right', fill: '#3b82f6', fontSize: 12 }} />
                          <ReferenceLine y={thresholds.humidity.low} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: 'Terlalu Kering', position: 'right', fill: '#f59e0b', fontSize: 12 }} />
                          <defs>
                            <linearGradient id="humidColorArea" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.2}/>
                            </linearGradient>
                          </defs>
                          <Area
                            type="monotone"
                            dataKey="humidity"
                            name="Kelembapan (%)"
                            stroke="#3b82f6"
                            fillOpacity={1}
                            fill="url(#humidColorArea)"
                            isAnimationActive={animateCharts}
                            animationDuration={1500}
                          />
                        </AreaChart>
                      ) : (
                        <BarChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                          <XAxis 
                            dataKey="time" 
                            tick={{ fontSize: 12, fill: 'rgba(255, 255, 255, 0.7)' }} 
                            tickMargin={10} 
                            stroke="rgba(255, 255, 255, 0.3)"
                          />
                          <YAxis 
                            domain={[humidityRange.min, humidityRange.max]}
                            stroke="rgba(255, 255, 255, 0.3)" 
                            tick={{ fill: 'rgba(255, 255, 255, 0.7)' }}
                          />
                          <Tooltip content={<CustomTooltip />} />
                          <Legend />
                          <ReferenceLine y={thresholds.humidity.high} stroke="#3b82f6" strokeDasharray="3 3" label={{ value: 'Terlalu Lembap', position: 'right', fill: '#3b82f6', fontSize: 12 }} />
                          <ReferenceLine y={thresholds.humidity.low} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: 'Terlalu Kering', position: 'right', fill: '#f59e0b', fontSize: 12 }} />
                          <defs>
                            <linearGradient id="humidColorBar" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.5}/>
                            </linearGradient>
                          </defs>
                          <Bar
                            dataKey="humidity"
                            name="Kelembapan (%)"
                            fill="url(#humidColorBar)"
                            radius={[4, 4, 0, 0]}
                            barSize={8}
                            isAnimationActive={animateCharts}
                            animationDuration={1500}
                          />
                        </BarChart>
                      )}
                    </ResponsiveContainer>
                  ) : expandedChart === 'soil' ? (
                    <ResponsiveContainer width="100%" height="100%">
                      {chartType === 'line' ? (
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
                            orientation="left"
                            domain={[0, 100]}
                            stroke="#10b981" 
                            tick={{ fill: 'rgba(255, 255, 255, 0.7)' }}
                          />
                          <YAxis 
                            yAxisId="right"
                            orientation="right"
                            domain={[4095, 0]}
                            stroke="rgba(255, 255, 255, 0.3)" 
                            tick={{ fill: 'rgba(255, 255, 255, 0.7)' }}
                          />
                          <Tooltip content={<CustomTooltip />} />
                          <Legend />
                          <Line
                            yAxisId="left"
                            type="monotone"
                            dataKey="soilMoisturePercent"
                            name="Kelembapan (%)"
                            stroke="#10b981"
                            strokeWidth={2}
                            dot={{ r: 2 }}
                            activeDot={{ r: 6 }}
                            isAnimationActive={animateCharts}
                            animationDuration={1500}
                          />
                          <Line
                            yAxisId="right"
                            type="monotone"
                            dataKey="soilMoisture"
                            name="Nilai Analog"
                            stroke="#94a3b8"
                            strokeWidth={1.5}
                            strokeDasharray="5 5"
                            dot={false}
                            isAnimationActive={animateCharts}
                            animationDuration={1500}
                          />
                        </LineChart>
                      ) : chartType === 'area' ? (
                        <AreaChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                          <XAxis 
                            dataKey="time" 
                            tick={{ fontSize: 12, fill: 'rgba(255, 255, 255, 0.7)' }} 
                            tickMargin={10} 
                            stroke="rgba(255, 255, 255, 0.3)"
                          />
                          <YAxis 
                            domain={[0, 100]}
                            stroke="#10b981" 
                            tick={{ fill: 'rgba(255, 255, 255, 0.7)' }}
                          />
                          <Tooltip content={<CustomTooltip />} />
                          <Legend />
                          <defs>
                            <linearGradient id="soilColorArea" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                              <stop offset="95%" stopColor="#10b981" stopOpacity={0.2}/>
                            </linearGradient>
                          </defs>
                          <Area
                            type="monotone"
                            dataKey="soilMoisturePercent"
                            name="Kelembapan Tanah (%)"
                            stroke="#10b981"
                            fillOpacity={1}
                            fill="url(#soilColorArea)"
                            isAnimationActive={animateCharts}
                            animationDuration={1500}
                          />
                        </AreaChart>
                      ) : (
                        <BarChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                          <XAxis 
                            dataKey="time" 
                            tick={{ fontSize: 12, fill: 'rgba(255, 255, 255, 0.7)' }} 
                            tickMargin={10} 
                            stroke="rgba(255, 255, 255, 0.3)"
                          />
                          <YAxis 
                            domain={[0, 100]}
                            stroke="#10b981" 
                            tick={{ fill: 'rgba(255, 255, 255, 0.7)' }}
                          />
                          <Tooltip content={<CustomTooltip />} />
                          <Legend />
                          <defs>
                            <linearGradient id="soilColorBar" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                              <stop offset="95%" stopColor="#10b981" stopOpacity={0.5}/>
                            </linearGradient>
                          </defs>
                          <Bar
                            dataKey="soilMoisturePercent"
                            name="Kelembapan Tanah (%)"
                            fill="url(#soilColorBar)"
                            radius={[4, 4, 0, 0]}
                            barSize={8}
                            isAnimationActive={animateCharts}
                            animationDuration={1500}
                          />
                        </BarChart>
                      )}
                    </ResponsiveContainer>
                  ) : expandedChart === 'pump' ? (
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
                          <linearGradient id="pumpGradientLarge" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.6}/>
                          </linearGradient>
                        </defs>
                        <Bar 
                          dataKey="pumpStatus" 
                          name="Status Pompa" 
                          fill="url(#pumpGradientLarge)" 
                          radius={[4, 4, 0, 0]}
                          isAnimationActive={animateCharts}
                          animationDuration={1500}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
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
                          yAxisId="temp"
                          orientation="left"
                          domain={[tempRange.min, tempRange.max]}
                          stroke="#ef4444" 
                          tick={{ fill: 'rgba(255, 255, 255, 0.7)' }}
                        />
                        <YAxis 
                          yAxisId="humid"
                          orientation="right"
                          domain={[humidityRange.min, humidityRange.max]}
                          stroke="#3b82f6" 
                          tick={{ fill: 'rgba(255, 255, 255, 0.7)' }}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Line
                          yAxisId="temp"
                          type="monotone"
                          dataKey="temperature"
                          name="Suhu (°C)"
                          stroke="#ef4444"
                          strokeWidth={2}
                          dot={{ r: 2 }}
                          activeDot={{ r: 5 }}
                          isAnimationActive={animateCharts}
                          animationDuration={1500}
                        />
                        <Line
                          yAxisId="humid"
                          type="monotone"
                          dataKey="humidity"
                          name="Kelembapan (%)"
                          stroke="#3b82f6"
                          strokeWidth={2}
                          dot={{ r: 2 }}
                          activeDot={{ r: 5 }}
                          isAnimationActive={animateCharts}
                          animationDuration={1500}
                        />
                        <Line
                          yAxisId="humid"
                          type="monotone"
                          dataKey="soilMoisturePercent"
                          name="Kelembapan Tanah (%)"
                          stroke="#10b981"
                          strokeWidth={2}
                          dot={{ r: 2 }}
                          activeDot={{ r: 5 }}
                          isAnimationActive={animateCharts}
                          animationDuration={1500}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  )
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-white/30 text-sm bg-white/5 rounded-lg border border-white/10">
                    Tidak ada data yang tersedia untuk ditampilkan
                  </div>
                )}
              </div>
              
              {/* Chart Controls */}
              <div className="flex flex-wrap justify-between gap-4">
                <div className="flex items-center gap-3">
                  {/* Chart Type Selector */}
                  <div className="rounded-lg bg-white/5 p-1 flex border border-white/10">
                    <button 
                      onClick={() => setChartType('line')}
                      className={`px-3 py-1 rounded-md text-xs flex items-center gap-1.5 transition-colors ${
                        chartType === 'line' 
                        ? 'bg-white/10 text-white' 
                        : 'text-white/70 hover:bg-white/5'
                      }`}
                    >
                      <LineChartIcon className="h-3 w-3" />
                      <span>Line</span>
                    </button>
                    <button 
                      onClick={() => setChartType('area')}
                      className={`px-3 py-1 rounded-md text-xs flex items-center gap-1.5 transition-colors ${
                        chartType === 'area' 
                        ? 'bg-white/10 text-white' 
                        : 'text-white/70 hover:bg-white/5'
                      }`}
                    >
                      <AreaChartIcon className="h-3 w-3" />
                      <span>Area</span>
                    </button>
                    <button 
                      onClick={() => setChartType('bar')}
                      className={`px-3 py-1 rounded-md text-xs flex items-center gap-1.5 transition-colors ${
                        chartType === 'bar' 
                        ? 'bg-white/10 text-white' 
                        : 'text-white/70 hover:bg-white/5'
                      }`}
                    >
                      <BarChartIcon className="h-3 w-3" />
                      <span>Bar</span>
                    </button>
                  </div>
                </div>
                
                <button 
                  onClick={() => setExpandedChart(null)}
                  className="px-4 py-1.5 rounded-lg text-xs flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white/80 transition-colors border border-white/10"
                >
                  <span>Tutup Detail</span>
                  <X className="h-3 w-3" />
                </button>
              </div>
              
              {/* Data Statistics for the chart */}
              <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 bg-white/5 p-4 rounded-xl border border-white/10">
                {expandedChart === 'temperature' && (
                  <>
                    <div>
                      <div className="text-xs text-white/60">Rata-rata</div>
                      <div className="text-lg font-medium text-white">{summary.avgTemp}°C</div>
                    </div>
                    <div>
                      <div className="text-xs text-white/60">Minimum</div>
                      <div className="text-lg font-medium text-white">{summary.minTemp}°C</div>
                    </div>
                    <div>
                      <div className="text-xs text-white/60">Maximum</div>
                      <div className="text-lg font-medium text-white">{summary.maxTemp}°C</div>
                    </div>
                    <div>
                      <div className="text-xs text-white/60">Rentang</div>
                      <div className="text-lg font-medium text-white">{(Number(summary.maxTemp) - Number(summary.minTemp)).toFixed(1)}°C</div>
                    </div>
                  </>
                )}
                
                {expandedChart === 'humidity' && (
                  <>
                    <div>
                      <div className="text-xs text-white/60">Rata-rata</div>
                      <div className="text-lg font-medium text-white">{summary.avgHumidity}%</div>
                    </div>
                    <div>
                      <div className="text-xs text-white/60">Minimum</div>
                      <div className="text-lg font-medium text-white">{summary.minHumidity}%</div>
                    </div>
                    <div>
                      <div className="text-xs text-white/60">Maximum</div>
                      <div className="text-lg font-medium text-white">{summary.maxHumidity}%</div>
                    </div>
                    <div>
                      <div className="text-xs text-white/60">Rentang</div>
                      <div className="text-lg font-medium text-white">{(Number(summary.maxHumidity) - Number(summary.minHumidity)).toFixed(1)}%</div>
                    </div>
                  </>
                )}
                
                {expandedChart === 'soil' && (
                  <>
                    <div>
                      <div className="text-xs text-white/60">Rata-rata Persentase</div>
                      <div className="text-lg font-medium text-white">{summary.avgSoil}%</div>
                    </div>
                    <div>
                      <div className="text-xs text-white/60">Minimum</div>
                      <div className="text-lg font-medium text-white">{summary.minSoil}%</div>
                    </div>
                    <div>
                      <div className="text-xs text-white/60">Maximum</div>
                      <div className="text-lg font-medium text-white">{summary.maxSoil}%</div>
                    </div>
                    <div>
                      <div className="text-xs text-white/60">Nilai Analog</div>
                      <div className="text-lg font-medium text-white">~{(4095 - (parseInt(String(summary.avgSoil)) * 40.95)).toFixed(0)}</div>
                    </div>
                  </>
                )}
                
                {expandedChart === 'pump' && (
                  <>
                    <div>
                      <div className="text-xs text-white/60">Waktu Aktif</div>
                      <div className="text-lg font-medium text-white">{summary.pumpOnTime} jam</div>
                    </div>
                    <div>
                      <div className="text-xs text-white/60">Persentase Aktif</div>
                      <div className="text-lg font-medium text-white">{summary.pumpOnPercentage}%</div>
                    </div>
                    <div>
                      <div className="text-xs text-white/60">Total Data</div>
                      <div className="text-lg font-medium text-white">{summary.dataPoints}</div>
                    </div>
                    <div>
                      <div className="text-xs text-white/60">Periode</div>
                      <div className="text-lg font-medium text-white">
                        {timeFilter === '24h' ? '24 jam' : timeFilter === '7d' ? '7 hari' : timeFilter === '30d' ? '30 hari' : 'Semua'}
                      </div>
                    </div>
                  </>
                )}
                
                {expandedChart === 'combined' && (
                  <>
                    <div>
                      <div className="text-xs text-white/60">Suhu</div>
                      <div className="text-lg font-medium text-white">{summary.avgTemp}°C</div>
                    </div>
                    <div>
                      <div className="text-xs text-white/60">Kelembapan</div>
                      <div className="text-lg font-medium text-white">{summary.avgHumidity}%</div>
                    </div>
                    <div>
                      <div className="text-xs text-white/60">Kelembapan Tanah</div>
                      <div className="text-lg font-medium text-white">{summary.avgSoil}%</div>
                    </div>
                    <div>
                      <div className="text-xs text-white/60">Pompa Aktif</div>
                      <div className="text-lg font-medium text-white">{summary.pumpOnPercentage}%</div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        ) : (
          // Summary Chart View (when no chart is expanded)
          <motion.div
            key="summary-charts"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {/* Temperature & Humidity Chart */}
            <motion.div 
              className="p-0 rounded-3xl relative overflow-hidden bg-gradient-to-br from-slate-800/60 to-slate-900/60 border border-white/10 shadow-lg"
              whileHover={{ y: -3, boxShadow: "0 10px 25px rgba(0, 0, 0, 0.3)" }}
              animate={{
                boxShadow: activeChart === 'temperature' || activeChart === 'humidity' ? '0 10px 30px rgba(255, 255, 255, 0.1)' : 'none'
              }}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-red-900/40 via-blue-900/40 to-indigo-900/40 px-4 py-3 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-white flex items-center gap-2">
                    <div className="flex items-center -space-x-1">
                      <div className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center border border-red-500/30">
                        <Thermometer className="h-2.5 w-2.5 text-red-300" />
                      </div>
                      <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                        <Droplets className="h-2.5 w-2.5 text-blue-300" />
                      </div>
                    </div>
                    <span>Suhu & Kelembapan</span>
                  </h3>
                  
                  <button
                    className="p-1 rounded hover:bg-white/10 transition-colors"
                    onClick={() => toggleExpandChart('temperature')}
                  >
                    <Maximize2 className="h-3.5 w-3.5 text-white/70" />
                  </button>
                </div>
              </div>
              
              {/* Chart */}
              <div className="p-5">
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
                          domain={[tempRange.min, tempRange.max]}
                        />
                        <YAxis 
                          yAxisId="right" 
                          orientation="right" 
                          stroke="#3b82f6" 
                          tick={{ fill: 'rgba(255, 255, 255, 0.7)' }}
                          domain={[humidityRange.min, humidityRange.max]}
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
                          dot={false}
                          activeDot={{ r: 5, strokeWidth: 0 }}
                          isAnimationActive={animateCharts}
                        />
                        <Line
                          yAxisId="right"
                          type="monotone"
                          dataKey="humidity"
                          name="Kelembapan (%)"
                          stroke="#3b82f6"
                          strokeWidth={2}
                          dot={false}
                          activeDot={{ r: 5, strokeWidth: 0 }}
                          isAnimationActive={animateCharts}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-white/30 bg-white/5 rounded-lg border border-white/10">
                      Data tidak tersedia
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
            
            {/* Soil Moisture Chart */}
            <motion.div 
              className="p-0 rounded-3xl relative overflow-hidden bg-gradient-to-br from-slate-800/60 to-slate-900/60 border border-white/10 shadow-lg"
              whileHover={{ y: -3, boxShadow: "0 10px 25px rgba(0, 0, 0, 0.3)" }}
              animate={{
                boxShadow: activeChart === 'soil' ? '0 10px 30px rgba(255, 255, 255, 0.1)' : 'none'
              }}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-emerald-900/60 via-green-800/60 to-teal-900/60 px-4 py-3 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-white flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                      <Sprout className="h-2.5 w-2.5 text-emerald-300" />
                    </div>
                    <span>Kelembapan Tanah</span>
                  </h3>
                  
                  <button
                    className="p-1 rounded hover:bg-white/10 transition-colors"
                    onClick={() => toggleExpandChart('soil')}
                  >
                    <Maximize2 className="h-3.5 w-3.5 text-white/70" />
                  </button>
                </div>
              </div>
              
              {/* Chart */}
              <div className="p-5">
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
                          domain={[0, 100]}
                          stroke="rgba(255, 255, 255, 0.3)"
                          tick={{ fill: 'rgba(255, 255, 255, 0.7)' }}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <defs>
                          <linearGradient id="soilGradientSummary" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0.2}/>
                          </linearGradient>
                        </defs>
                        <Area
                          type="monotone"
                          dataKey="soilMoisturePercent"
                          name="Kelembapan Tanah (%)"
                          stroke="#10b981"
                          fillOpacity={1}
                          fill="url(#soilGradientSummary)"
                          isAnimationActive={animateCharts}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-white/30 bg-white/5 rounded-lg border border-white/10">
                      Data tidak tersedia
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
            
            {/* Pump Activity Chart */}
            <motion.div 
              className="p-0 rounded-3xl relative overflow-hidden bg-gradient-to-br from-slate-800/60 to-slate-900/60 border border-white/10 shadow-lg"
              whileHover={{ y: -3, boxShadow: "0 10px 25px rgba(0, 0, 0, 0.3)" }}
              animate={{
                boxShadow: activeChart === 'pump' ? '0 10px 30px rgba(255, 255, 255, 0.1)' : 'none'
              }}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-cyan-900/60 via-blue-800/60 to-blue-900/60 px-4 py-3 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-white flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-cyan-500/20 flex items-center justify-center border border-cyan-500/30">
                      <Droplet className="h-2.5 w-2.5 text-cyan-300" />
                    </div>
                    <span>Aktivitas Pompa</span>
                  </h3>
                  
                  <button
                    className="p-1 rounded hover:bg-white/10 transition-colors"
                    onClick={() => toggleExpandChart('pump')}
                  >
                    <Maximize2 className="h-3.5 w-3.5 text-white/70" />
                  </button>
                </div>
              </div>
              
              {/* Chart */}
              <div className="p-5">
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
                          <linearGradient id="pumpGradientSummary" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.6}/>
                          </linearGradient>
                        </defs>
                        <Bar 
                          dataKey="pumpStatus" 
                          name="Status Pompa" 
                          fill="url(#pumpGradientSummary)" 
                          radius={[4, 4, 0, 0]}
                          isAnimationActive={animateCharts}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-white/30 bg-white/5 rounded-lg border border-white/10">
                      Data tidak tersedia
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
            
            {/* Data Summary Panel */}
            <motion.div 
              className="p-0 rounded-3xl relative overflow-hidden bg-gradient-to-br from-slate-800/60 to-slate-900/60 border border-white/10 shadow-lg"
              whileHover={{ y: -3, boxShadow: "0 10px 25px rgba(0, 0, 0, 0.3)" }}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-purple-900/60 via-fuchsia-800/60 to-violet-900/60 px-4 py-3 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-white flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-purple-500/20 flex items-center justify-center border border-purple-500/30">
                      <PieChart className="h-2.5 w-2.5 text-purple-300" />
                    </div>
                    <span>Ringkasan Data</span>
                  </h3>
                </div>
              </div>
              
              {/* Summary Content */}
              <div className="p-5">
                <div className="h-64 relative overflow-y-auto rounded-md flex flex-col gap-3">
                  {chartData.length > 0 ? (
                    <>
                      {/* Time period info */}
                      <div className="mb-4">
                        <div className="flex items-center gap-1.5 mb-2">
                          <Calendar className="h-4 w-4 text-purple-400" />
                          <h4 className="font-medium text-white/90 text-sm">Periode Data</h4>
                        </div>
                        <div className="bg-white/5 p-3 rounded-lg border border-white/10 flex items-center justify-between">
                          <span className="text-xs text-white/70">
                            {timeFilter === '24h' ? '24 Jam Terakhir' : 
                             timeFilter === '7d' ? '7 Hari Terakhir' : 
                             timeFilter === '30d' ? '30 Hari Terakhir' : 
                             'Semua Data'}
                          </span>
                          <span className="text-xs font-medium text-white">{summary.dataPoints} data point</span>
                        </div>
                      </div>
                      
                      {/* Key statistics */}
                      <div className="flex flex-col gap-3 flex-grow">
                        <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg border border-white/10">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center">
                              <Thermometer className="h-4 w-4 text-red-300" />
                            </div>
                            <div>
                              <div className="text-xs text-white/60">Suhu</div>
                              <div className="font-medium text-white">{summary.avgTemp}°C</div>
                            </div>
                          </div>
                          <div className="text-xs text-white/60">
                            <span className="text-red-300">{summary.maxTemp}°C</span> / <span className="text-blue-300">{summary.minTemp}°C</span>
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg border border-white/10">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                              <Droplets className="h-4 w-4 text-blue-300" />
                            </div>
                            <div>
                              <div className="text-xs text-white/60">Kelembapan</div>
                              <div className="font-medium text-white">{summary.avgHumidity}%</div>
                            </div>
                          </div>
                          <div className="text-xs text-white/60">
                            <span className="text-blue-300">{summary.maxHumidity}%</span> / <span className="text-amber-300">{summary.minHumidity}%</span>
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg border border-white/10">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
                              <Sprout className="h-4 w-4 text-emerald-300" />
                            </div>
                            <div>
                              <div className="text-xs text-white/60">Kelembapan Tanah</div>
                              <div className="font-medium text-white">{summary.avgSoil}%</div>
                            </div>
                          </div>
                          <div className="text-xs text-white/60">
                            Nilai analog: ~{(4095 - (parseInt(String(summary.avgSoil)) * 40.95)).toFixed(0)}
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="h-full flex items-center justify-center text-white/30 bg-white/5 rounded-lg border border-white/10">
                      Data tidak tersedia
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Optional: Analytics Insight Panel - only shows when not in expanded mode */}
      {!expandedChart && chartData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
          className="p-0 rounded-3xl relative overflow-hidden bg-gradient-to-br from-slate-800/60 to-slate-900/60 border border-white/10 shadow-lg"
        >
          <div className="bg-gradient-to-r from-slate-900/60 via-slate-800/60 to-slate-900/60 px-4 py-3 border-b border-white/10">
            <h3 className="font-medium text-white flex items-center gap-2">
              <PieChart className="h-3.5 w-3.5 text-white/70" />
              <span>Wawasan Analitik</span>
            </h3>
          </div>
          
          <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/5 p-4 rounded-xl border border-white/10">
              <h4 className="text-sm font-medium text-white mb-2">Status Suhu</h4>
              <p className="text-xs text-white/70 leading-relaxed">
                {Number(summary.avgTemp) > 30
                  ? 'Suhu rata-rata berada di atas normal. Pertimbangkan untuk meningkatkan ventilasi atau memberikan naungan tambahan untuk tanaman Anda.'
                  : Number(summary.avgTemp) < 20
                  ? 'Suhu rata-rata berada di bawah optimal. Jika berlanjut, pertumbuhan tanaman mungkin melambat.'
                  : 'Suhu berada dalam rentang optimal untuk pertumbuhan tanaman yang sehat.'}
              </p>
            </div>
            
            <div className="bg-white/5 p-4 rounded-xl border border-white/10">
              <h4 className="text-sm font-medium text-white mb-2">Status Kelembapan</h4>
              <p className="text-xs text-white/70 leading-relaxed">
                {Number(summary.avgHumidity) > 80
                  ? 'Kelembapan udara sangat tinggi. Ini dapat meningkatkan risiko perkembangan jamur dan penyakit pada tanaman.'
                  : Number(summary.avgHumidity) < 40
                  ? 'Kelembapan udara rendah. Tanaman mungkin memerlukan penyiraman lebih sering untuk mencegah dehidrasi.'
                  : 'Kelembapan udara berada pada tingkat yang baik untuk pertumbuhan tanaman yang sehat.'}
              </p>
            </div>
            
            <div className="bg-white/5 p-4 rounded-xl border border-white/10">
              <h4 className="text-sm font-medium text-white mb-2">Penggunaan Air</h4>
              <p className="text-xs text-white/70 leading-relaxed">
                {Number(summary.pumpOnPercentage) > 50
                  ? `Pompa air aktif selama ${summary.pumpOnPercentage}% dari waktu. Ini menunjukkan penggunaan air yang tinggi, periksa sistem untuk efisiensi.`
                  : Number(summary.pumpOnPercentage) < 10
                  ? `Penggunaan pompa sangat rendah (${summary.pumpOnPercentage}%). Pastikan tanaman mendapatkan hidrasi yang cukup.`
                  : `Pompa berjalan selama ${summary.pumpOnPercentage}% dari waktu, menunjukkan penggunaan air yang efisien dan wajar.`}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}