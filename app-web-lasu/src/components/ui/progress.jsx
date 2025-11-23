"use client";

import * as React from "react";
// 1. Quitamos la versión del import
import * as ProgressPrimitive from "@radix-ui/react-progress";

import { cn } from "./utils";

// 2. Quitamos ': React.ComponentProps<typeof ProgressPrimitive.Root>'
function Progress({
  className,
  value,
  ...props
}) {
  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      className={cn(
        "bg-primary/20 relative h-2 w-full overflow-hidden rounded-full",
        className,
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className="bg-primary h-full w-full flex-1 transition-all"
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  );
}

export { Progress };