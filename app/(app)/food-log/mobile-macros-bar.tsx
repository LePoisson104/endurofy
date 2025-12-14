"use client";

import {
  FlameIcon,
  ProteinIcon,
  CarbsIcon,
  AvocadoIcon,
} from "@/components/icons/nutrition-icons";
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
            <ProteinIcon className="h-3 w-3" />
            {totalNutrients?.protein === 0
              ? 0
              : totalNutrients?.protein?.toFixed(2) ?? 0}
          </p>
          <span>•</span>
          <p className="flex items-center gap-1 text-sm font-semibold">
            <CarbsIcon className="h-3 w-3" />
            {totalNutrients?.carbs === 0
              ? 0
              : totalNutrients?.carbs?.toFixed(2) ?? 0}
          </p>

          <span>•</span>
          <p className="flex items-center gap-1 text-sm font-semibold">
            <AvocadoIcon className="h-3 w-3" />
            {totalNutrients?.fat === 0
              ? 0
              : totalNutrients?.fat?.toFixed(2) ?? 0}
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
