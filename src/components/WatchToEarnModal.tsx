import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useTheme, DEFAULT_MASTER_SWITCHES } from '../context/ThemeContext';
import { supabase } from '../lib/supabase';
import {
  Tv,
  X,
  Play,
  Award,
  CheckCircle,
  Clock,
  Sparkles,
  Zap,
  Gift,
  Coins,
  Lock
} from 'lucide-react';

export interface WatchVideoItem {
  id: string;
  youtubeId: string;
  title: string;
  requiredSeconds: number; // e.g. 30
  rewardCoins: number; // e.g. 50
  thumbnailUrl?: string;
  status: 'active' | 'paused';
}

interface WatchToEarnModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WatchToEarnModal: React.FC<WatchToEarnModalProps> = ({ isOpen, onClose }) => {
  const { user, updateCoins } = useAuth();
  const { addToast } = useToast();
  const { theme } = useTheme();

  const masterSwitches = theme.masterSwitches || DEFAULT_MASTER_SWITCHES;
  const isWatchVideoEnabled = masterSwitches.enableWatchVideoCoins !== false;

  // Load videos list from localStorage or defaults
  const [videos, setVideos] = useState<WatchVideoItem[]>(() => {
    const saved = localStorage.getItem('tq_watch_to_earn_videos');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [
      {
        id: 'vid_1',
        youtubeId: 'dQw4w9WgXcQ',
        title: '🔥 Video Giới Thiệu Hệ Thống TQ Store & Ưu Đãi Xu TQ Pay',
        requiredSeconds: 15,
        rewardCoins: 100,
        status: 'active'
      },
      {
        id: 'vid_2',
        youtubeId: 'L_LUpnjgPso',
        title: '🏖️ Xu Hướng Thời Trang Đi Biển & Váy Cưới Luxury 2026',
        requiredSeconds: 20,
        rewardCoins: 150,
        status: 'active'
      },
      {
        id: 'vid_3',
        youtubeId: 'fJ9rUzIMcZQ',
        title: '🧋 Khai Trương Chuỗi Trà Sữa & Spa Làm Đẹp Toàn Quốc',
        requiredSeconds: 30,
        rewardCoins: 200,
        status: 'active'
      }
    ];
  });

  // Track completed videos by user in localStorage
  const [completedVideoIds, setCompletedVideoIds] = useState<string[]>(() => {
    const key = `tq_completed_videos_${user?.id || 'guest'}`;
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : [];
  });

  // Active playing video state
  const [activeVideo, setActiveVideo] = useState<WatchVideoItem | null>(null);
  const [countdown, setCountdown] = useState<number>(0);
  const [isCounting, setIsCounting] = useState<boolean>(false);
  const timerRef = useRef<any>(null);

  // Sync videos from localStorage if admin updates & Supabase Realtime Broadcast
  useEffect(() => {
    // Fetch initial latest videos list from Supabase Cloud DB
    const fetchCloudVideos = async () => {
      try {
        const { data } = await supabase
          .from('site_settings')
          .select('value')
          .eq('key', 'watch_to_earn_videos')
          .single();
        if (data?.value) {
          const parsed = JSON.parse(data.value);
          setVideos(parsed);
          localStorage.setItem('tq_watch_to_earn_videos', JSON.stringify(parsed));
        }
      } catch (e) {
        console.warn('Cloud video fetch active');
      }
    };
    fetchCloudVideos();

    const handleStorage = () => {
      const saved = localStorage.getItem('tq_watch_to_earn_videos');
      if (saved) setVideos(JSON.parse(saved));
    };
    window.addEventListener('storage', handleStorage);

    // Supabase Realtime Listener for Live Video Posts
    const videoChannel = supabase
      .channel('public:watch_videos')
      .on('broadcast', { event: 'video_list_updated' }, (payload) => {
        if (payload?.payload?.videos) {
          setVideos(payload.payload.videos);
          localStorage.setItem('tq_watch_to_earn_videos', JSON.stringify(payload.payload.videos));
          if (payload.payload.addedTitle) {
            addToast(`📺 Admin vừa phát hành Video Kiếm Xu mới: "${payload.payload.addedTitle}"!`, 'success');
          } else {
            addToast('📺 Danh sách Video Kiếm Xu vừa được Admin đồng bộ Realtime!', 'info');
          }
        }
      })
      .subscribe();

    return () => {
      window.removeEventListener('storage', handleStorage);
      supabase.removeChannel(videoChannel);
    };
  }, []);

  // Countdown logic for active video
  useEffect(() => {
    if (isCounting && countdown > 0) {
      timerRef.current = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    } else if (countdown === 0 && isCounting && activeVideo) {
      // Completed watching video!
      setIsCounting(false);
      handleAwardCoins(activeVideo);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isCounting, countdown, activeVideo]);

  const handleStartWatching = (video: WatchVideoItem) => {
    setActiveVideo(video);
    setCountdown(video.requiredSeconds);
    setIsCounting(true);
  };

  const handleAwardCoins = (video: WatchVideoItem) => {
    // Check if already completed
    if (completedVideoIds.includes(video.id)) {
      addToast(`😊 Bạn đã xem video này rồi!`, 'info');
      return;
    }

    // Award coins to user profile & sync system-wide with audit trail
    if (user) {
      updateCoins(video.rewardCoins, true, `Xem Video YouTube: "${video.title}"`, 'WATCH_VIDEO');

      // Save completed list
      const newCompleted = [...completedVideoIds, video.id];
      setCompletedVideoIds(newCompleted);
      localStorage.setItem(`tq_completed_videos_${user.id}`, JSON.stringify(newCompleted));

      addToast(`🎉 CHÚC MỪNG! Bạn đã nhận thành công +${video.rewardCoins} Xu TQ!`, 'success');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5">
      <div className="bg-slate-900 border border-amber-400/40 text-slate-100 rounded-3xl w-full max-w-3xl h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 my-auto">
        
        {/* Header */}
        <div className="bg-slate-950 border-b border-slate-800 px-5 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-gradient-to-r from-amber-400 to-orange rounded-2xl flex items-center justify-center text-slate-950 font-black shadow-md">
              <Tv className="w-6 h-6 text-slate-950 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-black text-amber-300 uppercase tracking-wider flex items-center gap-2">
                📺 KIẾM XU TQ TỪ XEM VIDEO YOUTUBE
              </h3>
              <p className="text-xs text-slate-400 font-medium">
                Xem hết thời lượng yêu cầu để tích lũy TQ Coins đổi quà & giảm giá đơn hàng!
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setIsCounting(false);
              setActiveVideo(null);
              onClose();
            }}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Coin Balance Header Bar */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 px-5 py-3 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-xs">
            <Coins className="w-4 h-4 text-amber-400" />
            <span className="text-slate-300 font-bold">Số dư Xu hiện tại:</span>
            <span className="text-amber-400 font-black text-sm font-mono">{user?.coins || 0} Xu</span>
          </div>

          <div className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
            <Award className="w-3.5 h-3.5 text-emerald-400" /> Đã hoàn thành: {completedVideoIds.length} / {videos.filter(v => v.status === 'active').length} Video
          </div>
        </div>

        {/* Main Content Area */}
        {!isWatchVideoEnabled ? (
          <div className="p-8 text-center space-y-4 my-auto">
            <div className="w-16 h-16 bg-rose-500/20 text-rose-400 rounded-full flex items-center justify-center mx-auto border border-rose-500/40 shadow-lg">
              <Lock className="w-8 h-8 text-rose-400" />
            </div>
            <div>
              <h4 className="text-lg font-black text-rose-400 uppercase tracking-wider">CHƯƠNG TRÌNH ĐANG TẠM KHÓA TOÀN SÀN</h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto mt-1 leading-relaxed">
                🔒 Super Admin đã kích hoạt Lệnh Khóa Master Control đối với tính năng Xem Video Thưởng TQ Xu trên toàn hệ thống.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto custom-scrollbar space-y-6">
            {/* Active Video Player Screen */}
            {activeVideo ? (
              <div className="bg-slate-950 p-4 rounded-2xl border border-amber-400/50 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                  <Play className="w-4 h-4 animate-bounce" /> Đang phát: <span className="text-slate-100">{activeVideo.title}</span>
                </div>

                <button
                  onClick={() => {
                    setIsCounting(false);
                    setActiveVideo(null);
                  }}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs px-3 py-1 rounded-xl transition cursor-pointer"
                >
                  ✕ Đóng Player
                </button>
              </div>

              {/* YouTube IFrame Embed Player */}
              <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black border border-slate-800 shadow-inner">
                <iframe
                  src={`https://www.youtube.com/embed/${activeVideo.youtubeId}?autoplay=1&enablejsapi=1`}
                  title={activeVideo.title}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>

              {/* Countdown Progress & Coin Claim Status */}
              <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-400/20 rounded-xl flex items-center justify-center text-amber-400 font-black">
                    <Clock className="w-5 h-5 animate-spin" />
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block font-medium">Thời gian xem còn lại:</span>
                    <span className="text-lg font-black text-amber-300 font-mono">
                      {countdown > 0 ? `${countdown} Giây` : '✓ Đã Đạt Thời Lượng!'}
                    </span>
                  </div>
                </div>

                {countdown === 0 ? (
                  <div className="bg-emerald-500/20 text-emerald-300 px-4 py-2 rounded-xl border border-emerald-500/40 text-xs font-black flex items-center gap-1.5 animate-pulse">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span>+${activeVideo.rewardCoins} Xu TQ Đã Được Cộng Vào Tài Khoản!</span>
                  </div>
                ) : (
                  <div className="text-xs text-amber-400/80 font-bold bg-amber-400/10 px-3 py-1.5 rounded-xl border border-amber-400/20">
                    🎁 Thưởng +{activeVideo.rewardCoins} Xu TQ sau khi hết đếm ngược
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-blue-500/10 p-4 rounded-2xl border border-amber-400/30 flex items-center gap-3">
              <Sparkles className="w-6 h-6 text-amber-400 shrink-0 animate-spin" />
              <p className="text-xs text-slate-300 leading-relaxed font-medium">
                Hãy chọn một video bên dưới và xem đủ thời gian đếm ngược để nhận thưởng ngay <strong>TQ Coins</strong> vào tài khoản cá nhân nhé!
              </p>
            </div>
          )}

          {/* Videos Grid */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Gift className="w-4 h-4 text-amber-400" /> DANH SÁCH VIDEO XEM KIẾM XU TQ HÔM NAY:
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {videos.filter(v => v.status === 'active').map(video => {
                const isCompleted = completedVideoIds.includes(video.id);
                const thumb = video.thumbnailUrl || `https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`;

                return (
                  <div
                    key={video.id}
                    className={`bg-slate-950 p-3 rounded-2xl border space-y-3 flex flex-col justify-between transition shadow-md ${
                      isCompleted ? 'border-emerald-500/50 opacity-80' : 'border-slate-800 hover:border-amber-400/60'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-900 group">
                        <img src={thumb} alt={video.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        <div className="absolute inset-0 bg-slate-950/40 flex items-center justify-center">
                          <div className="w-10 h-10 bg-amber-400 text-slate-950 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                            <Play className="w-5 h-5 fill-slate-950 ml-0.5" />
                          </div>
                        </div>

                        {/* Reward Badge */}
                        <span className="absolute top-2 left-2 bg-gradient-to-r from-amber-400 to-orange text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-md shadow uppercase flex items-center gap-1">
                          <Zap className="w-3 h-3" /> +{video.rewardCoins} Xu
                        </span>

                        {/* Duration Badge */}
                        <span className="absolute bottom-2 right-2 bg-slate-950/80 text-white text-[9px] font-mono px-2 py-0.5 rounded shadow flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5 text-amber-400" /> {video.requiredSeconds}s
                        </span>
                      </div>

                      <h5 className="font-bold text-xs text-slate-100 line-clamp-2 leading-snug">
                        {video.title}
                      </h5>
                    </div>

                    {isCompleted ? (
                      <div className="bg-emerald-500/20 text-emerald-300 text-[11px] font-black py-2 rounded-xl text-center flex items-center justify-center gap-1 border border-emerald-500/40">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> Đã Nhận +{video.rewardCoins} Xu
                      </div>
                    ) : (
                      <button
                        onClick={() => handleStartWatching(video)}
                        className="w-full bg-gradient-to-r from-amber-400 via-orange to-amber-500 hover:from-amber-500 hover:to-orange text-slate-950 font-black py-2 rounded-xl text-xs uppercase tracking-wider transition shadow flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Play className="w-3.5 h-3.5 text-slate-950 fill-slate-950" /> XEM VIDEO KIẾM XU
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      </div>
    </div>
  );
};
