/**
 * SEPAY PAYMENT GATEWAY & AUTOMATED BANKING SERVICE (SEPAY.VN)
 * 1. Hỗ trợ SePay Payment Gateway (SePay PG): Merchant ID & Secret Key, ký HMAC-SHA256, checkout form URL.
 * 2. Hỗ trợ SePay Direct VietQR Napas 24/7 & Auto-Polling qua SePay API v2.
 */

import CryptoJS from 'crypto-js';

// ==============================================================
// 1. CẤU HÌNH SEPAY PAYMENT GATEWAY (MERCHANT ID & SECRET KEY)
// ==============================================================
export type SePayPgEnv = 'sandbox' | 'production';

export interface SePayPgConfig {
  env: SePayPgEnv;
  merchant_id: string;
  secret_key: string;
}

export interface OneTimePaymentParams {
  payment_method?: 'BANK_TRANSFER' | 'NAPAS_BANK_TRANSFER';
  order_invoice_number: string;
  order_amount: number;
  currency?: string;
  order_description?: string;
  customer_id?: string;
  success_url?: string;
  error_url?: string;
  cancel_url?: string;
  custom_data?: string;
}

export interface SePayCheckoutFormFields {
  [key: string]: string | number;
  merchant: string;
  operation: string;
  payment_method: string;
  order_invoice_number: string;
  order_amount: number;
  currency: string;
  order_description: string;
  signature: string;
}

export const DEFAULT_SEPAY_PG_CONFIG: SePayPgConfig = {
  env: 'sandbox',
  merchant_id: '',
  secret_key: ''
};

/**
 * Lấy cấu hình SePay PG (Merchant ID & Secret Key)
 */
export const getSePayPgConfig = (): SePayPgConfig => {
  try {
    const saved = localStorage.getItem('ttn_sepay_pg_config');
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        env: parsed.env || (import.meta.env.VITE_SEPAY_ENV as SePayPgEnv) || 'sandbox',
        merchant_id: parsed.merchant_id || import.meta.env.VITE_SEPAY_MERCHANT_ID || '',
        secret_key: parsed.secret_key || import.meta.env.VITE_SEPAY_SECRET_KEY || ''
      };
    }
  } catch {
    // ignore
  }

  return {
    env: (import.meta.env.VITE_SEPAY_ENV as SePayPgEnv) || 'sandbox',
    merchant_id: import.meta.env.VITE_SEPAY_MERCHANT_ID || '',
    secret_key: import.meta.env.VITE_SEPAY_SECRET_KEY || ''
  };
};

/**
 * Lưu cấu hình SePay PG vào LocalStorage
 */
export const saveSePayPgConfig = (config: Partial<SePayPgConfig>) => {
  const current = getSePayPgConfig();
  const updated = { ...current, ...config };
  localStorage.setItem('ttn_sepay_pg_config', JSON.stringify(updated));
  return updated;
};

/**
 * Lớp SePay Payment Gateway Client (Tương thích 100% tài liệu sepay-pg-node)
 */
export class SePayPgClient {
  private config: SePayPgConfig;

  constructor(config?: Partial<SePayPgConfig>) {
    const defaultConfig = getSePayPgConfig();
    this.config = {
      env: config?.env || defaultConfig.env,
      merchant_id: config?.merchant_id ?? defaultConfig.merchant_id,
      secret_key: config?.secret_key ?? defaultConfig.secret_key
    };
  }

  public get checkout() {
    return {
      initCheckoutUrl: (): string => {
        const version = 'v1';
        return this.config.env === 'sandbox'
          ? `https://pay-sandbox.sepay.vn/${version}/checkout/init`
          : `https://pay.sepay.vn/${version}/checkout/init`;
      },

      initOneTimePaymentFields: (params: OneTimePaymentParams): SePayCheckoutFormFields => {
        const fields: Record<string, any> = {
          merchant: this.config.merchant_id,
          operation: 'PURCHASE',
          payment_method: params.payment_method || 'BANK_TRANSFER',
          order_invoice_number: params.order_invoice_number,
          order_amount: Math.round(params.order_amount),
          currency: params.currency || 'VND',
          order_description: params.order_description || `Thanh toan don hang ${params.order_invoice_number}`,
          customer_id: params.customer_id,
          success_url: params.success_url,
          error_url: params.error_url,
          cancel_url: params.cancel_url,
          custom_data: params.custom_data
        };

        const signature = this.signFields(fields);
        return {
          ...fields,
          signature
        } as SePayCheckoutFormFields;
      }
    };
  }

  /**
   * Ký chữ ký HMAC-SHA256 theo đúng đặc tả của SePay Payment Gateway
   */
  private signFields(fields: Record<string, any>): string {
    const signedAllowed = [
      'merchant',
      'env',
      'operation',
      'payment_method',
      'order_amount',
      'currency',
      'order_invoice_number',
      'order_description',
      'customer_id',
      'agreement_id',
      'agreement_name',
      'agreement_type',
      'agreement_payment_frequency',
      'agreement_amount_per_payment',
      'success_url',
      'error_url',
      'cancel_url',
      'order_id'
    ];

    const signedParts: string[] = [];
    for (const key of signedAllowed) {
      if (fields[key] !== undefined && fields[key] !== null && fields[key] !== '') {
        signedParts.push(`${key}=${fields[key]}`);
      }
    }

    const payload = signedParts.join(',');
    const hash = CryptoJS.HmacSHA256(payload, this.config.secret_key);
    return CryptoJS.enc.Base64.stringify(hash);
  }
}

// ==============================================================
// 2. CẤU HÌNH SEPAY DIRECT VIETQR & BANKING API V2
// ==============================================================
export interface SePayConfig {
  apiKey: string;
  accountNo: string;
  bank: string;
  accountName: string;
}

export interface SePayTransaction {
  id: number | string;
  bank_brand_name?: string;
  account_number?: string;
  transaction_date?: string;
  amount_out?: string;
  amount_in: string;
  accumulated?: string;
  transaction_content: string;
  reference_number?: string;
  code?: string | null;
  sub_account?: string | null;
}

export interface SePayApiResponse {
  status: number;
  messages: string[];
  transactions: SePayTransaction[];
  error?: string;
}

export const DEFAULT_SEPAY_CONFIG: SePayConfig = {
  apiKey: '',
  accountNo: '07478087601',
  bank: 'TPBank',
  accountName: 'CHAU THANH DAT'
};

export const getSePayConfig = (): SePayConfig => {
  try {
    const saved = localStorage.getItem('ttn_sepay_config');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.apiKey || parsed.accountNo) {
        return {
          apiKey: parsed.apiKey || import.meta.env.VITE_SEPAY_API_KEY || '',
          accountNo: parsed.accountNo || import.meta.env.VITE_SEPAY_ACCOUNT_NO || import.meta.env.VITE_VIETQR_ACCOUNT_NO || DEFAULT_SEPAY_CONFIG.accountNo,
          bank: parsed.bank || import.meta.env.VITE_SEPAY_BANK || import.meta.env.VITE_VIETQR_BANK_ID || DEFAULT_SEPAY_CONFIG.bank,
          accountName: parsed.accountName || import.meta.env.VITE_SEPAY_ACCOUNT_NAME || import.meta.env.VITE_VIETQR_ACCOUNT_NAME || DEFAULT_SEPAY_CONFIG.accountName
        };
      }
    }
  } catch {
    // ignore
  }

  return {
    apiKey: import.meta.env.VITE_SEPAY_API_KEY || '',
    accountNo: import.meta.env.VITE_SEPAY_ACCOUNT_NO || import.meta.env.VITE_VIETQR_ACCOUNT_NO || DEFAULT_SEPAY_CONFIG.accountNo,
    bank: import.meta.env.VITE_SEPAY_BANK || import.meta.env.VITE_VIETQR_BANK_ID || DEFAULT_SEPAY_CONFIG.bank,
    accountName: import.meta.env.VITE_SEPAY_ACCOUNT_NAME || import.meta.env.VITE_VIETQR_ACCOUNT_NAME || DEFAULT_SEPAY_CONFIG.accountName
  };
};

export const saveSePayConfig = (config: Partial<SePayConfig>) => {
  const current = getSePayConfig();
  const updated = { ...current, ...config };
  localStorage.setItem('ttn_sepay_config', JSON.stringify(updated));
  return updated;
};

/**
 * Sinh mã thanh toán chuẩn SePay: TTN <code_number>
 */
export const getTransferSyntax = (bookingCode: string): string => {
  const rawCode = bookingCode.replace(/^TTN-?/i, '').replace(/[^a-zA-Z0-9]/g, '');
  return `TTN ${rawCode}`;
};

/**
 * Sinh URL mã QR động chuẩn SePay
 */
export const generateSePayQRUrl = (
  amount: number,
  bookingCode: string,
  customConfig?: SePayConfig
): string => {
  const cfg = customConfig || getSePayConfig();
  const cleanBank = encodeURIComponent(cfg.bank.trim());
  const cleanAcc = encodeURIComponent(cfg.accountNo.trim());
  const cleanAmount = Math.round(amount);
  const transferContent = getTransferSyntax(bookingCode);
  const encodedContent = encodeURIComponent(transferContent);

  return `https://qr.sepay.vn/img?acc=${cleanAcc}&bank=${cleanBank}&amount=${cleanAmount}&des=${encodedContent}&template=compact`;
};

/**
 * Gọi SePay API v2 để tra cứu sao kê biến động số dư
 */
async function fetchSePayTransactions(token: string, limit = 20): Promise<SePayApiResponse> {
  const endpoints = [
    `/api/sepay/v2/transactions?limit=${limit}`,
    `https://userapi.sepay.vn/v2/transactions?limit=${limit}`
  ];

  let lastError: any = null;

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token.trim()}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 401) {
        return {
          status: 401,
          messages: ['API Key SePay không hợp lệ.'],
          transactions: [],
          error: 'Unauthorized: Invalid SePay API Key'
        };
      }

      if (!response.ok) {
        const text = await response.text();
        lastError = new Error(`SePay API HTTP ${response.status}: ${text}`);
        continue;
      }

      const data = await response.json();
      return {
        status: data.status || 200,
        messages: data.messages || ['success'],
        transactions: Array.isArray(data.transactions) ? data.transactions : []
      };
    } catch (err: any) {
      lastError = err;
    }
  }

  throw lastError || new Error('Không thể kết nối đến SePay API v2.');
}

/**
 * Kiểm tra kết nối SePay API Token
 */
export const testSePayConnection = async (
  apiKey?: string
): Promise<{ success: boolean; message: string }> => {
  const token = apiKey || getSePayConfig().apiKey;
  if (!token) {
    return {
      success: false,
      message: 'Chưa nhập SePay API Key (Token)!'
    };
  }

  try {
    const res = await fetchSePayTransactions(token, 5);
    if (res.status === 401) {
      return {
        success: false,
        message: 'Mã SePay API Key không chính xác. Vui lòng lấy tại https://my.sepay.vn'
      };
    }
    if (res.status === 200) {
      return {
        success: true,
        message: 'Kết nối SePay API v2 thành công! Hệ thống sẵn sàng kiểm tra biến động số dư tự động.'
      };
    }
    return {
      success: false,
      message: res.messages?.[0] || 'Lỗi kiểm tra SePay API'
    };
  } catch (err: any) {
    return {
      success: false,
      message: err.message || 'Lỗi mạng khi kết nối SePay'
    };
  }
};

/**
 * Kiểm tra thanh toán tự động qua SePay API v2
 */
export const checkSePayPayment = async (
  bookingCode: string,
  expectedAmount: number
): Promise<{
  isPaid: boolean;
  transaction?: SePayTransaction;
  message?: string;
}> => {
  const config = getSePayConfig();
  if (!config.apiKey) {
    return {
      isPaid: false,
      message: 'Chưa cấu hình SePay API Key trong Cài Đặt hoặc file .env'
    };
  }

  try {
    const res = await fetchSePayTransactions(config.apiKey, 30);
    if (res.status !== 200 || !res.transactions || res.transactions.length === 0) {
      return { isPaid: false, message: 'Chưa có biến động số dư nào gần đây.' };
    }

    const rawCode = bookingCode.replace(/^TTN-?/i, '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    const codeFull = bookingCode.toLowerCase().replace(/[^a-zA-Z0-9]/g, '');

    for (const tx of res.transactions) {
      const amountIn = parseFloat(tx.amount_in || '0');
      if (amountIn < Math.round(expectedAmount)) {
        continue;
      }

      const content = (tx.transaction_content || '').toLowerCase();
      const contentNormalized = content.replace(/[^a-zA-Z0-9]/g, '');

      const matchesCode =
        contentNormalized.includes(rawCode) ||
        contentNormalized.includes(codeFull) ||
        contentNormalized.includes(`ttn${rawCode}`) ||
        content.includes(`ttn ${rawCode}`) ||
        content.includes(bookingCode.toLowerCase());

      if (matchesCode) {
        return {
          isPaid: true,
          transaction: tx,
          message: `Giao dịch thành công! Nhận ${amountIn.toLocaleString('vi-VN')}đ qua ${tx.bank_brand_name || 'Napas'}`
        };
      }
    }

    return {
      isPaid: false,
      message: 'Đang tiếp tục chờ biến động số dư từ ngân hàng...'
    };
  } catch (err: any) {
    return {
      isPaid: false,
      message: err.message || 'Lỗi khi kiểm tra giao dịch SePay'
    };
  }
};
