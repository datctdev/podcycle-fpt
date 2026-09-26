import React from 'react';

export const StitchSteps: React.FC = () => {
  return (
    <section className="px-4 sm:px-6 mb-8 max-w-5xl mx-auto">
      <h3 className="font-heading font-bold text-xl text-[#0b1c30] mb-4">Quy trình 3 bước</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Step 1 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-start gap-4 hover:border-[#f26f21]/40 transition-colors">
          <div className="bg-[#f26f21]/10 w-12 h-12 rounded-full flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[#f26f21]">calendar_add_on</span>
          </div>
          <div>
            <h4 className="font-heading font-bold text-base text-[#f26f21] mb-1">1. Đặt lịch</h4>
            <p className="text-slate-600 text-xs leading-relaxed">
              Chọn thời gian và slot trực sảnh tự học campus thuận tiện nhất giữa các ca học của bạn.
            </p>
          </div>
        </div>

        {/* Step 2 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-start gap-4 hover:border-cyan-500/40 transition-colors">
          <div className="bg-cyan-500/10 w-12 h-12 rounded-full flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-cyan-700">storefront</span>
          </div>
          <div>
            <h4 className="font-heading font-bold text-base text-cyan-800 mb-1">2. Gửi thiết bị</h4>
            <p className="text-slate-600 text-xs leading-relaxed">
              Mang AirPods gửi trực tiếp tại bàn trực sảnh tự học Tòa nhà A (Campus Q.9 TP.HCM).
            </p>
          </div>
        </div>

        {/* Step 3 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-start gap-4 hover:border-emerald-500/40 transition-colors">
          <div className="bg-emerald-500/10 w-12 h-12 rounded-full flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-emerald-600">check_circle</span>
          </div>
          <div>
            <h4 className="font-heading font-bold text-base text-emerald-700 mb-1">3. Nhận lại sạch bong</h4>
            <p className="text-slate-600 text-xs leading-relaxed">
              Sau 30 phút, nhận lại tai nghe khử khuẩn sạch sẽ, test âm thanh và hài lòng mới thanh toán.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
};
