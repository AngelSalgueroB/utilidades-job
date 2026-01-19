// src/app/OF/RIACHUELO/config.ts

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
  logoImageName: string;
  headerRow: number; 
  columns: ColumnConfig[];
}

const RIACHUELO_COLUMNS: ColumnConfig[] = [
  { header: 'Color', keys: ['color_code'], width: 0.6, align: 'center' },
  { header: '#', keys: ['num'], width: 0.4, align: 'center' },
  { header: 'Artigo', keys: ['artigo'], width: 0.8, align: 'center' },
  // Ajustado: Descripcion suele ser corto (FB), Tipo es largo (CAMISETA)
  { header: 'Descripcion', keys: ['description'], width: 0.7, align: 'center' }, 
  { header: 'Fecha', keys: ['date'], width: 0.6, align: 'center' },
  
  // AUMENTADO para que entre "CAMISETA"
  { header: 'Tipo', keys: ['type'], width: 1.3, align: 'left' }, 
  
  { header: 'Style', keys: ['style'], width: 0.8, align: 'left' },
  { header: 'Ref', keys: ['ref'], width: 0.6, align: 'center' },
  
  // NO ABREVIADO y más ancho
  { header: 'SEASON YEAR', keys: ['season_year'], width: 0.9, align: 'center' },
  
  // AUMENTADO
  { header: 'Season', keys: ['season'], width: 1.0, align: 'center' },
  
  { header: 'Talla', keys: ['size'], width: 0.5, align: 'center', isBold: true },
  
  // CALCULADOS
  { header: 'Qty', keys: ['total_qty'], width: 0.5, align: 'center', isBold: true },
  { header: 'Precio', keys: ['price'], width: 0.6, align: 'center' },
  { header: 'Start Barcode', keys: ['start_barcode'], width: 1.1, align: 'center' },
  { header: 'End Barcode', keys: ['end_barcode'], width: 1.1, align: 'center' },
  
  // VACÍO MANUAL
  { header: 'Peso (gr)', keys: [], width: 0.6, align: 'center' } 
];

export const RIACHUELO_CONFIG: ProductConfig = {
  id: 'riachuelo_standard',
  name: 'RIACHUELO - Generación',
  sampleImageName: 'riachuelo.jpg',
  logoImageName: 'logosml2.jpg',
  headerRow: 0,
  columns: RIACHUELO_COLUMNS
};