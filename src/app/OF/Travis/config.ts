export interface ColumnConfig {
  header: string;
  keys: string[];
  width: number;
  align?: 'left' | 'center' | 'right';
  isBold?: boolean;
  isOptional?: boolean;
  isCheck?: boolean;
  isUpperCase?: boolean;
}

export interface ProductConfig {
  id: string;
  name: string;
  sampleImageName: string;
  logoImageName: string;
  headerRow: number; 
  columns: ColumnConfig[];
}

// --- 1. COLUMNAS PARA TRTRHKV002 MENS/WOMANS NON RFID ---
const TRTRHKV002_COLUMNS: ColumnConfig[] = [
  { header: 'Sort', keys: ['sorting_ID', 'Sorting'], width: 0.6, align: 'center' },
  { header: 'Label Name', keys: ['LabelName', 'labelname'], width: 1.4, align: 'left' },
  { header: 'Program', keys: ['Program', 'program'], width: 0.5, align: 'center' },
  { header: 'Name', keys: ['item_desc', 'Item_Desc', 'Name'], width: 1.4, align: 'left' },
  { header: 'Style', keys: ['style_desc', 'Style_Desc', 'Style'], width: 0.7, align: 'center' },
  { header: 'Color', keys: ['color_name', 'Color_Name', 'Color'], width: 1.0, align: 'left' },
  { header: 'Size', keys: ['size_des', 'Size_Des', 'Size'], width: 0.5, align: 'center', isBold: true },
  { header: 'Barcode', keys: ['barcode', 'Barcode', 'rf$barcode'], width: 0.8, align: 'center' },
  { header: 'Qty', keys: ['Qty_So', 'qty_so', 'Qty'], width: 0.5, align: 'center', isBold: true },
  { header: 'Check', keys: [], width: 0.4, align: 'center', isCheck: true }
];

// --- 2. COLUMNAS PARA TRTRM9V001 MENS UPC RFID ---
const TRTRM9V001_COLUMNS: ColumnConfig[] = [
  { header: 'Sort', keys: ['sorting_ID', 'Sorting'], width: 0.5, align: 'center' },
  { header: 'Un_Key', keys: ['Un_Key', 'un_key'], width: 0.9, align: 'center' }, // <--- AGREGADO AQUÍ
  { header: 'Name', keys: ['item_desc', 'Item_Desc', 'Name'], width: 1.2, align: 'left' },
  { header: 'Style', keys: ['style_desc', 'Style_Desc', 'Style'], width: 0.7, align: 'center' },
  { header: 'Color', keys: ['color_name', 'Color_Name', 'Color'], width: 0.9, align: 'left' },
  { header: 'Size', keys: ['size_des', 'Size_Des', 'Size'], width: 0.5, align: 'center', isBold: true },
  { header: 'Barcode', keys: ['rf$barcode', 'barcode', 'Barcode'], width: 0.9, align: 'center' },
  { header: 'USD Price', keys: ['us_price', 'US_Price', 'US Price'], width: 0.6, align: 'center' }, 
  { header: 'CAD Price', keys: ['ca_price', 'CA_Price', 'CA Price'], width: 0.6, align: 'center' }, 
  { header: 'Qty', keys: ['Qty_So', 'qty_so', 'Qty'], width: 0.5, align: 'center', isBold: true },
  { header: 'Check', keys: [], width: 0.3, align: 'center', isCheck: true }
];

// --- DICCIONARIO DE CONFIGURACIONES TRAVIS ---
export const TRAVIS_CONFIGS: Record<string, ProductConfig> = {
  'trtrhkv002': {
    id: 'trtrhkv002',
    name: 'TRTRHKV002 - MENS/WOMANS NON RFID',
    sampleImageName: 'TRTRHKV002.jpg', 
    logoImageName: 'logosml.jpg', 
    headerRow: 0,
    columns: TRTRHKV002_COLUMNS 
  },
  'trtrm9v001': {
    id: 'trtrm9v001',
    name: 'TRTRM9V001 - MENS UPC RFID',
    sampleImageName: 'TRTRM9V001.jpg', 
    logoImageName: 'logosml.jpg',
    headerRow: 0,
    columns: TRTRM9V001_COLUMNS 
  }
};