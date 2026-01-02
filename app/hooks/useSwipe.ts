export function useSwipe(onUp: () => void, onDown: () => void) {
  let startY: number | null = null;

  return {
    onTouchStart: (e: React.TouchEvent) => {
      startY = e.touches[0].clientY;
    },
    onTouchEnd: (e: React.TouchEvent) => {
      if (startY === null) return;
      const diff = startY - e.changedTouches[0].clientY;
      if (diff > 50) onUp();
      if (diff < -50) onDown();
      startY = null;
    },
  };
}
