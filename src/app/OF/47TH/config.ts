// src/app/OF/47TH/config.ts

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

// --- COLUMNAS PARA 47TH RFID ---
const F47_RFID_COLUMNS: ColumnConfig[] = [
  { header: 'Sorting', keys: ['sorting_ID', 'Sorting'], width: 0.6, align: 'center' },
  { header: 'Un Key', keys: ['Un_Key', 'un_key'], width: 0.8, align: 'center' },
  { header: 'Sty No', keys: ['sty_no', 'Sty_No'], width: 0.8, align: 'center' },
  { header: 'Style Desc', keys: ['style_des', 'Style_Des', 'style_desc'], width: 1.5, align: 'center' },
  { header: 'Graphic', keys: ['graphic_no', 'Graphic_No'], width: 0.8, align: 'center' },
  { header: 'Group', keys: ['group', 'Group'], width: 2.1, align: 'center' },
  { header: 'SKU', keys: ['sku_no', 'Sku_No'], width: 0.8, align: 'center' },
  { header: 'PO', keys: ['po', 'PO'], width: 0.8, align: 'center' },
  { header: 'Color', keys: ['color_des', 'Color_Des', 'color'], width: 1.5, align: 'center' },
  { header: 'Item Desc', keys: ['item_des', 'Item_Des', 'item_desc'], width: 1.5, align: 'center' },
  { header: 'UPC', keys: ['upc', 'UPC', 'Barcode'], width: 1.0, align: 'center' },
  { header: 'Qty', keys: ['Qty_So', 'qty_so', 'Qty'], width: 0.6, align: 'center', isBold: true },
  { header: 'Size', keys: ['size_des', 'Size_Des', 'Size'], width: 0.6, align: 'center' },
  { header: 'Price', keys: ['price', 'Price'], width: 0.7, align: 'center' },
  { header: 'Check', keys: [], width: 0.5, align: 'center', isCheck: true }
];

export const F47_CONFIGS: Record<string, ProductConfig> = {
  '47th_rfid': {
    id: '47th_rfid',
    name: '47TH RFID',
    sampleImageName: '47th.jpg',
    logoImageName: 'logosml.jpg',
    headerRow: 0,
    columns: F47_RFID_COLUMNS
  }
};