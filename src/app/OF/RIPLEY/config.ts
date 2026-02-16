// src/app/OF/Ripley/config.ts

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
  logoImageName: string;
  headerRow: number; 
  columns: ColumnConfig[];
}

// --- COLUMNAS PARA RIPLEY HOME (UR7HT9V004) ---
const RIPLEY_HOME_COLUMNS: ColumnConfig[] = [
  { header: 'Sort', keys: ['sorting_ID', 'Sorting'], width: 0.5, align: 'center' },
  { header: 'Un Key', keys: ['Un_Key', 'un_key'], width: 0.7, align: 'center' },
  
  { header: 'Brand', keys: ['brand', 'Brand'], width: 0.8, align: 'center' },
  { header: 'Season', keys: ['season', 'Season'], width: 0.8, align: 'center' },
  
  { header: 'Size', keys: ['size', 'Size'], width: 0.5, align: 'center' },
  // EAN movido de aquí...
  
  { header: 'Art Desc 1', keys: ['artdesc1', 'ArtDesc1'], width: 1.2, align: 'left' },
  { header: 'Art Desc 2', keys: ['artdesc2', 'ArtDesc2'], width: 0.5, align: 'left' },
  
  { header: 'Dept', keys: ['codedept', 'CodeDept'], width: 0.5, align: 'center' },
  { header: 'Name Dept', keys: ['namedept', 'NameDept'], width: 0.9, align: 'left' },
  { header: 'Line', keys: ['codeline', 'CodeLine'], width: 0.6, align: 'center' },
  
  { header: 'Price', keys: ['retprice', 'RetPrice', 'Price'], width: 0.7, align: 'center' },
  
  // ...hacia aquí (Justo antes de Qty)
  { header: 'EAN', keys: ['ean', 'EAN', 'rf$barcode'], width: 0.9, align: 'center' },
  
  { header: 'Qty', keys: ['Qty_So', 'qty_so', 'Qty'], width: 0.5, align: 'center', isBold: true },
  
  { header: 'QR Link', keys: ['qr_text'], width: 1.8, align: 'left' }, 

  { header: 'Check', keys: [], width: 0.4, align: 'center', isCheck: true }
];

export const RIPLEY_CONFIGS: Record<string, ProductConfig> = {
  'ripley_rfid': {
    id: 'ripley_rfid',
    name: 'RIPLEY RFID - UR7HT9V004',
    sampleImageName: 'RipleyRFIDsticker_PR_UR7HT9V004.jpg', 
    logoImageName: 'logosml.jpg',
    headerRow: 0,
    columns: RIPLEY_HOME_COLUMNS
  }
};