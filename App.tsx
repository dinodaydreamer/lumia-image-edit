
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
  Check,
  Paintbrush,
  RotateCcw,
  ChevronRight,
  Key,
  ShieldCheck,
  MousePointer2,
  Images,
  ExternalLink
} from 'lucide-react';
import { AppTab, ImageFile, ProcessLog, AspectRatio, ImageSize } from './types';
import { PRESETS } from './constants';
import { GeminiImageService } from './services/geminiService';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.GENERATE);
  const [images, setImages] = useState<ImageFile[]>([]);
  const [referenceIds, setReferenceIds] = useState<string[]>([]);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [logs, setLogs] = useState<ProcessLog[]>([]);
  const [showGuide, setShowGuide] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [ratio, setRatio] = useState<AspectRatio>("1:1");
  const [size, setSize] = useState<ImageSize>("1K");
  
  // Trạng thái API Key theo hướng dẫn Gemini 3 / Veo
  const [hasKey, setHasKey] = useState(false);

  useEffect(() => {
    const checkKey = async () => {
      const selected = await (window as any).aistudio.hasSelectedApiKey();
      setHasKey(selected);
    };
    checkKey();
  }, []);

  const handleOpenKey = async () => {
    await (window as any).aistudio.openSelectKey();
    // Race condition: giả định thành công theo hướng dẫn
    setHasKey(true);
  };

  const [brushSize, setBrushSize] = useState(30);
  const maskCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- HÀM VẼ MASK CHO INPAINT ---
  const getCoordinates = (e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;
    if ('touches' in e && (e as React.TouchEvent).touches.length > 0) {
      clientX = (e as React.TouchEvent).touches[0].clientX;
      clientY = (e as React.TouchEvent).touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }
    const x = (clientX - rect.left) * (canvas.width / rect.width);
    const y = (clientY - rect.top) * (canvas.height / rect.height);
    return { x, y };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    const canvas = maskCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const { x, y } = getCoordinates(e, canvas);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = 'white';
    ctx.lineWidth = brushSize;
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = maskCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const { x, y } = getCoordinates(e, canvas);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      const canvas = maskCanvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.closePath();
    }
  };

  const clearMask = () => {
    const canvas = maskCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const addLog = (message: string, type: 'info' | 'error' | 'success' = 'info') => {
    setLogs(prev => [{ timestamp: new Date(), message, type }, ...prev].slice(0, 50));
  };

  const processFiles = (files: FileList | File[]) => {
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
        if (activeTab === AppTab.RETOUCH || activeTab === AppTab.GENERATE) {
          setReferenceIds(prev => [...prev, newImage.id]);
        }
        addLog(`Đã thêm: ${file.name}`, 'success');
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) processFiles(e.target.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) processFiles(e.dataTransfer.files);
  };

  const toggleReference = (id: string) => {
    setReferenceIds(prev => 
      prev.includes(id) ? prev.filter(rid => rid !== id) : [...prev, id]
    );
  };

  const handleProcess = async (customPrompt?: string) => {
    const isKeySelected = await (window as any).aistudio.hasSelectedApiKey();
    if (!isKeySelected) {
      addLog("Lỗi: Thiếu API Key. Vui lòng kết nối với Google AI Studio.", 'error');
      await handleOpenKey();
      return;
    }

    const activePrompt = customPrompt || prompt;
    const selectedRefs = images.filter(img => referenceIds.includes(img.id));

    if (activeTab === AppTab.INPAINT) {
        if (!selectedImageId) return addLog("Chọn ảnh gốc để Inpaint", 'error');
        setIsProcessing(true);
        try {
            const selectedImg = images.find(img => img.id === selectedImageId)!;
            const maskBase64 = maskCanvasRef.current?.toDataURL('image/png') || '';
            const res = await GeminiImageService.inpaintImage(selectedImg.base64, maskBase64, activePrompt, selectedImg.type, ratio, size);
            setResultImage(res);
            addNewImageToLibrary(res);
        } catch (e: any) {
            if (e.message?.includes("Requested entity was not found.")) {
               setHasKey(false);
               addLog("API Key không hợp lệ hoặc thiếu Billing. Vui lòng chọn lại.", 'error');
               await handleOpenKey();
            } else {
               addLog(e.message, 'error');
            }
        } finally { setIsProcessing(false); }
        return;
    }

    if (selectedRefs.length === 0 && activeTab !== AppTab.GENERATE) {
      addLog("Vui lòng chọn ít nhất 1 ảnh làm tham chiếu.", 'error');
      return;
    }

    setIsProcessing(true);
    setResultImage(null);
    addLog(`Đang tổng hợp dữ liệu từ ${selectedRefs.length} ảnh...`, 'info');

    try {
      const refPayload = selectedRefs.map(img => ({ base64: img.base64, mimeType: img.type }));
      const result = await GeminiImageService.processWithReferences(activePrompt, refPayload, ratio, size);
      setResultImage(result);
      addNewImageToLibrary(result);
      addLog("Xử lý thành công!", 'success');
    } catch (error: any) {
      if (error.message?.includes("Requested entity was not found.")) {
        setHasKey(false);
        addLog("API Key không hợp lệ hoặc thiếu Billing. Vui lòng chọn lại.", 'error');
        await handleOpenKey();
      } else {
        addLog(error.message, 'error');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const addNewImageToLibrary = (base64: string) => {
    const newId = `ai-${Date.now()}`;
    const newImage: ImageFile = {
      id: newId,
      url: base64,
      name: `Lumina-Result-${newId.slice(-4)}.png`,
      type: 'image/png',
      base64: base64
    };
    setImages(prev => [newImage, ...prev]);
  };

  const handleApplyResult = () => {
    if (!resultImage) return;
    const lastImg = images[0];
    setSelectedImageId(lastImg.id);
    setReferenceIds([lastImg.id]);
    setResultImage(null);
    addLog("Đã áp dụng kết quả làm tham chiếu mới.");
  };

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
    <div 
      className={`min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans transition-all duration-300 ${isDragging ? 'scale-[0.99] grayscale-[0.5]' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {isDragging && (
        <div className="fixed inset-0 z-[100] bg-orange-600/20 backdrop-blur-sm border-4 border-dashed border-orange-500 flex flex-col items-center justify-center pointer-events-none">
          <div className="p-8 bg-zinc-950 rounded-[3rem] shadow-2xl flex flex-col items-center gap-4 animate-bounce">
            <Images size={48} className="text-orange-500" />
            <p className="text-xl font-black uppercase italic tracking-tighter text-white">Thả để thêm ảnh tham chiếu</p>
          </div>
        </div>
      )}

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

        <nav className="hidden lg:flex items-center gap-1 bg-zinc-900/50 p-1 rounded-xl border border-zinc-800">
          {[
            { id: AppTab.GENERATE, label: 'Tạo ảnh', icon: Wand2 },
            { id: AppTab.RETOUCH, label: 'Sửa ảnh', icon: Sparkles },
            { id: AppTab.INPAINT, label: 'Vẽ Mask', icon: Paintbrush },
            { id: AppTab.BACKGROUND, label: 'Phông nền', icon: Mountain },
            { id: AppTab.STYLE, label: 'Style', icon: Layers },
            { id: AppTab.PRESETS, label: 'Trang phục', icon: Shirt },
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

        <div className="flex items-center gap-3">
          <div className="relative">
            <button 
              onClick={handleOpenKey}
              className={`h-11 px-6 rounded-full border flex items-center gap-3 transition-all min-w-[200px] font-black text-[10px] uppercase tracking-widest ${hasKey ? 'bg-zinc-900 border-green-500/50 text-green-500 shadow-[0_0_20px_-5px_rgba(34,197,94,0.4)]' : 'bg-orange-600 border-orange-500 text-white hover:bg-orange-500 shadow-lg shadow-orange-950/20'}`}
            >
              <Key size={14} />
              <span>{hasKey ? 'ĐÃ KẾT NỐI CLOUD' : 'KẾT NỐI API KEY'}</span>
              <div className={`w-2 h-2 rounded-full ${hasKey ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,1)]' : 'bg-white/50 animate-pulse'}`}></div>
            </button>
          </div>

          <button onClick={() => setShowGuide(true)} className="p-3 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-orange-500 transition-all shadow-xl">
            <HelpCircle size={18} />
          </button>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Library & References */}
        <aside className="hidden lg:flex w-80 border-r border-zinc-800 bg-zinc-950 flex-col shrink-0">
          <div className="p-4 border-b border-zinc-800 space-y-4">
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-4 bg-orange-600/10 hover:bg-orange-600/20 border border-orange-500/30 text-orange-500 rounded-2xl flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest transition-all shadow-inner"
            >
              <Plus size={18} /> Tải ảnh tham chiếu
            </button>
            <input type="file" ref={fileInputRef} onChange={handleFileUpload} multiple className="hidden" accept="image/*" />
            
            <div className="bg-zinc-900/50 rounded-2xl p-3 border border-zinc-800">
               <p className="text-[10px] font-black text-zinc-500 uppercase mb-2 px-1">Đang tham chiếu ({referenceIds.length})</p>
               <div className="flex flex-wrap gap-2">
                  {referenceIds.length > 0 ? images.filter(img => referenceIds.includes(img.id)).map(img => (
                    <div key={img.id} className="relative w-12 h-12 rounded-lg overflow-hidden border border-orange-500/50 shadow-lg">
                       <img src={img.url} className="w-full h-full object-cover" />
                       <button onClick={() => toggleReference(img.id)} className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity">
                          <X size={12} className="text-white" />
                       </button>
                    </div>
                  )) : <div className="py-2 px-1 text-[9px] text-zinc-700 italic">Chưa có ảnh tham chiếu</div>}
               </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
            <h3 className="text-[10px] font-black text-zinc-600 uppercase tracking-widest flex items-center gap-2">
              <Library size={12}/> Thư viện ảnh
            </h3>
            <div className="grid grid-cols-2 gap-2.5">
              {images.map(img => (
                <div 
                  key={img.id}
                  onClick={() => {
                    if (activeTab === AppTab.INPAINT) setSelectedImageId(img.id);
                    else toggleReference(img.id);
                  }}
                  className={`relative aspect-square rounded-xl overflow-hidden cursor-pointer border-2 transition-all group ${
                    referenceIds.includes(img.id) || selectedImageId === img.id ? 'border-orange-600 scale-[0.96] shadow-xl shadow-orange-950/20' : 'border-zinc-800/50 grayscale hover:grayscale-0'
                  }`}
                >
                  <img src={img.url} className="w-full h-full object-cover" alt={img.name} />
                  {referenceIds.includes(img.id) && (
                    <div className="absolute top-1 right-1 bg-orange-600 text-white rounded-md p-0.5">
                      <Check size={10} strokeWidth={4} />
                    </div>
                  )}
                  <button 
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      setImages(prev => prev.filter(i => i.id !== img.id)); 
                      setReferenceIds(prev => prev.filter(rid => rid !== img.id));
                    }} 
                    className="absolute bottom-1 right-1 p-1 bg-black/60 rounded-md text-white opacity-0 group-hover:opacity-100 hover:bg-red-600 transition-all"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Center Canvas */}
        <section className="flex-1 bg-zinc-900/10 flex flex-col p-6 overflow-hidden relative">
          <div className="flex-1 flex flex-col items-center justify-center gap-6 relative min-h-0 overflow-y-auto scrollbar-hide">
            {isProcessing && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-zinc-950/80 backdrop-blur-md rounded-3xl">
                    <div className="flex flex-col items-center gap-6">
                        <div className="relative">
                           <Loader2 className="w-20 h-20 text-orange-500 animate-spin" strokeWidth={1} />
                           <Sparkles className="absolute inset-0 m-auto text-orange-500 animate-pulse" size={24} />
                        </div>
                        <p className="text-sm font-black text-orange-500 tracking-[0.4em] animate-pulse uppercase italic">Đang kiến tạo nghệ thuật...</p>
                    </div>
                </div>
            )}

            {!hasKey && (
               <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-md rounded-3xl p-10 text-center">
                  <div className="max-w-md bg-zinc-900 border border-zinc-800 p-12 rounded-[3.5rem] shadow-2xl flex flex-col items-center gap-8">
                    <div className="w-20 h-20 bg-zinc-950 rounded-full flex items-center justify-center border border-zinc-800 shadow-inner">
                        <Key className="w-10 h-10 text-orange-600 opacity-50 animate-pulse" />
                    </div>
                    <div className="space-y-3">
                        <h3 className="text-xl font-black uppercase italic tracking-tight">Kích hoạt Lumina Pro</h3>
                        <p className="text-xs text-zinc-500 leading-relaxed font-medium italic">Bạn cần kết nối API Key từ một dự án Google Cloud <b>đã bật Billing</b> để sử dụng các mô hình Gemini 3 cao cấp.</p>
                        <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noreferrer" className="text-[10px] text-orange-500 font-black uppercase flex items-center justify-center gap-1 hover:underline">
                          TÀI LIỆU BILLING <ExternalLink size={10} />
                        </a>
                    </div>
                    <button 
                      onClick={handleOpenKey}
                      className="px-12 py-4 bg-orange-600 hover:bg-orange-500 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-orange-950/20"
                    >
                      KẾT NỐI NGAY
                    </button>
                  </div>
               </div>
            )}

            {activeTab === AppTab.INPAINT ? (
              <div className="w-full h-full flex flex-col items-center justify-center p-4">
                <div className="flex flex-col gap-4 w-full max-w-2xl">
                   <div className="flex justify-between items-center px-4">
                     <span className="text-[10px] font-black uppercase tracking-widest text-orange-500 flex items-center gap-2"><Paintbrush size={10} /> Chế độ Vẽ Mask</span>
                     <div className="flex gap-3 items-center">
                        <span className="text-[9px] font-black text-zinc-500 tracking-tighter">CỌ: {brushSize}PX</span>
                        <input type="range" min="5" max="100" value={brushSize} onChange={(e) => setBrushSize(parseInt(e.target.value))} className="w-24 accent-orange-600 h-1 bg-zinc-800 rounded-full" />
                        <button onClick={clearMask} className="p-2 bg-zinc-900 hover:bg-zinc-800 rounded-lg text-zinc-500 transition-colors"><RotateCcw size={14}/></button>
                     </div>
                   </div>
                   
                   <div className="relative w-full overflow-hidden flex items-center justify-center bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl">
                      <div className={`w-full relative ${getRatioClass(ratio)}`}>
                        {selectedImageId ? (
                          <>
                            <img src={images.find(img => img.id === selectedImageId)?.url} className="absolute inset-0 w-full h-full object-contain pointer-events-none opacity-50" />
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
                             <p className="font-black text-xs uppercase tracking-widest">Chọn ảnh gốc từ thư viện</p>
                          </div>
                        )}
                      </div>
                      
                      {resultImage && (
                        <div className="absolute inset-0 z-10 bg-zinc-950">
                           <img src={resultImage} className="w-full h-full object-contain" alt="Result" />
                           <div className="absolute top-4 right-4 flex gap-2">
                              <button onClick={handleApplyResult} className="bg-green-600 text-white px-5 py-2.5 rounded-xl font-black text-[10px] flex items-center gap-2 shadow-xl uppercase tracking-wider"><Check size={14}/> ÁP DỤNG</button>
                              <button onClick={() => setResultImage(null)} className="bg-zinc-900/80 backdrop-blur-md text-white p-2.5 rounded-xl shadow-xl transition-all hover:bg-zinc-800"><X size={18}/></button>
                           </div>
                        </div>
                      )}
                   </div>
                </div>
              </div>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center max-w-4xl p-4 gap-8">
                  <div className="w-full grid lg:grid-cols-2 gap-8 items-center">
                    {/* Input References Visualization */}
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center justify-between px-2">
                        <span className="text-[10px] font-black uppercase text-zinc-600 tracking-widest">Dữ liệu tham chiếu</span>
                        <span className="text-[9px] bg-zinc-900 px-2 py-0.5 rounded-full text-zinc-500 font-bold">{referenceIds.length} ảnh</span>
                      </div>
                      <div className={`w-full bg-zinc-950 rounded-[2.5rem] border-2 border-dashed border-zinc-800 overflow-hidden flex items-center justify-center shadow-lg transition-all duration-500 min-h-[300px] relative group ${getRatioClass(ratio)}`}>
                        {referenceIds.length > 0 ? (
                           <div className="grid grid-cols-2 w-full h-full p-4 gap-3">
                              {images.filter(img => referenceIds.includes(img.id)).slice(0, 4).map((img, idx) => (
                                <div key={img.id} className={`relative rounded-2xl overflow-hidden border border-zinc-800 ${referenceIds.length === 1 ? 'col-span-2 row-span-2' : ''}`}>
                                  <img src={img.url} className="w-full h-full object-cover" />
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                </div>
                              ))}
                              {referenceIds.length > 4 && (
                                <div className="absolute bottom-6 right-6 bg-zinc-900/90 backdrop-blur-md px-3 py-1.5 rounded-full text-[10px] font-black text-orange-500 border border-orange-500/20 shadow-xl">
                                  +{referenceIds.length - 4} khác
                                </div>
                              )}
                           </div>
                        ) : (
                          <div className="flex flex-col items-center gap-4 opacity-10">
                            <MousePointer2 size={48} />
                            <p className="text-xs font-black uppercase tracking-widest">Kéo thả hoặc chọn ảnh tham chiếu</p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Result Output */}
                    <div className="flex flex-col gap-4">
                      <span className="text-[10px] font-black uppercase tracking-widest text-orange-500 px-3 py-1 bg-orange-500/10 rounded-full w-fit flex items-center gap-2 self-end"><Sparkles size={10} /> Kết quả sáng tạo</span>
                      <div className={`w-full bg-zinc-950 rounded-[2.5rem] border border-zinc-800 shadow-2xl overflow-hidden flex items-center justify-center group relative transition-all duration-500 min-h-[300px] ${getRatioClass(ratio)}`}>
                        {resultImage ? (
                            <>
                              <img src={resultImage} className="w-full h-full object-contain" alt="Result" />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 backdrop-blur-sm">
                                <button onClick={handleApplyResult} className="bg-orange-600 text-white px-8 py-3.5 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-2xl active:scale-95 transition-all">SỬ DỤNG LÀM THAM CHIẾU</button>
                                <button onClick={() => { const l = document.createElement('a'); l.href = resultImage; l.download = `lumina-${Date.now()}.png`; l.click(); }} className="bg-white text-zinc-900 p-3.5 rounded-2xl shadow-xl transition-all hover:scale-110"><Download size={20} /></button>
                              </div>
                            </>
                        ) : <Sparkles size={80} className="opacity-5 animate-pulse" />}
                      </div>
                    </div>
                  </div>
              </div>
            )}
          </div>

          {/* Prompt Input Area */}
          <div className="mt-6 pt-6 border-t border-zinc-800 flex flex-col gap-5 max-w-5xl mx-auto w-full">
              <div className="flex flex-wrap gap-6 items-center bg-zinc-900/40 p-5 rounded-3xl border border-zinc-800/50">
                  <div className="flex items-center gap-4 border-r border-zinc-800 pr-6">
                      <span className="text-[10px] font-black uppercase text-zinc-600">Khung hình:</span>
                      <div className="flex gap-2">
                        {(["1:1", "3:4", "4:3", "9:16", "16:9"] as AspectRatio[]).map(r => (
                          <button key={r} onClick={() => setRatio(r)} className={`px-3 py-1.5 text-[10px] rounded-xl font-black transition-all ${ratio === r ? 'bg-orange-600 text-white shadow-lg' : 'bg-zinc-800 text-zinc-600 hover:text-zinc-400'}`}>{r}</button>
                        ))}
                      </div>
                  </div>
                  <div className="flex items-center gap-4">
                      <span className="text-[10px] font-black uppercase text-zinc-600">Chất lượng:</span>
                      <div className="flex gap-2">
                        {(["1K", "2K", "4K"] as ImageSize[]).map(s => (
                          <button key={s} onClick={() => setSize(s)} className={`px-3 py-1.5 text-[10px] rounded-xl font-black transition-all ${size === s ? 'bg-white text-zinc-950 shadow-lg' : 'bg-zinc-800 text-zinc-600 hover:text-zinc-400'}`}>{s}</button>
                        ))}
                      </div>
                  </div>
              </div>

              <div className="flex gap-5 items-end">
                <div className="flex-1 relative">
                  <textarea 
                      value={prompt} onChange={(e) => setPrompt(e.target.value)}
                      placeholder="Mô tả ý tưởng của bạn (AI sẽ kết hợp với các ảnh tham chiếu đang chọn)..."
                      className="w-full h-28 bg-zinc-950 border border-zinc-800 rounded-[2rem] px-8 py-6 text-sm focus:ring-2 focus:ring-orange-600/20 outline-none resize-none placeholder:text-zinc-800 font-medium leading-relaxed shadow-inner no-scrollbar border-b-orange-600/10"
                  />
                  {prompt && <button onClick={() => setPrompt('')} className="absolute right-6 top-6 p-2 text-zinc-700 hover:text-white transition-colors bg-zinc-900 rounded-lg"><X size={14}/></button>}
                </div>
                <button 
                  disabled={isProcessing}
                  onClick={() => handleProcess()}
                  className="h-28 px-14 bg-orange-600 hover:bg-orange-500 disabled:bg-zinc-900 disabled:text-zinc-700 rounded-[2rem] font-black text-xs tracking-[0.25em] transition-all shadow-xl active:scale-95 flex items-center justify-center uppercase italic border-b-4 border-orange-800"
                >
                  {isProcessing ? <Loader2 className="animate-spin" size={28} /> : "XỬ LÝ NGAY"}
                </button>
              </div>
          </div>
        </section>

        {/* Right Sidebar - Presets */}
        <aside className="hidden xl:flex w-80 border-l border-zinc-800 bg-zinc-950 flex-col shrink-0">
            <div className="p-5 bg-zinc-900/20 border-b border-zinc-800">
                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600 italic">Preset Library</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-8 no-scrollbar">
                {Object.entries(groupedPresets).map(([group, items]) => (
                    <div key={group} className="space-y-4">
                        <h4 className="text-[9px] font-black text-orange-600 uppercase tracking-widest border-l-2 border-orange-600 pl-3">{group}</h4>
                        <div className="grid gap-3.5">
                            {items.map(p => (
                                <button 
                                    key={p.id} onClick={() => handleProcess(p.prompt)}
                                    className="flex items-center gap-4 p-4 bg-zinc-900/30 hover:bg-zinc-900 border border-zinc-800/40 rounded-2xl text-left transition-all active:scale-95 group shadow-sm hover:shadow-xl"
                                >
                                    <div className="w-10 h-10 rounded-xl bg-zinc-950 flex items-center justify-center text-xl group-hover:scale-110 transition-all shadow-inner border border-zinc-800 group-hover:border-orange-500/40">{p.icon}</div>
                                    <div className="flex flex-col gap-0.5">
                                        <span className="text-[10px] font-black text-zinc-400 group-hover:text-white uppercase tracking-tight transition-colors">{p.label}</span>
                                        <span className="text-[8px] text-zinc-700 font-bold uppercase tracking-tighter group-hover:text-orange-500/50">Lumina Preset</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </aside>
      </main>

      {/* Guide Modal */}
      {showGuide && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/95 backdrop-blur-2xl">
            <div className="w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-[4rem] overflow-hidden shadow-2xl">
                <div className="p-10 bg-zinc-950 border-b border-zinc-800 flex justify-between items-center">
                    <h2 className="text-3xl font-black uppercase italic tracking-tighter">Hướng dẫn <span className="text-orange-600">Lumina Pro</span></h2>
                    <button onClick={() => setShowGuide(false)} className="p-3 hover:bg-zinc-800 rounded-full transition-all hover:rotate-90"><X/></button>
                </div>
                <div className="p-12 grid md:grid-cols-2 gap-12 text-[11px] leading-relaxed font-medium">
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <p className="font-black text-orange-500 uppercase flex items-center gap-2 tracking-widest">1. Tham chiếu Đa Ảnh</p>
                            <p className="text-zinc-500 italic">Kéo thả 1 hoặc NHIỀU ảnh vào màn hình. AI sẽ phân tích phong cách, nhân vật từ tất cả các ảnh đó để tạo ra kết quả tổng hợp.</p>
                        </div>
                        <div className="space-y-2">
                            <p className="font-black text-orange-500 uppercase flex items-center gap-2 tracking-widest">2. Vẽ Mask & Inpaint</p>
                            <p className="text-zinc-500 italic">Chọn 1 ảnh gốc, dùng cọ bôi vùng cần thay đổi. AI sẽ chỉ tác động lên vùng mask bạn đã vẽ.</p>
                        </div>
                    </div>
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <p className="font-black text-orange-500 uppercase flex items-center gap-2 tracking-widest">3. Ảnh Thờ Chuyên Nghiệp</p>
                            <p className="text-zinc-500 italic">Dùng preset "Ảnh Thờ" để tự động crop chân dung cận cảnh, phông nền Dark Blue trang nghiêm cho Nam/Nữ.</p>
                        </div>
                        <div className="space-y-2">
                            <p className="font-black text-orange-500 uppercase flex items-center gap-2 tracking-widest">4. 10+ Style Nghệ Thuật</p>
                            <p className="text-zinc-500 italic">Khám phá các phong cách: Sơn dầu, Than chì, Pixel Art, Gothic... để biến đổi ảnh tham chiếu thành tác phẩm nghệ thuật.</p>
                        </div>
                    </div>
                </div>
                <div className="p-12 bg-zinc-950 flex justify-center border-t border-zinc-800">
                    <button onClick={() => setShowGuide(false)} className="px-24 py-5 bg-orange-600 hover:bg-orange-500 text-white font-black rounded-[2rem] transition-all shadow-2xl shadow-orange-950/40 text-[11px] uppercase italic tracking-widest active:scale-95 flex items-center gap-3">
                        BẮT ĐẦU SÁNG TẠO <ShieldCheck size={18}/>
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default App;
