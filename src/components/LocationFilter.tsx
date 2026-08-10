import React from 'react';
import { VIETNAM_PROVINCES } from '../data/vietnamLocations';
import { MapPin, Navigation, Compass } from 'lucide-react';

interface LocationFilterProps {
  selectedProvince: string;
  onSelectProvince: (prov: string) => void;
  selectedDistrict: string;
  onSelectDistrict: (dist: string) => void;
}

export const LocationFilter: React.FC<LocationFilterProps> = ({
  selectedProvince,
  onSelectProvince,
  selectedDistrict,
  onSelectDistrict
}) => {
  const activeProvinceObj = VIETNAM_PROVINCES.find(p => p.name === selectedProvince);

  return (
    <div className="bg-white p-3.5 sm:p-4 rounded-2xl shadow-sm border border-gray-100 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-orange/10 text-orange flex items-center justify-center font-bold">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-black text-navy uppercase tracking-wider flex items-center gap-1.5">
              KHU VỰC & TỈNH THÀNH BẠN MUỐN XEM
            </h3>
            <p className="text-[10px] text-gray-500 font-medium">Lọc danh sách sản phẩm & gian hàng theo đúng vị trí kho / Google Maps của Shop</p>
          </div>
        </div>

        {selectedProvince !== 'ALL' && (
          <button
            onClick={() => { onSelectProvince('ALL'); onSelectDistrict('ALL'); }}
            className="text-[10px] font-extrabold text-navy hover:text-orange bg-gray-100 px-3 py-1 rounded-full transition flex items-center gap-1 cursor-pointer"
          >
            <Compass className="w-3 h-3" /> Xem Tất Cả Tỉnh Thành
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        
        {/* Province / City Selector */}
        <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2">
          <Navigation className="w-4 h-4 text-orange shrink-0" />
          <span className="text-xs font-bold text-gray-600 shrink-0">Tỉnh/Thành:</span>
          <select
            value={selectedProvince}
            onChange={(e) => {
              onSelectProvince(e.target.value);
              onSelectDistrict('ALL'); // Reset district when province changes
            }}
            className="w-full bg-transparent text-xs font-black text-navy focus:outline-none cursor-pointer"
          >
            <option value="ALL">🌐 Tất Cả Tỉnh Thành Việt Nam</option>
            {VIETNAM_PROVINCES.map((prov) => (
              <option key={prov.id} value={prov.name}>
                📍 {prov.name}
              </option>
            ))}
          </select>
        </div>

        {/* District Selector */}
        <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2">
          <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="text-xs font-bold text-gray-600 shrink-0">Quận/Huyện:</span>
          <select
            value={selectedDistrict}
            onChange={(e) => onSelectDistrict(e.target.value)}
            disabled={selectedProvince === 'ALL' || !activeProvinceObj}
            className="w-full bg-transparent text-xs font-black text-navy focus:outline-none cursor-pointer disabled:opacity-50"
          >
            <option value="ALL">🏢 Tất Cả Quận/Huyện</option>
            {activeProvinceObj?.districts.map((dist) => (
              <option key={dist} value={dist}>
                🔹 {dist}
              </option>
            ))}
          </select>
        </div>

      </div>
    </div>
  );
};
