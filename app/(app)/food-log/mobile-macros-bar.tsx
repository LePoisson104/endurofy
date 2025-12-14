"use client";

import { FlameIcon } from "@/components/icons/nutrition-icons";
import { useScrollAtTop } from "@/hooks/use-scroll-at-top";
import { motion, AnimatePresence } from "framer-motion";

export default function MobileMacorsBar({
  totalNutrients,
}: {
  totalNutrients: any;
}) {
  const isAtTop = useScrollAtTop();

  return (
    <AnimatePresence>
      {isAtTop && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[350px] py-3 mb-4 border rounded-full flex justify-center items-center gap-2 bg-background/10 backdrop-blur-[2px] supports-[backdrop-filter]:bg-card/80"
        >
          <p className="flex items-center gap-1 text-sm font-semibold">
            <FlameIcon className="h-3 w-3" />
            {totalNutrients?.calories === 0
              ? 0
              : Math.round(totalNutrients?.calories) ?? 0}
          </p>
          <span>•</span>
          <p className="flex items-center gap-1 text-sm font-semibold">
            <span className="text-red-400 text-sm">P</span>
            {totalNutrients?.protein === 0
              ? 0
              : totalNutrients?.protein?.toFixed(2) ?? 0}
          </p>
          <span>•</span>
          <p className="flex items-center gap-1 text-sm font-semibold">
            <span className="text-blue-400 text-sm">C</span>
            {totalNutrients?.carbs === 0
              ? 0
              : totalNutrients?.carbs?.toFixed(2) ?? 0}
          </p>

          <span>•</span>
          <p className="flex items-center gap-1 text-sm font-semibold">
            <span className="text-amber-400 text-sm">F</span>
            {totalNutrients?.fat === 0
              ? 0
              : totalNutrients?.fat?.toFixed(2) ?? 0}
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
