
import { GoogleGenAI } from "@google/genai";
import { AspectRatio, ImageSize } from "../types";

export class GeminiImageService {
  /**
   * Tạo hoặc chỉnh sửa ảnh sử dụng 1 hoặc nhiều ảnh tham chiếu.
   */
  static async processWithReferences(
    apiKey: string,
    prompt: string, 
    referenceImages: { base64: string, mimeType: string }[], 
    aspectRatio: AspectRatio = "1:1", 
    imageSize: ImageSize = "1K"
  ) {
    const ai = new GoogleGenAI({ apiKey: apiKey });
    
    const imageParts = referenceImages.map(img => {
      const cleanBase64 = img.base64.includes('base64,') ? img.base64.split('base64,')[1] : img.base64;
      return {
        inlineData: {
          data: cleanBase64,
          mimeType: img.mimeType || 'image/png',
        },
      };
    });

    const enhancedPrompt = imageParts.length > 1 
      ? `Dựa trên ${imageParts.length} hình ảnh tham chiếu đi kèm, hãy kết hợp các đặc điểm (phong cách, đối tượng, màu sắc) và thực hiện yêu cầu sau: ${prompt}`
      : prompt;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: [...imageParts, { text: enhancedPrompt }],
      },
      config: {
        imageConfig: {
          aspectRatio,
          imageSize,
        },
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    
    const textPart = response.candidates?.[0]?.content?.parts.find(p => p.text);
    if (textPart) throw new Error(`AI: ${textPart.text}`);

    throw new Error("Không thể tạo kết quả từ các ảnh tham chiếu này.");
  }

  static async inpaintImage(apiKey: string, base64Image: string, base64Mask: string, prompt: string, mimeType: string, aspectRatio: AspectRatio = "1:1", imageSize: ImageSize = "1K") {
    const ai = new GoogleGenAI({ apiKey: apiKey });
    const cleanImage = base64Image.includes('base64,') ? base64Image.split('base64,')[1] : base64Image;
    const cleanMask = base64Mask.includes('base64,') ? base64Mask.split('base64,')[1] : base64Mask;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: [
          { inlineData: { data: cleanImage, mimeType: mimeType || 'image/png' } },
          { inlineData: { data: cleanMask, mimeType: 'image/png' } },
          { text: `Dựa trên mặt nạ mask, hãy thay thế vùng trắng bằng: ${prompt}.` },
        ],
      },
      config: {
        imageConfig: { aspectRatio, imageSize }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
    }
    throw new Error("Inpaint thất bại.");
  }
}
