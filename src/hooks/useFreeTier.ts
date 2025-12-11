import { useState, useEffect } from 'react';

export function useFreeTier() {
  const MAX_FREE_USAGE = 3;
  const [usageCount, setUsageCount] = useState(0);
  const [isLimitReached, setIsLimitReached] = useState(false);
  const [mounted, setMounted] = useState(false); // To prevent hydration mismatch

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem('guest_usage_count');
    if (stored) {
      const count = parseInt(stored, 10);
      setUsageCount(count);
      if (count >= MAX_FREE_USAGE) setIsLimitReached(true);
    }
  }, []);

  return { 
    remaining: Math.max(0, MAX_FREE_USAGE - usageCount),
    isLimitReached,
    mounted
  };
}