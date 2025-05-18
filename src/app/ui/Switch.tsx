"use client"

import * as React from "react"
import * as SwitchPrimitives from "@radix-ui/react-switch"
import { motion } from "framer-motion"

type SwitchProps = React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root> & {
  size?: "sm" | "md" | "lg";
};

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  SwitchProps
>(({ size = "md", ...props }, ref) => { // Removed className from destructuring
  const sizes = {
    sm: {
      switch: "h-4 w-8",
      thumb: "h-3 w-3",
      translateX: 11
    },
    md: {
      switch: "h-6 w-11",
      thumb: "h-5 w-5",
      translateX: 18 
    },
    lg: {
      switch: "h-7 w-14",
      thumb: "h-6 w-6",
      translateX: 24
    }
  };

  const { switch: switchSize, thumb: thumbSize, translateX } = sizes[size];

  return (
    <SwitchPrimitives.Root
      className={`peer inline-flex shrink-0 cursor-pointer items-center rounded-full 
        border-2 border-transparent transition-all duration-300 
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-garden-600 focus-visible:ring-offset-2 
        disabled:cursor-not-allowed disabled:opacity-50 
        data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-garden-500 data-[state=checked]:to-garden-600
        data-[state=checked]:shadow-inner
        data-[state=unchecked]:bg-gradient-to-r data-[state=unchecked]:from-gray-200 data-[state=unchecked]:to-gray-300
        ${switchSize}`}
      {...props}
      ref={ref}
    >
      <SwitchPrimitives.Thumb asChild>
        <motion.span
          className={`pointer-events-none block rounded-full 
            shadow-lg ring-0 transition-transform 
            data-[state=checked]:bg-white data-[state=unchecked]:bg-white
            ${thumbSize}`}
          layout
          transition={{ 
            type: "spring", 
            stiffness: 500, 
            damping: 30
          }}
          animate={{
            translateX: props.checked ? translateX : 0,
            boxShadow: props.checked 
              ? "0 0 10px rgba(34, 197, 94, 0.4), inset 0 0 0 2px rgba(34, 197, 94, 0.2)" 
              : "0 1px 2px rgba(0, 0, 0, 0.2)"
          }}
        />
      </SwitchPrimitives.Thumb>
    </SwitchPrimitives.Root>
  )
})

Switch.displayName = "Switch"

export { Switch }