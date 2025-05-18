"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import SensorCards from "./SensorCards";
import PumpControl from "./PumpControl";
import SensorTable from "./SensorTable";
import { Leaf, Github } from "lucide-react";

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

  useEffect(() => {
    fetchAll();
    const interval = setInterval(() => {
      fetchAll();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen animated-bg-gradient bg-gradient-to-br from-garden-50 via-garden-50 to-garden-100">
      <div className="dashboard-container">
        <header>
          <motion.div 
            className="flex items-center justify-center mb-8"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <div className="relative">
              <h1 className="garden-title text-4xl font-bold text-garden-700 flex items-center justify-center gap-3">
                <motion.div
                  animate={{ rotate: [0, 10, 0, -10, 0] }}
                  transition={{ 
                    duration: 10, 
                    ease: "easeInOut", 
                    repeat: Infinity,
                  }}
                >
                  <Leaf className="h-10 w-10 text-garden-500" />
                </motion.div>
                <span>Smart Garden Dashboard</span>
              </h1>
              
              <motion.div 
                className="absolute inset-0 -z-10"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <div className="absolute inset-x-0 top-0 h-[40px] w-full bg-garden-500/10 blur-3xl" />
              </motion.div>
            </div>
          </motion.div>
        </header>

        <SensorCards latest={latest} />
        
        <PumpControl
          initialStatus={pumpStatus}
          initialManual={manual}
          onSuccess={fetchAll}
        />
        
        <SensorTable data={history} />
        
        <motion.footer 
          className="text-center text-garden-700/70 mt-10 py-4 border-t border-garden-200"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <span>Dibuat dengan</span>
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="text-red-500"
            >
              ❤️
            </motion.div>
            <span>&</span>
            <span className="text-garden-600 font-semibold">Next.js</span>
          </div>
          <div className="text-sm flex items-center justify-center gap-1">
            <span>© {new Date().getFullYear()} Smart Garden Dashboard</span>
            <a 
              href="https://github.com/rfisyhn/smartgarden-dashboard" 
              target="_blank" 
              rel="noopener noreferrer"
              className="ml-2 inline-flex items-center text-garden-700 hover:text-garden-800 transition-colors"
            >
              <Github className="h-4 w-4 mr-1" />
              Source Code
            </a>
          </div>
        </motion.footer>
      </div>
    </div>
  );
}