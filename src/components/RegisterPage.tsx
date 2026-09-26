import React, { useState } from 'react';
import { User, UserRole } from '../types';

interface RegisterPageProps {
  onRegisterSuccess: (user: User) => void;
  onGoToLogin: () => void;
  onBackToHome: () => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({
  onRegisterSuccess,
  onGoToLogin,
  onBackToHome
}) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [studentId, setStudentId] = useState('');
  const [role, setRole] = useState<UserRole>('CUSTOMER');
  const [campus, setCampus] = useState('ĐH FPT TP.HCM (Campus Q.9)');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !phone.trim() || !password.trim()) {
      setError('Vui lòng điền đầy đủ các thông tin bắt buộc.');
      return;
    }

    const newUser: User = {
      id: 'usr_' + Date.now(),
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      studentId: studentId.trim() || (role === 'CUSTOMER' ? 'SE18xxxx' : 'TECH-01'),
      role: role,
      campus: campus,
      avatar: role === 'CUSTOMER'
        ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
        : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80'
    };

    // Save to custom users
    try {
      const existing = JSON.parse(localStorage.getItem('podcycle_custom_users') || '[]');
      existing.push({ ...newUser, password });
      localStorage.setItem('podcycle_custom_users', JSON.stringify(existing));
    } catch {
      // ignore
    }

    onRegisterSuccess(newUser);
  };

  return (
    <div className="min-h-screen bg-[#f8f9ff] flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      
      {/* Background decoration */}
      <div className="absolute top-[-10%] right-[-10%] w-[400px] h-[400px] rounded-full bg-[#f26f21]/10 blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] rounded-full bg-[#4c56af]/10 blur-[100px] pointer-events-none"></div>

      <div className="relative z-10 w-full max-w-md">
        
        {/* Back button */}
        <button
          onClick={onBackToHome}
          className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          <span>Về trang chủ</span>
        </button>

        {/* Brand header */}
        <div className="flex flex-col items-center mb-6 text-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#f26f21] to-[#ffb693] flex items-center justify-center text-white shadow-md shadow-orange-500/25 mb-2">
            <span className="material-symbols-outlined text-[24px]">person_add</span>
          </div>
          <h1 className="font-heading font-extrabold text-2xl text-[#0b1c30]">Đăng Ký Tài Khoản</h1>
          <p className="text-slate-500 text-xs mt-0.5">Tạo tài khoản sinh viên FPT hoặc kỹ thuật viên trạm</p>
        </div>

        {/* Form Card */}
        <div className="glass-card rounded-2xl shadow-xl p-6 sm:p-8 border border-slate-200/80">
          <form onSubmit={handleSubmit} className="space-y-3.5">
            
            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
                {error}
              </div>
            )}

            {/* Role selector */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Vai Trò Đăng Ký:</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRole('CUSTOMER')}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-center ${
                    role === 'CUSTOMER'
                      ? 'border-[#f26f21] bg-orange-50 text-[#f26f21] ring-2 ring-[#f26f21]/20'
                      : 'border-slate-200 text-slate-600 bg-white'
                  }`}
                >
                  👨‍🎓 Sinh Viên FPT
                </button>

                <button
                  type="button"
                  onClick={() => setRole('TECHNICIAN')}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-center ${
                    role === 'TECHNICIAN'
                      ? 'border-[#0b1c30] bg-[#0b1c30] text-white shadow-xs'
                      : 'border-slate-200 text-slate-600 bg-white'
                  }`}
                >
                  🔧 Kỹ Thuật Viên
                </button>
              </div>
            </div>

            {/* Full Name */}
            <div>
              <label className="text-[11px] font-semibold text-slate-700 block mb-1">Họ và Tên *</label>
              <input
                type="text"
                placeholder="VD: Châu Thành Đạt"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#f26f21] focus:outline-none"
              />
            </div>

            {/* Email & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">Email FPT *</label>
                <input
                  type="email"
                  placeholder="name@fpt.edu.vn"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#f26f21] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">Số Điện Thoại *</label>
                <input
                  type="tel"
                  placeholder="09xxxxxxxx"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#f26f21] focus:outline-none"
                />
              </div>
            </div>

            {/* MSSV & Campus */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                  {role === 'CUSTOMER' ? 'MSSV FPT' : 'Mã Kỹ Thuật Viên'}
                </label>
                <input
                  type="text"
                  placeholder={role === 'CUSTOMER' ? 'VD: SE180123' : 'VD: TECH-01'}
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#f26f21] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">Campus</label>
                <select
                  value={campus}
                  onChange={(e) => setCampus(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#f26f21] focus:outline-none"
                >
                  <option value="ĐH FPT TP.HCM (Campus Q.9)">FPT TP.HCM (Q.9)</option>
                  <option value="ĐH FPT Hà Nội (Hòa Lạc)">FPT Hà Nội (Hòa Lạc)</option>
                </select>
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-[11px] font-semibold text-slate-700 block mb-1">Mật khẩu *</label>
              <input
                type="password"
                placeholder="Tối thiểu 6 ký tự (VD: 123456)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#f26f21] focus:outline-none"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full fpt-gradient fpt-gradient-hover text-white font-bold text-xs py-3 rounded-xl shadow-md active:scale-95 transition-all flex items-center justify-center gap-1.5 mt-2"
            >
              <span>Hoàn Tất Đăng Ký</span>
              <span className="material-symbols-outlined text-[18px]">check</span>
            </button>

            {/* Login Link */}
            <div className="text-center pt-2 border-t border-slate-100">
              <p className="text-xs text-slate-500">
                Đã có tài khoản?{' '}
                <button
                  type="button"
                  onClick={onGoToLogin}
                  className="font-bold text-[#f26f21] hover:underline"
                >
                  Đăng nhập tại đây
                </button>
              </p>
            </div>

          </form>
        </div>

      </div>

    </div>
  );
};
