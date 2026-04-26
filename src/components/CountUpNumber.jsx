import useCountUp from '../hooks/useCountUp';

/**
 * Animated number that counts up when scrolled into view
 * Usage: <CountUpNumber end={10000} suffix="+" />
 */
export default function CountUpNumber({ end, suffix = '', prefix = '', duration = 2000, className = '' }) {
  const { ref, displayValue } = useCountUp(end, duration, suffix);

  return (
    <span ref={ref} className={className}>
      {prefix}{displayValue}
    </span>
  );
}
