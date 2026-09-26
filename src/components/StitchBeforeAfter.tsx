import React, { useState, useRef, useCallback } from 'react';

export const StitchBeforeAfter: React.FC = () => {
  const [sliderPos, setSliderPos] = useState<number>(50);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'slider' | 'full' | 'station'>('slider');
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const width = rect.width;
    const percentage = Math.max(0, Math.min(100, (x / width) * 100));
    setSliderPos(percentage);
  }, []);

  const handleTouchMove = (e: React.TouchEvent) => {
    handleMove(e.touches[0].clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    handleMove(e.clientX);
  };

  return (
    <section className="px-4 sm:px-6 mb-10 max-w-5xl mx-auto">
      <div className="flex flex-col gap-4">
        
        {/* Header with Title and Mode Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-[#f26f21]/10 text-[#f26f21] text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-[#f26f21]/20">
                KIỂM ĐỊNH LÂM SÀNG
              </span>
              <span className="text-emerald-600 text-xs font-semibold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Hiệu quả thực tế
              </span>
            </div>
            <h3 className="font-heading font-extrabold text-xl sm:text-2xl text-[#0b1c30] mt-1">
              Đối Chiếu Trước & Sau Khi Vệ Sinh
            </h3>
            <p className="text-slate-500 text-xs sm:text-sm">
              Khôi phục 95-100% âm lượng ban đầu & loại bỏ 99.9% cặn ráy tai bám màng loa
            </p>
          </div>

          {/* Asset View Mode Tabs */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold self-start sm:self-auto">
            <button
              onClick={() => setActiveTab('slider')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
                activeTab === 'slider'
                  ? 'bg-white text-[#0b1c30] shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="material-symbols-outlined text-[15px] text-[#f26f21]">compare</span>
              <span>Kéo So Sánh</span>
            </button>
            <button
              onClick={() => setActiveTab('full')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
                activeTab === 'full'
                  ? 'bg-white text-[#0b1c30] shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="material-symbols-outlined text-[15px] text-[#4c56af]">burst_mode</span>
              <span>Ảnh Góc Rộng</span>
            </button>
            <button
              onClick={() => setActiveTab('station')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
                activeTab === 'station'
                  ? 'bg-white text-[#0b1c30] shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="material-symbols-outlined text-[15px] text-emerald-600">engineering</span>
              <span>Bàn KTV</span>
            </button>
          </div>
        </div>

        {/* 1. SLIDER MODE (Kéo vuốt tương tác) */}
        {activeTab === 'slider' && (
          <div 
            ref={containerRef}
            className="relative rounded-2xl overflow-hidden shadow-md border border-slate-200 aspect-[16/9] sm:aspect-[21/9] select-none cursor-ew-resize bg-slate-900"
            onMouseDown={() => setIsDragging(true)}
            onMouseUp={() => setIsDragging(false)}
            onMouseLeave={() => setIsDragging(false)}
            onMouseMove={handleMouseMove}
            onTouchMove={handleTouchMove}
          >
            {/* Background: Dirty / Before Image */}
            <img
              src="/before-after.png"
              alt="AirPods trước khi vệ sinh"
              className="absolute inset-0 w-full h-full object-cover pointer-events-none"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/clean-airpods.png';
              }}
            />

            {/* Foreground: Clean / After Image (Clipped) */}
            <div 
              className="absolute inset-0 overflow-hidden pointer-events-none"
              style={{ clipPath: `inset(0 0 0 ${sliderPos}%)` }}
            >
              <img
                src="/clean-airpods.png"
                alt="AirPods sau khi vệ sinh sạch bong"
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>

            {/* Divider Handle */}
            <div 
              className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_12px_rgba(0,0,0,0.6)] cursor-ew-resize pointer-events-none"
              style={{ left: `${sliderPos}%` }}
            >
              <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-white text-[#0b1c30] shadow-lg flex items-center justify-center border-2 border-[#f26f21]">
                <span className="material-symbols-outlined text-[20px] text-[#f26f21]">compare_arrows</span>
              </div>
            </div>

            {/* Labels */}
            <div className="absolute top-4 left-4 bg-black/75 backdrop-blur-xs text-white text-[10px] font-bold px-3 py-1 rounded-full border border-white/20 pointer-events-none">
              TRƯỚC (BÁM BẨN, NGHẸT ÂM)
            </div>
            <div className="absolute top-4 right-4 bg-emerald-600/90 backdrop-blur-xs text-white text-[10px] font-bold px-3 py-1 rounded-full border border-white/20 pointer-events-none">
              SAU (KHỬ KHUẨN, ÂM CHUẨN)
            </div>

            {/* Bottom Hint */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-semibold px-4 py-1.5 rounded-full border border-white/10 flex items-center gap-1.5 pointer-events-none">
              <span className="material-symbols-outlined text-[15px] text-[#ffb693]">touch_app</span>
              <span>Chạm hoặc kéo thanh trượt để so sánh</span>
            </div>
          </div>
        )}

        {/* 2. FULL VIEW MODE (Ảnh Adobe Express Trước Sau góc rộng) */}
        {activeTab === 'full' && (
          <div className="relative rounded-2xl overflow-hidden shadow-md border border-slate-200 aspect-[16/9] sm:aspect-[21/9] bg-slate-900">
            <img
              src="/before-after.png"
              alt="Ảnh đối chiếu trước và sau"
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-4 left-4 glass-card px-4 py-2 rounded-xl text-xs font-bold text-[#0b1c30] flex items-center gap-2">
              <span className="material-symbols-outlined text-[#f26f21] text-[18px]">verified</span>
              <span>Ảnh thực tế bàn giao tại Campus ĐH FPT</span>
            </div>
          </div>
        )}

        {/* 3. STATION VIEW MODE (Trạm KTV công nghệ cao) */}
        {activeTab === 'station' && (
          <div className="relative rounded-2xl overflow-hidden shadow-md border border-slate-200 aspect-[16/9] sm:aspect-[21/9] bg-slate-900">
            <img
              src="/cleaning-station.png"
              alt="Bàn trực kỹ thuật viên công nghệ cao"
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-4 left-4 glass-card px-4 py-2 rounded-xl text-xs font-bold text-[#0b1c30] flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-600 text-[18px]">biotech</span>
              <span>Thiết bị vệ sinh siêu âm chuyên dụng không dùng cồn gây bong keo</span>
            </div>
          </div>
        )}

        {/* 3 Metric Cards Underneath from Stitch Design System */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-100 text-[#f26f21] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[20px]">volume_up</span>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 font-semibold uppercase">Âm thanh khôi phục</p>
              <p className="font-heading font-extrabold text-sm text-[#0b1c30]">95% - 100% âm lượng gốc</p>
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[20px]">sanitizer</span>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 font-semibold uppercase">Diệt khuẩn màng loa</p>
              <p className="font-heading font-extrabold text-sm text-[#0b1c30]">99.9% Kháng khuẩn UV</p>
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[20px]">timer</span>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 font-semibold uppercase">Thời gian thực hiện</p>
              <p className="font-heading font-extrabold text-sm text-[#0b1c30]">Chuẩn 30 phút giữa ca</p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
