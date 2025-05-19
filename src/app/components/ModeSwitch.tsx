import { motion } from "framer-motion";
import { Settings, Power } from "lucide-react";

type ModeSwitchProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
};

export function ModeSwitch({ checked, onChange, disabled = false }: ModeSwitchProps) {
  return (
    <div className="flex flex-col w-full">
      {/* Toggle Switch - Centered and Bigger */}
      <div className="w-full flex justify-center mb-4">
        <button
          type="button"
          onClick={() => !disabled && onChange(!checked)}
          className={`
            w-28 h-12 
            relative 
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} 
            rounded-full 
            outline-none
            border
            transition-colors duration-300
            ${checked 
              ? 'bg-gradient-to-r from-blue-500/60 to-blue-600/60 border-blue-500/50 shadow-inner shadow-blue-900/20' 
              : 'bg-gradient-to-r from-emerald-500/60 to-emerald-600/60 border-emerald-500/50 shadow-inner shadow-emerald-900/20'
            }
          `}
          disabled={disabled}
          aria-checked={checked}
          aria-label="Toggle control mode"
        >
          <motion.div
            initial={false}
            animate={{ 
              x: checked ? 70 : 4,
              backgroundColor: checked ? 'rgb(59, 130, 246)' : 'rgb(5, 150, 105)'
            }}
            transition={{ 
              type: "spring", 
              stiffness: 500, 
              damping: 30,
              mass: 0.8
            }}
            className="absolute top-1.5 w-9 h-9 shadow-md rounded-full flex items-center justify-center"
          >
            <motion.div
              animate={{ 
                opacity: 1,
                scale: 1
              }}
              initial={{ opacity: 0, scale: 0.5 }}
              transition={{ delay: 0.1 }}
              className="text-white"
            >
              {checked ? (
                <Power className="h-5 w-5" />
              ) : (
                <Settings className="h-5 w-5" />
              )}
            </motion.div>
          </motion.div>
        </button>
      </div>
      
      {/* Mode Labels - Below Switch */}
      <div className="flex items-center justify-between w-full px-1">
        <div className={`flex items-center gap-2 ${checked ? 'opacity-40' : 'opacity-100'}`}>
          <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
            <Settings className="h-3 w-3 text-emerald-400" />
          </div>
          <span className="text-xs font-medium text-white/90">Otomatis</span>
        </div>
        
        <div className={`flex items-center gap-2 ${!checked ? 'opacity-40' : 'opacity-100'}`}>
          <span className="text-xs font-medium text-white/90">Manual</span>
          <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center">
            <Power className="h-3 w-3 text-blue-400" />
          </div>
        </div>
      </div>
      
      {/* Mode Indicator */}
      <div className="mt-3 flex justify-center">
        <div className="flex items-center gap-2">
          <motion.div 
            className={`w-2.5 h-2.5 rounded-full transition-colors ${checked ? 'bg-blue-400' : 'bg-emerald-400'}`}
            animate={{ 
              scale: [0.8, 1.2, 0.8],
              opacity: [0.7, 1, 0.7] 
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <span className={`text-xs font-medium ${checked ? 'text-blue-400' : 'text-emerald-400'}`}>
            Mode {checked ? 'Manual' : 'Otomatis'} Aktif
          </span>
        </div>
      </div>
    </div>
  );
}