import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { trackVisitor } from '../utils/visitor-tracker';

/**
 * Invisible component that tracks page views on route changes
 * Skips /admin pages and deduplicates rapid re-renders
 */
export default function PageViewTracker() {
  const location = useLocation();
  const lastTracked = useRef('');

  useEffect(() => {
    // Skip admin pages
    if (location.pathname.startsWith('/admin')) return;

    // Deduplicate — don't fire twice for same path
    const key = location.pathname + location.search;
    if (key === lastTracked.current) return;
    lastTracked.current = key;

    trackVisitor('page_view', location.pathname);
  }, [location.pathname, location.search]);

  return null;
}
