// src/app/OF/VV/config.ts

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
  sampleImageName: string;
  headerRow: number; 
  columns: ColumnConfig[];
}

// --- 1. COLUMNAS PARA VV RFID (Ajustadas) ---
const VV_RFID_COLUMNS: ColumnConfig[] = [
  { header: 'Sorting', keys: ['sorting_ID', 'Sorting'], width: 0.6, align: 'center' }, // Reducido
  { header: 'Un Key', keys: ['Un_Key', 'Un_key'], width: 0.9, align: 'center' },
  { header: 'Sty No', keys: ['sty_no', 'Sty_no'], width: 0.8, align: 'center' },
  { header: 'Style No', keys: ['style_no', 'Style_no'], width: 0.8, align: 'center' },
  { header: 'Prod', keys: ['prod', 'Prod'], width: 0.6, align: 'center' },
  
  // AUMENTADO SIGNIFICATIVAMENTE PARA VERSE COMPLETO
  { header: 'Pattern', keys: ['patternnam', 'pattername'], width: 2.2, align: 'left' },
  
  { header: 'Col Code', keys: ['color_code'], width: 0.7, align: 'center' },
  { header: 'Col Desc', keys: ['color_desc'], width: 1.1, align: 'left' },
  { header: 'UPC', keys: ['barcode', 'upc', 'rf$barcode'], width: 1.0, align: 'center' },
  
  { header: 'Size', keys: ['Size_Des', 'size_des', 'size', 'Size'], width: 0.6, align: 'center' },
  { header: 'Kid Sz', keys: ['kidssize', 'kid_size', 'Kidssize'], width: 0.6, align: 'center' },
  
  { header: 'Price', keys: ['main_price', 'price', 'price_in'], width: 0.6, align: 'center' },
  { header: 'Qty', keys: ['Qty_So', 'Qty', 'Prod_Qty'], width: 0.5, align: 'center', isBold: true },
];

const DUMMY_COLS: ColumnConfig[] = [{ header: 'Data', keys: ['data'], width: 1, align: 'left' }];

export const VV_CONFIGS: Record<string, ProductConfig> = {
  'vv_rfid': {
    id: 'vv_rfid',
    name: 'VV RFID - VVVVM9V008',
    sampleImageName: 'vvrfid.jpg',
    headerRow: 0, 
    columns: VV_RFID_COLUMNS
  },
  'vv_price_ticket': {
    id: 'vv_price_ticket',
    name: 'PRICE TICKET VV - VVVVTNV01Y',
    sampleImageName: 'sample.jpg', 
    headerRow: 0,
    columns: DUMMY_COLS
  },
  'vv_polybags': {
    id: 'vv_polybags',
    name: 'VV POLYBAGS - DYLA3WR8545',
    sampleImageName: 'sample.jpg', 
    headerRow: 0,
    columns: DUMMY_COLS
  },
  'vv_boxer': {
    id: 'vv_boxer',
    name: 'BOXER VV - VVVVI9V001',
    sampleImageName: 'sample.jpg', 
    headerRow: 0,
    columns: DUMMY_COLS
  }
};