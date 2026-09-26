import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { AuthService, AuthValidator, ValidationErrors } from '../services/auth';

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
  // Form fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [studentId, setStudentId] = useState('');
  const [role, setRole] = useState<UserRole>('CUSTOMER');
  const [campus, setCampus] = useState('ĐH FPT TP.HCM (Campus Q.9)');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});
  const [fieldErrors, setFieldErrors] = useState<ValidationErrors>({});
  const [generalError, setGeneralError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Validation handler on change / blur
  const validateField = (field: string, value: string) => {
    let err: string | null = null;
    switch (field) {
      case 'fullName':
        err = AuthValidator.validateFullName(value);
        break;
      case 'email':
        err = AuthValidator.validateEmail(value);
        break;
      case 'phone':
        err = AuthValidator.validatePhone(value);
        break;
      case 'studentId':
        err = AuthValidator.validateStudentId(value, role);
        break;
      case 'password':
        err = AuthValidator.validatePassword(value);
        break;
      case 'confirmPassword':
        err = AuthValidator.validateConfirmPassword(password, value);
        break;
    }
    setFieldErrors(prev => ({ ...prev, [field]: err || undefined }));
    return err;
  };

  const handleBlur = (field: string, value: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validateField(field, value);
  };

  const handleChange = (field: string, value: string) => {
    switch (field) {
      case 'fullName':
        setFullName(value);
        break;
      case 'email':
        setEmail(value);
        break;
      case 'phone':
        setPhone(value);
        break;
      case 'studentId':
        setStudentId(value);
        break;
      case 'password':
        setPassword(value);
        if (touched.confirmPassword) {
          validateField('confirmPassword', confirmPassword);
        }
        break;
      case 'confirmPassword':
        setConfirmPassword(value);
        break;
    }
    if (touched[field]) {
      validateField(field, value);
    }
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError('');

    // Mark all as touched
    setTouched({
      fullName: true,
      email: true,
      phone: true,
      studentId: true,
      password: true,
      confirmPassword: true
    });

    // Run full validation check
    const errors: ValidationErrors = {};
    const e1 = AuthValidator.validateFullName(fullName);
    if (e1) errors.fullName = e1;

    const e2 = AuthValidator.validateEmail(email);
    if (e2) errors.email = e2;

    const e3 = AuthValidator.validatePhone(phone);
    if (e3) errors.phone = e3;

    const e4 = AuthValidator.validateStudentId(studentId, role);
    if (e4) errors.studentId = e4;

    const e5 = AuthValidator.validatePassword(password);
    if (e5) errors.password = e5;

    const e6 = AuthValidator.validateConfirmPassword(password, confirmPassword);
    if (e6) errors.confirmPassword = e6;

    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      setGeneralError('Vui lòng kiểm tra lại các trường thông tin có viền đỏ bên dưới.');
      return;
    }

    setIsLoading(true);

    try {
      // Gọi Real API AuthService
      const response = await AuthService.register({
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        studentId: studentId.trim(),
        role: role,
        campus: campus,
        password: password
      });

      if (!response.success || !response.user) {
        setGeneralError(response.error || 'Đăng ký thất bại. Vui lòng thử lại.');
        setIsLoading(false);
        return;
      }

      setSuccessMessage('Đăng ký tài khoản thành công! Đang chuyển hướng...');
      setTimeout(() => {
        setIsLoading(false);
        onRegisterSuccess(response.user!);
      }, 1000);

    } catch (err: any) {
      setIsLoading(false);
      setGeneralError('Lỗi kết nối máy chủ xác thực: ' + (err.message || 'Unknown error'));
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9ff] flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      
      {/* Background decoration */}
      <div className="absolute top-[-10%] right-[-10%] w-[400px] h-[400px] rounded-full bg-[#f26f21]/10 blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] rounded-full bg-[#4c56af]/10 blur-[100px] pointer-events-none"></div>

      <div className="relative z-10 w-full max-w-lg">
        
        {/* Back to login button */}
        <button
          onClick={onGoToLogin}
          className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          <span>Đã có tài khoản? Quay lại Đăng nhập</span>
        </button>

        {/* Brand header */}
        <div className="flex flex-col items-center mb-6 text-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#f26f21] to-[#ffb693] flex items-center justify-center text-white shadow-md shadow-orange-500/25 mb-2">
            <span className="material-symbols-outlined text-[24px]">person_add</span>
          </div>
          <h1 className="font-heading font-extrabold text-2xl text-[#0b1c30]">Đăng Ký Tài Khoản</h1>
          <p className="text-slate-500 text-xs mt-0.5">Hệ thống quản lý dịch vụ chăm sóc tai nghe PODCYCLE FPT</p>
        </div>

        {/* Form Card */}
        <div className="glass-card rounded-2xl shadow-xl p-6 sm:p-8 border border-slate-200/80">
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            
            {/* General Error Banner */}
            {generalError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
                <span className="material-symbols-outlined text-red-500 text-[18px] shrink-0">error</span>
                <span>{generalError}</span>
              </div>
            )}

            {/* Success Banner */}
            {successMessage && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-start gap-2">
                <span className="material-symbols-outlined text-emerald-500 text-[18px] shrink-0">check_circle</span>
                <span className="font-semibold">{successMessage}</span>
              </div>
            )}

            {/* Role selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <span>Vai Trò Đăng Ký:</span>
                <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setRole('CUSTOMER');
                    if (studentId.startsWith('TECH-')) setStudentId('');
                  }}
                  className={`p-3 rounded-xl border text-xs font-bold transition-all text-left flex items-center gap-2 ${
                    role === 'CUSTOMER'
                      ? 'border-[#f26f21] bg-orange-50 text-[#f26f21] ring-2 ring-[#f26f21]/20'
                      : 'border-slate-200 text-slate-600 bg-white hover:bg-slate-50'
                  }`}
                >
                  <span className="text-lg">👨‍🎓</span>
                  <div>
                    <span className="block font-bold">Sinh Viên FPT</span>
                    <span className="text-[10px] text-slate-500 font-normal">Đặt lịch & Xem tiến độ</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setRole('TECHNICIAN');
                    if (!studentId || studentId.startsWith('SE')) setStudentId('TECH-FPT-01');
                  }}
                  className={`p-3 rounded-xl border text-xs font-bold transition-all text-left flex items-center gap-2 ${
                    role === 'TECHNICIAN'
                      ? 'border-[#0b1c30] bg-[#0b1c30] text-white shadow-xs'
                      : 'border-slate-200 text-slate-600 bg-white hover:bg-slate-50'
                  }`}
                >
                  <span className="text-lg">🔧</span>
                  <div>
                    <span className="block font-bold">Kỹ Thuật Viên</span>
                    <span className="text-[10px] text-slate-300 font-normal">Workspace trực trạm</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Full Name */}
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                Họ và Tên <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="VD: Châu Thành Đạt"
                  value={fullName}
                  onChange={(e) => handleChange('fullName', e.target.value)}
                  onBlur={(e) => handleBlur('fullName', e.target.value)}
                  className={`w-full px-3.5 py-2.5 bg-white border rounded-xl text-xs transition-colors focus:outline-none ${
                    touched.fullName && fieldErrors.fullName
                      ? 'border-red-500 focus:ring-2 focus:ring-red-200'
                      : touched.fullName && !fieldErrors.fullName
                      ? 'border-emerald-500 focus:ring-2 focus:ring-emerald-200'
                      : 'border-slate-300 focus:ring-2 focus:ring-[#f26f21]/20 focus:border-[#f26f21]'
                  }`}
                />
                {touched.fullName && !fieldErrors.fullName && (
                  <span className="material-symbols-outlined text-emerald-500 text-[18px] absolute right-3 top-1/2 -translate-y-1/2">
                    check_circle
                  </span>
                )}
              </div>
              {touched.fullName && fieldErrors.fullName && (
                <p className="text-[10px] text-red-600 mt-1 flex items-center gap-1 font-medium">
                  <span className="material-symbols-outlined text-[13px]">warning</span>
                  <span>{fieldErrors.fullName}</span>
                </p>
              )}
            </div>

            {/* Email & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Email FPT <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="email"
                    placeholder="name.mssv@fpt.edu.vn"
                    value={email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    onBlur={(e) => handleBlur('email', e.target.value)}
                    className={`w-full px-3.5 py-2.5 bg-white border rounded-xl text-xs transition-colors focus:outline-none ${
                      touched.email && fieldErrors.email
                        ? 'border-red-500 focus:ring-2 focus:ring-red-200'
                        : touched.email && !fieldErrors.email
                        ? 'border-emerald-500 focus:ring-2 focus:ring-emerald-200'
                        : 'border-slate-300 focus:ring-2 focus:ring-[#f26f21]/20 focus:border-[#f26f21]'
                    }`}
                  />
                  {touched.email && !fieldErrors.email && (
                    <span className="material-symbols-outlined text-emerald-500 text-[18px] absolute right-3 top-1/2 -translate-y-1/2">
                      check_circle
                    </span>
                  )}
                </div>
                {touched.email && fieldErrors.email && (
                  <p className="text-[10px] text-red-600 mt-1 flex items-center gap-1 font-medium">
                    <span className="material-symbols-outlined text-[13px]">warning</span>
                    <span>{fieldErrors.email}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Số Điện Thoại <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    placeholder="VD: 0901234567"
                    value={phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    onBlur={(e) => handleBlur('phone', e.target.value)}
                    className={`w-full px-3.5 py-2.5 bg-white border rounded-xl text-xs transition-colors focus:outline-none ${
                      touched.phone && fieldErrors.phone
                        ? 'border-red-500 focus:ring-2 focus:ring-red-200'
                        : touched.phone && !fieldErrors.phone
                        ? 'border-emerald-500 focus:ring-2 focus:ring-emerald-200'
                        : 'border-slate-300 focus:ring-2 focus:ring-[#f26f21]/20 focus:border-[#f26f21]'
                    }`}
                  />
                  {touched.phone && !fieldErrors.phone && (
                    <span className="material-symbols-outlined text-emerald-500 text-[18px] absolute right-3 top-1/2 -translate-y-1/2">
                      check_circle
                    </span>
                  )}
                </div>
                {touched.phone && fieldErrors.phone && (
                  <p className="text-[10px] text-red-600 mt-1 flex items-center gap-1 font-medium">
                    <span className="material-symbols-outlined text-[13px]">warning</span>
                    <span>{fieldErrors.phone}</span>
                  </p>
                )}
              </div>
            </div>

            {/* MSSV & Campus */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  {role === 'CUSTOMER' ? 'MSSV FPT' : 'Mã Kỹ Thuật Viên'} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder={role === 'CUSTOMER' ? 'VD: SE180123' : 'VD: TECH-FPT-01'}
                    value={studentId}
                    onChange={(e) => handleChange('studentId', e.target.value.toUpperCase())}
                    onBlur={(e) => handleBlur('studentId', e.target.value)}
                    className={`w-full px-3.5 py-2.5 bg-white border rounded-xl text-xs font-mono transition-colors focus:outline-none ${
                      touched.studentId && fieldErrors.studentId
                        ? 'border-red-500 focus:ring-2 focus:ring-red-200'
                        : touched.studentId && !fieldErrors.studentId
                        ? 'border-emerald-500 focus:ring-2 focus:ring-emerald-200'
                        : 'border-slate-300 focus:ring-2 focus:ring-[#f26f21]/20 focus:border-[#f26f21]'
                    }`}
                  />
                  {touched.studentId && !fieldErrors.studentId && (
                    <span className="material-symbols-outlined text-emerald-500 text-[18px] absolute right-3 top-1/2 -translate-y-1/2">
                      check_circle
                    </span>
                  )}
                </div>
                {touched.studentId && fieldErrors.studentId && (
                  <p className="text-[10px] text-red-600 mt-1 flex items-center gap-1 font-medium">
                    <span className="material-symbols-outlined text-[13px]">warning</span>
                    <span>{fieldErrors.studentId}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Cơ Sở Hoạt Động</label>
                <select
                  value={campus}
                  onChange={(e) => setCampus(e.target.value)}
                  className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#f26f21] focus:outline-none"
                >
                  <option value="ĐH FPT TP.HCM (Campus Q.9)">FPT TP.HCM (Campus Q.9)</option>
                  <option value="ĐH FPT Hà Nội (Hòa Lạc)">FPT Hà Nội (Hòa Lạc)</option>
                </select>
              </div>
            </div>

            {/* Password & Confirm Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Mật khẩu <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Tối thiểu 6 ký tự"
                    value={password}
                    onChange={(e) => handleChange('password', e.target.value)}
                    onBlur={(e) => handleBlur('password', e.target.value)}
                    className={`w-full pl-3.5 pr-10 py-2.5 bg-white border rounded-xl text-xs transition-colors focus:outline-none ${
                      touched.password && fieldErrors.password
                        ? 'border-red-500 focus:ring-2 focus:ring-red-200'
                        : touched.password && !fieldErrors.password
                        ? 'border-emerald-500 focus:ring-2 focus:ring-emerald-200'
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
                {touched.password && fieldErrors.password && (
                  <p className="text-[10px] text-red-600 mt-1 flex items-center gap-1 font-medium">
                    <span className="material-symbols-outlined text-[13px]">warning</span>
                    <span>{fieldErrors.password}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Xác nhận mật khẩu <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Nhập lại mật khẩu"
                    value={confirmPassword}
                    onChange={(e) => handleChange('confirmPassword', e.target.value)}
                    onBlur={(e) => handleBlur('confirmPassword', e.target.value)}
                    className={`w-full pl-3.5 pr-10 py-2.5 bg-white border rounded-xl text-xs transition-colors focus:outline-none ${
                      touched.confirmPassword && fieldErrors.confirmPassword
                        ? 'border-red-500 focus:ring-2 focus:ring-red-200'
                        : touched.confirmPassword && !fieldErrors.confirmPassword
                        ? 'border-emerald-500 focus:ring-2 focus:ring-emerald-200'
                        : 'border-slate-300 focus:ring-2 focus:ring-[#f26f21]/20 focus:border-[#f26f21]'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {showConfirmPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
                {touched.confirmPassword && fieldErrors.confirmPassword && (
                  <p className="text-[10px] text-red-600 mt-1 flex items-center gap-1 font-medium">
                    <span className="material-symbols-outlined text-[13px]">warning</span>
                    <span>{fieldErrors.confirmPassword}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full fpt-gradient fpt-gradient-hover text-white font-bold text-xs py-3 rounded-xl shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 mt-3 ${
                isLoading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>Đang kết nối API xác thực & tạo tài khoản...</span>
                </>
              ) : (
                <>
                  <span>Xác Nhận Đăng Ký Tài Khoản</span>
                  <span className="material-symbols-outlined text-[18px]">how_to_reg</span>
                </>
              )}
            </button>

            {/* Login Link */}
            <div className="text-center pt-3 border-t border-slate-100">
              <p className="text-xs text-slate-500">
                Đã có tài khoản PODCYCLE?{' '}
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
