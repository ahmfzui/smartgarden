"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";

type User = {
  userId: string;
  name: string;
  email: string;
  role: string;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);
  const router = useRouter();
  const pathname = usePathname();

  // Handle component mounting for hydration safety
  useEffect(() => {
    setMounted(true);
  }, []);

  // Check authentication after component is mounted
  useEffect(() => {
    if (!mounted) return;

    const initialize = async () => {
      setLoading(true);
      try {
        const isAuthenticated = await checkAuth();
        
        // Auto-redirect based on auth status and current path
        if (isAuthenticated) {
          if (pathname && pathname.startsWith("/auth/")) {
            router.push("/");
          }
        } else {
          if (!pathname || !pathname.startsWith("/auth/")) {
            router.push("/auth/login");
          }
        }
      } catch (error) {
        console.error("Authentication error:", error);
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, [mounted, pathname, router]);

  const checkAuth = async (): Promise<boolean> => {
    if (!mounted) return false;
    
    try {
      // Check if we have a token in localStorage
      const localToken = localStorage.getItem("smart-garden-auth");
      
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: localToken ? JSON.stringify({ token: localToken }) : JSON.stringify({}),
      });

      if (!res.ok) {
        setUser(null);
        return false;
      }

      const data = await res.json();
      
      if (data.valid && data.user) {
        setUser(data.user);
        return true;
      } else {
        setUser(null);
        localStorage.removeItem("smart-garden-auth");
        return false;
      }
    } catch (error) {
      console.error("Error checking auth:", error);
      setUser(null);
      localStorage.removeItem("smart-garden-auth");
      return false;
    }
  };

  const login = async (email: string, password: string): Promise<void> => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Login failed");
      }

      // Store auth token in localStorage
      localStorage.setItem("smart-garden-auth", data.token);
      
      // Set user data
      setUser(data.user);
      
      // Redirect to dashboard
      router.push("/");
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setLoading(true);
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      // Clear local storage
      localStorage.removeItem("smart-garden-auth");
      
      // Clear user data
      setUser(null);
      
      // Redirect to login
      router.push("/auth/login");
    } finally {
      setLoading(false);
    }
  };

  // Loading component
  const LoadingComponent = () => (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-bl from-emerald-900/30 via-cyan-900/20 to-purple-900/30">
      <div className="relative">
        <div className="relative w-20 h-20 rounded-full flex items-center justify-center bg-gradient-to-br from-slate-800/60 to-slate-900/60 border border-white/10 shadow-md">
          <div 
            className="absolute inset-0 border-4 border-emerald-500/20 rounded-full animate-spin"
            style={{ 
              borderTopColor: 'rgba(16, 185, 129, 0.8)',
              animationDuration: '1.5s'
            }}
          />
        </div>
        <p className="text-center mt-4 text-emerald-300">Memuat...</p>
      </div>
    </div>
  );

  // Don't render anything until mounted (prevents hydration mismatch)
  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-bl from-emerald-900/30 via-cyan-900/20 to-purple-900/30">
        <div className="relative">
          <div className="relative w-20 h-20 rounded-full flex items-center justify-center bg-gradient-to-br from-slate-800/60 to-slate-900/60 border border-white/10 shadow-md">
            <div className="absolute inset-0 border-4 border-emerald-500/20 rounded-full animate-spin" />
          </div>
          <p className="text-center mt-4 text-emerald-300">Memuat...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        checkAuth,
      }}
    >
      {loading ? <LoadingComponent /> : children}
    </AuthContext.Provider>
  );
}