import React, { useState } from 'react';
import { User } from '../types';
import { DEMO_USERS } from '../data/mockUsers';

interface LoginPageProps {
  onLoginSuccess: (user: User) => void;
  onGoToRegister: () => void;
  onBackToHome: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLoginSuccess,
  onGoToRegister,
  onBackToHome
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    setTimeout(() => {
      // Find user in registered list or demo users
      const allUsers = [...DEMO_USERS];
      try {
        const customUsers = JSON.parse(localStorage.getItem('podcycle_custom_users') || '[]');
        allUsers.push(...customUsers);
      } catch {
        // ignore
      }

      const found = allUsers.find(
        (u) => u.email.toLowerCase() === email.trim().toLowerCase()
      );

      if (found && (found.password === password || password === '123' || password === '123456')) {
        setIsLoading(false);
        onLoginSuccess(found);
      } else if (found) {
        setIsLoading(false);
        setError('Mật khẩu không chính xác. Mẹo: nhập 123');
      } else {
        // If not found, create a customer session on the fly
        const newUser: User = {
          id: 'usr_' + Date.now(),
          fullName: email.split('@')[0],
          email: email.trim(),
          phone: '0901234567',
          studentId: 'SE180999',
          role: 'CUSTOMER',
          campus: 'ĐH FPT TP.HCM (Campus Q.9)',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
        };
        setIsLoading(false);
        onLoginSuccess(newUser);
      }
    }, 400);
  };

  const handleQuickDemo = (userRole: 'CUSTOMER' | 'TECHNICIAN') => {
    const target = DEMO_USERS.find((u) => u.role === userRole);
    if (target) {
      onLoginSuccess(target);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9ff] flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      
      {/* Background decorations */}
      <div className="absolute top-[-10%] right-[-10%] w-[400px] h-[400px] rounded-full bg-[#f26f21]/10 blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] rounded-full bg-[#4c56af]/10 blur-[100px] pointer-events-none"></div>

      {/* Main Container */}
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
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#f26f21] to-[#ffb693] flex items-center justify-center text-white shadow-lg shadow-orange-500/25 mb-3">
            <span className="material-symbols-outlined text-[30px]">headphones</span>
          </div>
          <h1 className="font-heading font-extrabold text-2xl text-[#0b1c30]">PODCYCLE</h1>
          <p className="text-slate-500 text-xs mt-1">Đăng nhập tài khoản sinh viên hoặc kỹ thuật viên</p>
        </div>

        {/* Quick Demo Switcher Cards */}
        <div className="bg-orange-50/80 p-3 rounded-2xl border border-orange-200 mb-5 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#f26f21]">
            <span className="material-symbols-outlined text-[16px]">bolt</span>
            <span>ĐĂNG NHẬP NHANH ĐỂ TRẢI NGHIỆM 2 VAI TRÒ:</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemo('CUSTOMER')}
              className="bg-white hover:bg-slate-50 border border-orange-200 p-2.5 rounded-xl text-left transition-all active:scale-95 shadow-2xs"
            >
              <span className="block text-[11px] font-bold text-[#0b1c30]">👨‍🎓 Sinh Viên</span>
              <span className="block text-[10px] text-slate-500">Châu Thành Đạt</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemo('TECHNICIAN')}
              className="bg-[#0b1c30] hover:bg-slate-800 text-white p-2.5 rounded-xl text-left transition-all active:scale-95 shadow-xs"
            >
              <span className="block text-[11px] font-bold text-[#ffb693]">🔧 Kỹ Thuật Viên</span>
              <span className="block text-[10px] text-slate-300">Nguyễn Văn Minh</span>
            </button>
          </div>
        </div>

        {/* Form Card */}
        <div className="glass-card rounded-2xl shadow-xl p-6 sm:p-8 border border-slate-200/80">
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
                {error}
              </div>
            )}

            {/* Email */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700" htmlFor="email">
                Email FPT / Số điện thoại
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
                  mail
                </span>
                <input
                  id="email"
                  type="text"
                  placeholder="example@fpt.edu.vn"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26f21]/20 focus:border-[#f26f21] text-xs text-[#0b1c30]"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-slate-700" htmlFor="password">
                  Mật khẩu
                </label>
                <span className="text-[11px] text-[#f26f21] cursor-pointer hover:underline">
                  Mặc định: 123
                </span>
              </div>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
                  lock
                </span>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26f21]/20 focus:border-[#f26f21] text-xs text-[#0b1c30]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full fpt-gradient fpt-gradient-hover text-white font-bold text-xs py-3 rounded-xl shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 mt-2"
            >
              <span>{isLoading ? 'Đang xác thực...' : 'Đăng Nhập'}</span>
              <span className="material-symbols-outlined text-[18px]">login</span>
            </button>

            {/* Register Link */}
            <div className="text-center pt-3 border-t border-slate-100">
              <p className="text-xs text-slate-500">
                Chưa có tài khoản?{' '}
                <button
                  type="button"
                  onClick={onGoToRegister}
                  className="font-bold text-[#f26f21] hover:underline"
                >
                  Đăng ký tài khoản mới
                </button>
              </p>
            </div>

          </form>
        </div>

      </div>

    </div>
  );
};
