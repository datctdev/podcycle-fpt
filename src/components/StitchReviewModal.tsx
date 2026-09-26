import React, { useState } from 'react';

interface StitchReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingCode?: string;
}

export const StitchReviewModal: React.FC<StitchReviewModalProps> = ({
  isOpen,
  onClose,
  bookingCode
}) => {
  const [rating, setRating] = useState(5);
  const [submitted, setSubmitted] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([
    'Âm lượng to rõ như mới',
    'Sạch hết cặn dock sạc'
  ]);
  const [feedback, setFeedback] = useState('Dịch vụ rất nhanh và sạch sẽ, lấy tai nghe ngay sau tiết học!');

  if (!isOpen) return null;

  const tags = [
    'Âm lượng to rõ như mới',
    'Sạch hết cặn dock sạc',
    'Xử lý đúng 30 phút',
    'Nhân viên sảnh nhiệt tình',
    'Giá 90k rất hợp lý'
  ];

  const toggleTag = (t: string) => {
    if (selectedTags.includes(t)) {
      setSelectedTags(selectedTags.filter((x) => x !== t));
    } else {
      setSelectedTags([...selectedTags, t]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 border border-slate-200">
        
        {submitted ? (
          <div className="text-center py-8 space-y-3">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-[32px] active-icon">check_circle</span>
            </div>
            <h3 className="font-heading font-bold text-lg text-[#0b1c30]">Cảm ơn đánh giá của bạn!</h3>
            <p className="text-xs text-slate-500">Phản hồi của bạn giúp Tiệm Tai Nhỏ nâng cao chất lượng dịch vụ.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <div>
                <h3 className="font-heading font-bold text-base text-[#0b1c30]">Đánh Giá Dịch Vụ</h3>
                {bookingCode && <p className="text-[11px] text-slate-400">Đơn hàng: {bookingCode}</p>}
              </div>
              <button
                type="button"
                onClick={onClose}
                className="text-slate-400 hover:text-slate-700"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Stars */}
            <div className="text-center py-2">
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="text-amber-400 hover:scale-110 transition-transform"
                  >
                    <span 
                      className="material-symbols-outlined text-[32px]"
                      style={{ fontVariationSettings: star <= rating ? "'FILL' 1" : "'FILL' 0" }}
                    >
                      star
                    </span>
                  </button>
                ))}
              </div>
              <p className="text-xs font-semibold text-slate-700 mt-1">
                {rating === 5 ? 'Cực kỳ hài lòng (Âm thanh phục hồi 100%)' : `${rating} sao`}
              </p>
            </div>

            {/* Quick Tags */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-600">Điều bạn thích nhất:</span>
              <div className="flex flex-wrap gap-1.5">
                {tags.map((t) => {
                  const isSel = selectedTags.includes(t);
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => toggleTag(t)}
                      className={`text-[10px] font-semibold px-2.5 py-1 rounded-full transition-all ${
                        isSel
                          ? 'bg-[#f26f21] text-white shadow-2xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Comments */}
            <div>
              <textarea
                rows={3}
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Chia sẻ thêm cảm nhận của bạn về độ trong trẻo của âm thanh sau khi vệ sinh..."
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#f26f21] focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full fpt-gradient fpt-gradient-hover text-white font-bold text-xs py-3 rounded-full shadow-md active:scale-95 transition-all"
            >
              Gửi Đánh Giá 5 Sao
            </button>

          </form>
        )}

      </div>
    </div>
  );
};
