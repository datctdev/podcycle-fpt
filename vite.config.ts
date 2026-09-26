import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import { createClient } from '@supabase/supabase-js'

// Middleware lắng nghe Webhook IPN từ SePay trực tiếp trên Localhost
function sepayWebhookPlugin() {
  return {
    name: 'sepay-webhook-handler',
    configureServer(server: any) {
      server.middlewares.use('/api/sepay-webhook', async (req: any, res: any) => {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

        if (req.method === 'OPTIONS') {
          res.statusCode = 204;
          res.end();
          return;
        }

        if (req.method === 'POST') {
          let body = '';
          req.on('data', (chunk: any) => {
            body += chunk;
          });
          req.on('end', async () => {
            try {
              const payload = JSON.parse(body || '{}');
              console.log('\n[🔔 SEPAY WEBHOOK RECEIVED]:', JSON.stringify(payload, null, 2));

              // 1. Trích xuất mã đơn hàng
              let bookingCode = payload.order_invoice_number || payload.code || '';
              const content = payload.transaction_content || payload.content || payload.order_description || '';
              if (!bookingCode && content) {
                const match = content.match(/(PC|TTN)[-_ ]?\d+/i);
                if (match) {
                  bookingCode = match[0].replace(/[-_ ]/, '-').toUpperCase();
                }
              }

              console.log(`[SePay Webhook] Detected Booking Code: "${bookingCode}"`);

              if (bookingCode) {
                const env = loadEnv('production', process.cwd(), '');
                const supabaseUrl = env.VITE_SUPABASE_URL || 'https://blgmdjvzkadleqvjtcxy.supabase.co';
                const supabaseKey = env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_a_FEnye_BC38vHJLxphmfw_1Knp1HNk';
                const sb = createClient(supabaseUrl, supabaseKey);

                // Cập nhật trạng thái đơn hàng sang CONFIRMED và PAID
                const { data: updatedBookings, error: updateError } = await sb
                  .from('bookings')
                  .update({
                    status: 'CONFIRMED',
                    payment_status: 'PAID'
                  })
                  .ilike('booking_code', bookingCode)
                  .select();

                if (updateError) {
                  console.error('[SePay Webhook] Supabase update error:', updateError);
                } else if (updatedBookings && updatedBookings.length > 0) {
                  const b = updatedBookings[0];
                  console.log(`[SePay Webhook] ✅ Đã kích hoạt thành công đơn hàng ${b.booking_code}!`);

                  // Ghi nhận giao dịch vào bảng transactions
                  const amount = payload.transferAmount || payload.order_amount || payload.amount_in || b.amount;
                  const txId = 'tx_' + (payload.id || Date.now());
                  await sb.from('transactions').insert([{
                    id: txId,
                    booking_id: b.id,
                    booking_code: b.booking_code,
                    amount: Number(amount),
                    payment_method: 'SEPAY_PG',
                    reference_number: String(payload.id || payload.referenceCode || payload.reference_number || 'IPN_LOCAL'),
                    status: 'SUCCESS'
                  }]);
                } else {
                  console.warn(`[SePay Webhook] Không tìm thấy đơn hàng "${bookingCode}" trong database để cập nhật.`);
                }
              }

              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ 
                success: true, 
                message: 'Webhook processed successfully',
                bookingCode 
              }));
            } catch (err: any) {
              console.error('[SePay Webhook Error]:', err);
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: false, error: err.message }));
            }
          });
        } else {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ 
            status: 'online', 
            service: 'SePay Webhook IPN Listener (Local Dev)',
            endpoint: '/api/sepay-webhook'
          }));
        }
      });
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    sepayWebhookPlugin()
  ],
  server: {
    proxy: {
      '/api/sepay': {
        target: 'https://userapi.sepay.vn',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/sepay/, '')
      }
    }
  }
})

