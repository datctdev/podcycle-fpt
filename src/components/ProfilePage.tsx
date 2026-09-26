import React from 'react';
import { User, Booking } from '../types';

interface ProfilePageProps {
  user: User;
  bookings: Booking[];
  onLogout: () => void;
  onGoToTechnicianWorkspace: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
  user,
  bookings,
  onLogout,
  onGoToTechnicianWorkspace
}) => {
  const userBookings = bookings.filter(
    (b) => b.phone === user.phone || b.studentId === user.studentId
  );

  return (
    <div className="pt-20 pb-28 px-4 sm:px-6 max-w-xl mx-auto space-y-5">
      
      {/* Profile Header Card */}
      <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-200/90 text-center space-y-3 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-r from-[#f26f21] to-[#ffb693]"></div>

        <div className="relative pt-6">
          <div className="w-20 h-20 rounded-full border-4 border-white shadow-md mx-auto overflow-hidden bg-slate-100">
            <img
              src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
              alt={user.fullName}
              className="w-full h-full object-cover"
            />
          </div>

          <h2 className="font-heading font-extrabold text-xl text-[#0b1c30] mt-2">
            {user.fullName}
          </h2>
          <span className="inline-block bg-orange-100 text-[#f26f21] text-xs font-bold px-3 py-0.5 rounded-full mt-1">
            {user.role === 'TECHNICIAN' ? '🔧 Kỹ Thuật Viên Trạm Sảnh' : '👨‍🎓 Sinh Viên ĐH FPT'}
          </span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100">
          <div className="p-2.5 rounded-xl bg-slate-50">
            <span className="text-[10px] text-slate-400 block uppercase font-bold">Số Lần Vệ Sinh</span>
            <span className="font-heading font-black text-lg text-[#0b1c30]">
              {userBookings.length > 0 ? userBookings.length : 1} lần
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50">
            <span className="text-[10px] text-slate-400 block uppercase font-bold">Điểm Tích Lũy</span>
            <span className="font-heading font-black text-lg text-[#10B981]">
              120 pts
            </span>
          </div>
        </div>
      </div>

      {/* Account Info Details */}
      <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200/90 space-y-3 text-xs">
        <h3 className="font-heading font-bold text-sm text-[#0b1c30]">Thông Tin Sinh Viên</h3>

        <div className="divide-y divide-slate-100 space-y-2">
          <div className="flex justify-between pt-1">
            <span className="text-slate-400">Email:</span>
            <span className="font-semibold text-slate-800">{user.email}</span>
          </div>
          <div className="flex justify-between pt-2">
            <span className="text-slate-400">Số điện thoại:</span>
            <span className="font-semibold text-slate-800">{user.phone}</span>
          </div>
          <div className="flex justify-between pt-2">
            <span className="text-slate-400">Mã sinh viên (MSSV):</span>
            <span className="font-semibold text-slate-800">{user.studentId || 'Chưa cập nhật'}</span>
          </div>
          <div className="flex justify-between pt-2">
            <span className="text-slate-400">Campus đăng ký:</span>
            <span className="font-semibold text-slate-800">{user.campus || 'FPT Campus Q.9'}</span>
          </div>
        </div>
      </div>

      {/* Technician Switcher (If technician or for test convenience) */}
      <div className="bg-slate-900 text-white p-5 rounded-2xl space-y-3">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#ffb693] text-[20px]">engineering</span>
          <div>
            <h4 className="font-heading font-bold text-xs">Khu Vực Làm Việc Của Kỹ Thuật Viên</h4>
            <p className="text-[11px] text-slate-400">Dành riêng cho nhân viên trực tại trạm sảnh tự học campus</p>
          </div>
        </div>

        <button
          onClick={onGoToTechnicianWorkspace}
          className="w-full bg-[#f26f21] hover:bg-[#e05e10] text-white font-bold text-xs py-2.5 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-1.5"
        >
          <span>Vào Workspace Kỹ Thuật Viên</span>
          <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
        </button>
      </div>

      {/* Logout */}
      <button
        onClick={onLogout}
        className="w-full bg-white hover:bg-red-50 text-red-600 font-bold text-xs py-3 rounded-2xl border border-red-200 shadow-2xs transition-colors flex items-center justify-center gap-1.5"
      >
        <span className="material-symbols-outlined text-[16px]">logout</span>
        <span>Đăng Xuất Tài Khoản</span>
      </button>

    </div>
  );
};
