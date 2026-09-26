import React, { useEffect } from 'react';
import { trackEvent } from '../utils/analytics';

interface PrivacyPolicyPageProps {
  onBackToHome: () => void;
}

export const PrivacyPolicyPage: React.FC<PrivacyPolicyPageProps> = ({ onBackToHome }) => {
  useEffect(() => {
    trackEvent('view_privacy_policy', { page: 'privacy_policy' });
  }, []);

  return (
    <div className="pt-20 pb-28 px-4 sm:px-6 max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="pb-4 border-b border-slate-200">
        <button
          onClick={onBackToHome}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#f26f21] mb-2 transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          <span>Quay lại Trang chủ</span>
        </button>
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
            <span className="material-symbols-outlined text-[24px]">verified_user</span>
          </div>
          <div>
            <h1 className="font-heading font-extrabold text-2xl text-[#0b1c30]">
              Chính Sách Quyền Riêng Tư & Bảo Vệ Dữ Liệu
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Tuân thủ Tiêu chuẩn Phân phối CH Play & Nghị định 13/2023/NĐ-CP về Bảo vệ dữ liệu cá nhân
            </p>
          </div>
        </div>
      </div>

      {/* Main Legal Content Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-9 border border-slate-200/90 shadow-xs space-y-6 text-slate-700 text-xs sm:text-sm leading-relaxed">
        
        {/* Intro Banner */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
          <span className="material-symbols-outlined text-[#f26f21] text-[22px] shrink-0 mt-0.5">shield</span>
          <div className="space-y-1">
            <p className="font-bold text-slate-900 text-xs">
              Cam kết bảo mật của Tiệm Tai Nhỏ (Dự án PODCYCLE - Đại học FPT)
            </p>
            <p className="text-[11px] text-slate-500 leading-normal">
              Chính sách này công bố minh bạch cách thức nền tảng thu thập, lưu trữ, sử dụng và bảo vệ thông tin cá nhân của sinh viên và người dùng khi sử dụng dịch vụ đặt lịch chăm sóc tai nghe AirPods tại các trạm sảnh campus.
            </p>
          </div>
        </div>

        {/* Section 1 */}
        <div className="space-y-2">
          <h2 className="font-heading font-bold text-base text-[#0b1c30] flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-orange-100 text-[#f26f21] text-xs font-black flex items-center justify-center">1</span>
            <span>Các Dữ Liệu Cá Nhân Được Thu Thập</span>
          </h2>
          <p className="text-slate-600">
            Để thực hiện việc điều phối đặt lịch hẹn và phục vụ tại sảnh, hệ thống chỉ thu thập các thông tin thiết yếu sau:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-slate-600 text-xs">
            <li><strong>Thông tin định danh:</strong> Họ và tên, Mã số sinh viên (MSSV ĐH FPT), Địa chỉ Email.</li>
            <li><strong>Thông tin liên lạc:</strong> Số điện thoại cá nhân (sử dụng để thông báo qua SMS/Zalo khi tai nghe vệ sinh xong).</li>
            <li><strong>Thông tin thiết bị:</strong> Dòng tai nghe (Model AirPods), tình trạng âm thanh lâm sàng và ghi chú sự cố của tai nghe.</li>
            <li><strong>Hình ảnh kiểm tra ngoại quan (Trước & Sau vệ sinh):</strong> Ảnh chụp vỏ dock và màng loa tai nghe bằng camera tại trạm tiếp nhận nhằm đối chiếu trầy xước minh bạch.</li>
          </ul>
        </div>

        {/* Section 2 */}
        <div className="space-y-2">
          <h2 className="font-heading font-bold text-base text-[#0b1c30] flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-orange-100 text-[#f26f21] text-xs font-black flex items-center justify-center">2</span>
            <span>Mục Đích Và Phạm Vi Xử Lý Thông Tin</span>
          </h2>
          <p className="text-slate-600">
            Dữ liệu cá nhân của người dùng chỉ được sử dụng cho các mục đích chính đáng:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-slate-600 text-xs">
            <li>Xác thực slot hẹn và in tem niêm phong chống thất lạc tai nghe tại sảnh trực tiếp.</li>
            <li>Khởi tạo mã VietQR động chính xác theo số tiền gói dịch vụ và xuất Hóa đơn điện tử e-receipt.</li>
            <li>Kỹ thuật viên đối chứng tình trạng trước - sau và gửi đánh giá chất lượng âm lượng sau vệ sinh.</li>
            <li>Tuyệt đối <strong>KHÔNG</strong> bán, chia sẻ hoặc thương mại hóa thông tin sinh viên cho bất kỳ bên thứ ba nào vì mục đích quảng cáo rác.</li>
          </ul>
        </div>

        {/* Section 3 */}
        <div className="space-y-2">
          <h2 className="font-heading font-bold text-base text-[#0b1c30] flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-orange-100 text-[#f26f21] text-xs font-black flex items-center justify-center">3</span>
            <span>Chính Sách Bảo Mật Hình Ảnh Camera & Thiết Bị</span>
          </h2>
          <p className="text-slate-600 text-xs">
            Tính năng chụp ảnh và tải ảnh tại Workspace Kỹ thuật viên hoạt động tuân thủ nguyên tắc riêng tư:
          </p>
          <div className="p-3.5 rounded-xl bg-indigo-50/60 border border-indigo-100 text-indigo-900 text-xs space-y-1">
            <p className="font-semibold flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">photo_camera</span>
              <span>Giới hạn quyền truy cập camera:</span>
            </p>
            <p className="text-[11px] text-indigo-700 leading-relaxed">
              Camera chỉ được kích hoạt khi Kỹ thuật viên chủ động bấm nút "Chụp Ảnh Hiện Trạng Ngoại Quan" tại trạm bàn giao. Ứng dụng không bao giờ truy cập micro hay các tệp tin cá nhân ngoài khung hình tai nghe đang tiếp nhận.
            </p>
          </div>
        </div>

        {/* Section 4 */}
        <div className="space-y-2">
          <h2 className="font-heading font-bold text-base text-[#0b1c30] flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-orange-100 text-[#f26f21] text-xs font-black flex items-center justify-center">4</span>
            <span>Thời Hạn Lưu Trữ & Quyền Của Chủ Thể Dữ Liệu</span>
          </h2>
          <p className="text-slate-600 text-xs">
            Theo Nghị định 13/2023/NĐ-CP và tiêu chuẩn người dùng của Google Play Store:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-slate-600 text-xs">
            <li>Người dùng có quyền tra cứu, xuất file PDF lịch sử giao dịch và bảo dưỡng bất kỳ lúc nào.</li>
            <li>Người dùng có quyền yêu cầu xóa bỏ hoàn toàn dữ liệu tài khoản, lịch hẹn và số điện thoại khỏi hệ thống bằng cách gửi yêu cầu tại trang Liên Hệ hoặc liên hệ DPO dự án.</li>
            <li>Dữ liệu mật khẩu tài khoản được mã hóa một chiều an toàn bằng thuật toán <strong>SHA-256 kèm Salt</strong> trước khi ghi vào bộ nhớ; ban quản trị không lưu trữ mật khẩu ở dạng văn bản thuần.</li>
          </ul>
        </div>

        {/* Section 5 */}
        <div className="space-y-2">
          <h2 className="font-heading font-bold text-base text-[#0b1c30] flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-orange-100 text-[#f26f21] text-xs font-black flex items-center justify-center">5</span>
            <span>Đơn Vị Chịu Trách Nhiệm Vận Hành & Bảo Vệ Dữ Liệu</span>
          </h2>
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
            <p className="font-bold text-slate-900">Ban Quản Trị Dự Án Tiệm Tai Nhỏ - PODCYCLE FPT (EXE201)</p>
            <p className="text-slate-600">Trưởng nhóm phụ trách kỹ thuật: <strong>Châu Thành Đạt</strong> (SE180123)</p>
            <p className="text-slate-600">Email tiếp nhận khiếu nại bảo mật: <strong>datct.se18@fpt.edu.vn</strong> / <strong>support.podcycle@fpt.edu.vn</strong></p>
            <p className="text-slate-600">Địa chỉ liên hệ: Khu Công Nghệ Cao, Long Thạnh Mỹ, TP. Thủ Đức, TP. Hồ Chí Minh</p>
          </div>
        </div>

        {/* Footer actions */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-3">
          <span className="text-[11px] text-slate-400">
            Phiên bản hiệu lực: Tháng 09/2026 • Cập nhật định kỳ theo tiêu chuẩn Play Console & ĐH FPT
          </span>
          <button
            onClick={onBackToHome}
            className="fpt-gradient fpt-gradient-hover text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-xs"
          >
            Đã Hiểu & Quay Lại Trang Chủ
          </button>
        </div>

      </div>

    </div>
  );
};
