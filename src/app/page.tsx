"use client";
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import SensorCards from "./components/SensorCards";
import PumpControl from "./components/PumpControl";
import SensorTable from "./components/SensorTable";
import SensorGraphs from "./components/SensorGraphs";
import { Leaf, Github, BarChart2, Droplets, RefreshCw, GaugeCircle, AlertCircle, Clock } from "lucide-react";
import useSWR from "swr";

type Sensor = {
  temperature: number;
  humidity: number;
  soilMoisture: number;
  pumpStatus: number;
  timestamp: string;
};

export default function HomePage() {
  const [latest, setLatest] = useState<Sensor | null>(null);
  const [history, setHistory] = useState<Sensor[]>([]);
  const [pumpStatus, setPumpStatus] = useState(0);
  const [manual, setManual] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'graphs' | 'history'>('overview');
  const [error, setError] = useState<string | null>(null);
  
  // Refs for effects
  const dashboardRef = useRef<HTMLDivElement>(null);
  const blobsRef = useRef<HTMLDivElement>(null);

  // Motion values for parallax effects
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  // Handle mouse move for subtle parallax
  const handleMouseMove = (e: React.MouseEvent) => {
    if (dashboardRef.current) {
      const rect = dashboardRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      mouseX.set(x / rect.width);
      mouseY.set(y / rect.height);
    }
  };

  // SWR fetcher function with error handling
  const fetcher = async (url: string) => {
    const res = await fetch(url);
    
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || "An error occurred");
    }
    
    return res.json();
  };
  
  // Use SWR for automatic data refreshing
  const { data: historyData, mutate: refreshHistory } = useSWR("/api/history", fetcher, {
    refreshInterval: 3000, // Refresh every 3 seconds
    dedupingInterval: 1000,
    revalidateOnFocus: true,
    onSuccess: (data) => {
      setHistory(data);
      if (data.length > 0) {
        setLatest(data[0]);
      }
      setLoading(false);
      setError(null); // Clear any previous errors
    },
    onError: (err) => {
      console.error("Error fetching history:", err);
      setLoading(false);
      setError(err.message || "Failed to fetch sensor data");
    }
  });
  
  // Use SWR for pump control data
  const { data: pumpData, mutate: refreshPump } = useSWR("/api/pump-control", fetcher, {
    refreshInterval: 1000, // Refresh every 1 second for better responsiveness
    dedupingInterval: 500,
    revalidateOnFocus: true,
    onSuccess: (data) => {
      if (data) {
        setPumpStatus(data.pumpStatus);
        setManual(data.manual);
      }
      setError(null);
    },
    onError: (error) => {
      console.error("Error fetching pump control:", error);
      setError(error.message || "Failed to fetch pump status");
    }
  });
  
  // Manual refresh handler
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([refreshHistory(), refreshPump()]);
      setError(null);
    } catch (error) {
      console.error("Error during manual refresh:", error);
      setError(error instanceof Error ? error.message : "Error refreshing data");
    } finally {
      setTimeout(() => setRefreshing(false), 800);
    }
  };

  // Transforms for parallax elements
  const blob1X = useTransform(mouseX, [0, 1], [-15, 15]);
  const blob1Y = useTransform(mouseY, [0, 1], [-15, 15]);
  
  const blob2X = useTransform(mouseX, [0, 1], [15, -15]);
  const blob2Y = useTransform(mouseY, [0, 1], [15, -15]);
  
  const blob3X = useTransform(mouseX, [0, 1], [-20, 20]); 
  const blob3Y = useTransform(mouseY, [0, 1], [20, -20]);

  return (
    <div 
      className="min-h-screen relative overflow-hidden bg-gradient-to-bl from-emerald-900/30 via-cyan-900/20 to-purple-900/30"
      onMouseMove={handleMouseMove}
      ref={dashboardRef}
    >
      {/* Abstract 3D "Slime" Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        {/* Large abstract color blobs */}
        <div ref={blobsRef} className="absolute inset-0">
          {/* Blob 1 - Top Left */}
          <motion.div 
            className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-gradient-to-r from-emerald-400/30 to-green-300/30 blur-3xl"
            style={{
              x: blob1X,
              y: blob1Y,
            }}
          />
          
          {/* Blob 2 - Top Right */}
          <motion.div 
            className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-gradient-to-l from-cyan-400/30 to-blue-300/30 blur-3xl"
            style={{
              x: blob2X,
              y: blob2Y,
            }}
          />
          
          {/* Blob 3 - Bottom Center */}
          <motion.div 
            className="absolute bottom-0 left-1/3 w-[40rem] h-[25rem] rounded-full bg-gradient-to-tr from-purple-400/20 to-fuchsia-300/20 blur-3xl"
            style={{
              x: blob3X,
              y: blob3Y,
            }}
          />
        </div>
        
        {/* 3D "Slime" Abstract Shape Effects */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Animated Slime Blobs */}
          <div className="slime-blob slime-blob-1"></div>
          <div className="slime-blob slime-blob-2"></div>
          <div className="slime-blob slime-blob-3"></div>
          <div className="slime-blob slime-blob-4"></div>
          
          {/* Neon Lines */}
          <div className="neon-line neon-line-1"></div>
          <div className="neon-line neon-line-2"></div>
          <div className="neon-line neon-line-3"></div>
          
          {/* Floating 3D Elements */}
          <motion.div 
            className="absolute w-20 h-20 rounded-xl border border-white/10 backdrop-blur-md bg-white/5"
            style={{ 
              right: '20%', 
              top: '30%',
              rotateX: useTransform(mouseY, [0, 1], [15, -15]),
              rotateY: useTransform(mouseX, [0, 1], [-15, 15])
            }}
            animate={{
              y: [0, -20, 0],
              rotate: [0, 10, 0]
            }}
            transition={{
              duration: 8,
              ease: "easeInOut",
              repeat: Infinity
            }}
          />
          
          <motion.div 
            className="absolute w-24 h-24 rounded-full border border-white/10 backdrop-blur-md bg-white/5"
            style={{ 
              left: '15%', 
              bottom: '20%',
              rotateX: useTransform(mouseY, [0, 1], [-20, 20]),
              rotateY: useTransform(mouseX, [0, 1], [20, -20])
            }}
            animate={{
              y: [0, 30, 0],
              rotate: [0, -15, 0]
            }}
            transition={{
              duration: 10,
              ease: "easeInOut",
              repeat: Infinity,
              delay: 2
            }}
          />
          
          {/* Neural Network-like Points */}
          <div className="neural-points"></div>
        </div>
      </div>
      
      {/* Glass panels design elements */}
      <div className="fixed right-[5%] top-[20%] w-40 h-40 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/20 z-0 rotate-12"></div>
      <div className="fixed left-[10%] bottom-[15%] w-32 h-32 rounded-full bg-gradient-to-br from-green-200/10 to-green-300/5 backdrop-blur-sm border border-white/10 z-0 -rotate-12"></div>
      
      {/* Vibrant gradients */}
      <motion.div 
        className="fixed top-1/4 left-1/5 w-60 h-60 rounded-full bg-gradient-radial from-emerald-500/20 via-green-500/5 to-transparent blur-3xl z-0"
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.2, 0.3, 0.2]
        }}
        transition={{ 
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut" 
        }}
      />
      
      <motion.div 
        className="fixed bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-gradient-radial from-cyan-500/10 via-blue-500/5 to-transparent blur-3xl z-0"
        animate={{ 
          scale: [1, 1.4, 1],
          opacity: [0.15, 0.25, 0.15]
        }}
        transition={{ 
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 5
        }}
      />
      
      {/* Dashboard Container */}
      <div className="dashboard-container relative z-10 pt-8 pb-8">
        {/* Header */}
        <div className="p-0 rounded-3xl relative overflow-hidden bg-gradient-to-br from-slate-800/60 to-slate-900/60 border border-white/10 shadow-lg mb-6">
          <div className="bg-gradient-to-r from-emerald-900/60 via-green-800/60 to-teal-900/60 px-4 py-3 border-b border-white/10">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <motion.div 
                className="flex items-center mb-4 md:mb-0 relative"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              >
                {/* Logo and Title */}
                <div className="logo-container relative">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-400 via-green-500 to-emerald-600 shadow-lg flex items-center justify-center border border-white/20">
                    <motion.div
                      animate={{ 
                        scale: [1, 1.05, 1],
                        rotate: [0, 2, 0, -2, 0] 
                      }}
                      transition={{ 
                        duration: 6, 
                        ease: "easeInOut",
                        repeat: Infinity 
                      }}
                    >
                      <Leaf className="h-7 w-7 text-white drop-shadow-md" />
                    </motion.div>
                  </div>
                </div>
                
                <div className="ml-4 flex flex-col">
                  <motion.h1 
                    className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-green-200"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                  >
                    Smart Garden System - Kelompok 3
                  </motion.h1>
                  <motion.p
                    className="text-emerald-300/90 text-xs md:text-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                  >
                    Monitor & Control Dashboard
                  </motion.p>
                </div>
              </motion.div>
              
              {/* Right side controls */}
              <div className="flex items-center gap-4">
                <div className="flex flex-col md:flex-row items-center gap-3">
                  <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
                    <Clock className="h-3.5 w-3.5 text-blue-300/70" />
                    <span className="text-xs text-white/70">
                      {new Date().toLocaleDateString('id-ID', { 
                        day: 'numeric',
                        month: 'short', 
                        year: 'numeric' 
                      })}
                    </span>
                  </div>
                  
                  <motion.button
                    className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-gradient-to-r from-emerald-600/80 to-emerald-700/80 hover:from-emerald-500/80 hover:to-emerald-600/80 text-white border border-emerald-500/30 shadow-md"
                    onClick={handleRefresh}
                    whileHover={{ y: -1 }}
                    whileTap={{ y: 1 }}
                    disabled={refreshing}
                  >
                    <motion.div
                      animate={{ rotate: refreshing ? 360 : 0 }}
                      transition={{ duration: 1, ease: "linear", repeat: refreshing ? Infinity : 0 }}
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                    </motion.div>
                    <span className="text-xs">{refreshing ? 'Refreshing...' : 'Refresh Data'}</span>
                  </motion.button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Status bar */}
          <div className="p-3 flex flex-wrap items-center justify-between gap-2 bg-black/20">
            {/* System stats */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-1.5">
                <div className={`h-2 w-2 rounded-full ${latest ? 'bg-emerald-500 animate-pulse' : 'bg-gray-500'}`}></div>
                <span className="text-xs text-white/70">
                  Status: <span className="font-medium text-emerald-400">{latest ? 'Online' : 'Connecting...'}</span>
                </span>
              </div>
              
              <div className="h-3 border-r border-white/10"></div>
              
              <div className="flex items-center gap-1.5">
                <GaugeCircle className="h-3 w-3 text-blue-400/70" />
                <span className="text-xs text-white/70">
                  Mode: <span className="font-medium">{manual ? 'Manual' : 'Auto'}</span>
                </span>
              </div>
              
              {latest && (
                <>
                  <div className="h-3 border-r border-white/10"></div>
                  <div className="flex items-center gap-1.5">
                    <Droplets className="h-3 w-3 text-cyan-400/70" />
                    <span className="text-xs text-white/70">
                      Pompa: <span className={`font-medium ${pumpStatus === 1 ? 'text-emerald-400' : 'text-white/50'}`}>
                        {pumpStatus === 1 ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </span>
                  </div>
                </>
              )}
            </div>
            
            {latest && (
              <div className="text-xs text-white/50">
                Terakhir diperbarui: {new Date(latest.timestamp).toLocaleTimeString('id-ID', {hour: '2-digit', minute: '2-digit', second: '2-digit'})}
              </div>
            )}
          </div>
        </div>
        
        {/* Error Alert */}
        <AnimatePresence>
          {error && (
            <motion.div 
              className="mb-4 mx-auto px-4 py-3 bg-gradient-to-r from-red-800/60 to-rose-800/60 text-white rounded-lg border border-red-500/30 flex items-center gap-3"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <AlertCircle className="h-5 w-5 text-red-300" />
              <div>
                <p className="font-medium">Terjadi kesalahan</p>
                <p className="text-sm text-white/80">{error}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Navigation Tabs */}
        <div className="mb-6 p-1 rounded-xl flex justify-center mx-auto bg-gradient-to-br from-slate-800/60 to-slate-900/60 border border-white/10 shadow-md">
          <button 
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === 'overview' ? 
              'bg-gradient-to-r from-emerald-600/80 to-emerald-700/80 text-white shadow-md' : 
              'text-white/80 hover:bg-white/5'
            }`}
            onClick={() => setActiveTab('overview')}
          >
            <Leaf className="h-4 w-4" />
            <span>Overview</span>
          </button>
          <button 
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === 'graphs' ? 
              'bg-gradient-to-r from-blue-600/80 to-blue-700/80 text-white shadow-md' : 
              'text-white/80 hover:bg-white/5'
            }`}
            onClick={() => setActiveTab('graphs')}
          >
            <BarChart2 className="h-4 w-4" />
            <span>Analytics</span>
          </button>
          <button 
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === 'history' ? 
              'bg-gradient-to-r from-purple-600/80 to-purple-700/80 text-white shadow-md' : 
              'text-white/80 hover:bg-white/5'
            }`}
            onClick={() => setActiveTab('history')}
          >
            <Droplets className="h-4 w-4" />
            <span>History</span>
          </button>
        </div>

        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div 
              className="flex justify-center items-center py-20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              key="loading"
            >
              <div className="relative">
                <div className="relative w-20 h-20 rounded-full flex items-center justify-center bg-gradient-to-br from-slate-800/60 to-slate-900/60 border border-white/10 shadow-md">
                  <motion.div 
                    className="absolute inset-0 border-4 border-emerald-500/20 rounded-full"
                    animate={{ 
                      rotate: 360,
                      borderTopColor: 'rgba(16, 185, 129, 0.8)'
                    }}
                    transition={{ 
                      duration: 1.5, 
                      repeat: Infinity,
                      ease: "linear" 
                    }}
                  />
                  <div className="flex items-center justify-center h-full">
                    <Leaf className="h-6 w-6 text-emerald-500" />
                  </div>
                </div>
                <p className="text-center mt-4 text-emerald-300">Memuat data sensor...</p>
              </div>
            </motion.div>
          ) : (
            <>
              {activeTab === 'overview' && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <SensorCards latest={latest} />
                  <PumpControl
                    initialStatus={pumpStatus}
                    initialManual={manual}
                    onSuccess={() => {
                      // Trigger immediate revalidation of both data sources
                      refreshPump();
                      refreshHistory();
                    }}
                  />
                </motion.div>
              )}
              
              {activeTab === 'graphs' && (
                <motion.div
                  key="graphs"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <SensorGraphs data={history} />
                </motion.div>
              )}
              
              {activeTab === 'history' && (
                <motion.div
                  key="history"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <SensorTable data={history} />
                </motion.div>
              )}
            </>
          )}
        </AnimatePresence>
        
        {/* Footer */}
        <div className="mt-8 p-0 rounded-3xl overflow-hidden bg-gradient-to-br from-slate-800/60 to-slate-900/60 border border-white/10 shadow-lg">
          <div className="px-4 py-3 border-b border-white/10 bg-gradient-to-r from-slate-900/60 via-slate-800/60 to-slate-900/60">
            <h3 className="text-sm font-medium text-white/90">Smart Garden Dashboard</h3>
          </div>
          
          <div className="px-4 py-3 flex flex-col md:flex-row items-center justify-between gap-3">
            {/* System info */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 backdrop-blur-md flex items-center justify-center shadow-inner border border-emerald-500/30">
                <Leaf className="h-4 w-4 text-emerald-400" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-white/90">Smart Garden System</span>
                <span className="text-xs text-white/60">Sistem monitoring dan kontrol kebun otomatis</span>
              </div>
            </div>

            {/* Links */}
            <div className="flex items-center gap-4 ml-auto">
              <span className="text-xs text-white/60">Made with ❤️</span>
              
              <a 
                href="https://github.com/ahmfzui/smartgarden" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-medium text-white/80 transition-colors border border-white/10"
              >
                <Github className="h-3.5 w-3.5" />
                Source Code
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}