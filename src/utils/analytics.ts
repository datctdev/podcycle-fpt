import { TrackingEvent } from '../types';

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

type EventCallback = (event: TrackingEvent) => void;
const listeners: EventCallback[] = [];

export const onAnalyticsEvent = (callback: EventCallback) => {
  listeners.push(callback);
  return () => {
    const idx = listeners.indexOf(callback);
    if (idx !== -1) listeners.splice(idx, 1);
  };
};

export const trackEvent = (eventName: string, params: Record<string, any> = {}) => {
  const eventObj: TrackingEvent = {
    id: 'evt_' + Math.random().toString(36).substring(2, 9),
    name: eventName,
    timestamp: new Date().toLocaleTimeString('vi-VN', { hour12: false }),
    params: {
      ...params,
      platform: 'web',
      project: 'tiem-tai-nho'
    }
  };

  // 1. Google Analytics 4 standard dispatch
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    try {
      window.gtag('event', eventName, params);
      console.log(`[GA4 Event] ${eventName}:`, params);
    } catch (err) {
      console.warn('GA4 dispatch error:', err);
    }
  }

  // 2. Notify in-app analytics debugger
  listeners.forEach(cb => cb(eventObj));

  // 3. Store into local session log
  try {
    const existing = JSON.parse(sessionStorage.getItem('ttn_analytics_events') || '[]');
    existing.unshift(eventObj);
    sessionStorage.setItem('ttn_analytics_events', JSON.stringify(existing.slice(0, 50)));
  } catch {
    // Ignore storage issues
  }
};
