// src/app/OF/TB/config.ts

export interface ColumnConfig {
  header: string;
  keys: string[];
  width: number;
  align?: 'left' | 'center' | 'right';
  isBold?: boolean;
  isOptional?: boolean;
}

export interface ProductConfig {
  id: string;
  name: string;
  sampleImageName: string; // Nombre de imagen por defecto
  headerRow: number; 
  columns: ColumnConfig[];
}

// --- COLUMNAS PARA TB (TOMMY BAHAMA / RFID STANDARD) ---
const TB_COLUMNS: ColumnConfig[] = [
  { header: 'Sorting', keys: ['Sorting_No', 'sorting_no', 'Sorting'], width: 0.7, align: 'center' },
  { header: 'Lot', keys: ['Lot_No', 'lot_no', 'Lot'], width: 0.6, align: 'center' },
  { header: 'Color By', keys: ['color_by', 'Color_By'], width: 1.0, align: 'left' },
  { header: 'Un_Key', keys: ['Un_Key', 'un_key'], width: 1.1, align: 'center' },
  { header: 'Unit', keys: ['Unit', 'unit'], width: 0.35, align: 'center' },
  { header: 'G. Name', keys: ['g_name', 'G_Name', 'Cust_Name'], width: 2.8, align: 'left' },
  { header: 'Style', keys: ['g_style', 'G_Style', 'Style', 'Style_No'], width: 1.0, align: 'left' },
  { header: 'Color', keys: ['g_color', 'G_Color', 'Color', 'Color_Desc'], width: 1.2, align: 'left' },
  { header: 'Barcode', keys: ['barcode', 'Barcode', 'UPC'], width: 1.0, align: 'center' },
  { header: 'Qty', keys: ['Qty_Original', 'Qty_Total', 'qty', 'QTY'], width: 0.5, align: 'center', isBold: true },
  { header: 'Size', keys: ['Size', 'size', 'us_size'], width: 0.8, align: 'center' },
  // Importante: 'Price' y 'Price2' para la lógica de imagen
  { header: 'Price', keys: ['Price', 'price', 'RRP', 'Retail_Price'], width: 0.5, align: 'center' },
  { header: 'Price 2', keys: ['Price2', 'price2'], width: 0.5, align: 'center', isOptional: true },
  { header: 'Fmt', keys: ['format', 'Format'], width: 0.35, align: 'center' },
  { header: 'QC', keys: [], width: 0.35, align: 'center' },
];

// === CONFIGURACIÓN ÚNICA TB ===
export const TB_CONFIG: ProductConfig = {
  id: 'tb_rfid_tmtmm9v001',
  name: 'TB RFID - Tommy Bahama',
  sampleImageName: 'sample.jpg',
  headerRow: 0,
  columns: TB_COLUMNS 
};