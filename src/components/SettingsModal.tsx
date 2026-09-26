import React, { useState } from 'react';
import { 
  getSupabaseConfig, 
  SUPABASE_SQL_SCHEMA 
} from '../services/db';
import { 
  getSePayPgConfig, 
  saveSePayPgConfig, 
  SePayPgConfig,
  getSePayApiToken,
  saveSePayApiToken,
  testSePayConnection
} from '../services/sepay';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onSaved }) => {
  const [supabaseUrl, setSupabaseUrl] = useState(getSupabaseConfig().url);
  const [supabaseKey, setSupabaseKey] = useState(getSupabaseConfig().key);
  const [sepayPgConfig, setSepayPgConfigState] = useState<SePayPgConfig>(getSePayPgConfig());
  const [sepayApiKey, setSepayApiKey] = useState(getSePayApiToken());
  const [testingSepay, setTestingSepay] = useState(false);
  const [sepayTestResult, setSepayTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  if (!isOpen) return null;

  const handleTestSepay = async () => {
    setTestingSepay(true);
    setSepayTestResult(null);
    try {
      const res = await testSePayConnection(sepayApiKey);
      setSepayTestResult(res);
    } catch (err: any) {
      setSepayTestResult({ success: false, message: err.message || 'Lỗi kết nối' });
    } finally {
      setTestingSepay(false);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveSePayPgConfig({
      ...sepayPgConfig,
      env: 'production' // Luôn cố định môi trường thực tế Production
    });
    saveSePayApiToken(sepayApiKey);
    if (supabaseUrl) localStorage.setItem('ttn_supabase_url', supabaseUrl.trim());
    if (supabaseKey) localStorage.setItem('ttn_supabase_key', supabaseKey.trim());
    setSavedSuccess(true);
    onSaved();
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  const copySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white text-[#0b1c30] rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5 border border-slate-200 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#f26f21] text-[24px]">settings</span>
            <h3 className="font-heading font-extrabold text-base text-[#0b1c30]">
              Cấu Hình Production (SePay Gateway & Database)
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {savedSuccess && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px] text-emerald-600">check_circle</span>
            <span>Đã lưu thành công cấu hình Production!</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          
          {/* SECTION 1: SEPAY PAYMENT GATEWAY (PRODUCTION BÊN THỨ 3) */}
          <div className="space-y-3 bg-blue-50/70 p-4 rounded-2xl border border-blue-200">
            <div className="flex items-center justify-between">
              <span className="font-heading font-bold text-xs text-blue-900 flex items-center gap-1.5 uppercase">
                <span className="material-symbols-outlined text-[18px] text-blue-600">verified_user</span>
                <span>1. Cổng Thanh Toán SePay (Production 100%)</span>
              </span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded-full font-bold">
                LIVE PRODUCTION
              </span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Mọi giao dịch chuyển khoản đều được xử lý an toàn thông qua cổng thanh toán SePay Gateway chính thức. Lấy khóa Live tại <a href="https://my.sepay.vn" target="_blank" rel="noreferrer" className="text-blue-700 underline font-semibold">my.sepay.vn</a>.
            </p>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                SePay Merchant ID (Live) *:
              </label>
              <input
                type="text"
                value={sepayPgConfig.merchant_id}
                onChange={(e) => setSepayPgConfigState({ ...sepayPgConfig, merchant_id: e.target.value.trim() })}
                placeholder="VD: SP-LIVE-CT923674"
                required
                className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-mono text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                SePay Secret Key (Live) *:
              </label>
              <input
                type="password"
                value={sepayPgConfig.secret_key}
                onChange={(e) => setSepayPgConfigState({ ...sepayPgConfig, secret_key: e.target.value.trim() })}
                placeholder="Dán mã spsk_live_... bí mật"
                required
                className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-mono text-[11px] text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* SECTION 2: SUPABASE CLOUD DATABASE CONFIG */}
          <div className="space-y-2.5 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <span className="font-heading font-bold text-xs text-[#0b1c30] flex items-center gap-1.5 uppercase">
              <span className="material-symbols-outlined text-[18px]">database</span>
              <span>2. Cloud Database PostgreSQL (Supabase)</span>
            </span>
            <p className="text-[11px] text-slate-500">
              Đồng bộ dữ liệu đặt lịch thật trực tiếp lên Cloud Database.
            </p>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Supabase Project URL:</label>
              <input
                type="text"
                value={supabaseUrl}
                onChange={(e) => setSupabaseUrl(e.target.value)}
                placeholder="https://xyzcompany.supabase.co"
                className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-mono text-[11px] text-slate-900 focus:ring-2 focus:ring-[#f26f21] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Supabase Anon Key:</label>
              <input
                type="password"
                value={supabaseKey}
                onChange={(e) => setSupabaseKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
                className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-mono text-[11px] text-slate-900 focus:ring-2 focus:ring-[#f26f21] focus:outline-none"
              />
            </div>

            <div className="pt-1">
              <button
                type="button"
                onClick={copySql}
                className="w-full py-2 px-3 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <span className="material-symbols-outlined text-[15px]">content_copy</span>
                <span>{copiedSql ? '✓ Đã copy mã SQL tạo bảng!' : 'Copy mã SQL tạo bảng cho Supabase'}</span>
              </button>
            </div>
          </div>

          {/* SECTION 3: SEPAY API TOKEN (TÙY CHỌN ĐỐI SOÁT TỰ ĐỘNG) */}
          <div className="space-y-2 bg-emerald-50/60 p-4 rounded-2xl border border-emerald-200">
            <span className="font-heading font-bold text-xs text-emerald-800 flex items-center gap-1.5 uppercase">
              <span className="material-symbols-outlined text-[18px] text-emerald-600">sensors</span>
              <span>3. SePay API Token (Auto-Polling Sao Kê)</span>
            </span>
            <p className="text-[11px] text-slate-600">
              Dùng để tự động tra cứu biến động số dư nền nếu cần đối soát liên tục.
            </p>

            <div>
              <input
                type="password"
                value={sepayApiKey}
                onChange={(e) => setSepayApiKey(e.target.value)}
                placeholder="Dán SePay API Key (tùy chọn)..."
                className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-mono text-[11px] text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            {sepayApiKey && (
              <div className="pt-1">
                <button
                  type="button"
                  onClick={handleTestSepay}
                  disabled={testingSepay}
                  className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                >
                  {testingSepay ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      <span>Đang kiểm tra SePay API...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[15px]">sensors</span>
                      <span>Kiểm Tra Kết Nối SePay API</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {sepayTestResult && (
              <div className={`p-2.5 rounded-xl text-[11px] font-medium flex items-start gap-1.5 ${sepayTestResult.success ? 'bg-emerald-100/80 text-emerald-900 border border-emerald-300' : 'bg-rose-100/80 text-rose-900 border border-rose-300'}`}>
                <span className="material-symbols-outlined text-[16px] shrink-0">
                  {sepayTestResult.success ? 'check_circle' : 'error'}
                </span>
                <span>{sepayTestResult.message}</span>
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="pt-2 flex gap-2">
            <button
              type="submit"
              className="flex-1 fpt-gradient fpt-gradient-hover text-white font-bold text-xs py-3 rounded-xl shadow-md active:scale-95 transition-all flex items-center justify-center gap-1"
            >
              <span className="material-symbols-outlined text-[16px]">save</span>
              <span>Lưu Cấu Hình Production</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors"
            >
              Hủy
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
