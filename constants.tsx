
import { AppTab, Preset } from './types';

export const APP_THEME = {
  primary: 'orange-600',
  secondary: 'zinc-900',
  accent: 'orange-500',
  background: 'zinc-950',
};

export const PRESETS: Preset[] = [
  // --- RETOUCH TAB ---
  { id: 'restore', label: 'Phục hồi ảnh cũ', prompt: 'Phục hồi ảnh này: làm nét khuôn mặt, xóa các vết xước và ố vàng, tái tạo chi tiết bị mất để trông như mới.', icon: '✨', category: AppTab.RETOUCH, subCategory: 'Nâng cao' },
  { id: 'beautify', label: 'Mịn da & Làm đẹp', prompt: 'Xóa mụn, làm mịn da tự nhiên, giữ lại kết cấu da, làm sáng vùng mắt và cân đối khuôn mặt.', icon: '💄', category: AppTab.RETOUCH, subCategory: 'Nâng cao' },
  
  // Ảnh Thẻ & Ảnh Thờ
  { id: 'id-white', label: 'Ảnh thẻ Nền Trắng', prompt: 'Chuyển ảnh thành ảnh thẻ chuyên nghiệp: phông nền trắng trơn, trang phục vest/sơ mi lịch sự, chân dung cận cảnh từ ngực trở lên, ánh sáng đều.', icon: '⬜', category: AppTab.RETOUCH, subCategory: 'Ảnh Thẻ & Ảnh Thờ' },
  { id: 'id-blue', label: 'Ảnh thẻ Nền Xanh', prompt: 'Chuyển ảnh thành ảnh thẻ chuyên nghiệp: phông nền xanh dương trơn, trang phục vest/sơ mi lịch sự, chân dung cận cảnh từ ngực trở lên, ánh sáng đều.', icon: '🟦', category: AppTab.RETOUCH, subCategory: 'Ảnh Thẻ & Ảnh Thờ' },
  { id: 'memorial-m', label: 'Ảnh Thờ Nam (Cận Cảnh)', prompt: 'Chuyển thành ảnh thờ trang nghiêm: Crop ảnh cận cảnh chân dung (head and shoulders), phông nền màu xanh dương đậm (Dark Blue), mặc bộ vest đen cao cấp có cà vạt, khuôn mặt chính diện, ánh sáng studio dịu nhẹ, phong cách chân dung chuyên nghiệp.', icon: '👨‍💼', category: AppTab.RETOUCH, subCategory: 'Ảnh Thẻ & Ảnh Thờ' },
  { id: 'memorial-f', label: 'Ảnh Thờ Nữ (Cận Cảnh)', prompt: 'Chuyển thành ảnh thờ trang nghiêm: Crop ảnh cận cảnh chân dung (head and shoulders), phông nền màu xanh dương đậm (Dark Blue), mặc áo dài truyền thống màu tím nhạt hoặc trắng, khuôn mặt chính diện, ánh sáng studio dịu nhẹ, phong cách chân dung chuyên nghiệp.', icon: '👩‍💼', category: AppTab.RETOUCH, subCategory: 'Ảnh Thẻ & Ảnh Thờ' },

  // --- STYLE TAB (Bổ sung 10 style mới) ---
  { id: 'oil-painting', label: 'Tranh Sơn Dầu', prompt: 'Chuyển đổi ảnh thành một bức tranh sơn dầu cổ điển với kết cấu cọ vẽ dày và màu sắc phong phú.', icon: '🖼️', category: AppTab.STYLE, subCategory: 'Nghệ thuật' },
  { id: 'charcoal', label: 'Vẽ Than Chì', prompt: 'Phong cách vẽ than chì đen trắng với các mảng tối sâu và hiệu ứng nhòe nghệ thuật.', icon: '✏️', category: AppTab.STYLE, subCategory: 'Nghệ thuật' },
  { id: 'pop-art', label: 'Pop Art (Warhol)', prompt: 'Phong cách Pop Art của Andy Warhol với màu sắc tương phản rực rỡ và hiệu ứng in lưới.', icon: '🌈', category: AppTab.STYLE, subCategory: 'Nghệ thuật' },
  { id: 'gothic', label: 'Gothic Huyền Bí', prompt: 'Phong cách Gothic tối tăm, u ám với độ tương phản cực cao và tông màu lạnh.', icon: '⛪', category: AppTab.STYLE, subCategory: 'Nghệ thuật' },
  { id: 'studio-pro', label: 'Chân dung Studio', prompt: 'Biến ảnh thành chân dung chụp tại Studio chuyên nghiệp với ánh sáng Rembrandt và nền bokeh mịn.', icon: '📸', category: AppTab.STYLE, subCategory: 'Nhiếp ảnh' },
  { id: 'pixel-8bit', label: 'Pixel Art (8-bit)', prompt: 'Chuyển đổi hình ảnh thành phong cách Pixel Art 8-bit hoài cổ như các trò chơi điện tử cũ.', icon: '👾', category: AppTab.STYLE, subCategory: 'Kỹ thuật số' },
  { id: 'claymation', label: 'Hoạt hình Đất Sét', prompt: 'Phong cách Claymation (đất sét nặn) giống các bộ phim stop-motion, kết cấu bề mặt thô mộc.', icon: '🧸', category: AppTab.STYLE, subCategory: 'Hoạt hình' },
  { id: 'surrealism', label: 'Siêu Thực (Dali)', prompt: 'Phong cách nghệ thuật siêu thực của Salvador Dali với các chi tiết biến dạng và không gian mơ hồ.', icon: '👁️', category: AppTab.STYLE, subCategory: 'Nghệ thuật' },
  { id: 'vibrant-color', label: 'Màu Sắc Sống Động', prompt: 'Tăng cường màu sắc tối đa, tạo ra một thế giới đầy màu sắc rực rỡ và tràn đầy năng lượng.', icon: '💥', category: AppTab.STYLE, subCategory: 'Kỹ thuật số' },
  { id: 'pencil-color', label: 'Bút Chì Màu', prompt: 'Chuyển ảnh thành tranh vẽ bằng bút chì màu với các nét gạch chéo tinh tế và tông màu nhẹ nhàng.', icon: '🎨', category: AppTab.STYLE, subCategory: 'Nghệ thuật' },
  
  { id: 'watercolor', label: 'Tranh Màu Nước', prompt: 'Chuyển ảnh sang phong cách tranh màu nước nghệ thuật, với các vệt loang màu mềm mại và tinh tế.', icon: '🖌️', category: AppTab.STYLE, subCategory: 'Nghệ thuật' },
  { id: 'cinematic-neon', label: 'Điện ảnh Neon', prompt: 'Áp dụng phong cách điện ảnh Cyberpunk với ánh sáng neon xanh đỏ và độ tương phản cao.', icon: '🌃', category: AppTab.STYLE, subCategory: 'Điện ảnh' },

  // --- BACKGROUND TAB ---
  { id: 'bg-wed-1', label: 'Lễ đường Hoa hồng', prompt: 'Thay phông nền thành lễ đường đám cưới sang trọng với hàng ngàn hoa hồng trắng và ánh đèn lung linh.', icon: '💍', category: AppTab.BACKGROUND, subCategory: 'Ảnh cưới' },
  { id: 'kr-minimal', label: 'Studio Hàn Quốc', prompt: 'Thay phông nền thành studio tối giản phong cách Hàn Quốc với tông màu be và ánh sáng tự nhiên.', icon: '🇰🇷', category: AppTab.BACKGROUND, subCategory: 'Phong cách Hàn' },
  { id: 'bg-fam-1', label: 'Phòng khách Ấm cúng', prompt: 'Thay phông nền thành phòng khách gia đình hiện đại với lò sưởi và sofa sang trọng.', icon: '🏠', category: AppTab.BACKGROUND, subCategory: 'Gia đình' },

  // --- PRESETS (CLOTHING) ---
  { id: 'suit-m', label: 'Vest Nam Đen', prompt: 'Thay trang phục người trong ảnh thành bộ vest nam đen cao cấp, sơ mi trắng và cà vạt.', icon: '👔', category: AppTab.PRESETS },
  { id: 'ao-dai', label: 'Áo dài Việt Nam', prompt: 'Thay trang phục thành bộ áo dài truyền thống Việt Nam màu trắng thướt tha.', icon: '🇻🇳', category: AppTab.PRESETS },
];
