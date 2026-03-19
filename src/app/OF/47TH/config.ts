export interface ColumnConfig {
  header: string;
  keys: string[];
  width: number;
  align?: 'left' | 'center' | 'right';
  isBold?: boolean;
  isOptional?: boolean;
  isCheck?: boolean;
  isGroupTotal?: boolean; // Propiedad clave para agrupar y sumar
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
// (Se eliminó Label Name y se ajustaron los anchos para aprovechar el espacio)
const TRTRHKV002_COLUMNS: ColumnConfig[] = [
  { header: 'Sort', keys: ['sorting_ID', 'Sorting'], width: 0.8, align: 'center' },
  { header: 'Program', keys: ['Program', 'program'], width: 0.8, align: 'center' },
  { header: 'Name', keys: ['item_desc', 'Item_Desc', 'Name'], width: 2.0, align: 'left' },
  { header: 'Style', keys: ['style_desc', 'Style_Desc', 'Style'], width: 1.0, align: 'center' },
  { header: 'Color', keys: ['color_name', 'Color_Name', 'Color'], width: 1.5, align: 'left' },
  { header: 'Size', keys: ['size_des', 'Size_Des', 'Size'], width: 0.8, align: 'center', isBold: true },
  { header: 'Barcode', keys: ['barcode', 'Barcode'], width: 1.2, align: 'center' },
  { header: 'Qty', keys: ['Qty_So', 'qty_so', 'Qty'], width: 0.6, align: 'center', isBold: true },
  { header: 'Qty x Size', keys: [], width: 1.0, align: 'center', isGroupTotal: true, isBold: true } // Subtotal por Estilo
];

// --- DICCIONARIO DE CONFIGURACIONES TRAVIS ---
export const TRAVIS_CONFIGS: Record<string, ProductConfig> = {
  'trtrhkv002': {
    id: 'trtrhkv002',
    name: 'TRTRHKV002 - MENS/WOMANS NON RFID',
    sampleImageName: 'TRTRHKV002.JPG', 
    logoImageName: 'logosml2.jpg',
    headerRow: 0,
    columns: TRTRHKV002_COLUMNS
  }
};