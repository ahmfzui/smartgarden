"use client";
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import SensorCards from "./components/SensorCards";
import PumpControl from "./components/PumpControl";
import SensorTable from "./components/SensorTable";
import SensorGraphs from "./components/SensorGraphs";
import { Leaf, Github, BarChart2, Droplets, RefreshCw } from "lucide-react";

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

  const fetchAll = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/history");
      const data = await res.json();
      setHistory(data);
      if (data.length > 0) setLatest(data[0]);

      const pumpRes = await fetch("/api/pump-control");
      const pumpData = await pumpRes.json();
      setPumpStatus(pumpData.pumpStatus);
      setManual(pumpData.manual);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAll();
    setTimeout(() => setRefreshing(false), 800);
  };

  useEffect(() => {
    fetchAll();
    const interval = setInterval(() => {
      fetchAll();
    }, 30000); // Fetch every 30 seconds
    return () => clearInterval(interval);
  }, []);

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
      <div className="dashboard-container relative z-10 pt-8">
        <header className="mb-10">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <motion.div 
              className="flex items-center mb-6 md:mb-0 relative"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              {/* Logo and Title */}
              <div className="logo-container relative">
                <motion.div
                  className="w-20 h-20 rounded-2xl bg-gradient-to-br from-green-400 via-green-500 to-emerald-600 shadow-lg flex items-center justify-center border border-white/20"
                  whileHover={{ rotate: 5 }}
                  style={{
                    boxShadow: "0 8px 32px rgba(31, 209, 103, 0.4)"
                  }}
                >
                  <motion.div
                    animate={{ 
                      scale: [1, 1.05, 1],
                      rotate: [0, 5, 0, -5, 0] 
                    }}
                    transition={{ 
                      duration: 8, 
                      ease: "easeInOut",
                      repeat: Infinity 
                    }}
                  >
                    <Leaf className="h-10 w-10 text-white drop-shadow-md" />
                  </motion.div>
                </motion.div>
                
                {/* Glowing logo effect */}
                <motion.div
                  className="absolute -inset-3 rounded-full bg-green-400/20 blur-xl -z-10"
                  animate={{ 
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 0.8, 0.5] 
                  }}
                  transition={{ 
                    duration: 5, 
                    ease: "easeInOut",
                    repeat: Infinity 
                  }}
                />
              </div>
              
              <div className="ml-5">
                <motion.h1 
                  className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-green-200"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                >
                  Smart Garden
                </motion.h1>
                <motion.p
                  className="text-emerald-300/90 text-md"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                >
                  Monitor & Control Dashboard
                </motion.p>
              </div>
            </motion.div>
            
            {/* Refresh button and timestamp */}
            <motion.div
              className="flex flex-col items-end"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <motion.button
                className="glass-button-primary flex items-center gap-2 px-5 py-2 mb-2"
                onClick={handleRefresh}
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                disabled={refreshing}
              >
                <motion.div
                  animate={{ rotate: refreshing ? 360 : 0 }}
                  transition={{ duration: 1, ease: "linear", repeat: refreshing ? Infinity : 0 }}
                >
                  <RefreshCw className="h-4 w-4" />
                </motion.div>
                <span>{refreshing ? 'Menyegarkan...' : 'Segarkan Data'}</span>
              </motion.button>
              
              <div className="glass-panel px-4 py-2 rounded-lg text-sm text-emerald-100">
                <span>
                  {new Date().toLocaleDateString('id-ID', { 
                    weekday: 'long', 
                    day: 'numeric',
                    month: 'long', 
                    year: 'numeric' 
                  })}
                </span>
              </div>
              
              {latest && (
                <p className="text-xs text-emerald-300/80 mt-1">
                  Terakhir diperbarui: {new Date(latest.timestamp).toLocaleTimeString()}
                </p>
              )}
            </motion.div>
          </div>
        </header>
        
        {/* Navigation Tabs */}
        <div className="glass-tabs mb-8 p-1 rounded-xl flex justify-center mx-auto">
          <button 
            className={`tab-button ${activeTab === 'overview' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <Leaf className="h-4 w-4" />
            <span>Overview</span>
          </button>
          <button 
            className={`tab-button ${activeTab === 'graphs' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('graphs')}
          >
            <BarChart2 className="h-4 w-4" />
            <span>Analytics</span>
          </button>
          <button 
            className={`tab-button ${activeTab === 'history' ? 'tab-active' : ''}`}
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
                <div className="glass-loading">
                  <motion.div 
                    className="absolute inset-0 border-4 border-green-200/40 rounded-full"
                    animate={{ 
                      rotate: 360,
                      borderTopColor: 'rgba(34, 197, 94, 0.8)'
                    }}
                    transition={{ 
                      duration: 1.5, 
                      repeat: Infinity,
                      ease: "linear" 
                    }}
                  />
                  <div className="flex items-center justify-center h-full">
                    <Leaf className="h-6 w-6 text-green-500" />
                  </div>
                </div>
                <p className="text-center mt-4 text-green-300">Loading garden data...</p>
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
                    onSuccess={fetchAll}
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
        
        <motion.footer 
          className="mt-12 px-8 py-6 rounded-3xl bg-white/10 backdrop-blur-xl shadow-lg border border-white/20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Logo + Branding */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-300/20 backdrop-blur-md flex items-center justify-center shadow-inner border border-green-300/30">
                <Leaf className="h-5 w-5 text-green-400" />
              </div>
              <span className="text-lg font-semibold text-white drop-shadow-sm tracking-tight">
                Smart Garden Dashboard
              </span>
            </div>

            {/* Info + Link */}
            <div className="flex items-center gap-2 text-sm text-white/80">
              <span>Made with</span>
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="text-pink-400"
              >
                ❤️
              </motion.div>

              {/* Divider */}
              <span className="mx-2 hidden md:inline text-white/30">|</span>

              {/* Source Code */}
              <a 
                href="https://github.com/ahmfzui/smartgarden" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-white/90 hover:text-green-300 transition-colors"
              >
                <Github className="h-4 w-4" />
                Source Code
              </a>
            </div>
          </div>
        </motion.footer>
      </div>
    </div>
  );
}