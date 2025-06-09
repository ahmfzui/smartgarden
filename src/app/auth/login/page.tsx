"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Leaf, Eye, EyeOff, AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login, loading } = useAuth();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || "An error occurred during login");
    }
  };
  
  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-bl from-emerald-900/30 via-cyan-900/20 to-purple-900/30 flex flex-col justify-center items-center p-4">
      {/* Abstract Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        {/* Large abstract color blobs */}
        <div className="absolute inset-0">
          {/* Blob 1 - Top Left */}
          <motion.div 
            className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-gradient-to-r from-emerald-400/30 to-green-300/30 blur-3xl"
            animate={{ 
              y: [0, 20, 0], 
              x: [0, 10, 0],
              scale: [1, 1.05, 1]
            }}
            transition={{ 
              duration: 15, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
          />
          
          {/* Blob 2 - Top Right */}
          <motion.div 
            className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-gradient-to-l from-cyan-400/30 to-blue-300/30 blur-3xl"
            animate={{ 
              y: [0, -30, 0], 
              x: [0, -15, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              duration: 18, 
              repeat: Infinity, 
              ease: "easeInOut",
              delay: 2
            }}
          />
          
          {/* Blob 3 - Bottom Center */}
          <motion.div 
            className="absolute bottom-0 left-1/3 w-[40rem] h-[25rem] rounded-full bg-gradient-to-tr from-purple-400/20 to-fuchsia-300/20 blur-3xl"
            animate={{ 
              y: [0, -10, 0], 
              x: [0, 20, 0],
              scale: [1, 1.05, 1]
            }}
            transition={{ 
              duration: 20, 
              repeat: Infinity, 
              ease: "easeInOut",
              delay: 5
            }}
          />
        </div>
      </div>
      
      {/* Login Card */}
      <motion.div 
        className="w-full max-w-md relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-md rounded-2xl overflow-hidden border border-white/10 shadow-xl">
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-900/60 via-green-800/60 to-teal-900/60 px-6 py-4 border-b border-white/10 flex items-center justify-center">
            <motion.div 
              className="flex flex-col items-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
            >
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-green-400 via-green-500 to-emerald-600 shadow-lg flex items-center justify-center border border-white/20 mb-3">
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
                  <Leaf className="h-8 w-8 text-white drop-shadow-md" />
                </motion.div>
              </div>
              
              <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-green-200">
                Smart Garden System
              </h1>
              <p className="text-emerald-300/90 text-sm mt-1">
                Login to access your dashboard
              </p>
            </motion.div>
          </div>
          
          {/* Error Alert */}
          <AnimatePresence>
            {error && (
              <motion.div 
                className="mx-6 mt-4 px-4 py-3 bg-gradient-to-r from-red-800/60 to-rose-800/60 text-white rounded-lg border border-red-500/30 flex items-center gap-3"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <AlertCircle className="h-5 w-5 text-red-300" />
                <p className="text-sm">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Login Form */}
          <form 
            onSubmit={handleSubmit}
            className="p-6 space-y-5"
          >
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-white/70">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 text-white placeholder:text-white/40"
                placeholder="your@email.com"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-white/70">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 text-white placeholder:text-white/40"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/80"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
            
            <div className="pt-2">
              <motion.button
                type="submit"
                className="w-full py-2.5 px-4 bg-gradient-to-r from-emerald-600/90 to-emerald-700/90 hover:from-emerald-500/90 hover:to-emerald-600/90 text-white rounded-lg font-medium flex items-center justify-center border border-emerald-500/30 shadow-md"
                whileHover={{ y: -2 }}
                whileTap={{ y: 1 }}
                disabled={loading}
              >
                {loading ? (
                  <motion.div 
                    className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                ) : (
                  "Login"
                )}
              </motion.button>
            </div>
            
            <div className="text-center text-white/60 text-sm pt-2">
              Don't have an account?{' '}
              <Link href="/auth/register" className="text-emerald-400 hover:text-emerald-300 font-medium">
                Register
              </Link>
            </div>
          </form>
        </div>
      </motion.div>
      
      {/* Footer */}
      <div className="mt-8 text-center text-xs text-white/50">
        <p>© {new Date().getFullYear()} Smart Garden System - Kelompok 3</p>
      </div>
    </div>
  );
}