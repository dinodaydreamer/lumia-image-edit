
import React, { useState, useRef, useEffect } from 'react';
import { 
  Plus, 
  Image as ImageIcon, 
  Sparkles, 
  Layers, 
  Wand2, 
  HelpCircle, 
  Trash2, 
  Download, 
  Loader2,
  X,
  Mountain,
  Shirt,
  Library,
  ArrowRightLeft,
  Check,
  Paintbrush,
  RotateCcw,
  ChevronRight,
  Key // Added missing Key import
} from 'lucide-react';
import { AppTab, ImageFile, ProcessLog, AspectRatio, ImageSize } from './types';
import { PRESETS } from './constants';
import { GeminiImageService } from './services/geminiService';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.GENERATE);
  const [images, setImages] = useState<ImageFile[]>([]);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [logs, setLogs] = useState<ProcessLog[]>([]);
  const [showGuide, setShowGuide] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [ratio, setRatio] = useState<AspectRatio>("1:1");
  const [size, setSize] = useState<ImageSize>("1K");
  
  // API Key selection state following mandatory guidelines
  const [hasApiKey, setHasApiKey] = useState<boolean>(false);

  // Check for API key on mount using the mandatory aistudio global
  useEffect(() => {
    const checkKey = async () => {
      const has = await (window as any).aistudio.hasSelectedApiKey();
      setHasApiKey(has);
    };
    checkKey();
  }, []);

  const handleOpenSelectKey = async () => {
    await (window as any).aistudio.openSelectKey();
    // Assume success as per guidelines to avoid race condition
    setHasApiKey(true);
  };

  // Inpaint State
  const [brushSize, setBrushSize] = useState(30);
  const maskCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const addLog = (message: string, type: 'info' | 'error' | 'success' = 'info') => {
    setLogs(prev => [{ timestamp: new Date(), message, type }, ...prev].slice(0, 50));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        const newImage: ImageFile = {
          id: Math.random().toString(36).substring(2, 11),
          url: URL.createObjectURL(file),
          name: file.name,
          type: file.type,
          base64: base64
        };
        setImages(prev => [newImage, ...prev]);
        setSelectedImageId(newImage.id);
        setResultImage(null);
        addLog(`Đã tải lên: ${file.name}`, 'success');
      };
      reader.readAsDataURL(file);
    });
  };

  const initMaskCanvas = () => {
    const canvas = maskCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  useEffect(() => {
    if (activeTab === AppTab.INPAINT && selectedImageId) {
      setTimeout(initMaskCanvas, 100);
    }
  }, [activeTab, selectedImageId]);

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    draw(e);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const canvas = maskCanvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx?.beginPath();
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = maskCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    let x, y;
    if ('touches' in e) {
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = (e as React.MouseEvent).clientX - rect.left;
      y = (e as React.MouseEvent).clientY - rect.top;
    }

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.strokeStyle = 'white';

    ctx.lineTo(x * scaleX, y * scaleY);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x * scaleX, y * scaleY);
  };

  const clearMask = () => {
    initMaskCanvas();
    addLog("Đã xóa mặt nạ");
  };

  const handleProcess = async (customPrompt?: string) => {
    // Check key status before processing
    if (!hasApiKey) {
      addLog("Lỗi: Bạn chưa chọn API Key. Hãy nhấn nút ở thanh trạng thái để chọn.", 'error');
      await handleOpenSelectKey();
      return;
    }

    const activePrompt = customPrompt || prompt;
    
    if (activeTab === AppTab.GENERATE) {
      if (!activePrompt) {
        addLog("Vui lòng nhập mô tả ảnh bạn muốn tạo.", 'error');
        return;
      }
    } else {
      if (!selectedImageId) {
        addLog("Vui lòng chọn một ảnh từ thư viện để chỉnh sửa.", 'error');
        return;
      }
    }

    setIsProcessing(true);
    setResultImage(null);
    addLog(`Đang xử lý với Gemini AI...`, 'info');

    try {
      let result = '';
      const selectedImg = images.find(img => img.id === selectedImageId);

      if (activeTab === AppTab.GENERATE) {
        result = await GeminiImageService.generateImage(activePrompt, ratio, size);
      } else if (activeTab === AppTab.INPAINT && selectedImg) {
        const maskCanvas = maskCanvasRef.current;
        if (!maskCanvas) throw new Error("Không tìm thấy Canvas mặt nạ");
        const maskBase64 = maskCanvas.toDataURL('image/png');
        result = await GeminiImageService.inpaintImage(selectedImg.base64, maskBase64, activePrompt, selectedImg.type, ratio, size);
      } else if (selectedImg) {
        result = await GeminiImageService.editImage(selectedImg.base64, activePrompt, selectedImg.type, ratio, size);
      }

      setResultImage(result);
      
      const newId = `ai-${Date.now()}`;
      const newImage: ImageFile = {
        id: newId,
        url: result,
        name: `Lumina-${activeTab.toLowerCase()}-${newId.slice(-4)}.png`,
        type: 'image/png',
        base64: result
      };
      
      setImages(prev => [newImage, ...prev]);
      addLog("Xử lý thành công!", 'success');
    } catch (error: any) {
      // Handle the specific error per guidelines to reset key state
      if (error.message?.includes("Requested entity was not found.")) {
        setHasApiKey(false);
        addLog("API Key không hợp lệ hoặc dự án không có quyền truy cập. Vui lòng chọn lại.", 'error');
        await handleOpenSelectKey();
      } else {
        addLog(error.message || "Lỗi xử lý. Kiểm tra lại kết nối.", 'error');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApplyResult = () => {
    if (!resultImage || images.length === 0) return;
    setSelectedImageId(images[0].id);
    setResultImage(null);
    addLog("Đã áp dụng kết quả làm ảnh gốc mới.", 'success');
  };

  const selectedImage = images.find(img => img.id === selectedImageId);

  const getRatioClass = (r: AspectRatio) => {
    switch(r) {
      case "1:1": return "aspect-square";
      case "3:4": return "aspect-[3/4]";
      case "4:3": return "aspect-[4/3]";
      case "9:16": return "aspect-[9/16]";
      case "16:9": return "aspect-[16/9]";
      default: return "aspect-square";
    }
  };

  const groupedPresets = (() => {
    const tabPresets = PRESETS.filter(p => p.category === activeTab);
    const groups: { [key: string]: typeof tabPresets } = {};
    tabPresets.forEach(p => {
      const key = p.subCategory || 'Công cụ';
      if (!groups[key]) groups[key] = [];
      groups[key].push(p);
    });
    return groups;
  })();

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-orange-500/30">
      {/* Header */}
      <header className="h-16 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-xl sticky top-0 z-50 px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-700 rounded-xl flex items-center justify-center shadow-lg shadow-orange-950/20">
            <Sparkles className="text-white w-6 h-6" />
          </div>
          <div className="hidden sm:block">
            <h1 className="font-black text-xl tracking-tighter uppercase italic">Lumina<span className="text-orange-500">Pro</span></h1>
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest leading-none">Studio AI Professional</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1 bg-zinc-900/50 p-1 rounded-xl border border-zinc-800">
          {[
            { id: AppTab.GENERATE, label: 'Tạo ảnh', icon: Wand2 },
            { id: AppTab.RETOUCH, label: 'Sửa ảnh', icon: Sparkles },
            { id: AppTab.INPAINT, label: 'Vẽ Mask', icon: Paintbrush },
            { id: AppTab.BACKGROUND, label: 'Phông nền', icon: Mountain },
            { id: AppTab.STYLE, label: 'Style', icon: Layers },
            { id: AppTab.PRESETS, label: 'Trang phục', icon: Shirt },
            { id: AppTab.UTILITIES, label: 'Tiện ích', icon: ChevronRight },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id); setResultImage(null); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all text-xs font-bold ${
                activeTab === item.id 
                ? 'bg-orange-600 text-white shadow-lg' 
                : 'text-zinc-500 hover:text-white hover:bg-zinc-800'
              }`}
            >
              <item.icon size={14} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* API Key Selection UI following mandatory guidelines */}
        <div className="flex items-center gap-3">
          <button 
            onClick={handleOpenSelectKey}
            className={`h-10 px-4 rounded-full border border-zinc-800/50 bg-[#0c0c0e] flex items-center gap-3 transition-all min-w-[150px] ${hasApiKey ? 'shadow-[0_0_15px_-5px_rgba(34,197,94,0.3)] border-green-900/50' : 'hover:border-orange-500/50'}`}
          >
            <div className={`w-2.5 h-2.5 rounded-full ${hasApiKey ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]' : 'bg-orange-500 animate-pulse'}`}></div>
            <span className={`text-[10px] font-black tracking-widest uppercase transition-colors ${hasApiKey ? 'text-blue-200 opacity-60' : 'text-zinc-400'}`}>
              {hasApiKey ? 'API READY' : 'SELECT API KEY'}
            </span>
          </button>

          <button onClick={() => setShowGuide(true)} className="p-2.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-orange-500 transition-all">
            <HelpCircle size={18} />
          </button>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Library */}
        {activeTab !== AppTab.GENERATE && (
          <aside className="hidden lg:flex w-72 border-r border-zinc-800 bg-zinc-950 flex-col shrink-0">
            <div className="p-4 border-b border-zinc-800">
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl flex items-center justify-center gap-2 text-sm font-bold transition-all group"
              >
                <Plus size={18} className="text-orange-500 group-hover:rotate-90 transition-transform" />
                Tải ảnh lên
              </button>
              <input type="file" ref={fileInputRef} onChange={handleFileUpload} multiple className="hidden" accept="image/*" />
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <h3 className="text-[10px] font-black text-zinc-600 uppercase tracking-widest flex items-center gap-2">
                <Library size={12}/> Thư viện ({images.length})
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {images.map(img => (
                  <div 
                    key={img.id}
                    onClick={() => { setSelectedImageId(img.id); setResultImage(null); }}
                    className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer border-2 transition-all group ${
                      selectedImageId === img.id ? 'border-orange-600 scale-[0.98]' : 'border-transparent hover:border-zinc-800'
                    }`}
                  >
                    <img src={img.url} className="w-full h-full object-cover" alt={img.name} />
                    <button 
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        setImages(prev => prev.filter(i => i.id !== img.id)); 
                        if (selectedImageId === img.id) { setSelectedImageId(null); setResultImage(null); }
                      }} 
                      className="absolute top-1 right-1 p-1 bg-black/60 rounded-md text-white opacity-0 group-hover:opacity-100 hover:bg-red-600 transition-all"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
              <div className="pt-4 border-t border-zinc-900 space-y-2">
                <h3 className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Nhật ký xử lý</h3>
                <div className="space-y-1 text-[9px] font-mono max-h-40 overflow-y-auto pr-2 opacity-50">
                  {logs.map((log, i) => (
                    <div key={i} className={`p-1.5 rounded bg-zinc-900/30 border-l-2 ${log.type === 'error' ? 'border-red-600' : log.type === 'success' ? 'border-green-600' : 'border-zinc-800'}`}>
                      {log.message}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        )}

        {/* Center Canvas */}
        <section className="flex-1 bg-zinc-900/10 flex flex-col p-6 overflow-hidden relative">
          <div className="flex-1 flex flex-col items-center justify-center gap-6 relative min-h-0 overflow-y-auto scrollbar-hide">
            {isProcessing && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-zinc-950/70 backdrop-blur-md rounded-3xl">
                    <div className="flex flex-col items-center gap-5">
                        <Loader2 className="w-16 h-16 text-orange-500 animate-spin" strokeWidth={1.5} />
                        <p className="text-sm font-black text-orange-500 tracking-[0.3em] animate-pulse uppercase">Đang kiến tạo...</p>
                    </div>
                </div>
            )}

            {!hasApiKey && (
               <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-sm rounded-3xl p-10 text-center">
                  <div className="max-w-md bg-zinc-900 border border-zinc-800 p-10 rounded-[2.5rem] shadow-2xl flex flex-col items-center gap-6">
                    <Key className="w-12 h-12 text-orange-600 opacity-50" />
                    <h3 className="text-lg font-black uppercase italic">Sẵn sàng trải nghiệm?</h3>
                    <p className="text-xs text-zinc-500 leading-relaxed">Để sử dụng Lumina Pro, bạn cần chọn một <b>API Key</b> từ dự án GCP có tính phí. Xem thêm về <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noreferrer" className="text-orange-500 underline">tài liệu thanh toán</a>.</p>
                    <button onClick={handleOpenSelectKey} className="px-8 py-4 bg-orange-600 hover:bg-orange-500 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-orange-950/20">CHỌN API KEY CỦA BẠN</button>
                  </div>
               </div>
            )}

            {activeTab === AppTab.GENERATE ? (
              <div className="w-full max-w-2xl flex flex-col items-center gap-4">
                  <div className="w-full flex justify-between items-center px-4">
                    <span className="text-[10px] font-black uppercase tracking-widest text-orange-500 px-3 py-1 bg-orange-500/10 rounded-full flex items-center gap-2">
                      <Sparkles size={10} /> Kết quả sáng tạo
                    </span>
                  </div>
                  <div className={`w-full bg-zinc-950 rounded-[2.5rem] border border-zinc-800 shadow-2xl overflow-hidden flex items-center justify-center group relative transition-all duration-500 ${getRatioClass(ratio)}`}>
                    {resultImage ? (
                        <>
                          <img src={resultImage} className="w-full h-full object-contain" alt="Generated" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 backdrop-blur-sm">
                              <button onClick={handleApplyResult} className="bg-orange-600 text-white px-6 py-3 rounded-2xl shadow-xl transition-all font-bold text-xs">CHỈNH SỬA TIẾP</button>
                              <button onClick={() => { const l = document.createElement('a'); l.href = resultImage; l.download = `lumina-${Date.now()}.png`; l.click(); }} className="bg-white text-zinc-900 p-3 rounded-2xl"><Download size={20} /></button>
                          </div>
                        </>
                    ) : (
                        <div className="text-center p-12 space-y-4 opacity-10">
                            <Wand2 size={80} strokeWidth={1} />
                            <p className="text-base font-black tracking-widest uppercase italic">Phòng sáng tạo</p>
                        </div>
                    )}
                  </div>
              </div>
            ) : activeTab === AppTab.INPAINT ? (
              <div className="w-full h-full flex flex-col items-center justify-center p-4">
                <div className="flex flex-col gap-4 w-full max-w-2xl">
                   <div className="flex justify-between items-center px-4">
                     <span className="text-[10px] font-black uppercase tracking-widest text-orange-500 flex items-center gap-2"><Paintbrush size={10} /> Vẽ vùng cần thay đổi</span>
                     <div className="flex gap-2 items-center">
                        <span className="text-[9px] font-black text-zinc-500">BRUSH: {brushSize}PX</span>
                        <input type="range" min="5" max="100" value={brushSize} onChange={(e) => setBrushSize(parseInt(e.target.value))} className="w-24 accent-orange-600" />
                        <button onClick={clearMask} className="p-2 bg-zinc-900 hover:bg-zinc-800 rounded-lg text-zinc-500"><RotateCcw size={14}/></button>
                     </div>
                   </div>
                   
                   <div className="relative w-full overflow-hidden flex items-center justify-center bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl">
                      <div className={`w-full relative ${getRatioClass(ratio)}`}>
                        {selectedImage ? (
                          <>
                            <img src={selectedImage.url} className="absolute inset-0 w-full h-full object-contain pointer-events-none opacity-50" alt="Base" />
                            <canvas 
                              ref={maskCanvasRef}
                              width={1024} height={1024}
                              onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={stopDrawing} onMouseLeave={stopDrawing}
                              onTouchStart={startDrawing} onTouchMove={draw} onTouchEnd={stopDrawing}
                              className="absolute inset-0 w-full h-full object-contain cursor-crosshair mix-blend-screen opacity-70"
                            />
                          </>
                        ) : (
                          <div className="flex flex-col items-center justify-center h-full opacity-10 gap-4">
                             <ImageIcon size={64}/>
                             <p className="font-black text-xs">CHỌN ẢNH ĐỂ BẮT ĐẦU</p>
                          </div>
                        )}
                      </div>
                      
                      {resultImage && (
                        <div className="absolute inset-0 z-10 bg-zinc-950">
                           <img src={resultImage} className="w-full h-full object-contain" alt="Result" />
                           <div className="absolute top-4 right-4 flex gap-2">
                              <button onClick={handleApplyResult} className="bg-green-600 text-white px-4 py-2 rounded-xl font-black text-[10px] flex items-center gap-2 shadow-xl"><Check size={14}/> ÁP DỤNG</button>
                              <button onClick={() => setResultImage(null)} className="bg-zinc-900 text-white p-2 rounded-xl"><X size={18}/></button>
                           </div>
                        </div>
                      )}
                   </div>
                </div>
              </div>
            ) : (
              <div className="w-full h-full flex flex-col lg:flex-row gap-8 items-center justify-center p-4">
                  <div className="flex-1 w-full max-w-xl flex flex-col gap-3">
                      <span className="text-[10px] font-black uppercase text-zinc-600 flex items-center gap-2 px-2"><Library size={10} /> Ảnh gốc</span>
                      <div className={`w-full bg-zinc-950 rounded-2xl border border-zinc-800 overflow-hidden flex items-center justify-center shadow-lg transition-all duration-500 ${getRatioClass(ratio)}`}>
                        {selectedImage ? <img src={selectedImage.url} className="w-full h-full object-contain" alt="Original" /> : <ImageIcon className="opacity-10" size={64} />}
                      </div>
                  </div>
                  
                  <div className="flex-1 w-full max-w-xl flex flex-col gap-3">
                      <span className="text-[10px] font-black uppercase tracking-widest text-orange-500 px-3 py-1 bg-orange-500/10 rounded-full w-fit flex items-center gap-2"><Sparkles size={10} /> Kết quả</span>
                      <div className={`w-full bg-zinc-950 rounded-2xl border border-zinc-800 shadow-2xl overflow-hidden flex items-center justify-center group relative transition-all duration-500 ${getRatioClass(ratio)}`}>
                        {resultImage ? (
                            <>
                              <img src={resultImage} className="w-full h-full object-contain" alt="Result" />
                              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <button onClick={handleApplyResult} className="bg-green-600 text-white px-8 py-3 rounded-2xl font-black text-xs shadow-xl">CHẤP NHẬN ẢNH NÀY</button>
                              </div>
                            </>
                        ) : <Sparkles size={80} className="opacity-5" />}
                      </div>
                  </div>
              </div>
            )}
          </div>

          {/* Prompt Input Area */}
          <div className="mt-6 pt-6 border-t border-zinc-800 flex flex-col gap-4">
              <div className="flex flex-wrap gap-4 items-center bg-zinc-900/40 p-4 rounded-2xl border border-zinc-800/50">
                  <div className="flex items-center gap-3 border-r border-zinc-800 pr-4">
                      <span className="text-[9px] font-black uppercase text-zinc-600">Tỷ lệ:</span>
                      <div className="flex gap-1.5">
                        {(["1:1", "3:4", "4:3", "9:16", "16:9"] as AspectRatio[]).map(r => (
                          <button key={r} onClick={() => setRatio(r)} className={`px-2.5 py-1 text-[10px] rounded-lg font-black transition-all ${ratio === r ? 'bg-orange-600 text-white' : 'bg-zinc-800 text-zinc-600 hover:text-zinc-400'}`}>{r}</button>
                        ))}
                      </div>
                  </div>
                  <div className="flex items-center gap-3">
                      <span className="text-[9px] font-black uppercase text-zinc-600">Size:</span>
                      <div className="flex gap-1.5">
                        {(["1K", "2K", "4K"] as ImageSize[]).map(s => (
                          <button key={s} onClick={() => setSize(s)} className={`px-2.5 py-1 text-[10px] rounded-lg font-black transition-all ${size === s ? 'bg-white text-zinc-950' : 'bg-zinc-800 text-zinc-600 hover:text-zinc-400'}`}>{s}</button>
                        ))}
                      </div>
                  </div>
              </div>

              <div className="flex gap-4 items-end">
                <div className="flex-1 relative">
                  <textarea 
                      value={prompt} onChange={(e) => setPrompt(e.target.value)}
                      placeholder="Mô tả yêu cầu chỉnh sửa..."
                      className="w-full h-20 bg-zinc-950 border border-zinc-800 rounded-2xl px-6 py-4 text-sm focus:ring-1 focus:ring-orange-600 outline-none resize-none placeholder:text-zinc-800 font-medium leading-relaxed shadow-inner"
                  />
                  {prompt && <button onClick={() => setPrompt('')} className="absolute right-4 top-4 p-1 text-zinc-700 hover:text-white"><X size={14}/></button>}
                </div>
                <button 
                  disabled={isProcessing}
                  onClick={() => handleProcess()}
                  className="h-20 px-12 bg-orange-600 hover:bg-orange-500 disabled:bg-zinc-900 disabled:text-zinc-700 rounded-2xl font-black text-xs tracking-[0.2em] transition-all shadow-xl active:scale-95"
                >
                  {isProcessing ? <Loader2 className="animate-spin" size={20} /> : "THỰC HIỆN"}
                </button>
              </div>
          </div>
        </section>

        {/* Right Sidebar - Presets */}
        {activeTab !== AppTab.GENERATE && activeTab !== AppTab.INPAINT && (
            <aside className="w-80 border-l border-zinc-800 bg-zinc-950 flex flex-col shrink-0">
                <div className="p-5 bg-zinc-900/20 border-b border-zinc-800">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600">Preset Pro</h3>
                </div>
                <div className="flex-1 overflow-y-auto p-5 space-y-8 no-scrollbar">
                    {Object.entries(groupedPresets).map(([group, items]) => (
                        <div key={group} className="space-y-4">
                            <h4 className="text-[9px] font-black text-orange-600 uppercase tracking-widest border-l-2 border-orange-600 pl-3">{group}</h4>
                            <div className="grid gap-2.5">
                                {items.map(p => (
                                    <button 
                                        key={p.id} onClick={() => handleProcess(p.prompt)}
                                        className="flex items-center gap-3.5 p-3.5 bg-zinc-900/40 hover:bg-zinc-900 border border-zinc-800/50 rounded-2xl text-left transition-all active:scale-95 group"
                                    >
                                        <div className="w-9 h-9 rounded-xl bg-zinc-950 flex items-center justify-center text-lg group-hover:scale-110 transition-all shadow-inner">{p.icon}</div>
                                        <span className="text-[10px] font-black text-zinc-400 group-hover:text-white uppercase tracking-tight">{p.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </aside>
        )}
      </main>

      {/* Guide Modal */}
      {showGuide && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md">
            <div className="w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-[3rem] overflow-hidden">
                <div className="p-8 bg-zinc-950 border-b border-zinc-800 flex justify-between items-center">
                    <h2 className="text-xl font-black uppercase italic">Hướng dẫn <span className="text-orange-600">Lumina Pro</span></h2>
                    <button onClick={() => setShowGuide(false)} className="p-2 hover:bg-zinc-800 rounded-lg transition-transform hover:rotate-90"><X/></button>
                </div>
                <div className="p-10 grid md:grid-cols-2 gap-10 text-xs leading-relaxed">
                    <div className="space-y-4">
                        <p className="font-black text-orange-500 uppercase flex items-center gap-2">1. Chọn API Key</p>
                        <p className="text-zinc-500">Nhấn vào nút <b>SELECT API KEY</b> ở thanh trạng thái. Bạn cần chọn một dự án GCP có bật tính phí để sử dụng mô hình Gemini 3 Pro Image.</p>
                        <p className="font-black text-orange-500 uppercase flex items-center gap-2">2. Vẽ vùng Mask</p>
                        <p className="text-zinc-500">Tại tab "Vẽ Mask", bôi trắng vùng bạn muốn thay đổi (vd: bôi vùng áo để thay quần áo). AI sẽ chỉ vẽ lại đúng phần đó.</p>
                    </div>
                    <div className="space-y-4">
                        <p className="font-black text-orange-500 uppercase flex items-center gap-2">3. Sử dụng Preset</p>
                        <p className="text-zinc-500">Bộ công cụ bên phải cung cấp các cài đặt sẵn cho: phục hồi ảnh cũ, làm ảnh thờ Nam/Nữ, ảnh thẻ các màu nền.</p>
                        <p className="font-black text-orange-500 uppercase flex items-center gap-2">4. Xuất & Lưu</p>
                        <p className="text-zinc-500">Sau khi có kết quả, nhấn <b>ÁP DỤNG</b> để tiếp tục chỉnh sửa trên ảnh mới hoặc nhấn Download để lưu về máy.</p>
                    </div>
                </div>
                <div className="p-10 bg-zinc-950 flex justify-center">
                    <button onClick={() => setShowGuide(false)} className="px-16 py-4 bg-orange-600 hover:bg-orange-500 text-white font-black rounded-2xl transition-all shadow-xl text-xs uppercase italic tracking-widest active:scale-95">BẮT ĐẦU NGAY</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default App;
