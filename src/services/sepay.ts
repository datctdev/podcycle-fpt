/**
 * SEPAY PAYMENT GATEWAY SERVICE (SEPAY.VN)
 * Cổng thanh toán chuyển khoản và thẻ thông qua bên thứ ba SePay (Production 100%)
 * Không hardcode STK cá nhân, không sandbox giả lập
 */

import CryptoJS from 'crypto-js';

// ==============================================================
// 1. CẤU HÌNH SEPAY PAYMENT GATEWAY (PRODUCTION)
// ==============================================================
export type SePayPgEnv = 'production';

export interface SePayPgConfig {
  env: 'production';
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
  env: 'production',
  merchant_id: '',
  secret_key: ''
};

/**
 * Lấy cấu hình SePay PG (Production) từ Environment Variables hoặc LocalStorage
 */
export const getSePayPgConfig = (): SePayPgConfig => {
  try {
    const saved = localStorage.getItem('ttn_sepay_pg_config');
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        env: (parsed.env as SePayPgEnv) || (import.meta.env.VITE_SEPAY_ENV as SePayPgEnv) || 'production',
        merchant_id: parsed.merchant_id || import.meta.env.VITE_SEPAY_MERCHANT_ID || '',
        secret_key: parsed.secret_key || import.meta.env.VITE_SEPAY_SECRET_KEY || ''
      };
    }
  } catch {
    // ignore
  }

  return {
    env: (import.meta.env.VITE_SEPAY_ENV as SePayPgEnv) || 'production',
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
 * Lớp SePay Payment Gateway Client chuẩn Production (sepay-pg-node tương thích)
 */
export class SePayPgClient {
  private config: SePayPgConfig;

  constructor(config?: Partial<SePayPgConfig>) {
    const defaultConfig = getSePayPgConfig();
    this.config = {
      env: config?.env || defaultConfig.env,
      merchant_id: (config?.merchant_id ?? defaultConfig.merchant_id).trim(),
      secret_key: (config?.secret_key ?? defaultConfig.secret_key).trim()
    };
  }

  public get checkout() {
    return {
      initCheckoutUrl: (): string => {
        return 'https://pay.sepay.vn/v1/checkout/init';
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
   * Ký chữ ký HMAC-SHA256 chuẩn đặc tả của SePay Payment Gateway
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
// 2. SEPAY TRANSACTION TRA CỨU & AUTO-POLLING API
// ==============================================================
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

export const getSePayApiToken = (): string => {
  return (
    localStorage.getItem('ttn_sepay_api_key') ||
    import.meta.env.VITE_SEPAY_API_KEY ||
    ''
  ).trim();
};

export const saveSePayApiToken = (token: string) => {
  localStorage.setItem('ttn_sepay_api_key', token.trim());
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
  const token = apiKey || getSePayApiToken();
  if (!token) {
    return {
      success: false,
      message: 'Chưa nhập SePay API Key!'
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
        message: 'Kết nối SePay API thành công! Hệ thống sẵn sàng đối soát tự động.'
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
 * Kiểm tra thanh toán tự động qua SePay API
 */
export const checkSePayPayment = async (
  bookingCode: string,
  expectedAmount: number
): Promise<{
  isPaid: boolean;
  transaction?: SePayTransaction;
  message?: string;
}> => {
  const token = getSePayApiToken();
  if (!token) {
    return {
      isPaid: false,
      message: 'Chưa cấu hình SePay API Key để tự động polling.'
    };
  }

  try {
    const res = await fetchSePayTransactions(token, 30);
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
          message: `Giao dịch thành công! Nhận ${amountIn.toLocaleString('vi-VN')}đ qua ${tx.bank_brand_name || 'SePay'}`
        };
      }
    }

    return {
      isPaid: false,
      message: 'Đang tiếp tục chờ biến động số dư từ SePay...'
    };
  } catch (err: any) {
    return {
      isPaid: false,
      message: err.message || 'Lỗi khi kiểm tra giao dịch SePay'
    };
  }
};
