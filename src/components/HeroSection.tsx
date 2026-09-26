import React from 'react';
import { Sparkles, Clock, CheckCircle2, ShieldCheck, ArrowRight, AlertTriangle } from 'lucide-react';
import { trackEvent } from '../utils/analytics';

interface HeroProps {
  onStartBooking: () => void;
}

export const HeroSection: React.FC<HeroProps> = ({ onStartBooking }) => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-blue-50/60 via-white to-slate-50 pt-8 pb-16 sm:pb-24 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Banner badge */}
        <div className="inline-flex items-center gap-2 bg-blue-100/80 border border-blue-200 text-blue-800 text-xs sm:text-sm font-semibold px-3 py-1 rounded-full mb-6">
          <Sparkles className="w-4 h-4 text-blue-600" />
          <span>Mô hình O2O đầu tiên trực tiếp tại Campus ĐH FPT</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Heading & Value Proposition */}
          <div className="lg:col-span-7 space-y-6">
            <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Trạm Vệ Sinh AirPods Chuyên Sâu <br />
              <span className="text-blue-600">Lấy Ngay 30 Phút Giữa Ca Học</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed">
              Bẻ gãy hoàn toàn sự trì hoãn và nỗi lo bị luộc đồ. Đặt lịch online 1 chạm, gửi máy ngay tại bàn trực sảnh tự học campus và nhận lại tai nghe sạch bóng, phục hồi âm lượng chuẩn ban đầu.
            </p>

            {/* Quick Guarantees */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="flex items-center gap-2.5 bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
                <Clock className="w-5 h-5 text-blue-600 shrink-0" />
                <span className="text-sm font-medium text-slate-800">Xử lý 30 phút giữa ca học</span>
              </div>
              <div className="flex items-center gap-2.5 bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                <span className="text-sm font-medium text-slate-800">Hoàn tiền 100% nếu không cải thiện</span>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-4">
              <button
                onClick={() => {
                  trackEvent('start_booking_cta', { position: 'hero' });
                  onStartBooking();
                }}
                className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3.5 rounded-xl shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Đặt Lịch Vệ Sinh 90.000đ</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 text-sm text-slate-500">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Trạm sảnh tự học đang mở slot hôm nay</span>
              </div>
            </div>
          </div>

          {/* Right Column: Pain Points Card (From EXE101 Research) */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-2xl p-6 shadow-xl border border-slate-200/80 relative">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  <h3 className="font-bold text-slate-900 text-base">Thực trạng AirPods Sinh Viên FPT</h3>
                </div>
                <span className="text-xs bg-slate-100 font-medium px-2 py-1 rounded text-slate-600">Khảo sát FPT K18</span>
              </div>

              <div className="space-y-4 pt-4">
                <div className="flex items-start gap-3">
                  <div className="bg-red-50 text-red-700 font-bold text-sm px-2 py-0.5 rounded shrink-0">91.8%</div>
                  <p className="text-xs sm:text-sm text-slate-600">Bị tích tụ cáu cặn, bã nhờn sâu trong màng loa sau 6 tháng sử dụng.</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-red-50 text-red-700 font-bold text-sm px-2 py-0.5 rounded shrink-0">90.9%</div>
                  <p className="text-xs sm:text-sm text-slate-600">Gặp tình trạng loa nghẹt, nhỏ tiếng một bên, cản trở việc học và họp nhóm.</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-amber-50 text-amber-700 font-bold text-sm px-2 py-0.5 rounded shrink-0">96.4%</div>
                  <p className="text-xs sm:text-sm text-slate-600">Tự dùng tăm, kim nhọn cạy bẩn tại nhà gây nguy cơ rách màng lưới loa.</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-blue-50 text-blue-700 font-bold text-sm px-2 py-0.5 rounded shrink-0">81.8%</div>
                  <p className="text-xs sm:text-sm text-slate-600">Sợ cửa hàng nhỏ lẻ bên ngoài tráo linh kiện và hét giá bất hợp lý.</p>
                </div>
              </div>

              <div className="mt-5 p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span className="text-xs font-semibold text-emerald-800">
                  Giải pháp Tiệm Tai Nhỏ: Minh bạch 100%, bảo dưỡng tận mắt ngay tại Campus!
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
