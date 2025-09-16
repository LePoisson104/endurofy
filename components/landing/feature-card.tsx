import { motion } from "framer-motion";
import { useState, useRef } from "react";

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
      blue: "bg-blue-500/10 group-hover:bg-blue-500/20 dark:bg-blue-500/20 dark:group-hover:bg-blue-500/30 text-blue-600 group-hover:text-blue-500 dark:text-blue-400 dark:group-hover:text-blue-300",
      green:
        "bg-green-500/10 group-hover:bg-green-500/20 dark:bg-green-500/20 dark:group-hover:bg-green-500/30 text-green-600 group-hover:text-green-500 dark:text-green-400 dark:group-hover:text-green-300",
      purple:
        "bg-purple-500/10 group-hover:bg-purple-500/20 dark:bg-purple-500/20 dark:group-hover:bg-purple-500/30 text-purple-600 group-hover:text-purple-500 dark:text-purple-400 dark:group-hover:text-purple-300",
      orange:
        "bg-orange-500/10 group-hover:bg-orange-500/20 dark:bg-orange-500/20 dark:group-hover:bg-orange-500/30 text-orange-600 group-hover:text-orange-500 dark:text-orange-400 dark:group-hover:text-orange-300",
      red: "bg-red-500/10 group-hover:bg-red-500/20 dark:bg-red-500/20 dark:group-hover:bg-red-500/30 text-red-600 group-hover:text-red-500 dark:text-red-400 dark:group-hover:text-red-300",
      indigo:
        "bg-indigo-500/10 group-hover:bg-indigo-500/20 dark:bg-indigo-500/20 dark:group-hover:bg-indigo-500/30 text-indigo-600 group-hover:text-indigo-500 dark:text-indigo-400 dark:group-hover:text-indigo-300",
    };

    return colorMap[colorName] || colorMap["blue"]; // fallback to blue
  };

  // Get hover shadow gradient classes based on color
  const getHoverGradient = (color: string) => {
    const colorName = getColorName(color);

    const gradientMap: Record<string, string> = {
      blue: "bg-gradient-to-r from-blue-300/40 to-blue-500/10",
      green: "bg-gradient-to-r from-green-300/40 to-green-500/10",
      purple: "bg-gradient-to-r from-purple-300/40 to-purple-500/10",
      orange: "bg-gradient-to-r from-orange-300/40 to-orange-500/10",
      red: "bg-gradient-to-r from-red-300/40 to-red-500/10",
      indigo: "bg-gradient-to-r from-indigo-300/40 to-indigo-500/10",
    };

    return gradientMap[colorName] || gradientMap["blue"]; // fallback to blue
  };

  return (
    <motion.div
      ref={cardRef}
      variants={featureCardVariants}
      className="flex flex-col p-6 rounded-xl border bg-card dark:bg-background hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] 
      dark:hover:shadow-[0_8px_30px_rgba(255,255,255,0.1)] transition-all cursor-pointer h-[200px] w-full group relative overflow-hidden"
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {isHovered && (
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
      <div className="mt-4 relative z-10">
        <h3 className="text-xl font-bold text-left">{title}</h3>
        <p className="mt-2 text-sm text-muted-foreground text-left">
          {description}
        </p>
      </div>
    </motion.div>
  );
}

export function PricingFeature({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="shrink-0 h-4 w-4 text-primary mt-1"
      >
        <polyline points="20 6 9 17 4 12" />
      </svg>
      <span className="flex-1 text-left">{children}</span>
    </li>
  );
}
