import React, { useState, useEffect, useRef } from 'react';
import type { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import {
  Sparkles,
  X,
  Send,
  ShoppingCart,
  Eye,
  MapPin,
  ExternalLink,
  Zap,
  RefreshCw,
  Move,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Rocket,
  Heart
} from 'lucide-react';

interface AiShoppingAssistantProps {
  products: Product[];
  onOpenProductDetail: (product: Product) => void;
  onOpenShopStorefront?: (shopName: string) => void;
}

interface AiChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  recommendedProducts?: Product[];
  timestamp: string;
}

export const AiShoppingAssistant: React.FC<AiShoppingAssistantProps> = ({
  products,
  onOpenProductDetail,
  onOpenShopStorefront
}) => {
  const { addToCart } = useCart();
  const { addToast } = useToast();

  const [isOpen, setIsOpen] = useState(false);
  const [showHint, setShowHint] = useState(true);

  // Audio Voice Output & Voice Input State
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [isListening, setIsListening] = useState(false);

  // 📍 Draggable Position State (default: bottom right floating)
  const [position, setPosition] = useState(() => {
    const saved = localStorage.getItem('tq_ai_assistant_pos');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return { x: window.innerWidth - 100, y: window.innerHeight - 180 };
  });

  const [isDragging, setIsDragging] = useState(false);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const elementStartPos = useRef({ x: 0, y: 0 });
  const hasMovedRef = useRef(false);

  // Chat State
  const [inputText, setInputText] = useState('');
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [chatMessages, setChatMessages] = useState<AiChatMessage[]>([
    {
      id: 'msg_welcome',
      sender: 'ai',
      text: '✨ Hế lô bạn nhé! Tớ là **AI TiQi 🐰** - Trợ lý mua sắm giọng nói cá nhân hóa siêu đáng yêu!\n\nHãy bấm nút 🎙️ để nói chuyện trực tiếp với tớ, hoặc thử gõ *"Tìm cho tôi bộ quần áo đi biển dưới 500k"* để tớ tự động phối đồ và mở các mục đề xuất cho bạn nhé! 💕',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isOpen]);

  // Save position to localStorage
  useEffect(() => {
    localStorage.setItem('tq_ai_assistant_pos', JSON.stringify(position));
  }, [position]);

  // 🔊 Text-To-Speech Response Output in Vietnamese
  const speakAiResponse = (textToSpeak: string) => {
    if (!isSoundEnabled || !('speechSynthesis' in window)) return;

    try {
      window.speechSynthesis.cancel(); // Stop ongoing audio
      
      // Strip markdown bold / formatting symbols for smooth reading
      const cleanText = textToSpeak
        .replace(/\*\*/g, '')
        .replace(/\*/g, '')
        .replace(/#/g, '')
        .replace(/\[/g, '')
        .replace(/\]/g, '')
        .replace(/https?:\/\/\S+/g, '')
        .trim();

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = 'vi-VN';
      utterance.rate = 1.05; // Slightly cheerful speed
      utterance.pitch = 1.25; // Cute slightly higher pitch voice

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis active:', e);
    }
  };

  // 🎙️ Voice Speech Recognition (Listen to customer's voice)
  const handleStartVoiceRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      addToast('⚠️ Trình duyệt của bạn chưa hỗ trợ nhận diện giọng nói. Vui lòng gõ chữ để nói chuyện với AI!', 'info');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'vi-VN';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      setIsListening(true);
      addToast('🎙️ 🎤 AI TiQi đang lắng nghe bạn nói... (Hãy nói yêu cầu của bạn!)', 'info');

      recognition.onresult = (event: any) => {
        setIsListening(false);
        const transcript = event.results[0][0].transcript;
        if (transcript && transcript.trim()) {
          setInputText(transcript);
          addToast(`🗣️ Giọng nói của bạn: "${transcript}"`, 'success');
          processAiRequest(transcript);
        }
      };

      recognition.onerror = (event: any) => {
        setIsListening(false);
        console.warn('Speech recognition error:', event.error);
        addToast('⚠️ AI TiQi chưa nghe rõ giọng nói. Bạn thử bấm nói lại lần nữa nhé!', 'info');
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (e) {
      setIsListening(false);
      addToast('Không thể kích hoạt Micro. Bạn hãy cho phép quyền Micro trên trình duyệt nhé!', 'error');
    }
  };

  // Handle Drag Start
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    hasMovedRef.current = false;
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    elementStartPos.current = { ...position };
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      hasMovedRef.current = false;
      dragStartPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      elementStartPos.current = { ...position };
    }
  };

  // Handle Drag Move
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - dragStartPos.current.x;
      const dy = e.clientY - dragStartPos.current.y;

      if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
        hasMovedRef.current = true;
      }

      const newX = Math.min(Math.max(10, elementStartPos.current.x + dx), window.innerWidth - 90);
      const newY = Math.min(Math.max(10, elementStartPos.current.y + dy), window.innerHeight - 90);
      setPosition({ x: newX, y: newY });
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging || e.touches.length !== 1) return;
      const dx = e.touches[0].clientX - dragStartPos.current.x;
      const dy = e.touches[0].clientY - dragStartPos.current.y;

      if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
        hasMovedRef.current = true;
      }

      const newX = Math.min(Math.max(10, elementStartPos.current.x + dx), window.innerWidth - 90);
      const newY = Math.min(Math.max(10, elementStartPos.current.y + dy), window.innerHeight - 90);
      setPosition({ x: newX, y: newY });
    };

    const handleDragEnd = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleDragEnd);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleDragEnd);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleDragEnd);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleDragEnd);
    };
  }, [isDragging]);

  const handleAvatarClick = () => {
    if (!hasMovedRef.current) {
      setIsOpen(prev => {
        const next = !prev;
        if (next && isSoundEnabled) {
          speakAiResponse('Hế lô bạn nè! Tớ là AI TiQi siêu cute 🐰, cần tớ phối đồ hay tìm món gì không?');
        }
        return next;
      });
      setShowHint(false);
    }
  };

  // 🤖 AI Personalization & Matching Engine
  const processAiRequest = (userQuery: string) => {
    const userMsg: AiChatMessage = {
      id: `msg_${Date.now()}`,
      sender: 'user',
      text: userQuery,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsAiThinking(true);

    setTimeout(() => {
      const q = userQuery.toLowerCase();
      
      // Parse budget from text (e.g. 500k -> 500000, 1 triệu -> 1000000, 300k -> 300000)
      let maxBudget = Infinity;
      if (q.includes('500k') || q.includes('500.000') || q.includes('500.000đ') || q.includes('500000')) {
        maxBudget = 500000;
      } else if (q.includes('300k') || q.includes('300.000') || q.includes('300000')) {
        maxBudget = 300000;
      } else if (q.includes('1 triệu') || q.includes('1tr') || q.includes('1.000.000') || q.includes('1M')) {
        maxBudget = 1000000;
      } else if (q.includes('200k') || q.includes('200.000')) {
        maxBudget = 200000;
      }

      // Filter products matching category keywords or general match
      let filtered = products.filter(p => {
        const matchTitle = p.title.toLowerCase();
        const matchDetails = (p.details || '').toLowerCase();
        const matchShop = p.shopName.toLowerCase();

        const matchBeach = q.includes('biển') || q.includes('du lịch') || q.includes('đi biển') || q.includes('đầm');
        const matchWedding = q.includes('váy cưới') || q.includes('cưới') || q.includes('dạ hội') || q.includes('thuê');
        const matchFnb = q.includes('ăn') || q.includes('uống') || q.includes('trà sữa') || q.includes('món');
        const matchSpa = q.includes('spa') || q.includes('làm đẹp') || q.includes('dưỡng da') || q.includes('massage');

        let isCatMatch = false;
        if (matchBeach) {
          isCatMatch = matchTitle.includes('biển') || matchTitle.includes('váy') || matchTitle.includes('đầm') || matchTitle.includes('bộ') || p.shopType === 'RENTAL' || p.shopType === 'RETAIL';
        } else if (matchWedding) {
          isCatMatch = matchTitle.includes('cưới') || matchTitle.includes('dạ hội') || p.shopType === 'RENTAL';
        } else if (matchFnb) {
          isCatMatch = p.shopType === 'FNB' || matchTitle.includes('trà sữa') || matchTitle.includes('nước');
        } else if (matchSpa) {
          isCatMatch = p.shopType === 'BEAUTY' || matchTitle.includes('spa') || matchTitle.includes('massage');
        } else {
          isCatMatch = matchTitle.includes(q) || matchDetails.includes(q) || matchShop.includes(q);
        }

        const isWithinBudget = p.price <= maxBudget;
        return isCatMatch && isWithinBudget;
      });

      // If no exact match under budget, fallback to items sorted by price
      if (filtered.length === 0) {
        filtered = products.filter(p => p.price <= maxBudget).slice(0, 3);
      }

      const finalRecommendations = filtered.slice(0, 4);

      let responseText = '';
      if (q.includes('biển')) {
        responseText = `🏖️ **Set Đồ Đi Biển Cá Nhân Hóa (Ngân sách ${maxBudget !== Infinity ? maxBudget.toLocaleString('vi-VN') + ' VNĐ' : 'Tối Ưu'})**\n\nAI TiQi 🐰 đã lựa cho bạn các mẫu trang phục đi biển xinh xỉu, chất vải mềm mát & cực chuẩn trend biển năm nay! Bấm nút "🚀 TRUY CẬP NGAY" để xem sản phẩm chi tiết nhé:`;
      } else if (q.includes('cưới') || q.includes('dạ hội')) {
        responseText = `👗 **Set Trang Phục Cưới & Dạ Hội Luxury**\n\nAI TiQi gợi ý các thiết kế lộng lẫy và sang trọng nhất dành riêng cho bạn:`;
      } else if (q.includes('trà sữa') || q.includes('ăn')) {
        responseText = `🧋 **Món Ăn & Thức Uống Ngon Giao Hỏa Tốc 15Phút**\n\nAI TiQi gợi ý các món ngon tuyệt vời từ các gian hàng uy tín:`;
      } else if (q.includes('spa') || q.includes('làm đẹp')) {
        responseText = `💄 **Gói Spa & Chăm Sóc Da Chuyên Sâu**\n\nCác gói liệu trình làm đẹp chuẩn 5 sao được AI TiQi đề xuất:`;
      } else {
        responseText = `✨ **AI TiQi 🐰 đã tìm ra ${finalRecommendations.length} sản phẩm cực phù hợp theo yêu cầu của bạn nè:**`;
      }

      const aiReplyMsg: AiChatMessage = {
        id: `msg_ai_${Date.now()}`,
        sender: 'ai',
        text: responseText,
        recommendedProducts: finalRecommendations,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setChatMessages(prev => [...prev, aiReplyMsg]);
      setIsAiThinking(false);

      // 🔊 Speak back AI reply out loud to customer!
      speakAiResponse(responseText);
    }, 650);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    processAiRequest(inputText.trim());
  };

  const quickPrompts = [
    '🏖️ Tìm cho tôi bộ quần áo đi biển dưới 500k',
    '👗 Tư vấn set váy cưới dạ hội sang trọng',
    '🧋 Gợi ý trà sữa & đồ ăn ngon giao 15 phút',
    '💄 Tư vấn gói Spa làm đẹp dưỡng da'
  ];

  return (
    <>
      {/* 🤖 FLOATING DRAGGABLE CUTE AI RABBIT (CON THỎ) MASCOT WIDGET */}
      <div
        style={{ left: `${position.x}px`, top: `${position.y}px` }}
        className="fixed z-50 select-none touch-none cursor-grab active:cursor-grabbing transition-shadow"
      >
        {/* Floating Cute Speech Hint Bubble */}
        {showHint && !isOpen && (
          <div className="absolute -top-16 right-0 bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 text-white text-[11px] font-bold py-2 px-3.5 rounded-2xl shadow-2xl border border-pink-400/60 whitespace-nowrap animate-bounce flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-pink-300 shrink-0" />
            <span>AI TiQi: "Nói 🎙️ hoặc gõ 'Bộ đi biển dưới 500k' nè!"</span>
            <button
              onClick={(e) => { e.stopPropagation(); setShowHint(false); }}
              className="text-slate-400 hover:text-white p-0.5 ml-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Floating Cute Rabbit Mascot Avatar Trigger Button */}
        <div
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          onClick={handleAvatarClick}
          className="relative group"
        >
          {/* Glowing Pastel Pink & Gold Aura Effect */}
          <div className="absolute -inset-2 bg-gradient-to-r from-pink-500 via-rose-400 to-amber-400 rounded-full blur-lg opacity-80 group-hover:opacity-100 animate-pulse"></div>

          <div className="relative w-16 h-16 bg-gradient-to-br from-pink-400 via-purple-600 to-indigo-900 text-white rounded-full border-2 border-pink-300 flex items-center justify-center shadow-2xl overflow-hidden hover:scale-110 transition-transform">
            
            {/* CUTE RABBIT (CON THỎ) MASCOT EMBLEM DESIGN */}
            <div className="w-full h-full flex flex-col items-center justify-center relative p-1 bg-gradient-to-tr from-pink-500/30 to-purple-500/30">
              <span className="text-3xl animate-bounce leading-none">🐰</span>
              <span className="text-[7px] font-black text-amber-300 uppercase tracking-tighter mt-0.5">
                AI TiQi
              </span>
            </div>

            {/* Move / Drag Indicator Badge */}
            <div className="absolute top-1 right-1 w-4 h-4 bg-slate-950 text-pink-300 rounded-full flex items-center justify-center border border-pink-400/60 shadow">
              <Move className="w-2.5 h-2.5" />
            </div>
          </div>
        </div>
      </div>

      {/* 🤖 FULL INTERACTIVE AI CHAT & VOICE PERSONALIZATION MODAL */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4">
          <div className="bg-slate-900 border border-pink-400/50 text-slate-100 rounded-3xl w-full max-w-2xl h-[88vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 my-auto">
            
            {/* Header */}
            <div className="bg-slate-950 border-b border-slate-800 px-5 py-3.5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="relative w-11 h-11 bg-gradient-to-r from-pink-400 via-rose-400 to-amber-400 rounded-2xl flex items-center justify-center text-slate-950 font-black shadow-md">
                  <span className="text-2xl animate-bounce">🐰</span>
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-slate-950 rounded-full"></span>
                </div>
                <div>
                  <h3 className="text-sm font-black text-pink-300 uppercase tracking-wider flex items-center gap-1.5">
                    ✨ AI TiQi 🐰 - TRỢ LÝ GIỌNG NÓI MUA SẮM
                  </h3>
                  <p className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                    <Heart className="w-3 h-3 text-pink-400 fill-pink-400" /> Nghe & Trả lời bằng Giọng nói • Tự động truy cập mục đề xuất
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Audio Text-To-Speech Toggle Button */}
                <button
                  onClick={() => setIsSoundEnabled(!isSoundEnabled)}
                  className={`p-2 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer border ${
                    isSoundEnabled
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                  title={isSoundEnabled ? 'Đang bật giọng nói AI đọc trả lời (Bấm để tắt)' : 'Đang tắt giọng nói AI (Bấm để bật)'}
                >
                  {isSoundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
                </button>

                <button
                  onClick={() => setIsOpen(false)}
                  className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Quick Prompt Recommendation Chips */}
            <div className="bg-slate-950/60 p-3 border-b border-slate-800 flex items-center gap-2 overflow-x-auto scrollbar-none shrink-0 text-xs">
              <span className="text-[10px] font-black text-amber-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
                <Zap className="w-3 h-3" /> GỢI Ý MAU:
              </span>
              {quickPrompts.map((promptText, idx) => (
                <button
                  key={idx}
                  onClick={() => processAiRequest(promptText)}
                  className="bg-slate-900 hover:bg-pink-500 hover:text-white text-slate-200 text-[11px] font-bold px-3 py-1 rounded-full border border-slate-700 transition shrink-0 cursor-pointer shadow-xs whitespace-nowrap"
                >
                  {promptText}
                </button>
              ))}
            </div>

            {/* Chat Body & Recommended Products */}
            <div className="flex-1 p-4 overflow-y-auto custom-scrollbar space-y-4 text-xs">
              {chatMessages.map(msg => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'} space-y-2`}
                >
                  <div
                    className={`max-w-[88%] p-3.5 rounded-2xl shadow-sm ${
                      msg.sender === 'user'
                        ? 'bg-gradient-to-r from-orange to-amber-500 text-white rounded-br-none font-medium'
                        : 'bg-slate-950 text-slate-100 border border-slate-800 rounded-bl-none font-medium'
                    }`}
                  >
                    <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>

                    {/* Embed Recommended Products Grid inside AI reply */}
                    {msg.recommendedProducts && msg.recommendedProducts.length > 0 && (
                      <div className="mt-3.5 space-y-2.5 pt-2.5 border-t border-slate-800">
                        <div className="flex items-center justify-between">
                          <div className="text-[10px] font-black text-amber-400 uppercase tracking-wider flex items-center gap-1">
                            <Sparkles className="w-3.5 h-3.5 text-amber-400" /> SET ĐỒ & MỤC ĐỀ XUẤT TỪ AI TIQI:
                          </div>
                          
                          {/* 🚀 Instant Direct Access to First Recommended Item */}
                          <button
                            onClick={() => {
                              setIsOpen(false);
                              onOpenProductDetail(msg.recommendedProducts![0]);
                            }}
                            className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-black text-[9px] px-2.5 py-1 rounded-lg uppercase tracking-wider transition shadow flex items-center gap-1 cursor-pointer border border-pink-300/40"
                          >
                            <Rocket className="w-3 h-3 text-amber-300" /> 🚀 Truy cập mục đề xuất
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {msg.recommendedProducts.map(p => {
                            const shopConfig = JSON.parse(localStorage.getItem(`tq_shop_config_${p.shopName}`) || '{}');
                            const warehouseAddr = shopConfig.warehouseAddress || shopConfig.pickupAddress || 'Hệ thống Kho Tổng TQ';
                            const googleMapsUrl = shopConfig.googleMapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${p.shopName} ${warehouseAddr}`)}`;

                            return (
                              <div
                                key={p.id}
                                className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 space-y-2 flex flex-col justify-between hover:border-pink-400/60 transition shadow-md group/card"
                              >
                                <div className="space-y-1.5">
                                  <div
                                    onClick={() => {
                                      setIsOpen(false);
                                      onOpenProductDetail(p);
                                    }}
                                    className="h-28 bg-slate-950 rounded-lg overflow-hidden relative cursor-pointer"
                                  >
                                    <img src={p.img} alt={p.title} className="w-full h-full object-cover group-hover/card:scale-105 transition-transform" />
                                    <span className="absolute top-1.5 left-1.5 bg-orange text-white text-[8px] font-black px-2 py-0.5 rounded shadow uppercase">
                                      {p.badge || 'AI MATCH'}
                                    </span>
                                  </div>

                                  <div>
                                    <span
                                      onClick={() => {
                                        if (onOpenShopStorefront) {
                                          setIsOpen(false);
                                          onOpenShopStorefront(p.shopName);
                                        }
                                      }}
                                      className="text-[9px] text-amber-400 font-bold block cursor-pointer hover:underline"
                                    >
                                      {p.shopName}
                                    </span>
                                    <h4
                                      onClick={() => {
                                        setIsOpen(false);
                                        onOpenProductDetail(p);
                                      }}
                                      className="font-bold text-slate-100 line-clamp-1 cursor-pointer hover:text-pink-300 transition-colors"
                                    >
                                      {p.title}
                                    </h4>
                                    <p className="text-amber-400 font-black font-mono mt-0.5">
                                      {p.price.toLocaleString('vi-VN')} đ
                                    </p>
                                  </div>
                                </div>

                                {/* Product Action Buttons */}
                                <div className="space-y-1 pt-1.5 border-t border-slate-800">
                                  <div className="grid grid-cols-2 gap-1.5">
                                    <button
                                      onClick={() => {
                                        addToCart(p);
                                        addToast(`🛒 Đã thêm "${p.title}" vào giỏ hàng!`, 'success');
                                      }}
                                      className="bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black py-1.5 rounded-lg transition text-[10px] uppercase flex items-center justify-center gap-1 cursor-pointer"
                                    >
                                      <ShoppingCart className="w-3 h-3" /> Thêm Giỏ
                                    </button>

                                    <button
                                      onClick={() => {
                                        setIsOpen(false);
                                        onOpenProductDetail(p);
                                      }}
                                      className="bg-pink-600 hover:bg-pink-500 text-white font-black py-1.5 rounded-lg transition text-[10px] uppercase flex items-center justify-center gap-1 cursor-pointer border border-pink-400/40"
                                    >
                                      <Eye className="w-3 h-3 text-white" /> Truy Cập
                                    </button>
                                  </div>

                                  <a
                                    href={googleMapsUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="w-full bg-slate-950 hover:bg-slate-800 text-slate-300 font-bold py-1 rounded-lg transition text-[9px] flex items-center justify-center gap-1 border border-slate-800"
                                  >
                                    <MapPin className="w-2.5 h-2.5 text-rose-400" /> Chỉ Đường Shop Google Maps <ExternalLink className="w-2.5 h-2.5" />
                                  </a>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <span className="text-[9px] text-slate-500 font-mono block text-right mt-1">
                      {msg.timestamp}
                    </span>
                  </div>
                </div>
              ))}

              {isAiThinking && (
                <div className="flex items-center gap-2 text-pink-300 text-xs font-bold bg-slate-950 p-3 rounded-2xl w-fit border border-slate-800">
                  <RefreshCw className="w-4 h-4 animate-spin text-pink-400" />
                  <span>AI TiQi đang chọn lọc phong cách & giọng nói...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input & Voice Speech Recognition Bar */}
            <form onSubmit={handleSendMessage} className="bg-slate-950 p-3 border-t border-slate-800 flex gap-2 shrink-0 items-center">
              
              {/* 🎙️ Voice Input Microphone Button */}
              <button
                type="button"
                onClick={handleStartVoiceRecognition}
                className={`p-2.5 rounded-2xl transition flex items-center gap-1.5 text-xs font-black shrink-0 cursor-pointer ${
                  isListening
                    ? 'bg-rose-600 text-white animate-pulse shadow-lg ring-2 ring-rose-400'
                    : 'bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:opacity-90 shadow-md'
                }`}
                title="Bấm để nói trực tiếp bằng Giọng Nói với AI TiQi!"
              >
                {isListening ? <MicOff className="w-4 h-4 text-white animate-spin" /> : <Mic className="w-4 h-4 text-amber-300" />}
                <span className="hidden sm:inline">{isListening ? 'ĐANG NGHE...' : 'NÓI VỚI AI TIQI'}</span>
              </button>

              <input
                type="text"
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                placeholder="Nói hoặc gõ: 'Tìm cho tôi bộ quần áo đi biển dưới 500k'..."
                className="flex-1 bg-slate-900 border border-slate-700 text-slate-100 rounded-2xl px-4 py-2.5 text-xs focus:outline-none focus:border-pink-400"
              />

              <button
                type="submit"
                disabled={!inputText.trim() || isAiThinking}
                className="bg-gradient-to-r from-pink-500 via-orange to-amber-500 hover:from-pink-600 text-slate-950 font-black px-5 py-2.5 rounded-2xl transition shadow-lg flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40"
              >
                <Send className="w-4 h-4 text-slate-950" /> GỬI
              </button>
            </form>

          </div>
        </div>
      )}
    </>
  );
};
