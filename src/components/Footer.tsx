import React from 'react';
import { Headphones, Shield, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 text-xs py-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Brand info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-white">
              <Headphones className="w-5 h-5 text-blue-400" />
              <span className="font-bold text-base">Tiệm Tai Nhỏ (EXE201)</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Nền tảng điều phối đặt lịch trực tuyến kết hợp trạm dịch vụ bảo dưỡng, vệ sinh ngoại quan chuyên sâu và kiểm tra âm thanh AirPods trực tiếp tại campus ĐH FPT.
            </p>
          </div>

          {/* Members */}
          <div className="space-y-2">
            <span className="font-semibold text-white uppercase tracking-wider block">Thành Viên Nhóm Dự Án</span>
            <p className="text-slate-400">
              Châu Thành Đạt • Trương Lâm Tấn • Nguyễn Minh Hiếu • Nguyễn Văn Minh • Đoàn Minh Khôi • Nguyễn Văn Cương
            </p>
            <p className="text-slate-500 pt-1">
              Giảng viên hướng dẫn: <strong>Dư Tiểu Dương</strong>
            </p>
          </div>

          {/* Guarantees */}
          <div className="space-y-2">
            <span className="font-semibold text-white uppercase tracking-wider block">Cam Kết Dịch Vụ</span>
            <div className="flex items-center gap-2 text-slate-300">
              <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Hoàn phí 100% nếu âm thanh không cải thiện sau vệ sinh</span>
            </div>
            <p className="text-slate-500">
              Trạm bàn giao: Sảnh Tự Học Tòa Nhà A (Campus Q.9 TP.HCM) & Sảnh Beta Hall (Hòa Lạc HN).
            </p>
          </div>

        </div>

        <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500">
          <p>© 2026 Tiệm Tai Nhỏ - Môn học Khởi nghiệp EXE201. Đã đăng ký bản quyền giải pháp.</p>
          <div className="flex items-center gap-1">
            <span>Phát triển với</span>
            <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
            <span>cho cộng đồng sinh viên FPT</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
