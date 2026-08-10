export interface Province {
  id: string;
  name: string;
  districts: string[];
}

export const VIETNAM_PROVINCES: Province[] = [
  {
    id: 'HN',
    name: 'Hà Nội',
    districts: ['Ba Đình', 'Hoàn Kiếm', 'Tây Hồ', 'Long Biên', 'Cầu Giấy', 'Đống Đa', 'Hai Bà Trưng', 'Thanh Xuân', 'Nam Từ Liêm', 'Bắc Từ Liêm', 'Hà Đông', 'Thanh Trì']
  },
  {
    id: 'HCM',
    name: 'TP. Hồ Chí Minh',
    districts: ['Quận 1', 'Quận 3', 'Quận 4', 'Quận 5', 'Quận 7', 'Quận 10', 'Bình Thạnh', 'Tân Bình', 'Gò Vấp', 'Phú Nhuận', 'Thủ Đức', 'Bình Tân']
  },
  {
    id: 'DN',
    name: 'Đà Nẵng',
    districts: ['Hải Châu', 'Thanh Khê', 'Sơn Trà', 'Ngũ Hành Sơn', 'Liên Chiểu', 'Cẩm Lệ', 'Hòa Vang']
  },
  {
    id: 'HP',
    name: 'Hải Phòng',
    districts: ['Hồng Bàng', 'Ngô Quyền', 'Lê Chân', 'Hải An', 'Kiến An', 'Đồ Sơn', 'Thủy Nguyên']
  },
  {
    id: 'CT',
    name: 'Cần Thơ',
    districts: ['Ninh Kiều', 'Bình Thủy', 'Cái Răng', 'Ô Môn', 'Thốt Nốt']
  },
  {
    id: 'BD',
    name: 'Bình Dương',
    districts: ['Thủ Dầu Một', 'Dĩ An', 'Thuận An', 'Tân Uyên', 'Bến Cát']
  },
  {
    id: 'LD',
    name: 'Lâm Đồng',
    districts: ['Đà Lạt', 'Bảo Lộc', 'Đức Trọng', 'Di Linh', 'Lạc Dương']
  },
  {
    id: 'QN',
    name: 'Quảng Ninh',
    districts: ['Hạ Long', 'Cẩm Phả', 'Uông Bí', 'Móng Cái']
  },
  {
    id: 'KH',
    name: 'Khánh Hòa',
    districts: ['Nha Trang', 'Cam Ranh', 'Ninh Hòa', 'Diên Khánh']
  },
  {
    id: 'DNAI',
    name: 'Đồng Nai',
    districts: ['Biên Hòa', 'Long Khánh', 'Nhơn Trạch', 'Long Thành']
  }
];

/**
 * Helper to parse Province / City from a Shop's Address string or Google Maps URL
 */
export const detectProvinceFromShopInfo = (shopName: string, addressText?: string, googleMapsUrl?: string): string => {
  const combined = `${shopName} ${addressText || ''} ${googleMapsUrl || ''}`.toLowerCase();

  for (const prov of VIETNAM_PROVINCES) {
    const provNameLower = prov.name.toLowerCase();
    // Check main province name
    if (combined.includes(provNameLower) || combined.includes(provNameLower.replace('tp. ', ''))) {
      return prov.name;
    }
    // Check keywords (e.g. "ha noi", "hcm", "saigon", "da nang")
    if (prov.id === 'HN' && (combined.includes('hà nội') || combined.includes('ha noi') || combined.includes('hanoi'))) return 'Hà Nội';
    if (prov.id === 'HCM' && (combined.includes('hồ chí minh') || combined.includes('tphcm') || combined.includes('hcm') || combined.includes('sài gòn') || combined.includes('saigon'))) return 'TP. Hồ Chí Minh';
    if (prov.id === 'DN' && (combined.includes('đà nẵng') || combined.includes('da nang') || combined.includes('danang'))) return 'Đà Nẵng';
    if (prov.id === 'HP' && (combined.includes('hải phòng') || combined.includes('hai phong'))) return 'Hải Phòng';
    if (prov.id === 'CT' && (combined.includes('cần thơ') || combined.includes('can tho'))) return 'Cần Thơ';
    if (prov.id === 'BD' && (combined.includes('bình dương') || combined.includes('binh duong'))) return 'Bình Dương';
    if (prov.id === 'LD' && (combined.includes('lâm đồng') || combined.includes('đà lạt') || combined.includes('da lat'))) return 'Lâm Đồng';
    if (prov.id === 'QN' && (combined.includes('quảng ninh') || combined.includes('hạ long'))) return 'Quảng Ninh';
    if (prov.id === 'KH' && (combined.includes('khánh hòa') || combined.includes('nha trang'))) return 'Khánh Hòa';
  }

  // Fallback defaults based on preset shop names
  if (shopName.toLowerCase().includes('rental')) return 'Hà Nội';
  if (shopName.toLowerCase().includes('retail')) return 'TP. Hồ Chí Minh';
  if (shopName.toLowerCase().includes('tea') || shopName.toLowerCase().includes('coffee') || shopName.toLowerCase().includes('fnb')) return 'Đà Nẵng';
  if (shopName.toLowerCase().includes('beauty') || shopName.toLowerCase().includes('spa')) return 'Cần Thơ';

  return 'Hà Nội';
};
