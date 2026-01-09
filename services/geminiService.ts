
import { GoogleGenAI } from "@google/genai";
import { AspectRatio, ImageSize } from "../types";

export class GeminiImageService {
  /**
   * Generates a new image based on a text prompt.
   * @param apiKey The API Key provided by the user manually.
   */
  static async generateImage(apiKey: string, prompt: string, aspectRatio: AspectRatio = "1:1", imageSize: ImageSize = "1K") {
    const ai = new GoogleGenAI({ apiKey: apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: [{ text: prompt }],
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
    throw new Error("Không thể tạo ảnh. Vui lòng thử lại.");
  }

  /**
   * Edits an existing image based on a text prompt.
   * @param apiKey The API Key provided by the user manually.
   */
  static async editImage(apiKey: string, base64Image: string, prompt: string, mimeType: string, aspectRatio: AspectRatio = "1:1", imageSize: ImageSize = "1K") {
    const ai = new GoogleGenAI({ apiKey: apiKey });
    const cleanBase64 = base64Image.includes('base64,') ? base64Image.split('base64,')[1] : base64Image;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: [
          {
            inlineData: {
              data: cleanBase64,
              mimeType: mimeType || 'image/png',
            },
          },
          { text: prompt },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio,
          imageSize
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    
    const textPart = response.candidates?.[0]?.content?.parts.find(p => p.text);
    if (textPart) {
        throw new Error(`AI phản hồi: ${textPart.text}`);
    }

    throw new Error("Không thể chỉnh sửa ảnh. AI không trả về kết quả hình ảnh.");
  }

  /**
   * Inpaints an image using a mask and a text prompt.
   * @param apiKey The API Key provided by the user manually.
   */
  static async inpaintImage(apiKey: string, base64Image: string, base64Mask: string, prompt: string, mimeType: string, aspectRatio: AspectRatio = "1:1", imageSize: ImageSize = "1K") {
    const ai = new GoogleGenAI({ apiKey: apiKey });
    const cleanImage = base64Image.includes('base64,') ? base64Image.split('base64,')[1] : base64Image;
    const cleanMask = base64Mask.includes('base64,') ? base64Mask.split('base64,')[1] : base64Mask;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: [
          {
            inlineData: {
              data: cleanImage,
              mimeType: mimeType || 'image/png',
            },
          },
          {
            inlineData: {
              data: cleanMask,
              mimeType: 'image/png',
            },
          },
          { text: `Sử dụng mặt nạ (mask) đi kèm, hãy thay đổi vùng màu trắng trong mặt nạ bằng: ${prompt}. Giữ nguyên các phần còn lại của ảnh gốc.` },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio,
          imageSize
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }

    const textPart = response.candidates?.[0]?.content?.parts.find(p => p.text);
    if (textPart) throw new Error(textPart.text);

    throw new Error("Không thể thực hiện inpaint. Vui lòng thử lại.");
  }
}
