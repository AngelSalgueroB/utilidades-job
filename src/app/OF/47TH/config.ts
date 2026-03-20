export interface ColumnConfig {
  header: string;
  keys: string[];
  width: number;
  align?: 'left' | 'center' | 'right';
  isBold?: boolean;
  isOptional?: boolean;
  isCheck?: boolean;
  isGroupTotal?: boolean;
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

// --- 1. COLUMNAS PARA 47TH ---
// Orden exacto solicitado en la captura
const TH47_COLUMNS: ColumnConfig[] = [
  { header: 'Sorting', keys: ['sorting_ID', 'Sorting'], width: 0.8, align: 'center' },
  { header: 'Un Key', keys: ['Un_Key', 'un_key'], width: 1.1, align: 'center' },
  { header: 'Sty No', keys: ['sty_no', 'Sty_no'], width: 0.6, align: 'center' },
  { header: 'Style Desc', keys: ['style_des', 'Style_Desc', 'style_desc'], width: 1.2, align: 'center' },
  { header: 'Graphic', keys: ['graphic_no', 'Graphic'], width: 0.8, align: 'center' },
  { header: 'Group', keys: ['group', 'Group'], width: 1.8, align: 'left' },
  { header: 'SKU', keys: ['sku_no', 'SKU'], width: 0.8, align: 'center' },
  { header: 'PO', keys: ['po', 'PO', 'PO_Number'], width: 0.8, align: 'center' },
  { header: 'Color', keys: ['color_des', 'Color'], width: 1.0, align: 'center' },
  { header: 'Item Desc', keys: ['item_des', 'Item_Desc'], width: 1.5, align: 'left' },
  { header: 'UPC', keys: ['upc', 'UPC', 'Barcode'], width: 1.2, align: 'center' },
  { header: 'Qty', keys: ['Qty_So', 'Qty', 'qty'], width: 0.6, align: 'center', isBold: true },
  { header: 'Size', keys: ['size_des', 'Size_Des', 'Size'], width: 0.6, align: 'center', isBold: true },
  { header: 'Price', keys: ['price', 'Price'], width: 0.7, align: 'center' },
  { header: 'Check', keys: [], width: 0.8, align: 'center', isGroupTotal: true, isBold: true } // Muestra el subtotal
];

// --- DICCIONARIO DE CONFIGURACIONES 47TH ---
export const TH47_CONFIGS: Record<string, ProductConfig> = {
  '47th_apparel': { // <-- ID cambiado a 47th
    id: '47th_apparel',
    name: '47TH Apparel Label',
    sampleImageName: '47th.jpg', 
    logoImageName: 'logosml.jpg',
    headerRow: 0,
    columns: TH47_COLUMNS
  }
};