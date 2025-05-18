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
>(({ className, size = "md", ...props }, ref) => {
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
      className={`peer inline-flex shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors 
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-garden-600 focus-visible:ring-offset-2 
        disabled:cursor-not-allowed disabled:opacity-50 
        data-[state=checked]:bg-garden-600 data-[state=unchecked]:bg-gray-200 
        ${switchSize}`}
      {...props}
      ref={ref}
    >
      <SwitchPrimitives.Thumb asChild>
        <motion.span
          className={`pointer-events-none block rounded-full bg-white shadow-lg ring-0 transition-transform 
            data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0 
            ${thumbSize}`}
          layout
          transition={{ 
            type: "spring", 
            stiffness: 500, 
            damping: 30
          }}
          animate={{
            translateX: props.checked ? translateX : 0
          }}
        />
      </SwitchPrimitives.Thumb>
    </SwitchPrimitives.Root>
  )
})

Switch.displayName = "Switch"

export { Switch }