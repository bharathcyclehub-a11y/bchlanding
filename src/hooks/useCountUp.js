import { useState, useEffect, useRef } from 'react';

/**
 * Animated count-up hook that triggers when element is in viewport
 * @param {number} end - Target number
 * @param {number} duration - Animation duration in ms (default 2000)
 * @param {string} suffix - Text to append (e.g., '+', 'K', 'L')
 * @returns {{ ref, displayValue }}
 */
export default function useCountUp(end, duration = 2000, suffix = '') {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) {
          setStarted(true);
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;

    const startTime = performance.now();
    let animationFrame;

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out cubic for smooth deceleration
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * end));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [started, end, duration]);

  const displayValue = `${count.toLocaleString('en-IN')}${suffix}`;

  return { ref, displayValue, count };
}
