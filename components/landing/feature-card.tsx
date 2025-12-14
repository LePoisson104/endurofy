import { motion } from "framer-motion";
import { useState, useRef } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useGetCurrentTheme } from "@/hooks/use-get-current-theme";

const featureCardVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.5 },
  },
};

export function FeatureCard({
  icon,
  title,
  bgColor,
  description,
  comingSoon = false,
}: {
  icon: React.ReactNode;
  title: string;
  bgColor: string;
  description: string;
  comingSoon?: boolean;
}) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const isDark = useGetCurrentTheme();

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setPosition({ x, y });
  };

  // Extract color name from formats like "bg-blue-400" or just "blue"
  const getColorName = (color: string) => {
    return color.includes("bg-") ? color.split("-")[1] : color;
  };

  // Create a mapping of bgColor to actual Tailwind classes
  const getIconClasses = (color: string) => {
    const colorName = getColorName(color);

    const colorMap: Record<string, string> = {
      zinc:
        "bg-zinc-500/10 group-hover:bg-zinc-500/20 dark:bg-zinc-500/20 dark:group-hover:bg-zinc-500/30 text-zinc-600 group-hover:text-zinc-500 dark:text-zinc-400 dark:group-hover:text-zinc-300",
      orange:
        "bg-orange-500/10 group-hover:bg-orange-500/20 dark:bg-orange-500/20 dark:group-hover:bg-orange-500/30 text-orange-600 group-hover:text-orange-500 dark:text-orange-400 dark:group-hover:text-orange-300",
      purple:
        "bg-purple-500/10 group-hover:bg-purple-500/20 dark:bg-purple-500/20 dark:group-hover:bg-purple-500/30 text-purple-600 group-hover:text-purple-500 dark:text-purple-400 dark:group-hover:text-purple-300",
      red: "bg-red-500/10 group-hover:bg-red-500/20 dark:bg-red-500/20 dark:group-hover:bg-red-500/30 text-red-600 group-hover:text-red-500 dark:text-red-400 dark:group-hover:text-red-300",
      pink: "bg-pink-500/10 group-hover:bg-pink-500/20 dark:bg-pink-500/20 dark:group-hover:bg-pink-500/30 text-pink-600 group-hover:text-pink-500 dark:text-pink-400 dark:group-hover:text-pink-300",
      emerald:
        "bg-emerald-500/10 group-hover:bg-emerald-500/20 dark:bg-emerald-500/20 dark:group-hover:bg-emerald-500/30 text-emerald-600 group-hover:text-emerald-500 dark:text-emerald-400 dark:group-hover:text-emerald-300",
      teal: "bg-teal-500/10 group-hover:bg-teal-500/20 dark:bg-teal-500/20 dark:group-hover:bg-teal-500/30 text-teal-600 group-hover:text-teal-500 dark:text-teal-400 dark:group-hover:text-teal-300",
      sky: "bg-sky-500/10 group-hover:bg-sky-500/20 dark:bg-sky-500/20 dark:group-hover:bg-sky-500/30 text-sky-600 group-hover:text-sky-500 dark:text-sky-400 dark:group-hover:text-sky-300",
      violet:
        "bg-violet-500/10 group-hover:bg-violet-500/20 dark:bg-violet-500/20 dark:group-hover:bg-violet-500/30 text-violet-600 group-hover:text-violet-500 dark:text-violet-400 dark:group-hover:text-violet-300",
      amber:
        "bg-amber-500/10 group-hover:bg-amber-500/20 dark:bg-amber-500/20 dark:group-hover:bg-amber-500/30 text-amber-600 group-hover:text-amber-500 dark:text-amber-400 dark:group-hover:text-amber-300",
      rose: "bg-rose-500/10 group-hover:bg-rose-500/20 dark:bg-rose-500/20 dark:group-hover:bg-rose-500/30 text-rose-600 group-hover:text-rose-500 dark:text-rose-400 dark:group-hover:text-rose-300",
      cyan: "bg-cyan-500/10 group-hover:bg-cyan-500/20 dark:bg-cyan-500/20 dark:group-hover:bg-cyan-500/30 text-cyan-600 group-hover:text-cyan-500 dark:text-cyan-400 dark:group-hover:text-cyan-300",
    };

    return colorMap[colorName] || colorMap["blue"]; // fallback to purple
  };

  // Get hover shadow gradient classes based on color
  const getHoverGradient = (color: string) => {
    const colorName = getColorName(color);

    const gradientMap: Record<string, string> = {
      zinc: "bg-gradient-to-r from-zinc-300/40 to-zinc-500/10",
      orange: "bg-gradient-to-r from-orange-300/40 to-orange-500/10",
      purple: "bg-gradient-to-r from-purple-300/40 to-purple-500/10",
      red: "bg-gradient-to-r from-red-300/40 to-red-500/10",
      pink: "bg-gradient-to-r from-pink-300/40 to-pink-500/10",
      sky: "bg-gradient-to-r from-sky-300/40 to-sky-500/10",
      emerald: "bg-gradient-to-r from-emerald-300/40 to-emerald-500/10",
      teal: "bg-gradient-to-r from-teal-300/40 to-teal-500/10",
      violet: "bg-gradient-to-r from-violet-300/40 to-violet-500/10",
      amber: "bg-gradient-to-r from-amber-300/40 to-amber-500/10",
      rose: "bg-gradient-to-r from-rose-300/40 to-rose-500/10",
      cyan: "bg-gradient-to-r from-cyan-300/40 to-cyan-500/10",
    };

    return gradientMap[colorName] || gradientMap["purple"]; // fallback to purple
  };

  // Get card shadow classes based on color
  const getCardShadow = (color: string) => {
    const colorName = getColorName(color);

    const shadowMap: Record<string, string> = {
      zinc:
        "hover:shadow-[0_8px_30px_rgba(113,113,122,0.15)] dark:hover:shadow-[0_8px_30px_rgba(113,113,122,0.25)]",
      orange:
        "hover:shadow-[0_8px_30px_rgba(249,115,22,0.15)] dark:hover:shadow-[0_8px_30px_rgba(249,115,22,0.25)]",
      purple:
        "hover:shadow-[0_8px_30px_rgba(168,85,247,0.15)] dark:hover:shadow-[0_8px_30px_rgba(168,85,247,0.25)]",
      red: "hover:shadow-[0_8px_30px_rgba(239,68,68,0.15)] dark:hover:shadow-[0_8px_30px_rgba(239,68,68,0.25)]",
      pink: "hover:shadow-[0_8px_30px_rgba(236,72,153,0.15)] dark:hover:shadow-[0_8px_30px_rgba(236,72,153,0.25)]",
      sky: "hover:shadow-[0_8px_30px_rgba(14,165,233,0.15)] dark:hover:shadow-[0_8px_30px_rgba(14,165,233,0.25)]",
      emerald:
        "hover:shadow-[0_8px_30px_rgba(16,185,129,0.15)] dark:hover:shadow-[0_8px_30px_rgba(16,185,129,0.25)]",
      teal: "hover:shadow-[0_8px_30px_rgba(20,184,166,0.15)] dark:hover:shadow-[0_8px_30px_rgba(20,184,166,0.25)]",
      violet:
        "hover:shadow-[0_8px_30px_rgba(139,92,246,0.15)] dark:hover:shadow-[0_8px_30px_rgba(139,92,246,0.25)]",
      amber:
        "hover:shadow-[0_8px_30px_rgba(251,191,36,0.15)] dark:hover:shadow-[0_8px_30px_rgba(251,191,36,0.25)]",
      rose: "hover:shadow-[0_8px_30px_rgba(251,113,133,0.15)] dark:hover:shadow-[0_8px_30px_rgba(251,113,133,0.25)]",
      cyan: "hover:shadow-[0_8px_30px_rgba(34,211,238,0.15)] dark:hover:shadow-[0_8px_30px_rgba(34,211,238,0.25)]",
    };

    return shadowMap[colorName] || shadowMap["purple"]; // fallback to purple
  };

  const getHighlightedText = (color: string) => {
    const colorName = getColorName(color);

    const highlightedTextMap: Record<string, string> = {
      zinc: "selection:bg-zinc-400 dark:selection:bg-zinc-500",
      orange: "selection:bg-orange-400 dark:selection:bg-orange-500",
      purple: "selection:bg-purple-400 dark:selection:bg-purple-500",
      red: "selection:bg-red-400 dark:selection:bg-red-500",
      pink: "selection:bg-pink-400 dark:selection:bg-pink-500",
      sky: "selection:bg-sky-400 dark:selection:bg-sky-500",
      emerald: "selection:bg-emerald-400 dark:selection:bg-emerald-500",
      teal: "selection:bg-teal-400 dark:selection:bg-teal-500",
      violet: "selection:bg-violet-400 dark:selection:bg-violet-500",
      amber: "selection:bg-amber-400 dark:selection:bg-amber-500",
      rose: "selection:bg-rose-400 dark:selection:bg-rose-500",
      cyan: "selection:bg-cyan-400 dark:selection:bg-cyan-500",
    };

    return highlightedTextMap[colorName] || highlightedTextMap["purple"]; // fallback to purple
  };

  // Get mobile background gradient
  const getMobileBackground = (color: string) => {
    const colorName = getColorName(color);

    const mobileGradientMap: Record<string, string> = {
      zinc:
        "bg-gradient-to-br from-zinc-500/20 via-zinc-500/5 to-transparent",
      orange:
        "bg-gradient-to-br from-orange-500/20 via-orange-500/5 to-transparent",
      purple:
        "bg-gradient-to-br from-purple-500/20 via-purple-500/5 to-transparent",
      red: "bg-gradient-to-br from-red-500/20 via-red-500/5 to-transparent",
      pink: "bg-gradient-to-br from-pink-500/20 via-pink-500/5 to-transparent",
      sky: "bg-gradient-to-br from-sky-500/20 via-sky-500/5 to-transparent",
      emerald:
        "bg-gradient-to-br from-emerald-500/20 via-emerald-500/5 to-transparent",
      teal: "bg-gradient-to-br from-teal-500/20 via-teal-500/5 to-transparent",
      violet:
        "bg-gradient-to-br from-violet-500/20 via-violet-500/5 to-transparent",
      amber:
        "bg-gradient-to-br from-amber-500/20 via-amber-500/5 to-transparent",
      rose: "bg-gradient-to-br from-rose-500/20 via-rose-500/5 to-transparent",
      cyan: "bg-gradient-to-br from-cyan-500/20 via-cyan-500/5 to-transparent",
    };

    return mobileGradientMap[colorName] || mobileGradientMap["purple"]; // fallback to purple
  };

  return (
    <motion.div
      ref={cardRef}
      variants={featureCardVariants}
      className={`flex flex-col p-6 rounded-xl ${
        isMobile
          ? `${getMobileBackground(bgColor)} dark:${getMobileBackground(
              bgColor
            )} border-none`
          : `bg-card dark:bg-background ${isDark ? "border" : "border-none"}`
      } ${getCardShadow(
        bgColor
      )} cursor-pointer h-[200px] w-full group relative overflow-hidden`}
      onMouseMove={!isMobile ? handleMouseMove : undefined}
      onMouseEnter={!isMobile ? () => setIsHovered(true) : undefined}
      onMouseLeave={!isMobile ? () => setIsHovered(false) : undefined}
    >
      {isHovered && !isMobile && (
        <div
          className={`absolute w-[200px] h-[200px] rounded-full blur-2xl pointer-events-none transition-transform duration-100 ${getHoverGradient(
            bgColor
          )}`}
          style={{
            left: position.x,
            top: position.y,
            transform: "translate(-50%, -50%)",
          }}
        />
      )}
      <div
        className={`rounded-full p-2 w-fit transition-colors relative z-10 ${getIconClasses(
          bgColor
        )}`}
      >
        {icon}
      </div>
      <div
        className={`mt-4 relative z-10 ${getHighlightedText(
          bgColor
        )} selection:text-white`}
      >
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-xl font-bold text-left">{title}</h3>
          {comingSoon && (
            <span className="shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-zinc-700 dark:bg-zinc-200 dark:text-zinc-900 text-white">
              Soon
            </span>
          )}
        </div>
        <p className="mt-2 text-sm text-muted-foreground text-left">
          {description}
        </p>
      </div>
    </motion.div>
  );
}
