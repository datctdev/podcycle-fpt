import React, { useState } from 'react';
import { trackEvent } from '../utils/analytics';
import { User } from '../types';

interface ContactPageProps {
  currentUser?: User | null;
  onBackToHome: () => void;
}

export const ContactPage: React.FC<ContactPageProps> = ({ currentUser, onBackToHome }) => {
  const [fullName, setFullName] = useState(currentUser?.fullName || '');
  const [studentId, setStudentId] = useState(currentUser?.studentId || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [category, setCategory] = useState('tu_van');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!fullName.trim() || !phone.trim() || !message.trim()) {
      setError('Vui lòng điền đầy đủ họ tên, số điện thoại và nội dung cần hỗ trợ.');
      return;
    }

    setIsSubmitting(true);

    try {
      const ticket = {
        id: 'ticket_' + Date.now(),
        fullName: fullName.trim(),
        studentId: studentId.trim(),
        phone: phone.trim(),
        category,
        message: message.trim(),
        createdAt: new Date().toISOString(),
        status: 'OPEN'
      };

      const existing = JSON.parse(localStorage.getItem('podcycle_support_tickets') || '[]');
      existing.unshift(ticket);
      localStorage.setItem('podcycle_support_tickets', JSON.stringify(existing));

      // Track analytics event
      trackEvent('contact_submit', {
        category,
        student_id: studentId || 'GUEST',
        phone: phone.substring(0, 3) + '***'
      });

      setIsSubmitting(false);
      setIsSubmitted(true);
    } catch (err: any) {
      setIsSubmitting(false);
      setError('Không thể gửi yêu cầu: ' + (err.message || 'Lỗi không xác định'));
    }
  };

  return (
    <div className="pt-20 pb-28 px-4 sm:px-6 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      
      {/* Header & Back */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <button
            onClick={onBackToHome}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#f26f21] mb-2 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            <span>Quay lại Trang chủ</span>
          </button>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-orange-100 text-[#f26f21] flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px]">support_agent</span>
            </div>
            <div>
              <h1 className="font-heading font-extrabold text-2xl text-[#0b1c30]">
                Trung Tâm Liên Hệ & Hỗ Trợ Kỹ Thuật
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Dự án Chăm sóc & Vệ sinh AirPods PODCYCLE - Đại học FPT (EXE201)
              </p>
            </div>
          </div>
        </div>

        <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3.5 py-1.5 rounded-full self-start sm:self-auto">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
          <span className="text-[11px] font-bold text-emerald-800">Trạm đang trực tiếp nhận máy</span>
        </div>
      </div>

      {/* Grid: Contact Info Cards & Support Form */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Left Column: Direct Contact Info (5 cols) */}
        <div className="md:col-span-5 space-y-4">
          
          {/* Card Hotline & Online */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs space-y-4">
            <h3 className="font-heading font-bold text-sm text-[#0b1c30] flex items-center gap-2">
              <span className="material-symbols-outlined text-[#f26f21] text-[18px]">call</span>
              <span>Đường Dây Nóng Tiếp Nhận</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-orange-50/70 border border-orange-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Hotline Trực Ca Sảnh</span>
                  <a href="tel:0901234567" className="font-heading font-black text-base text-[#f26f21] hover:underline">
                    0901.234.567
                  </a>
                </div>
                <span className="material-symbols-outlined text-[#f26f21] text-[24px]">phone_in_talk</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Email Hỗ Trợ Dự Án</span>
                  <span className="font-semibold text-slate-800">support.podcycle@fpt.edu.vn</span>
                </div>
                <span className="material-symbols-outlined text-slate-500 text-[20px]">mail</span>
              </div>

              <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Kênh Zalo Hỗ Trợ 1:1</span>
                  <span className="font-semibold text-blue-700">zalo.me/podcycle_fpt</span>
                </div>
                <span className="material-symbols-outlined text-blue-600 text-[20px]">chat</span>
              </div>
            </div>
          </div>

          {/* Card Physical Booth Locations */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs space-y-3">
            <h3 className="font-heading font-bold text-sm text-[#0b1c30] flex items-center gap-2">
              <span className="material-symbols-outlined text-[#f26f21] text-[18px]">location_on</span>
              <span>Vị Trí Trạm Trực Tại Campus</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="border-l-3 border-[#f26f21] pl-3 py-1">
                <p className="font-bold text-slate-900">Campus TP.HCM (Quận 9)</p>
                <p className="text-slate-500 text-[11px] mt-0.5">
                  Bàn trực Sảnh Tự Học Tòa Nhà A (cạnh Canteen). Giờ trực: 08:30 - 16:45 (T2 - T7).
                </p>
              </div>

              <div className="border-l-3 border-indigo-500 pl-3 py-1">
                <p className="font-bold text-slate-900">Campus Hà Nội (Hòa Lạc)</p>
                <p className="text-slate-500 text-[11px] mt-0.5">
                  Sảnh Beta Hall (Khu Vực Sinh Viên). Giờ trực: 08:30 - 16:45 (T2 - T7).
                </p>
              </div>
            </div>
          </div>

          {/* Service Guarantee Note */}
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-start gap-2.5">
            <span className="material-symbols-outlined text-amber-600 text-[20px] shrink-0">verified</span>
            <div>
              <p className="font-bold">Cam Kết Bảo Hành Âm Thanh</p>
              <p className="text-[11px] text-amber-700 mt-0.5">
                Khách hàng được trực tiếp test màng loa trước khi rời sảnh. Hoàn phí 100% nếu âm thanh không cải thiện rõ rệt.
              </p>
            </div>
          </div>

        </div>

        {/* Right Column: Feedback & Support Ticket Form (7 cols) */}
        <div className="md:col-span-7">
          <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/90 shadow-xs">
            
            <h3 className="font-heading font-bold text-base text-[#0b1c30] mb-1">
              Gửi Phản Hồi Hoặc Yêu Cầu Hỗ Trợ
            </h3>
            <p className="text-xs text-slate-500 mb-5">
              Đội ngũ Kỹ thuật viên PODCYCLE sẽ tiếp nhận và phản hồi qua SĐT/Zalo trong vòng 15 phút.
            </p>

            {isSubmitted ? (
              <div className="text-center py-10 space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <span className="material-symbols-outlined text-[36px]">check_circle</span>
                </div>
                <h4 className="font-heading font-extrabold text-lg text-slate-900">
                  Đã Tiếp Nhận Thông Tin Thành Công!
                </h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                  Cảm ơn bạn đã liên hệ với Tiệm Tai Nhỏ. Kỹ thuật viên trưởng ca trực sẽ liên hệ hỗ trợ bạn qua số điện thoại <strong>{phone}</strong> trong ít phút.
                </p>
                <div className="pt-2 flex justify-center gap-3">
                  <button
                    onClick={() => {
                      setIsSubmitted(false);
                      setMessage('');
                    }}
                    className="text-xs text-slate-600 hover:text-slate-900 font-semibold px-4 py-2 rounded-xl border border-slate-200"
                  >
                    Gửi phản hồi khác
                  </button>
                  <button
                    onClick={onBackToHome}
                    className="fpt-gradient fpt-gradient-hover text-white text-xs font-bold px-5 py-2 rounded-xl shadow-xs"
                  >
                    Quay về Trang chủ
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                
                {error && (
                  <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
                    <span className="material-symbols-outlined text-red-500 text-[18px] shrink-0">error</span>
                    <span>{error}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">
                      Họ và Tên Sinh Viên <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Nguyễn Văn A"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-[#0b1c30] focus:outline-none focus:ring-2 focus:ring-[#f26f21]/20 focus:border-[#f26f21]"
                    />
                  </div>

                  {/* Student ID */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Mã Sinh Viên (MSSV)</label>
                    <input
                      type="text"
                      placeholder="SE18xxxx hoặc IA17xxxx"
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-[#0b1c30] focus:outline-none focus:ring-2 focus:ring-[#f26f21]/20 focus:border-[#f26f21]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Phone */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">
                      Số Điện Thoại (Zalo) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      placeholder="0901234567"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-[#0b1c30] focus:outline-none focus:ring-2 focus:ring-[#f26f21]/20 focus:border-[#f26f21]"
                    />
                  </div>

                  {/* Category */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Chủ Đề Cần Hỗ Trợ</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-[#0b1c30] focus:outline-none focus:ring-2 focus:ring-[#f26f21]/20 focus:border-[#f26f21]"
                    >
                      <option value="tu_van">Tư vấn gói dịch vụ AirPods phù hợp</option>
                      <option value="doi_lich">Hỗ trợ đổi giờ hẹn lấy máy</option>
                      <option value="khieu_nai">Khiếu nại / Bảo hành âm thanh sau vệ sinh</option>
                      <option value="hoa_don">Yêu cầu xuất lại hóa đơn điện tử</option>
                      <option value="hop_tac">Đề xuất hợp tác / Khác</option>
                    </select>
                  </div>
                </div>

                {/* Message */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">
                    Nội Dung Cần Hỗ Trợ Chi Tiết <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Mô tả tình trạng tai nghe, thắc mắc về lịch hẹn hoặc phản hồi chất lượng..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full p-3.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-[#0b1c30] focus:outline-none focus:ring-2 focus:ring-[#f26f21]/20 focus:border-[#f26f21]"
                  />
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full fpt-gradient fpt-gradient-hover text-white font-bold text-xs py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 ${
                    isSubmitting ? 'opacity-70 cursor-not-allowed' : 'active:scale-95'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      <span>Đang gửi thông tin...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[18px]">send</span>
                      <span>Gửi Yêu Cầu Hỗ Trợ Ngay</span>
                    </>
                  )}
                </button>

              </form>
            )}

          </div>
        </div>

      </div>

    </div>
  );
};
