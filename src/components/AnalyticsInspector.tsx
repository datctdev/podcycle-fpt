import React, { useState, useEffect } from 'react';
import { onAnalyticsEvent } from '../utils/analytics';
import { TrackingEvent } from '../types';
import { Activity, ChevronDown, ChevronUp, Trash2, CheckCircle2 } from 'lucide-react';

export const AnalyticsInspector: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [events, setEvents] = useState<TrackingEvent[]>([]);

  useEffect(() => {
    // Load existing events from session
    try {
      const saved = JSON.parse(sessionStorage.getItem('ttn_analytics_events') || '[]');
      setEvents(saved);
    } catch {
      // Ignore
    }

    // Subscribe to new events
    const unsubscribe = onAnalyticsEvent((newEvent) => {
      setEvents((prev) => [newEvent, ...prev].slice(0, 30));
    });

    return unsubscribe;
  }, []);

  const clearEvents = () => {
    sessionStorage.removeItem('ttn_analytics_events');
    setEvents([]);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      
      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2.5 rounded-full shadow-2xl border border-slate-700 transition-all hover:scale-105"
      >
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
        <Activity className="w-4 h-4 text-emerald-400" />
        <span>GA4 Live Events ({events.length})</span>
        {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
      </button>

      {/* Drawer Panel */}
      {isOpen && (
        <div className="absolute bottom-12 right-0 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-300 overflow-hidden flex flex-col max-h-[500px] animate-in fade-in slide-in-from-bottom-3 duration-200">
          
          <div className="bg-slate-900 text-white p-3.5 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold uppercase tracking-wider">GA4 Event Inspector (Mục 1.8)</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={clearEvents}
                title="Xóa log"
                className="text-slate-400 hover:text-white p-1 rounded"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="bg-blue-50 px-3 py-2 text-[11px] text-blue-900 border-b border-blue-100 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span>Mã đo lường GA4: <strong>G-TIEMTAINHO</strong> (Active)</span>
          </div>

          {/* Event List */}
          <div className="p-3 overflow-y-auto space-y-2.5 flex-1 divide-y divide-slate-100">
            {events.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">
                Chưa có sự kiện nào phát sinh. Hãy thử bấm chọn gói dịch vụ hoặc đặt lịch!
              </div>
            ) : (
              events.map((evt) => (
                <div key={evt.id} className="pt-2 first:pt-0">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                      {evt.name}
                    </span>
                    <span className="text-[11px] text-slate-400">{evt.timestamp}</span>
                  </div>
                  <pre className="mt-1 bg-slate-900 text-emerald-400 text-[10px] p-2 rounded-lg font-mono overflow-x-auto">
                    {JSON.stringify(evt.params, null, 2)}
                  </pre>
                </div>
              ))
            )}
          </div>

          <div className="bg-slate-50 p-2 text-center border-t border-slate-200">
            <span className="text-[10px] text-slate-500">
              Minh chứng gắn công cụ đo lường và theo dõi sự kiện cho Outcome 1
            </span>
          </div>

        </div>
      )}

    </div>
  );
};
