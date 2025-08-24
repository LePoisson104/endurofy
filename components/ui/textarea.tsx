import * as React from "react";

import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  const isMobile = useIsMobile();

  return (
    <textarea
      data-slot="textarea"
      className={cn(
        `border-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex field-sizing-content min-h-16 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 ${
          isMobile ? "text-base" : "text-sm"
        } placeholder:text-sm`,
        className
      )}
      {...props}
    />
  );
}

export { Textarea };
