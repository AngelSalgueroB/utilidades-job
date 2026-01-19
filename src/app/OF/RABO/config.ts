// src/app/OF/RABO/config.ts

export interface ColumnConfig {
  header: string;
  keys: string[];
  width: number;
  align?: 'left' | 'center' | 'right';
  isBold?: boolean;
  isOptional?: boolean;
  isCorrelative?: boolean; 
  isSubtotal?: boolean;    // Suma + Bloque
}

export interface ProductConfig {
  id: string;
  name: string;
  sampleImageName: string;
  headerRow: number; 
  fixedItemName: string;
  fixedProductCode: string;
  columns: ColumnConfig[];
}

// DEFINICIÓN DE COLUMNAS ACTUALIZADA
const RABO_COLUMNS: ColumnConfig[] = [
  // 1. Item #
  { header: 'Item #', keys: [], width: 0.5, align: 'center', isCorrelative: true },
  
  // (Columna PO Eliminada)
  
  // 2. Detalles
  { header: 'Style', keys: ['STYLE', 'Style', 'Style_No'], width: 1.2, align: 'left' },
  { header: 'Color', keys: ['COLOR', 'Color', 'Colour'], width: 1.5, align: 'left' },
  { header: 'Description', keys: ['DESCRIPTION', 'Description', 'Desc'], width: 3.5, align: 'left' },
  
  // 3. Cut
  { header: 'Cut', keys: ['CUT', 'Cut'], width: 0.8, align: 'center', isOptional: true },
  
  // 4. Size / UPC / Price
  { header: 'Size', keys: ['SIZE', 'Size'], width: 0.6, align: 'center' },
  { header: 'UPC', keys: ['UPC', 'Barcode'], width: 1.2, align: 'center' },
  { header: 'Price', keys: ['PRICE', 'Price'], width: 0.8, align: 'center' },
  
  // 5. Cantidad Individual
  { header: 'Qty (R)', keys: ['ROUNDED', 'Rounded'], width: 0.7, align: 'center', isBold: true },
  
  // 6. Subtotal + Bloque (Combinados)
  { header: 'Subtotal (Blk)', keys: [], width: 0.9, align: 'center', isSubtotal: true, isBold: true }
];

export const RABO_CONFIGS: Record<string, ProductConfig> = {
  'rb_rabo_0896': {
    id: 'rb_rabo_0896',
    name: 'R&B RABO-0896',
    sampleImageName: 'RABO-0896.jpg',
    headerRow: 17,
    fixedItemName: 'RAG&BONE STICKER RABO-0896-UPC',
    fixedProductCode: 'RARATKV001',
    columns: RABO_COLUMNS
  },
  'rb_rabo_1068': {
    id: 'rb_rabo_1068',
    name: 'R&B RABO-1068',
    sampleImageName: 'RABO-1068.jpg',
    headerRow: 17,
    fixedItemName: 'RAG&BONE STICKER RABO-1068-UPC',
    fixedProductCode: 'RARATKV002',
    columns: RABO_COLUMNS
  }
};