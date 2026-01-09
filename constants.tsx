
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
  
  // Ảnh Thẻ & Ảnh Thờ (Updated)
  { id: 'id-white', label: 'Ảnh thẻ Nền Trắng', prompt: 'Chuyển ảnh thành ảnh thẻ chuyên nghiệp: phông nền trắng trơn, trang phục vest/sơ mi lịch sự, khuôn mặt chính diện, ánh sáng đều, chân dung từ ngực trở lên.', icon: '⬜', category: AppTab.RETOUCH, subCategory: 'Ảnh Thẻ & Ảnh Thờ' },
  { id: 'id-blue', label: 'Ảnh thẻ Nền Xanh', prompt: 'Chuyển ảnh thành ảnh thẻ chuyên nghiệp: phông nền xanh dương trơn (blue background), trang phục vest/sơ mi lịch sự, khuôn mặt chính diện, ánh sáng đều, chân dung từ ngực trở lên.', icon: '🟦', category: AppTab.RETOUCH, subCategory: 'Ảnh Thẻ & Ảnh Thờ' },
  { id: 'id-gray', label: 'Ảnh thẻ Nền Xám', prompt: 'Chuyển ảnh thành ảnh thẻ chuyên nghiệp: phông nền xám trung tính trơn, trang phục vest/sơ mi lịch sự, khuôn mặt chính diện, ánh sáng đều, chân dung từ ngực trở lên.', icon: '🩶', category: AppTab.RETOUCH, subCategory: 'Ảnh Thẻ & Ảnh Thờ' },
  { id: 'memorial-m', label: 'Ảnh Thờ Nam (Vest)', prompt: 'Chuyển ảnh thành ảnh thờ trang nghiêm cho Nam giới: chân dung cận mặt chính diện, phông nền màu xanh dương trơn, mặc bộ vest đen cao cấp có cà vạt, ánh sáng dịu nhẹ, biểu cảm điềm tĩnh.', icon: '👨‍💼', category: AppTab.RETOUCH, subCategory: 'Ảnh Thẻ & Ảnh Thờ' },
  { id: 'memorial-f', label: 'Ảnh Thờ Nữ (Áo Dài)', prompt: 'Chuyển ảnh thành ảnh thờ trang nghiêm cho Nữ giới: chân dung cận mặt chính diện, phông nền màu xanh dương trơn, mặc áo dài truyền thống Việt Nam thướt tha màu trắng hoặc tím nhạt, ánh sáng dịu nhẹ, biểu cảm điềm tĩnh.', icon: '👩‍💼', category: AppTab.RETOUCH, subCategory: 'Ảnh Thẻ & Ảnh Thờ' },

  // Basic Editing
  { id: 'brighten', label: 'Tăng độ sáng', prompt: 'Tăng độ sáng cho ảnh, làm cho các chi tiết rõ ràng và rực rỡ hơn.', icon: '☀️', category: AppTab.RETOUCH, subCategory: 'Chỉnh sửa cơ bản' },
  { id: 'contrast', label: 'Tăng tương phản', prompt: 'Tăng độ tương phản của ảnh, làm cho màu sắc đậm đà và khối hình rõ nét hơn.', icon: '🌗', category: AppTab.RETOUCH, subCategory: 'Chỉnh sửa cơ bản' },
  { id: 'sharpness', label: 'Làm sắc nét', prompt: 'Làm sắc nét các cạnh và chi tiết trong ảnh, giảm độ mờ nhiễu.', icon: '📐', category: AppTab.RETOUCH, subCategory: 'Chỉnh sửa cơ bản' },
  { id: 'warmth', label: 'Tông màu ấm', prompt: 'Thêm tông màu vàng ấm áp, lãng mạn cho toàn bộ bức ảnh.', icon: '🔥', category: AppTab.RETOUCH, subCategory: 'Chỉnh sửa cơ bản' },
  { id: 'saturation', label: 'Tăng màu sắc', prompt: 'Tăng độ bão hòa màu sắc để ảnh trông sống động và tươi tắn hơn.', icon: '🎨', category: AppTab.RETOUCH, subCategory: 'Chỉnh sửa cơ bản' },

  // --- STYLE TAB ---
  { id: 'watercolor', label: 'Tranh Màu Nước', prompt: 'Chuyển ảnh sang phong cách tranh màu nước nghệ thuật, với các vệt loang màu mềm mại và tinh tế.', icon: '🖌️', category: AppTab.STYLE, subCategory: 'Nghệ thuật' },
  { id: 'sketch', label: 'Phác thảo Chì Trắng', prompt: 'Biến ảnh thành bản phác thảo chì trắng trên nền đen tối giản, tập trung vào đường nét và ánh sáng.', icon: '✏️', category: AppTab.STYLE, subCategory: 'Nghệ thuật' },
  { id: 'crayon', label: 'Bút Sáp Màu', prompt: 'Chuyển đổi hình ảnh sang phong cách vẽ sáp màu (crayon) của trẻ em, với nét vẽ dày và màu sắc rực rỡ.', icon: '🖍️', category: AppTab.STYLE, subCategory: 'Nghệ thuật' },
  { id: 'cinematic-neon', label: 'Điện ảnh Neon', prompt: 'Áp dụng phong cách điện ảnh Cyberpunk với ánh sáng neon xanh đỏ và độ tương phản cao.', icon: '🌃', category: AppTab.STYLE, subCategory: 'Điện ảnh' },
  { id: 'vintage-film', label: 'Phim Cổ Điển', prompt: 'Phong cách phim nhựa cổ điển thập niên 70 với hạt grain và tông màu ấm áp.', icon: '🎞️', category: AppTab.STYLE, subCategory: 'Điện ảnh' },
  { id: 'cartoon', label: 'Hoạt hình Pixar', prompt: 'Biến nhân vật trong ảnh thành nhân vật hoạt hình 3D phong cách Disney Pixar.', icon: '🎬', category: AppTab.STYLE, subCategory: 'Hoạt hình' },
  { id: 'anime', label: 'Anime Nhật Bản', prompt: 'Chuyển đổi hình ảnh sang phong cách vẽ tay Anime Nhật Bản thập niên 90.', icon: '🌸', category: AppTab.STYLE, subCategory: 'Hoạt hình' },

  // --- BACKGROUND TAB ---
  { id: 'bg-wed-1', label: 'Lễ đường Hoa hồng', prompt: 'Thay phông nền thành lễ đường đám cưới sang trọng với hàng ngàn hoa hồng trắng và ánh đèn lung linh.', icon: '💍', category: AppTab.BACKGROUND, subCategory: 'Ảnh cưới' },
  { id: 'kr-minimal', label: 'Studio Hàn Quốc', prompt: 'Thay phông nền thành studio tối giản phong cách Hàn Quốc với tông màu be và ánh sáng tự nhiên.', icon: '🇰🇷', category: AppTab.BACKGROUND, subCategory: 'Phong cách Hàn' },
  { id: 'kr-cafe', label: 'Cafe Aesthetic', prompt: 'Thay phông nền thành một quán cafe Aesthetic tại Seoul với nội thất gỗ và cây xanh.', icon: '☕', category: AppTab.BACKGROUND, subCategory: 'Phong cách Hàn' },
  { id: 'kr-street', label: 'Phố Gangnam', prompt: 'Thay phông nền thành con phố hiện đại tại Gangnam về đêm với ánh đèn lung linh.', icon: '🏙️', category: AppTab.BACKGROUND, subCategory: 'Phong cách Hàn' },
  { id: 'kr-apartment', label: 'Penthouse Sông Hán', prompt: 'Thay phông nền thành căn hộ Penthouse sang trọng nhìn ra sông Hán lộng lẫy.', icon: '🏢', category: AppTab.BACKGROUND, subCategory: 'Phong cách Hàn' },
  { id: 'kr-garden', label: 'Vườn Hoa Anh Đào', prompt: 'Thay phông nền thành vườn hoa anh đào nở rộ dưới nắng nhẹ tại Seoul.', icon: '🌸', category: AppTab.BACKGROUND, subCategory: 'Phong cách Hàn' },
  { id: 'bg-kid-1', label: 'Công viên Đồ chơi', prompt: 'Thay phông nền thành một công viên đầy màu sắc với gấu bông, cầu trượt và bóng bay.', icon: '🧸', category: AppTab.BACKGROUND, subCategory: 'Trẻ em' },
  { id: 'bg-fam-1', label: 'Phòng khách Ấm cúng', prompt: 'Thay phông nền thành phòng khách gia đình hiện đại với lò sưởi và sofa sang trọng.', icon: '🏠', category: AppTab.BACKGROUND, subCategory: 'Gia đình' },

  // --- PRESETS (CLOTHING) TAB ---
  { id: 'suit-m', label: 'Vest Nam Đen', prompt: 'Thay trang phục người trong ảnh thành bộ vest nam đen cao cấp, sơ mi trắng và cà vạt.', icon: '👔', category: AppTab.PRESETS },
  { id: 'suit-f', label: 'Vest Nữ Công sở', prompt: 'Thay trang phục thành bộ vest nữ công sở màu xanh navy hiện đại.', icon: '🧥', category: AppTab.PRESETS },
  { id: 'ao-dai', label: 'Áo dài Việt Nam', prompt: 'Thay trang phục thành bộ áo dài truyền thống Việt Nam màu trắng thướt tha.', icon: '🇻🇳', category: AppTab.PRESETS },
  
  // --- UTILITIES TAB ---
  { id: 'rem-bg', label: 'Xóa phông (PNG)', prompt: 'Xóa hoàn toàn phông nền, chỉ giữ lại chủ thể trên nền trong suốt (transparent).', icon: '✂️', category: AppTab.UTILITIES },
  { id: 'up-4k', label: 'Nâng cấp 4K', prompt: 'Nâng cấp độ phân giải ảnh lên mức 4K siêu sắc nét, chi tiết hoàn mỹ.', icon: '💎', category: AppTab.UTILITIES },
];
