// src/app/OF/TY/config.ts

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
  defaultClientName?: string;
  headerRow: number; 
  columns: ColumnConfig[];
}

// --- 1. COLUMNAS TY RFID ---
const TY_RFID_COLUMNS: ColumnConfig[] = [
  { header: 'Sorting', keys: ['sorting_ID', 'Sorting', 'sorting'], width: 0.6, align: 'center' },
  { header: 'Un Key', keys: ['Un_Key', 'un_key'], width: 0.8, align: 'center' },
  { header: 'Lot', keys: ['lot', 'Lot', 'Lot_No'], width: 0.6, align: 'center' },
  { header: 'Fabric', keys: ['fabric', 'Fabric'], width: 0.8, align: 'center' },
  { header: 'Sty No', keys: ['sty_no', 'Sty_No'], width: 0.8, align: 'center' },
  { header: 'Name', keys: ['name', 'Name', 'Item_Name'], width: 1.8, align: 'left' },
  { header: 'Style', keys: ['style', 'Style', 'Style_No'], width: 0.8, align: 'left' },
  { header: 'Color', keys: ['color', 'Color', 'Color_Desc'], width: 0.8, align: 'left' },
  { header: 'Size', keys: ['size_des', 'Size_Desc', 'Size'], width: 0.7, align: 'center' },
  { header: 'Qty', keys: ['Qty_So', 'qty_so', 'Qty', 'QTY'], width: 0.6, align: 'center', isBold: true },
  { header: 'UPC', keys: ['upc', 'UPC', 'Barcode'], width: 0.9, align: 'center' },
  { header: 'Price', keys: ['price', 'Price'], width: 0.6, align: 'center' },
  { header: 'Div', keys: ['div', 'Div', 'Division'], width: 0.5, align: 'center' },
  { header: 'Check', keys: [], width: 0.5, align: 'center', isCheck: true }
];

// --- 2. COLUMNAS TY PACKING ---
const TY_PACKING_COLUMNS: ColumnConfig[] = [
  { header: 'Sorting', keys: ['sorting_ID', 'Sorting'], width: 0.6, align: 'center' },
  { header: 'Label Name', keys: ['LabelName', 'Label_Name'], width: 1.0, align: 'left' },
  { header: 'Program', keys: ['Program', 'program'], width: 0.7, align: 'center' },
  { header: 'Name', keys: ['name', 'Name', 'Item_Name'], width: 1.6, align: 'left' },
  { header: 'Col #', keys: ['color_num', 'Color_Num'], width: 0.6, align: 'center' },
  { header: 'Fabric', keys: ['fabric', 'Fabric'], width: 0.7, align: 'center' },
  { header: 'Style', keys: ['style', 'Style', 'Style_No'], width: 0.8, align: 'left' },
  { header: 'Color', keys: ['color', 'Color', 'Color_Desc'], width: 0.8, align: 'left' },
  { header: 'Size', keys: ['size_des', 'Size_Desc', 'Size'], width: 0.6, align: 'center' },
  { header: 'Qty', keys: ['Qty_So', 'qty_so', 'Qty', 'QTY'], width: 0.5, align: 'center', isBold: true },
  { header: 'Div', keys: ['div', 'Div', 'Division'], width: 0.5, align: 'center' },
  { header: 'UPC', keys: ['upc', 'UPC', 'Barcode'], width: 0.9, align: 'center' },
  { header: 'Price', keys: ['price', 'Price'], width: 0.6, align: 'center' },
  { header: 'Check', keys: [], width: 0.4, align: 'center', isCheck: true }
];

// --- 3. COLUMNAS TY PRICE STICKERS (CORREGIDO) ---
const TY_PRICE_STICKERS_COLUMNS: ColumnConfig[] = [
  { header: 'Sorting', keys: ['sorting_ID', 'Sorting'], width: 0.6, align: 'center' },
  // Solo UNA columna Prod ID
  { header: 'Prod ID', keys: ['Prod_id', 'prod_id'], width: 1.0, align: 'center' },
  { header: 'Cust No', keys: ['Cust_no', 'cust_no'], width: 0.8, align: 'center' },
  { header: 'Sty No', keys: ['sty_no', 'Sty_No'], width: 0.6, align: 'center' },
  { header: 'Item Code', keys: ['Item_code', 'item_code'], width: 1.0, align: 'center' },
  { header: 'Un Key', keys: ['Un_Key', 'un_key'], width: 1.0, align: 'center' },
  { header: 'Qty', keys: ['Qty_So', 'qty_so', 'Qty'], width: 0.6, align: 'center', isBold: true },
  { header: 'Price', keys: ['price', 'Price'], width: 0.6, align: 'center' },
  { header: 'Check', keys: [], width: 0.5, align: 'center', isCheck: true }
];

export const TY_CONFIGS: Record<string, ProductConfig> = {
  'ty_rfid': {
    id: 'ty_rfid',
    name: '1. TY RFID',
    sampleImageName: 'tyrfid.jpg',
    logoImageName: 'logosml.jpg', 
    headerRow: 0, 
    columns: TY_RFID_COLUMNS
  },
  'ty_packing': {
    id: 'ty_packing',
    name: '2. TY PACKING',
    sampleImageName: 'typacking.jpg',
    logoImageName: 'logosml2.jpg', 
    headerRow: 0, 
    columns: TY_PACKING_COLUMNS
  },
  'ty_price_stickers': { 
    id: 'ty_price_stickers',
    name: '3. TY PRICE STICKERS',
    sampleImageName: 'typricesticker.jpg',
    logoImageName: 'logosml2.jpg', 
    defaultClientName: 'SML (USA) Inc.', 
    headerRow: 0,
    columns: TY_PRICE_STICKERS_COLUMNS
  }
};