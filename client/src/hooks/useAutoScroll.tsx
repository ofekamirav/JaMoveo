import { useState, useRef, useEffect, useCallback } from "react";

export const useAutoScroll = (scrollSpeed: number = 50) => {
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const startScrolling = useCallback(() => {
    if (scrollIntervalRef.current) return; 

    scrollIntervalRef.current = setInterval(() => {
      window.scrollBy(0, 1);
    }, scrollSpeed);
    setIsScrolling(true);
  }, [scrollSpeed]);

  const stopScrolling = useCallback(() => {
    if (scrollIntervalRef.current) {
      clearInterval(scrollIntervalRef.current);
      scrollIntervalRef.current = null;
    }
    setIsScrolling(false);
  }, []);

  const toggleScrolling = useCallback(() => {
    if (isScrolling) {
      stopScrolling();
    } else {
      startScrolling();
    }
  }, [isScrolling, startScrolling, stopScrolling]);

  useEffect(() => {
    return () => {
      stopScrolling();
    };
  }, [stopScrolling]);

  return { isScrolling, toggleScrolling };
};
