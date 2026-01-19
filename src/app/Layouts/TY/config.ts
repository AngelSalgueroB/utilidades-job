// src/app/Layouts/TY/config.ts

export interface LayoutConfig {
  id: string;
  name: string;
  description: string;
  // Aquí agregaremos propiedades visuales en el futuro (ej: width, height, columns)
  sampleImage?: string; 
}

export const TY_LAYOUT_CONFIGS: Record<string, LayoutConfig> = {
  'ty_rfid': {
    id: 'ty_rfid',
    name: '1. TY RFID Standard',
    description: 'Etiqueta RFID estándar con EPC y códigos.',
    sampleImage: 'tyrfid.jpg'
  },
  'ty_packing': {
    id: 'ty_packing',
    name: '2. TY Packing Sticker',
    description: 'Etiqueta de empaque sin precio.',
    sampleImage: 'typacking.jpg'
  },
  'ty_price_stickers': {
    id: 'ty_price_stickers',
    name: '3. TY Price Sticker',
    description: 'Etiqueta de precio pequeña.',
    sampleImage: 'typricesticker.jpg'
  }
};