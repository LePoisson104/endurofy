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
}: {
  icon: React.ReactNode;
  title: string;
  bgColor: string;
  description: string;
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
      purple:
        "bg-purple-500/10 group-hover:bg-purple-500/20 dark:bg-purple-500/20 dark:group-hover:bg-purple-500/30 text-purple-600 group-hover:text-purple-500 dark:text-purple-400 dark:group-hover:text-purple-300",
      red: "bg-red-500/10 group-hover:bg-red-500/20 dark:bg-red-500/20 dark:group-hover:bg-red-500/30 text-red-600 group-hover:text-red-500 dark:text-red-400 dark:group-hover:text-red-300",
      pink: "bg-pink-500/10 group-hover:bg-pink-500/20 dark:bg-pink-500/20 dark:group-hover:bg-pink-500/30 text-pink-600 group-hover:text-pink-500 dark:text-pink-400 dark:group-hover:text-pink-300",
      emerald:
        "bg-emerald-500/10 group-hover:bg-emerald-500/20 dark:bg-emerald-500/20 dark:group-hover:bg-emerald-500/30 text-emerald-600 group-hover:text-emerald-500 dark:text-emerald-400 dark:group-hover:text-emerald-300",
      teal: "bg-teal-500/10 group-hover:bg-teal-500/20 dark:bg-teal-500/20 dark:group-hover:bg-teal-500/30 text-teal-600 group-hover:text-teal-500 dark:text-teal-400 dark:group-hover:text-teal-300",
      sky: "bg-sky-500/10 group-hover:bg-sky-500/20 dark:bg-sky-500/20 dark:group-hover:bg-sky-500/30 text-sky-600 group-hover:text-sky-500 dark:text-sky-400 dark:group-hover:text-sky-300",
    };

    return colorMap[colorName] || colorMap["blue"]; // fallback to purple
  };

  // Get hover shadow gradient classes based on color
  const getHoverGradient = (color: string) => {
    const colorName = getColorName(color);

    const gradientMap: Record<string, string> = {
      purple: "bg-gradient-to-r from-purple-300/40 to-purple-500/10",
      red: "bg-gradient-to-r from-red-300/40 to-red-500/10",
      pink: "bg-gradient-to-r from-pink-300/40 to-pink-500/10",
      sky: "bg-gradient-to-r from-sky-300/40 to-sky-500/10",
      emerald: "bg-gradient-to-r from-emerald-300/40 to-emerald-500/10",
      teal: "bg-gradient-to-r from-teal-300/40 to-teal-500/10",
    };

    return gradientMap[colorName] || gradientMap["purple"]; // fallback to purple
  };

  // Get card shadow classes based on color
  const getCardShadow = (color: string) => {
    const colorName = getColorName(color);

    const shadowMap: Record<string, string> = {
      purple:
        "hover:shadow-[0_8px_30px_rgba(168,85,247,0.15)] dark:hover:shadow-[0_8px_30px_rgba(168,85,247,0.25)]",
      red: "hover:shadow-[0_8px_30px_rgba(239,68,68,0.15)] dark:hover:shadow-[0_8px_30px_rgba(239,68,68,0.25)]",
      pink: "hover:shadow-[0_8px_30px_rgba(236,72,153,0.15)] dark:hover:shadow-[0_8px_30px_rgba(236,72,153,0.25)]",
      sky: "hover:shadow-[0_8px_30px_rgba(14,165,233,0.15)] dark:hover:shadow-[0_8px_30px_rgba(14,165,233,0.25)]",
      emerald:
        "hover:shadow-[0_8px_30px_rgba(16,185,129,0.15)] dark:hover:shadow-[0_8px_30px_rgba(16,185,129,0.25)]",
      teal: "hover:shadow-[0_8px_30px_rgba(20,184,166,0.15)] dark:hover:shadow-[0_8px_30px_rgba(20,184,166,0.25)]",
    };

    return shadowMap[colorName] || shadowMap["purple"]; // fallback to purple
  };

  const getHighlightedText = (color: string) => {
    const colorName = getColorName(color);

    const highlightedTextMap: Record<string, string> = {
      purple: "selection:bg-purple-400 dark:selection:bg-purple-500",
      red: "selection:bg-red-400 dark:selection:bg-red-500",
      pink: "selection:bg-pink-400 dark:selection:bg-pink-500",
      sky: "selection:bg-sky-400 dark:selection:bg-sky-500",
      emerald: "selection:bg-emerald-400 dark:selection:bg-emerald-500",
      teal: "selection:bg-teal-400 dark:selection:bg-teal-500",
    };

    return highlightedTextMap[colorName] || highlightedTextMap["purple"]; // fallback to purple
  };

  // Get mobile background gradient
  const getMobileBackground = (color: string) => {
    const colorName = getColorName(color);

    const mobileGradientMap: Record<string, string> = {
      purple:
        "bg-gradient-to-br from-purple-500/20 via-purple-500/5 to-transparent",
      red: "bg-gradient-to-br from-red-500/20 via-red-500/5 to-transparent",
      pink: "bg-gradient-to-br from-pink-500/20 via-pink-500/5 to-transparent",
      sky: "bg-gradient-to-br from-sky-500/20 via-sky-500/5 to-transparent",
      emerald:
        "bg-gradient-to-br from-emerald-500/20 via-emerald-500/5 to-transparent",
      teal: "bg-gradient-to-br from-teal-500/20 via-teal-500/5 to-transparent",
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
      )} transition-all cursor-pointer h-[200px] w-full group relative overflow-hidden`}
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
        <h3 className="text-xl font-bold text-left">{title}</h3>
        <p className="mt-2 text-sm text-muted-foreground text-left">
          {description}
        </p>
      </div>
    </motion.div>
  );
}
