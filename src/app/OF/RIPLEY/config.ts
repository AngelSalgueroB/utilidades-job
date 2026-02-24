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

// --- 1. COLUMNAS PARA RIPLEY HOME STICKER (UR7HT9V004) ---
const RIPLEY_HOME_COLUMNS: ColumnConfig[] = [
  { header: 'Sort', keys: ['sorting_ID', 'Sorting'], width: 0.5, align: 'center' },
  { header: 'Un Key', keys: ['Un_Key', 'un_key'], width: 0.7, align: 'center' },
  { header: 'Brand', keys: ['brand', 'Brand'], width: 0.8, align: 'center' },
  { header: 'Season', keys: ['season', 'Season'], width: 0.8, align: 'center' },
  { header: 'Size', keys: ['size', 'Size'], width: 0.5, align: 'center' },
  { header: 'Art Desc 1', keys: ['artdesc1', 'ArtDesc1'], width: 1.2, align: 'left' },
  { header: 'Art Desc 2', keys: ['artdesc2', 'ArtDesc2'], width: 1.2, align: 'left' },
  { header: 'Dept', keys: ['codedept', 'CodeDept'], width: 0.5, align: 'center' },
  { header: 'Name Dept', keys: ['namedept', 'NameDept'], width: 0.9, align: 'left' },
  { header: 'Line', keys: ['codeline', 'CodeLine'], width: 0.6, align: 'center' },
  { header: 'Price', keys: ['retprice', 'RetPrice', 'Price'], width: 0.7, align: 'center' },
  { header: 'EAN', keys: ['ean', 'EAN', 'rf$barcode'], width: 0.9, align: 'center' },
  { header: 'Qty', keys: ['Qty_So', 'qty_so', 'Qty'], width: 0.5, align: 'center', isBold: true },
  { header: 'QR Link', keys: ['qr_text'], width: 1.8, align: 'left' }, 
  { header: 'Check', keys: [], width: 0.4, align: 'center', isCheck: true }
];

// --- 2. COLUMNAS PARA RIPLEY HANG TAG (UR7HT9F00D) ---
const RIPLEY_HT_UR7HT9F00D_COLUMNS: ColumnConfig[] = [
  { header: 'Sort', keys: ['sorting_ID', 'Sorting'], width: 0.5, align: 'center' },
  { header: 'Un Key', keys: ['Un_Key', 'un_key'], width: 0.7, align: 'center' },
  { header: 'Art Desc 1', keys: ['artdesc1', 'ArtDesc1'], width: 1.2, align: 'left' },
  { header: 'Art Desc 2', keys: ['artdesc2', 'ArtDesc2'], width: 1.2, align: 'left' },
  { header: 'Dept', keys: ['codedept', 'CodeDept'], width: 0.5, align: 'center' },
  { header: 'Name Dept', keys: ['namedept', 'NameDept'], width: 0.9, align: 'left' },
  { header: 'Season', keys: ['season', 'Season'], width: 0.6, align: 'center' },
  { header: 'Ret Price', keys: ['retprice', 'RetPrice'], width: 0.7, align: 'center' },
  { header: 'Sale Price', keys: ['salprice', 'SalPrice'], width: 0.7, align: 'center' },
  { header: 'Barcode', keys: ['rf$barcode', 'barcode', 'ean', 'EAN'], width: 1.0, align: 'center' },
  { header: 'Prod MMYY', keys: ['productionmmyy', 'ProductionMMYY'], width: 0.7, align: 'center' },
  { header: 'Shipment', keys: ['shipment', 'Shipment'], width: 0.6, align: 'center' },
  { header: 'Sty No', keys: ['sty_no', 'Sty_No'], width: 0.5, align: 'center' },
  { header: 'Qty', keys: ['Qty_So', 'qty_so', 'Qty'], width: 0.5, align: 'center', isBold: true }, 
  { header: 'QR Link', keys: ['qr_text'], width: 1.8, align: 'left' },
  { header: 'Check', keys: [], width: 0.4, align: 'center', isCheck: true }
];

// --- 3. COLUMNAS PARA RIPLEY HANG TAG (UR7HT9F005) ---
const RIPLEY_HT_UR7HT9F005_COLUMNS: ColumnConfig[] = [
  { header: 'Sort', keys: ['sorting_ID', 'Sorting'], width: 0.5, align: 'center' },
  { header: 'Un Key', keys: ['Un_Key', 'un_key'], width: 0.7, align: 'center' },
  { header: 'Art Desc 1', keys: ['artdesc1', 'ArtDesc1'], width: 1.2, align: 'left' },
  { header: 'Art Desc 2', keys: ['artdesc2', 'ArtDesc2'], width: 1.2, align: 'left' },
  { header: 'Dept', keys: ['codedept', 'CodeDept'], width: 0.5, align: 'center' },
  { header: 'Name Dept', keys: ['namedept', 'NameDept'], width: 0.9, align: 'left' },
  { header: 'Season', keys: ['season', 'Season'], width: 0.6, align: 'center' },
  { header: 'Ret Price', keys: ['retprice', 'RetPrice'], width: 0.7, align: 'center' },
  { header: 'Sale Price', keys: ['salprice', 'SalPrice'], width: 0.7, align: 'center' },
  { header: 'Barcode', keys: ['rf$barcode', 'barcode', 'ean', 'EAN'], width: 1.0, align: 'center' },
  { header: 'Prod MMYY', keys: ['productionmmyy', 'ProductionMMYY'], width: 0.7, align: 'center' },
  { header: 'Shipment', keys: ['shipment', 'Shipment'], width: 0.6, align: 'center' },
  { header: 'Sty No', keys: ['sty_no', 'Sty_No'], width: 0.5, align: 'center' },
  { header: 'Qty', keys: ['Qty_So', 'qty_so', 'Qty'], width: 0.5, align: 'center', isBold: true }, 
  { header: 'QR Link', keys: ['qr_text'], width: 1.8, align: 'left' },
  { header: 'Check', keys: [], width: 0.4, align: 'center', isCheck: true }
];

// --- 4. COLUMNAS PARA RIPLEY HANG TAG W/ PRICE STICKER (UR7HT9F009) ---
const RIPLEY_HT_UR7HT9F009_COLUMNS: ColumnConfig[] = [
  { header: 'Sort', keys: ['sorting_ID', 'Sorting'], width: 0.5, align: 'center' },
  { header: 'Un Key', keys: ['Un_Key', 'un_key'], width: 0.7, align: 'center' },
  { header: 'Art Desc 1', keys: ['artdesc1', 'ArtDesc1'], width: 1.2, align: 'left' },
  { header: 'Art Desc 2', keys: ['artdesc2', 'ArtDesc2'], width: 1.2, align: 'left' },
  { header: 'Dept', keys: ['codedept', 'CodeDept'], width: 0.5, align: 'center' },
  { header: 'Name Dept', keys: ['namedept', 'NameDept'], width: 0.9, align: 'left' },
  { header: 'Season', keys: ['season', 'Season'], width: 0.6, align: 'center' },
  { header: 'Ret Price', keys: ['retprice', 'RetPrice'], width: 0.7, align: 'center' },
  { header: 'Sale Price', keys: ['salprice', 'SalPrice'], width: 0.7, align: 'center' },
  { header: 'Barcode', keys: ['rf$barcode', 'barcode', 'ean', 'EAN'], width: 1.0, align: 'center' },
  { header: 'Prod MMYY', keys: ['productionmmyy', 'ProductionMMYY'], width: 0.7, align: 'center' },
  { header: 'Shipment', keys: ['shipment', 'Shipment'], width: 0.6, align: 'center' },
  { header: 'Sty No', keys: ['sty_no', 'Sty_No'], width: 0.5, align: 'center' },
  { header: 'Qty', keys: ['Qty_So', 'qty_so', 'Qty'], width: 0.5, align: 'center', isBold: true }, 
  { header: 'QR Link', keys: ['qr_text'], width: 1.8, align: 'left' },
  { header: 'Check', keys: [], width: 0.4, align: 'center', isCheck: true }
];

// --- DICCIONARIO DE CONFIGURACIONES ---
export const RIPLEY_CONFIGS: Record<string, ProductConfig> = {
  'ripley_rfid': {
    id: 'ripley_rfid',
    name: 'RIPLEY RFID STICKER - UR7HT9V004',
    sampleImageName: 'RipleyRFIDsticker_PR_UR7HT9V004.jpg', 
    logoImageName: 'logosml.jpg',
    headerRow: 0,
    columns: RIPLEY_HOME_COLUMNS
  },
  'ripley_ht_ur7ht9f00d': {
    id: 'ripley_ht_ur7ht9f00d',
    name: 'RIPLEY HANG TAG - UR7HT9F00D',
    sampleImageName: 'UR7HT9F00D.jpg', 
    logoImageName: 'logosml.jpg',
    headerRow: 0,
    columns: RIPLEY_HT_UR7HT9F00D_COLUMNS
  },
  'ripley_ht_ur7ht9f005': {
    id: 'ripley_ht_ur7ht9f005',
    name: 'RIPLEY HANG TAG - UR7HT9F005',
    sampleImageName: 'UR7HT9F005.jpg', 
    logoImageName: 'logosml.jpg',
    headerRow: 0,
    columns: RIPLEY_HT_UR7HT9F005_COLUMNS
  },
  // ---> NUEVO ITEM AGREGADO AQUÍ (w/ Price Sticker) <---
  'ripley_ht_ur7ht9f009': {
    id: 'ripley_ht_ur7ht9f009',
    name: 'RIPLEY HANG TAG - UR7HT9F009',
    sampleImageName: 'UR7HT9F009.jpg', 
    logoImageName: 'logosml.jpg',
    headerRow: 0,
    columns: RIPLEY_HT_UR7HT9F009_COLUMNS
  }
};