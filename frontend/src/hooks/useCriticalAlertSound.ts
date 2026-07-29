import { useEffect, useRef } from "react";

export function useCriticalAlertSound(alerts: { level: string }[]) {
  const previousCount = useRef<number | null>(null);
  useEffect(() => {
    const count = alerts.filter((alert) => alert.level === "critical").length;
    const enabled = localStorage.getItem("criticalSound") !== "off";
    if (enabled && count > 0 && previousCount.current !== null && count > previousCount.current) {
      const context = new AudioContext();
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.frequency.value = 880;
      gain.gain.setValueAtTime(0.08, context.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.45);
      oscillator.connect(gain).connect(context.destination);
      oscillator.start(); oscillator.stop(context.currentTime + 0.45);
    }
    previousCount.current = count;
  }, [alerts]);
}
