import React, { useState } from 'react';
import { User } from '../types';
import { AuthService } from '../services/auth';

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
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ identifier?: string; password?: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  // Validate on submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const newFieldErrors: { identifier?: string; password?: string } = {};

    if (!identifier.trim()) {
      newFieldErrors.identifier = 'Vui lòng nhập Email FPT hoặc Số điện thoại.';
    }
    if (!password) {
      newFieldErrors.password = 'Vui lòng nhập mật khẩu.';
    }

    setFieldErrors(newFieldErrors);
    if (Object.keys(newFieldErrors).length > 0) return;

    setIsLoading(true);

    try {
      // Call Real AuthService API
      const result = await AuthService.login(identifier.trim(), password);

      if (!result.success || !result.user) {
        setIsLoading(false);
        setError(result.error || 'Đăng nhập không thành công. Vui lòng kiểm tra lại thông tin.');
        return;
      }

      setIsLoading(false);
      onLoginSuccess(result.user);
    } catch (err: any) {
      setIsLoading(false);
      setError('Lỗi kết nối máy chủ xác thực: ' + (err.message || 'Unknown error'));
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9ff] flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      
      {/* Background decorations */}
      <div className="absolute top-[-10%] right-[-10%] w-[400px] h-[400px] rounded-full bg-[#f26f21]/10 blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] rounded-full bg-[#4c56af]/10 blur-[100px] pointer-events-none"></div>

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-md">

        {/* Brand header */}
        <div className="flex flex-col items-center mb-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#f26f21] to-[#ffb693] flex items-center justify-center text-white shadow-lg shadow-orange-500/25 mb-3">
            <span className="material-symbols-outlined text-[30px]">headphones</span>
          </div>
          <h1 className="font-heading font-extrabold text-2xl text-[#0b1c30]">PODCYCLE</h1>
          <p className="text-slate-500 text-xs mt-1">Đăng nhập tài khoản sinh viên hoặc kỹ thuật viên</p>
        </div>

        {/* Form Card */}
        <div className="glass-card rounded-2xl shadow-xl p-6 sm:p-8 border border-slate-200/80">
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            
            {/* Error Message */}
            {error && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
                <span className="material-symbols-outlined text-red-500 text-[18px] shrink-0">error</span>
                <span>{error}</span>
              </div>
            )}

            {/* Email / Phone */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700" htmlFor="identifier">
                Email FPT hoặc Số điện thoại <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
                  account_circle
                </span>
                <input
                  id="identifier"
                  type="text"
                  placeholder="name.mssv@fpt.edu.vn hoặc 0901234567"
                  value={identifier}
                  onChange={(e) => {
                    setIdentifier(e.target.value);
                    if (fieldErrors.identifier) setFieldErrors(prev => ({ ...prev, identifier: undefined }));
                  }}
                  className={`w-full pl-10 pr-4 py-2.5 bg-white border rounded-xl focus:outline-none text-xs text-[#0b1c30] transition-colors ${
                    fieldErrors.identifier
                      ? 'border-red-500 focus:ring-2 focus:ring-red-200'
                      : 'border-slate-300 focus:ring-2 focus:ring-[#f26f21]/20 focus:border-[#f26f21]'
                  }`}
                />
              </div>
              {fieldErrors.identifier && (
                <p className="text-[10px] text-red-600 mt-1 flex items-center gap-1 font-medium">
                  <span className="material-symbols-outlined text-[13px]">warning</span>
                  <span>{fieldErrors.identifier}</span>
                </p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-700" htmlFor="password">
                  Mật khẩu <span className="text-red-500">*</span>
                </label>
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
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (fieldErrors.password) setFieldErrors(prev => ({ ...prev, password: undefined }));
                  }}
                  className={`w-full pl-10 pr-10 py-2.5 bg-white border rounded-xl focus:outline-none text-xs text-[#0b1c30] transition-colors ${
                    fieldErrors.password
                      ? 'border-red-500 focus:ring-2 focus:ring-red-200'
                      : 'border-slate-300 focus:ring-2 focus:ring-[#f26f21]/20 focus:border-[#f26f21]'
                  }`}
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
              {fieldErrors.password && (
                <p className="text-[10px] text-red-600 mt-1 flex items-center gap-1 font-medium">
                  <span className="material-symbols-outlined text-[13px]">warning</span>
                  <span>{fieldErrors.password}</span>
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full fpt-gradient fpt-gradient-hover text-white font-bold text-xs py-3 rounded-xl shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 mt-2 ${
                isLoading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>Đang kết nối API xác thực...</span>
                </>
              ) : (
                <>
                  <span>Đăng Nhập</span>
                  <span className="material-symbols-outlined text-[18px]">login</span>
                </>
              )}
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
