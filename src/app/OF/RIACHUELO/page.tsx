"use client";

import { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { Loader2, ArrowLeft, UploadCloud, CheckCircle2, FileDown, Eye, Package, FileText, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { pdf, Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { RIACHUELO_CONFIG, ProductConfig } from './config';

type RawRow = { [key: string]: any };

type GroupedRow = {
  color_code: string;
  num: string;
  artigo: string;
  description: string;
  date: string;
  type: string;
  style: string;
  ref: string;
  season_year: string;
  season: string;
  size: string;
  price: string;
  total_qty: number;
  start_barcode: string;
  end_barcode: string;
  dco: string; 
};

type ManualInputData = {
  so: string;
  mo: string;
  item: string;
  client: string;
};

const getValue = (row: any, keys: string[]): any => {
  if (!row) return '';
  for (const k of keys) {
    if (row[k] !== undefined && row[k] !== null && String(row[k]).trim() !== '') {
      return row[k];
    }
  }
  return '';
};

// ==================== ESTILOS PDF ====================
const styles = StyleSheet.create({
  page: { padding: 20, fontFamily: 'Helvetica', fontSize: 7.0, color: '#334155', backgroundColor: '#ffffff' },
  
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5, borderBottomWidth: 1, borderBottomColor: '#cbd5e1', paddingBottom: 5, height: 30 },
  logoImage: { height: 24, width: 'auto', objectFit: 'contain' },
  dateText: { fontSize: 8, color: '#94a3b8' },

  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 },
  clientTitle: { fontSize: 18, fontWeight: 'bold', color: '#0f172a', textTransform: 'uppercase' },
  printShopText: { fontSize: 7, fontWeight: 'bold', color: '#64748b', marginTop: 2 },

  opRow: { marginBottom: 10, padding: 4, backgroundColor: '#fef2f2', borderLeftWidth: 3, borderLeftColor: '#ef4444', borderRadius: 2 },
  opLabel: { fontSize: 7, color: '#ef4444', fontWeight: 'bold' },
  opValue: { fontSize: 11, color: '#dc2626', fontWeight: 'black' },

  // Info Grid mejorado para soportar más items
  infoGrid: { flexDirection: 'row', gap: 4, marginBottom: 10, flexWrap: 'wrap' }, // Añadido wrap por si acaso
  infoCard: { flex: 1, padding: 4, backgroundColor: '#f8fafc', borderRadius: 4, borderWidth: 1, borderColor: '#cbd5e1', minWidth: 60 },
  infoLabel: { fontSize: 5.5, color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 2 },
  infoValue: { fontSize: 8, color: '#0f172a', fontWeight: 'bold' },

  middleSection: { flexDirection: 'row', gap: 10, marginBottom: 15, height: 110 },
  summaryContainer: { flex: 1.2, borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 4, overflow: 'hidden' },
  summaryHeader: { flexDirection: 'row', backgroundColor: '#e2e8f0', padding: 4 },
  summaryText: { fontSize: 8, fontWeight: 'bold', color: '#334155', flex: 1, textAlign: 'center' },
  
  totalBigBox: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  totalBigLabel: { fontSize: 10, color: '#64748b', marginBottom: 2 },
  totalBigValue: { fontSize: 18, fontWeight: 'black', color: '#000000' },

  imageWrapper: { flex: 0.8, borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 4, justifyContent: 'center', alignItems: 'center', padding: 5, backgroundColor: '#ffffff' },
  sampleImage: { width: '100%', height: '100%', objectFit: 'contain' },

  tableContainer: { borderTopWidth: 1, borderLeftWidth: 1, borderRightWidth: 1, borderBottomWidth: 1, borderColor: '#64748b', borderRadius: 4, overflow: 'hidden' },
  tableHeader: { flexDirection: 'row', backgroundColor: '#1e293b', paddingVertical: 4 },
  th: { fontSize: 6, fontWeight: 'bold', color: '#ffffff', textAlign: 'center', borderRightWidth: 1, borderRightColor: '#475569' },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#e2e8f0', height: 12, alignItems: 'center' },
  td: { fontSize: 6.5, textAlign: 'center', paddingHorizontal: 1, color: '#334155', borderRightWidth: 1, borderRightColor: '#e2e8f0' },
});

// ==================== COMPONENTE PDF ====================
const RiachueloPDF = ({ 
  data, manualData, derivedOp, imgBase64, logoBase64, config 
}: { 
  data: GroupedRow[]; manualData: ManualInputData; derivedOp: string; imgBase64: string | null; logoBase64: string | null; config: ProductConfig;
}) => {
  
  const activeColumns = config.columns; 
  const first = data[0];
  const season = first?.season || 'N/A';
  const granTotal = data.reduce((sum, item) => sum + item.total_qty, 0);

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View style={styles.topBar}>
          <View>{logoBase64 ? <Image style={styles.logoImage} src={logoBase64} /> : <Text>SML</Text>}</View>
          <View><Text style={styles.dateText}>Fecha: {new Date().toLocaleDateString()}</Text></View>
        </View>

        <View style={styles.headerRow}>
            <View><Text style={styles.clientTitle}>{manualData.client || 'CLIENTE'}</Text></View>
            <View><Text style={styles.printShopText}>PRINT SHOP SML PE</Text></View>
        </View>

        <View style={styles.opRow}>
            <Text style={styles.opLabel}>OP (Archivo)</Text>
            <Text style={styles.opValue}>{derivedOp}</Text>
        </View>

        {/* INFO GRID INTEGRADO (Orden Solicitado) */}
        <View style={styles.infoGrid}>
          {/* 1. SO */}
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>SO #</Text>
            <Text style={styles.infoValue}>{manualData.so}</Text>
          </View>
          
          {/* 2. MO */}
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>MO #</Text>
            <Text style={styles.infoValue}>{manualData.mo}</Text>
          </View>

          {/* 3. PC# (Dato Fijo) */}
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>PC#</Text>
            <Text style={styles.infoValue}>BZRCTNF001</Text>
          </View>

          {/* 4. Call Out# (Dato Fijo) */}
          <View style={{ ...styles.infoCard, flex: 1.5 }}> {/* Un poco más ancho */}
            <Text style={styles.infoLabel}>Call Out#</Text>
            <Text style={styles.infoValue}>RIACHUELO FSC PRICE TICKET</Text>
          </View>

          {/* 5. ITEM */}
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>ITEM #</Text>
            <Text style={styles.infoValue}>{manualData.item}</Text>
          </View>

          {/* 6. SEASON */}
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>SEASON</Text>
            <Text style={styles.infoValue}>{season}</Text>
          </View>
        </View>

        <View style={styles.middleSection}>
           <View style={styles.summaryContainer}>
              <View style={styles.summaryHeader}><Text style={styles.summaryText}>RESUMEN DE ORDEN</Text></View>
              <View style={styles.totalBigBox}>
                  <Text style={styles.totalBigLabel}>TOTAL UNIDADES</Text>
                  <Text style={styles.totalBigValue}>{granTotal}</Text>
              </View>
           </View>
           <View style={styles.imageWrapper}>
              {imgBase64 ? <Image style={styles.sampleImage} src={imgBase64} /> : <Text style={{fontSize: 8, color:'#94a3b8'}}>{config.sampleImageName}</Text>}
           </View>
        </View>

        <View style={styles.tableContainer}>
          <View style={styles.tableHeader}>
            {activeColumns.map((col, i) => (
              <Text key={i} style={{ ...styles.th, flex: col.width }}>{col.header}</Text>
            ))}
          </View>
          {data.map((row, idx) => (
            <View key={idx} style={{ ...styles.tableRow, backgroundColor: idx % 2 === 0 ? 'white' : '#f8fafc' }}>
              {activeColumns.map((col, i) => {
                let val = '';
                if (col.keys.length > 0) {
                    // @ts-ignore
                    val = row[col.keys[0]]; 
                }
                return (
                  <Text key={i} style={{ ...styles.td, flex: col.width, fontWeight: col.isBold ? 'bold' : 'normal' }}>{String(val || '')}</Text>
                );
              })}
            </View>
          ))}
        </View>
      </Page>
    </Document>
  );
};

// ==================== PAGE LOGIC ====================
export default function RiachueloPage() {
  const currentConfig = RIACHUELO_CONFIG;

  const [files, setFiles] = useState<File[]>([]); 
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPdfGenerating, setIsPdfGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [groupedData, setGroupedData] = useState<GroupedRow[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  
  const [imgBase64, setImgBase64] = useState<string | null>(null);
  const [imgStatus, setImgStatus] = useState<string>('cargando');
  const [logoBase64, setLogoBase64] = useState<string | null>(null);

  const [derivedOp, setDerivedOp] = useState<string>('');
  
  // ESTADO INICIAL CON CLIENTE PRE-LLENADO
  const [manualData, setManualData] = useState<ManualInputData>({
    so: '',
    mo: '',
    item: 'BZRCRMTNF001-01',
    client: 'TEXTILES CAMONES S.A.' // VALOR POR DEFECTO
  });

  useEffect(() => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    fetch(`${origin}/images/${currentConfig.logoImageName}`).then(r => r.ok ? r.blob() : null).then(b => { if(b) { const r = new FileReader(); r.onloadend = () => setLogoBase64(r.result as string); r.readAsDataURL(b); }});
    fetch(`${origin}/images/${currentConfig.sampleImageName}`).then(r => r.ok ? r.blob() : Promise.reject()).then(b => { if(b.type.includes('image')) { const r = new FileReader(); r.onloadend = () => { setImgBase64(r.result as string); setImgStatus('ok'); }; r.readAsDataURL(b); } else setImgStatus('error'); }).catch(() => setImgStatus('404'));
  }, []);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const selectedFiles = Array.from(event.target.files);
      setFiles(selectedFiles);
      if (selectedFiles.length > 0) {
          const rawName = selectedFiles[0].name;
          const cleanName = rawName.replace(/(-|_)?data\.(xlsx|xls)$/i, '').replace(/\.(xlsx|xls)$/i, '');
          setDerivedOp(cleanName);
      }
      setGroupedData([]); setShowPreview(false); setError(null);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setGroupedData([]); setShowPreview(false);
    if (files.length <= 1) setDerivedOp(''); 
  };

  const processFiles = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);
    let allRawRows: RawRow[] = [];
    try {
      for (const file of files) {
        const data = await file.arrayBuffer();
        const wb = XLSX.read(data);
        const sheet = wb.Sheets[wb.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json<RawRow>(sheet, { defval: '' });
        allRawRows = allRawRows.concat(json);
      }
      const groups: Record<string, { rows: RawRow[], barcodes: string[] }> = {};
      allRawRows.forEach(row => {
        const size = getValue(row, ['TALLA', 'Talla', 'Size']);
        const artigo = getValue(row, ['ARTIGO', 'Artigo']);
        const color = getValue(row, ['COLORCODE', 'CODECOLOR', 'ColorCode']);
        if (!size) return;
        const key = `${artigo}_${color}_${size}`;
        if (!groups[key]) groups[key] = { rows: [], barcodes: [] };
        groups[key].rows.push(row);
        const bc = getValue(row, ['BARCODE(no llenar)', 'BARCODE', 'Barcode']);
        if (bc) groups[key].barcodes.push(String(bc).trim());
      });
      const consolidated: GroupedRow[] = Object.values(groups).map(group => {
         const representative = group.rows[0];
         const totalQty = group.rows.length;
         const sortedBarcodes = group.barcodes.sort();
         const startBc = sortedBarcodes.length > 0 ? sortedBarcodes[0] : '';
         const endBc = sortedBarcodes.length > 0 ? sortedBarcodes[sortedBarcodes.length - 1] : '';
         return {
             color_code: getValue(representative, ['COLORCODE', 'CODECOLOR']),
             num: getValue(representative, ['#', 'NUM']),
             artigo: getValue(representative, ['ARTIGO']),
             description: getValue(representative, ['DESCRIPCION']),
             date: getValue(representative, ['FECHA']),
             type: getValue(representative, ['TIPO']),
             style: getValue(representative, ['STYLE']),
             ref: getValue(representative, ['REFERENCIA']),
             season_year: getValue(representative, ['SEASON YEAR']),
             season: getValue(representative, ['SEASON']),
             size: getValue(representative, ['TALLA']),
             price: getValue(representative, ['PRECIO']),
             dco: getValue(representative, ['DCO', 'PO']),
             total_qty: totalQty,
             start_barcode: startBc,
             end_barcode: endBc
         };
      });

      // === LÓGICA DE ORDENAMIENTO DE TALLAS ===
      const sizeOrder = ['PP', 'P', 'M', 'G', 'GG'];
      
      consolidated.sort((a, b) => {
          const indexA = sizeOrder.indexOf(a.size.toUpperCase());
          const indexB = sizeOrder.indexOf(b.size.toUpperCase());
          
          // Si ambos están en la lista, ordenar por índice
          if (indexA !== -1 && indexB !== -1) return indexA - indexB;
          // Si solo A está en la lista, A va antes
          if (indexA !== -1) return -1;
          // Si solo B está en la lista, B va antes
          if (indexB !== -1) return 1;
          
          // Si ninguno está, alfabético
          return a.size.localeCompare(b.size);
      });

      setGroupedData(consolidated);
      setShowPreview(true);
    } catch (e: any) { setError(e.message); } finally { setIsProcessing(false); }
  };

  const handleDownload = async () => {
    setIsPdfGenerating(true);
    try {
        const blob = await pdf(<RiachueloPDF data={groupedData} manualData={manualData} derivedOp={derivedOp} imgBase64={imgBase64} logoBase64={logoBase64} config={currentConfig} />).toBlob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a'); link.href = url; link.download = `RIACHUELO_${Date.now()}.pdf`;
        document.body.appendChild(link); link.click(); document.body.removeChild(link);
    } catch (e) { console.error(e); } finally { setIsPdfGenerating(false); }
  };

  return (
    <main className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <Button variant="ghost" asChild className="text-pink-700 hover:bg-pink-50"><a href="/OF"><ArrowLeft className="mr-2 h-4 w-4" /> Volver al Menú</a></Button>
        <h1 className="text-3xl font-bold text-pink-700 flex items-center gap-3"><Package className="h-8 w-8" /> Generador RIACHUELO</h1>
      </div>
      <div className="grid gap-6">
        <Card className="border-l-4 border-l-blue-500 shadow-md">
            <CardHeader className="pb-3"><CardTitle className="text-lg flex gap-2"><UploadCloud className="h-5 w-5 text-blue-600"/> Cargar Excel</CardTitle></CardHeader>
            <CardContent>
                <div className="flex items-center gap-4 mb-4">
                    <Button asChild variant="secondary" size="lg" className="bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200"><label className="cursor-pointer"><UploadCloud className="mr-2 h-5 w-5"/> Seleccionar Archivos<Input type="file" multiple className="hidden" accept=".xlsx,.xls,.csv" onChange={handleFileUpload} /></label></Button>
                    <div className="text-sm text-slate-500">{imgStatus === 'ok' ? <span className="text-green-600 flex items-center font-medium"><CheckCircle2 className="h-4 w-4 mr-1"/> Imagen lista.</span> : <span className="text-amber-500 flex items-center"><Loader2 className="h-4 w-4 mr-1 animate-spin"/> Buscando imagen...</span>}</div>
                </div>
                {files.length > 0 && <div className="border rounded-md divide-y">{files.map((f, i) => (<div key={i} className="flex justify-between items-center p-3 text-sm hover:bg-slate-50"><span className="flex items-center gap-2 text-slate-700"><FileText className="h-4 w-4 text-blue-400"/> {f.name}</span><Button variant="ghost" size="sm" onClick={() => removeFile(i)} className="text-red-500 hover:text-red-700 h-8 w-8 p-0"><Trash2 className="h-4 w-4"/></Button></div>))}</div>}
                {derivedOp && (<div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md"><Label className="text-xs font-bold text-red-500">OP DETECTADA (Nombre de Archivo):</Label><p className="text-lg font-black text-red-700">{derivedOp}</p></div>)}
                {files.length > 0 && <div className="mt-4 flex justify-end"><Button onClick={processFiles} disabled={isProcessing} className="bg-blue-600 hover:bg-blue-700">{isProcessing ? <><Loader2 className="animate-spin mr-2"/> Procesando...</> : <><Eye className="mr-2"/> Procesar Datos</>}</Button></div>}
            </CardContent>
        </Card>
        {showPreview && groupedData.length > 0 && (
            <Card className="border-l-4 border-l-pink-500 bg-pink-50 shadow-md">
                <CardHeader><CardTitle className="text-pink-800 flex gap-2"><CheckCircle2/> Consolidación Exitosa</CardTitle><CardDescription className="text-pink-700">Se agruparon {groupedData.length} tallas/SKUs. Ingresa los datos finales:</CardDescription></CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="space-y-1"><Label htmlFor="clientInput" className="text-xs font-bold text-slate-500">CLIENTE</Label><Input id="clientInput" value={manualData.client} onChange={(e) => setManualData({...manualData, client: e.target.value})} className="border-slate-300 bg-white"/></div>
                        <div className="space-y-1"><Label htmlFor="soInput" className="text-xs font-bold text-slate-500">SO #</Label><Input id="soInput" placeholder="Ej: 7600D005641" value={manualData.so} onChange={(e) => setManualData({...manualData, so: e.target.value})} className="border-slate-300 bg-white"/></div>
                        <div className="space-y-1"><Label htmlFor="moInput" className="text-xs font-bold text-slate-500">MO #</Label><Input id="moInput" placeholder="Ej: 7605D009041" value={manualData.mo} onChange={(e) => setManualData({...manualData, mo: e.target.value})} className="border-slate-300 bg-white"/></div>
                        <div className="space-y-1"><Label htmlFor="itemInput" className="text-xs font-bold text-slate-500">ITEM #</Label><Input id="itemInput" value={manualData.item} onChange={(e) => setManualData({...manualData, item: e.target.value})} className="border-slate-300 bg-white"/></div>
                    </div>
                </CardContent>
                <CardFooter><Button size="lg" className="w-full bg-pink-600 hover:bg-pink-700 shadow-lg text-lg h-12" onClick={handleDownload} disabled={isPdfGenerating}>{isPdfGenerating ? <><Loader2 className="animate-spin mr-2"/> Generando...</> : <><FileDown className="mr-2 h-6 w-6"/> Descargar PDF</>}</Button></CardFooter>
            </Card>
        )}
      </div>
    </main>
  );
}