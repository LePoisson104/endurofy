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
  description,
}: {
  icon: React.ReactNode;
  title: string;
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
          className="absolute w-[200px] h-[200px] rounded-full bg-gradient-to-r from-blue-300/40 to-blue-500/10 blur-2xl pointer-events-none transition-transform duration-100"
          style={{
            left: position.x,
            top: position.y,
            transform: "translate(-50%, -50%)",
          }}
        />
      )}
      <div
        className="rounded-full bg-foreground/10 group-hover:bg-blue-400/20 dark:bg-foreground/20 dark:group-hover:bg-blue-400/20 p-2 w-fit 
      transition-colors relative z-10 text-primary group-hover:text-blue-400 dark:group-hover:text-blue-300"
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
