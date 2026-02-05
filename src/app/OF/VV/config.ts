// src/app/OF/VV/config.ts

export interface ColumnConfig {
  header: string;
  keys: string[];
  width: number;
  align?: 'left' | 'center' | 'right';
  isBold?: boolean;
  isOptional?: boolean;
  isCheck?: boolean;
}

export interface ProductConfig {
  id: string;
  name: string;
  sampleImageName: string;
  logoImageName?: string; // Propiedad opcional para el logo específico
  headerRow: number; 
  columns: ColumnConfig[];
}

// --- COLUMNAS VV RFID (Sin cambios) ---
const VV_RFID_COLUMNS: ColumnConfig[] = [
  { header: 'Sorting', keys: ['sorting_ID', 'Sorting'], width: 0.6, align: 'center' },
  { header: 'Un Key', keys: ['Un_Key', 'Un_key'], width: 0.9, align: 'center' },
  { header: 'Sty No', keys: ['sty_no', 'Sty_no'], width: 0.8, align: 'center' },
  { header: 'Style No', keys: ['style_no', 'Style_no'], width: 0.8, align: 'center' },
  { header: 'Prod', keys: ['prod', 'Prod'], width: 0.6, align: 'center' },
  { header: 'Pattern', keys: ['patternnam', 'pattername'], width: 2.2, align: 'left' },
  { header: 'Col Code', keys: ['color_code'], width: 0.7, align: 'center' },
  { header: 'Col Desc', keys: ['color_desc'], width: 1.1, align: 'left' },
  { header: 'UPC', keys: ['barcode', 'upc', 'rf$barcode'], width: 1.0, align: 'center' },
  { header: 'Size', keys: ['Size_Des', 'size_des', 'size', 'Size'], width: 0.6, align: 'center' },
  { header: 'Kid Sz', keys: ['kidssize', 'kid_size', 'Kidssize'], width: 0.6, align: 'center' },
  { header: 'Price', keys: ['main_price', 'price', 'price_in'], width: 0.6, align: 'center' },
  { header: 'Qty', keys: ['Qty_So', 'Qty', 'Prod_Qty'], width: 0.5, align: 'center', isBold: true },
];

// --- COLUMNAS VV BOXER (Sin cambios) ---
const VV_BOXER_COLUMNS: ColumnConfig[] = [
  { header: 'Sorting', keys: ['sorting_ID', 'Sorting'], width: 0.6, align: 'center' },
  { header: 'Un Key', keys: ['Un_Key', 'un_key'], width: 0.9, align: 'center' },
  { header: 'Prod', keys: ['prod', 'Prod', 'Prod_id'], width: 0.7, align: 'center' },
  { header: 'Pattern', keys: ['patternnam', 'pattern'], width: 2.0, align: 'left' },
  { header: 'Color Desc', keys: ['color_desc', 'Color_Desc'], width: 1.2, align: 'left' },
  { header: 'Color Code', keys: ['color_code', 'Color_Code'], width: 0.8, align: 'center' },
  { header: 'Style No', keys: ['style_no', 'Style_No', 'sty_no'], width: 0.9, align: 'left' },
  { header: 'UPC', keys: ['barcode', 'Barcode', 'UPC'], width: 1.0, align: 'center' },
  { header: 'Qty', keys: ['Qty_So', 'qty_so', 'Qty'], width: 0.6, align: 'center', isBold: true },
  { header: 'Size', keys: ['Size_Des', 'size_des', 'size', 'Size'], width: 0.7, align: 'center' },
  { header: 'Price', keys: ['main_price', 'price_in', 'Price'], width: 0.7, align: 'center' },
  { header: 'Check', keys: [], width: 0.5, align: 'center', isCheck: true }
];

// --- COLUMNAS VV POLYBAGS (NUEVO) ---
const VV_POLYBAGS_COLUMNS: ColumnConfig[] = [
  { header: 'Sorting', keys: ['sorting_ID', 'Sorting'], width: 0.6, align: 'center' },
  { header: 'Program', keys: ['program', 'Program'], width: 1.0, align: 'center' },
  { header: 'Desc', keys: ['desc', 'Desc', 'Description'], width: 1.8, align: 'left' },
  { header: 'Style No', keys: [ 'Style_No', 'style_no'], width: 1, align: 'center' },
  { header: 'Prod', keys: ['prod', 'Prod'], width: 0.7, align: 'center' },
  { header: 'Color Code', keys: ['color_code', 'Color_Code'], width: 0.8, align: 'center' },
  { header: 'Color Desc', keys: ['color_desc', 'Color_Desc'], width: 1.2, align: 'left' },
  { header: 'Size', keys: ['size', 'Size'], width: 0.6, align: 'center' },
  { header: 'Kid Sz', keys: ['kidssize', 'kid_size', 'Kidssize'], width: 0.6, align: 'center' },
  { header: 'Qty', keys: ['Qty_So', 'qty_so', 'Qty'], width: 0.6, align: 'center', isBold: true },
  { header: 'UPC', keys: ['barcode', 'Barcode', 'UPC'], width: 1.0, align: 'center' },
  { header: 'Out Price', keys: ['out_price', 'Out_Price', 'price'], width: 0.8, align: 'center' },
  { header: 'Check', keys: [], width: 0.5, align: 'center', isCheck: true }
];

const DUMMY_COLS: ColumnConfig[] = [{ header: 'Data', keys: ['data'], width: 1, align: 'left' }];

export const VV_CONFIGS: Record<string, ProductConfig> = {
  'vv_rfid': {
    id: 'vv_rfid',
    name: 'VV RFID - VVVVM9V008',
    sampleImageName: 'vvrfid.jpg',
    logoImageName: 'logosml.jpg',
    headerRow: 0, 
    columns: VV_RFID_COLUMNS
  },
  'vv_boxer': {
    id: 'vv_boxer',
    name: 'BOXER VV - VVVVI9V001',
    sampleImageName: 'vvboxer.jpg',
    logoImageName: 'logosml.jpg',
    headerRow: 0,
    columns: VV_BOXER_COLUMNS
  },
  'vv_polybags': { // NUEVA CONFIGURACIÓN
    id: 'vv_polybags',
    name: 'VV POLYBAGS - VVVVTKV006', // Nombre corregido
    sampleImageName: 'vvpolibag.jpg', // Imagen corregida
    logoImageName: 'logosml2.jpg',    // Logo específico solicitado
    headerRow: 0,
    columns: VV_POLYBAGS_COLUMNS
  },
  'vv_price_ticket': {
    id: 'vv_price_ticket',
    name: 'PRICE TICKET VV - VVVVTNV01Y',
    sampleImageName: 'sample.jpg', 
    headerRow: 0,
    columns: DUMMY_COLS
  }
};