export enum AppTab {
  GENERATE = 'GENERATE',
  RETOUCH = 'RETOUCH',
  INPAINT = 'INPAINT',
  STYLE = 'STYLE',
  BACKGROUND = 'BACKGROUND',
  PRESETS = 'PRESETS',
  UTILITIES = 'UTILITIES'
}

export type AspectRatio = "1:1" | "3:4" | "4:3" | "9:16" | "16:9";
export type ImageSize = "1K" | "2K" | "4K";

export interface ImageFile {
  id: string;
  url: string;
  name: string;
  type: string;
  base64: string;
}

export interface Preset {
  id: string;
  label: string;
  prompt: string;
  icon: string;
  category: AppTab;
  subCategory?: string;
}

export interface ProcessLog {
  timestamp: Date;
  message: string;
  type: 'info' | 'error' | 'success';
}