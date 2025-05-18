"use client";
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SensorCards from "./SensorCards";
import PumpControl from "./PumpControl";
import SensorTable from "./SensorTable";
import { Leaf, Github, Droplets } from "lucide-react";

type Sensor = {
  temperature: number;
  humidity: number;
  soilMoisture: number;
  pumpStatus: number;
  timestamp: string;
};

// Function to create particles
const createParticles = (container: HTMLDivElement, count: number) => {
  for (let i = 0; i < count; i++) {
    const particle = document.createElement("div");
    particle.classList.add("particle");
    
    const size = Math.random() * 6 + 2;
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    
    const posX = Math.random() * 100;
    const posY = Math.random() * 100;
    const delay = Math.random() * 5;
    const duration = Math.random() * 20 + 10;
    
    particle.style.left = `${posX}%`;
    particle.style.top = `${posY}%`;
    particle.style.opacity = (Math.random() * 0.5 + 0.1).toString();
    
    particle.style.animation = `float ${duration}s ease-in-out ${delay}s infinite alternate`;
    
    container.appendChild(particle);
  }
};

export default function HomePage() {
  const [latest, setLatest] = useState<Sensor | null>(null);
  const [history, setHistory] = useState<Sensor[]>([]);
  const [pumpStatus, setPumpStatus] = useState(0);
  const [manual, setManual] = useState(false);
  const [loading, setLoading] = useState(true);
  const [rainEffect, setRainEffect] = useState(false);
  const particleContainerRef = useRef<HTMLDivElement>(null);
  const leavesContainerRef = useRef<HTMLDivElement>(null);

  // Create floating leaves effect
  useEffect(() => {
    if (leavesContainerRef.current) {
      const container = leavesContainerRef.current;
      
      // Clear existing leaves
      container.innerHTML = '';
      
      // Create leaves
      for (let i = 0; i < 12; i++) {
        const leaf = document.createElement("div");
        leaf.classList.add("leaf");
        
        // Set random properties
        const randomValue = Math.random();
        leaf.style.setProperty('--random', randomValue.toString());
        leaf.style.left = `${Math.random() * 100}%`;
        leaf.style.animationDelay = `${Math.random() * 10}s`;
        
        container.appendChild(leaf);
      }
    }
    
    // Create particles
    if (particleContainerRef.current) {
      createParticles(particleContainerRef.current, 40);
    }
  }, []);

  // Toggle rain effect when pump status changes
  useEffect(() => {
    if (pumpStatus === 1) {
      setRainEffect(true);
    } else {
      setRainEffect(false);
    }
  }, [pumpStatus]);

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

  // Parallax effect for background
  const [scrollY, setScrollY] = useState(0);
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen animated-bg-gradient bg-gradient-to-br from-garden-50 via-garden-50 to-garden-100 relative overflow-hidden">
      {/* Particle animation container */}
      <div ref={particleContainerRef} className="particle-container"></div>
      
      {/* Floating leaves animation */}
      <div ref={leavesContainerRef} className="floating-leaves"></div>
      
      {/* Rain effect */}
      <AnimatePresence>
        {rainEffect && (
          <motion.div 
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            {Array.from({ length: 20 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: '-20px',
                }}
                animate={{
                  y: ['0%', '100vh'],
                  opacity: [0.8, 0.2, 0],
                }}
                transition={{
                  duration: 1 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                  ease: 'linear',
                }}
              >
                <Droplets className="text-blue-400 opacity-40" size={16} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="dashboard-container relative z-10">
        <header>
          <motion.div 
            className="flex items-center justify-center mb-8"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            style={{
              transform: `translateY(${scrollY * 0.2}px)`,
            }}
          >
            <div className="relative">
              <motion.div
                className="absolute -inset-32 -z-10 bg-gradient-radial from-garden-300/30 to-transparent rounded-full blur-3xl"
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.3, 0.4, 0.3],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              <h1 className="garden-title text-4xl font-bold text-garden-700 flex items-center justify-center gap-3">
                <motion.div
                  className="relative"
                  animate={{ 
                    rotate: [0, 10, 0, -10, 0],
                    y: [0, -5, 0, -5, 0]
                  }}
                  transition={{ 
                    duration: 10, 
                    ease: "easeInOut", 
                    repeat: Infinity,
                  }}
                >
                  <Leaf className="h-10 w-10 text-garden-500" />
                  <motion.div
                    className="absolute -inset-2 bg-garden-500/20 rounded-full blur-lg"
                    animate={{
                      scale: [1, 1.3, 1],
                      opacity: [0.2, 0.5, 0.2],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                </motion.div>
                <span className="glow-text">Smart Garden Dashboard</span>
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
          className="text-center text-garden-700/70 mt-10 py-6 glass-card"
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
              href="https://github.com/ahmfzui/smartgarden" 
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