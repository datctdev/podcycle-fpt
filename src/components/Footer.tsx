import React from 'react';
import { Headphones, Shield, Heart, Phone, Mail, FileText } from 'lucide-react';

interface FooterProps {
  onNavigate?: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-slate-900 text-slate-400 text-xs py-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand info */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2 text-white">
              <Headphones className="w-5 h-5 text-[#f26f21]" />
              <span className="font-bold text-base">Tiệm Tai Nhỏ (EXE201)</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Nền tảng điều phối đặt lịch trực tuyến kết hợp trạm dịch vụ bảo dưỡng, vệ sinh ngoại quan chuyên sâu và kiểm tra âm thanh AirPods trực tiếp tại campus ĐH FPT.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Trực tiếp tại FPT TP.HCM & Hà Nội</span>
            </div>
          </div>

          {/* Members */}
          <div className="space-y-2">
            <span className="font-semibold text-white uppercase tracking-wider block text-[11px]">Nhóm Sinh Viên Sáng Lập</span>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Châu Thành Đạt • Trương Lâm Tấn • Nguyễn Minh Hiếu • Nguyễn Văn Minh • Đoàn Minh Khôi • Nguyễn Văn Cương
            </p>
            <p className="text-slate-500 pt-1 text-[11px]">
              Giảng viên hướng dẫn: <strong>ThS. Dư Tiểu Dương (DuongDT26)</strong>
            </p>
          </div>

          {/* Legal & Compliance (Mục 2 Chuẩn đầu ra EXE201) */}
          <div className="space-y-2">
            <span className="font-semibold text-white uppercase tracking-wider block text-[11px]">Quyền Riêng Tư & Hỗ Trợ</span>
            <ul className="space-y-1.5 text-[11px]">
              <li>
                <button
                  onClick={() => onNavigate && onNavigate('contact')}
                  className="hover:text-white flex items-center gap-1.5 transition-colors text-left"
                >
                  <Phone className="w-3.5 h-3.5 text-[#f26f21]" />
                  <span>Trung tâm Liên hệ & Hotline</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate && onNavigate('privacy')}
                  className="hover:text-white flex items-center gap-1.5 transition-colors text-left"
                >
                  <FileText className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Chính sách quyền riêng tư (CH Play)</span>
                </button>
              </li>
              <li className="flex items-center gap-1.5 text-slate-400 pt-0.5">
                <Mail className="w-3.5 h-3.5 text-slate-500" />
                <span>support.podcycle@fpt.edu.vn</span>
              </li>
            </ul>
          </div>

          {/* Guarantees */}
          <div className="space-y-2">
            <span className="font-semibold text-white uppercase tracking-wider block text-[11px]">Cam Kết Chất Lượng</span>
            <div className="flex items-start gap-2 text-slate-300">
              <Shield className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span className="text-[11px] leading-relaxed">
                Hoàn phí 100% nếu âm thanh không cải thiện sau khi vệ sinh.
              </span>
            </div>
            <p className="text-slate-500 text-[11px]">
              Trạm bàn giao: Sảnh Tự Học Tòa Nhà A (Campus Q.9 TP.HCM) & Sảnh Beta Hall (Hòa Lạc HN).
            </p>
          </div>

        </div>

        <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500">
          <p className="text-[11px]">© 2026 Tiệm Tai Nhỏ - Môn học Khởi nghiệp EXE201. Đã đăng ký bản quyền giải pháp.</p>
          <div className="flex items-center gap-1 text-[11px]">
            <span>Phát triển với</span>
            <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
            <span>cho cộng đồng sinh viên FPT</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
