import { useEffect, useRef, useState } from "react";

export const useAnimatedCounter = (targetValue: number, duration: number) => {
  const [currentValue, setCurrentValue] = useState(targetValue);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const startValueRef = useRef<number>(targetValue);

  useEffect(() => {
    if (startValueRef.current !== targetValue) {
      startValueRef.current = currentValue;
      startTimeRef.current = Date.now();

      const animate = () => {
        const now = Date.now();
        const elapsed = now - (startTimeRef.current || now);
        const progress = Math.min(elapsed / duration, 1);

        // Easing function for smooth animation
        const easeOutCubic = 1 - Math.pow(1 - progress, 3);

        const newValue =
          startValueRef.current +
          (targetValue - startValueRef.current) * easeOutCubic;
        setCurrentValue(newValue);

        if (progress < 1) {
          animationRef.current = requestAnimationFrame(animate);
        }
      };

      animationRef.current = requestAnimationFrame(animate);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [targetValue, duration, currentValue]);

  return Math.round(currentValue);
};

export const useAnimatedDecimalCounter = (
  targetValue: number,
  duration: number,
  decimals: number
) => {
  const [currentValue, setCurrentValue] = useState(targetValue);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const startValueRef = useRef<number>(targetValue);

  useEffect(() => {
    if (Math.abs(startValueRef.current - targetValue) > 0) {
      startValueRef.current = currentValue;
      startTimeRef.current = Date.now();

      const animate = () => {
        const now = Date.now();
        const elapsed = now - (startTimeRef.current || now);
        const progress = Math.min(elapsed / duration, 1);

        // Easing function for smooth animation
        const easeOutCubic = 1 - Math.pow(1 - progress, 3);

        const newValue =
          startValueRef.current +
          (targetValue - startValueRef.current) * easeOutCubic;
        setCurrentValue(newValue);

        if (progress < 1) {
          animationRef.current = requestAnimationFrame(animate);
        }
      };

      animationRef.current = requestAnimationFrame(animate);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [targetValue, duration, currentValue, decimals]);

  return parseFloat(currentValue.toFixed(decimals));
};
