//src\app\OF\TB\page.tsx
"use client";

import { useState, useMemo, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { Loader2, ArrowLeft, FolderSearch, List, CheckCircle2, FileDown, Eye, Package, Settings, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { pdf, Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { TB_CONFIG, ProductConfig } from './config';

type ExcelRow = { [key: string]: any };

interface FileWithPath extends File {
  webkitRelativePath: string;
}

const getValue = (row: any, keys: string[]): any => {
  if (keys.length === 0) return '';
  for (const k of keys) {
    if (row[k] !== undefined && row[k] !== null && String(row[k]).trim() !== '') {
      return row[k];
    }
  }
  return '';
};

const parseQty = (val: any): number => {
  if (typeof val === 'number') return val;
  if (!val) return 0;
  return parseFloat(String(val).replace(/,/g, ''));
};

// ==================== ESTILOS PDF ====================
const styles = StyleSheet.create({
  page: { padding: 15, fontFamily: 'Helvetica', fontSize: 9, color: '#334155', backgroundColor: '#ffffff' },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4, borderBottomWidth: 1, borderBottomColor: '#64748b', borderBottomStyle: 'solid', paddingBottom: 2, height: 28 },
  logoGroup: { flexDirection: 'row', alignItems: 'center' },
  logoImage: { height: 24, width: 'auto', objectFit: 'contain' },
  dateText: { fontSize: 7, color: '#94a3b8', fontWeight: 'normal' },
  headerSection: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8, alignItems: 'flex-start' },
  clientContainer: { flex: 1 },
  customerTitle: { fontSize: 16, fontWeight: 'bold', color: '#0f172a', marginBottom: 1 },
  custNo: { fontSize: 9, color: '#64748b', fontWeight: 'bold' },
  docBadge: { backgroundColor: '#f1f5f9', paddingVertical: 4, paddingHorizontal: 8, borderRadius: 4, borderWidth: 1, borderColor: '#94a3b8', borderStyle: 'solid' },
  docBadgeText: { fontSize: 10, fontWeight: 'bold', color: '#334155', letterSpacing: 1 },
  infoGrid: { flexDirection: 'row', gap: 6, marginBottom: 8 },
  infoCard: { flex: 1, padding: 4, backgroundColor: '#f8fafc', borderRadius: 4, borderWidth: 1, borderColor: '#94a3b8', borderStyle: 'solid' },
  infoLabel: { fontSize: 6, color: '#475569', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 2 },
  infoValue: { fontSize: 9.5, fontWeight: 'bold', color: '#0f172a', lineHeight: 1 },
  rmText: { color: '#a0522d', fontWeight: 'bold' },
  poValue: { fontSize: 10.5, fontWeight: 'bold', color: '#ef4444' },
  middleSection: { flexDirection: 'row', gap: 8, marginBottom: 8, height: 115 },
  moContainer: { flex: 1, borderWidth: 1, borderColor: '#64748b', borderStyle: 'solid', borderRadius: 4, overflow: 'hidden' },
  moHeader: { flexDirection: 'row', backgroundColor: '#cbd5e1', paddingVertical: 3, paddingHorizontal: 3, borderBottomWidth: 1, borderBottomColor: '#64748b', borderBottomStyle: 'solid' },
  moHeaderText: { fontSize: 7, fontWeight: 'bold', color: '#1e293b' },
  moRow: { flexDirection: 'row', paddingVertical: 2, paddingHorizontal: 3, borderBottomWidth: 1, borderBottomColor: '#cbd5e1', borderBottomStyle: 'solid' },
  moText: { fontSize: 7.5, color: '#334155' },
  totalRow: { flexDirection: 'row', backgroundColor: '#e2e8f0', paddingVertical: 3, paddingHorizontal: 3, borderTopWidth: 1, borderTopColor: '#64748b', borderTopStyle: 'solid', marginTop: 'auto' },
  imageWrapper: { flex: 2, flexDirection: 'row', borderWidth: 1, borderColor: '#64748b', borderStyle: 'solid', borderRadius: 4, backgroundColor: '#ffffff', overflow: 'hidden' },
  imageContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 2 },
  sampleImage: { width: '100%', height: '100%', objectFit: 'contain' },
  placeholderText: { fontSize: 10, color: '#94a3b8', fontWeight: 'bold', textTransform: 'uppercase' },
  sideLabel: { width: 18, backgroundColor: '#cbd5e1', justifyContent: 'center', alignItems: 'center', borderLeftWidth: 1, borderLeftColor: '#64748b', borderLeftStyle: 'solid' },
  sideLabelText: { fontSize: 7, fontWeight: 'bold', color: '#475569', transform: 'rotate(-90deg)', width: 80, textAlign: 'center' },
  tableContainer: { borderTopWidth: 1, borderLeftWidth: 1, borderRightWidth: 1, borderBottomWidth: 1, borderColor: '#64748b', borderStyle: 'solid', borderRadius: 4, overflow: 'hidden' },
  tableHeader: { flexDirection: 'row', backgroundColor: '#1e293b', paddingVertical: 4, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#64748b', borderBottomStyle: 'solid' },
  th: { fontSize: 6.5, fontWeight: 'bold', color: '#ffffff', textAlign: 'center', borderRightWidth: 1, borderRightColor: '#475569', borderRightStyle: 'solid' },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#e2e8f0', borderBottomStyle: 'solid', alignItems: 'center', height: 12.5 },
  td: { fontSize: 6.5, textAlign: 'center', paddingHorizontal: 2, color: '#334155', borderRightWidth: 1, borderRightColor: '#e2e8f0', borderRightStyle: 'solid', overflow: 'hidden' },
});

// ==================== COMPONENTE PDF ====================
const DynamicPDFDocument = ({ data, imgBase64, logoBase64, config }: { data: ExcelRow[]; imgBase64: string | null; logoBase64: string | null; config: ProductConfig }) => {
  const activeColumns = useMemo(() => {
    return config.columns.filter(col => {
      if (!col.isOptional) return true; 
      return data.some(row => {
        const val = getValue(row, col.keys);
        return val !== undefined && val !== null && String(val).trim() !== '';
      });
    });
  }, [config, data]);

  const groupedBySO: Record<string, ExcelRow[]> = {};
  data.forEach((row) => {
    const soNo = getValue(row, ['SO_No', 'so_no']) || 'SIN_SO';
    if (!groupedBySO[soNo]) groupedBySO[soNo] = [];
    groupedBySO[soNo].push(row);
  });

  return (
    <Document>
      {Object.entries(groupedBySO).map(([soKey, rows], index) => {
        rows.sort((a, b) => {
            const colorA = String(getValue(a, ['g_color', 'color']) || '').toLowerCase();
            const colorB = String(getValue(b, ['g_color', 'color']) || '').toLowerCase();
            return colorA.localeCompare(colorB);
        });

        const firstRow = rows[0];
        const customerName = getValue(firstRow, ['Cust_Name', 'cust_name']) || '';
        const custNo = getValue(firstRow, ['Cust_No', 'cust_no']) || 'P10017';
        const itemCode = getValue(firstRow, ['Prod_Code', 'prod_code']) || '';
        const sysCallout = getValue(firstRow, ['SYS_Callout', 'sys_callout']) || 'TB-HT-A1';
        const rmNo = getValue(firstRow, ['RM_No', 'rm_no']) || 'TMTMTRM9V003';
        const epSoNo = getValue(firstRow, ['EP_SO_NO', 'ep_so_no']) || '';
        const poOc = getValue(firstRow, ['Cust_PO_NO', 'cust_po_no']) || '';
        const ordFrom = getValue(firstRow, ['Ord_From', 'ord_from']) || '';

        const moGroups: Record<string, { qty: number; sizes: Set<string> }> = {};
        const rowsByMO: Record<string, ExcelRow[]> = {};
        
        rows.forEach(row => {
            const mo = String(getValue(row, ['MO_No', 'mo_no']) || 'N/A');
            if (!rowsByMO[mo]) rowsByMO[mo] = [];
            rowsByMO[mo].push(row);
        });

        Object.entries(rowsByMO).forEach(([mo, groupRows]) => {
            const sizes = new Set<string>();
            let sumOriginal = 0;
            let hasOriginal = false;
            groupRows.forEach(row => {
                const size = String(getValue(row, ['Size', 'size', 'us_size']) || '');
                if (size) sizes.add(size);
                const valOrig = getValue(row, ['Qty_Original', 'qty_original']);
                if (valOrig !== undefined && valOrig !== null && String(valOrig).trim() !== '') {
                    hasOriginal = true;
                    sumOriginal += parseQty(valOrig);
                }
            });
            let finalQty = hasOriginal ? sumOriginal : parseQty(getValue(groupRows[0], ['Qty_Total', 'qty_total']));
            moGroups[mo] = { qty: finalQty, sizes };
        });
        const totalQty = Object.values(moGroups).reduce((sum, g) => sum + g.qty, 0);

        return (
          <Page key={index} size="A4" orientation="landscape" style={styles.page}>
            <View style={styles.topBar}>
              <View style={styles.logoGroup}>
                {logoBase64 ? <Image style={styles.logoImage} src={logoBase64} /> : <Text style={{ fontWeight: 'bold', color: '#e74c3c' }}>SML RFID</Text>}
              </View>
              <Text style={styles.dateText}>Print: {new Date().toLocaleDateString()} {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
            </View>

            <View style={styles.headerSection}>
              <View style={styles.clientContainer}>
                <Text style={styles.customerTitle}>{customerName}</Text>
                <Text style={styles.custNo}>Cust No: {custNo}</Text>
              </View>
              <View style={styles.docBadge}>
                <Text style={styles.docBadgeText}>PACKING LIST</Text>
              </View>
            </View>

            <View style={styles.infoGrid}>
              <View style={{ ...styles.infoCard, flex: 1 }}>
                <Text style={styles.infoLabel}>Sales Order (SO) / EP SO</Text>
                <Text style={styles.infoValue}>{soKey} / {epSoNo}</Text>
              </View>
              <View style={{ ...styles.infoCard, flex: 1.8 }}>
                <Text style={styles.infoLabel}>Item Code / Callout / RM</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                  <Text style={styles.infoValue}>{itemCode}</Text>
                  <Text style={{ fontSize: 9, color: '#64748b' }}>|</Text>
                  <Text style={{ ...styles.infoValue, color: '#0ea5e9' }}>{sysCallout}</Text>
                  <Text style={{ fontSize: 9, color: '#64748b' }}>|</Text>
                  <Text style={{ ...styles.infoValue, ...styles.rmText }}>{rmNo}</Text>
                </View>
              </View>
              <View style={{ ...styles.infoCard, flex: 0.8, backgroundColor: '#fef2f2', borderColor: '#ef4444' }}>
                <Text style={{ ...styles.infoLabel, color: '#ef4444' }}>Purchase Order</Text>
                <Text style={styles.poValue}>{poOc}</Text>
              </View>
              <View style={{ ...styles.infoCard, flex: 0.5 }}>
                <Text style={styles.infoLabel}>Origin</Text>
                <Text style={styles.infoValue}>{ordFrom}</Text>
                <Text style={{ fontSize: 6, color: '#64748b', marginTop: 3, fontWeight: 'bold' }}>Print-Shop SML PE</Text>
              </View>
            </View>

            <View style={styles.middleSection}>
              <View style={styles.moContainer}>
                <View style={styles.moHeader}>
                  <Text style={{ ...styles.moHeaderText, flex: 2 }}>MO #</Text>
                  <Text style={{ ...styles.moHeaderText, flex: 1.5 }}>Size</Text>
                  <Text style={{ ...styles.moHeaderText, flex: 1, textAlign: 'right' }}>Qty</Text>
                </View>
                {Object.entries(moGroups).map(([mo, data], idx) => (
                  <View key={idx} style={styles.moRow}>
                    <Text style={{ ...styles.moText, flex: 2, fontWeight: 'bold' }} {...{ maxLines: 1 } as any}>{mo.replace('7605-', '...')}</Text>
                    <Text style={{ ...styles.moText, flex: 1.5 }} {...{ maxLines: 1 } as any}>{Array.from(data.sizes).join(',')}</Text>
                    <Text style={{ ...styles.moText, flex: 1, textAlign: 'right' }}>{data.qty}</Text>
                  </View>
                ))}
                <View style={styles.totalRow}>
                  <Text style={{ ...styles.moText, flex: 3.5, fontWeight: 'bold' }}>TOTAL</Text>
                  <Text style={{ ...styles.moText, flex: 1, textAlign: 'right', fontWeight: 'bold' }}>{totalQty}</Text>
                </View>
              </View>

              <View style={styles.imageWrapper}>
                  <View style={styles.imageContainer}>
                      {imgBase64 ? (
                        <Image style={styles.sampleImage} src={imgBase64} />
                      ) : (
                        <View style={{ alignItems: 'center', padding: 5 }}>
                          <Text style={styles.placeholderText}>NO IMAGE</Text>
                          <Text style={{ fontSize: 6, color: '#94a3b8' }}>{config.sampleImageName}</Text>
                        </View>
                      )}
                  </View>
                  <View style={styles.sideLabel}>
                      <Text style={styles.sideLabelText}>SAMPLES</Text>
                  </View>
              </View>
            </View>

            <View style={styles.tableContainer}>
              <View style={styles.tableHeader}>
                {activeColumns.map((col, i) => (
                  <Text key={i} style={{ ...styles.th, flex: col.width, textAlign: col.align || 'center', borderRightWidth: i === activeColumns.length - 1 ? 0 : 1 }}>
                    {col.header}
                  </Text>
                ))}
              </View>

              {rows.map((row, idx) => (
                <View key={idx} style={{ ...styles.tableRow, backgroundColor: idx % 2 === 0 ? 'white' : '#f8fafc' }}>
                  {activeColumns.map((col, i) => {
                    let val = getValue(row, col.keys);
                    if (col.header === 'Qty') val = getValue(row, ['Qty_Original', 'Qty_Total', 'qty']);

                    return (
                      <Text 
                        key={i}
                        style={{ 
                          ...styles.td, 
                          flex: col.width, 
                          textAlign: col.align || 'center',
                          fontWeight: col.isBold ? 'bold' : 'normal',
                          borderRightWidth: i === activeColumns.length - 1 ? 0 : 1
                        }} 
                        {...{ maxLines: 1 } as any}
                      >
                        {String(val)}
                      </Text>
                    );
                  })}
                </View>
              ))}
            </View>
          </Page>
        );
      })}
    </Document>
  );
};

// ==================== MAIN PAGE ====================
export default function TBPage() {
  const currentConfig = TB_CONFIG;// CONFIGURACIÓN FIJA

  const [allFiles, setAllFiles] = useState<FileWithPath[]>([]);
  const [folderListText, setFolderListText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPdfGenerating, setIsPdfGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [consolidatedData, setConsolidatedData] = useState<ExcelRow[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [imgBase64, setImgBase64] = useState<string | null>(null);
  const [imgStatus, setImgStatus] = useState<string>('cargando');
  const [logoBase64, setLogoBase64] = useState<string | null>(null);
  const [activeImageName, setActiveImageName] = useState<string>(currentConfig.sampleImageName);

  useEffect(() => {
    setIsClient(true);
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const loadLogo = async () => {
        try {
            const r = await fetch(`${origin}/images/logosml.jpg`);
            if (r.ok) {
                const b = await r.blob();
                const reader = new FileReader();
                reader.onloadend = () => setLogoBase64(reader.result as string);
                reader.readAsDataURL(b);
            }
        } catch (e) {}
    };
    loadLogo();
  }, []);

  // Carga Imagen Dinámica (reemplaza el useEffect anterior)
  useEffect(() => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    setImgBase64(null); 
    setImgStatus('cargando');
    
    // Usamos la variable de estado dinámica
    fetch(`${origin}/images/${activeImageName}`)
        .then(r => r.ok ? r.blob() : Promise.reject())
        .then(b => {
            if (b.type.includes('image')) {
                const reader = new FileReader();
                reader.onloadend = () => { setImgBase64(reader.result as string); setImgStatus('ok'); };
                reader.readAsDataURL(b);
            } else { setImgStatus('error_type'); }
        })
        .catch(() => setImgStatus('error_404'));
  }, [activeImageName]); // <--- La dependencia ahora es el estado

  const handleFolderUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const files = Array.from(event.target.files) as FileWithPath[];
      const validFiles = files.filter((f) => f.name.match(/\.(xlsx|xls)$/i) && !f.name.startsWith('~$'));
      if (validFiles.length === 0) { setError('No se encontraron archivos Excel.'); return; }
      setAllFiles(validFiles); setConsolidatedData([]); setShowPreview(false); setError(null);
    }
  };

  const filesToProcess = useMemo(() => {
    if (!folderListText.trim()) return [];
    const targetFolders = folderListText.split(/[\n,]+/).map((s) => s.trim()).filter((s) => s.length > 0);
    if (targetFolders.length === 0) return [];
    const orderedFiles: FileWithPath[] = [];
    targetFolders.forEach((folderName) => {
      const matches = allFiles.filter((file) => file.webkitRelativePath.includes(folderName));
      orderedFiles.push(...matches);
    });
    return Array.from(new Set(orderedFiles));
  }, [allFiles, folderListText]);

  const processFiles = async () => {
    if (filesToProcess.length === 0) { setError('No hay archivos coincidentes.'); return; }
    setIsProcessing(true); setError(null);
    let allData: ExcelRow[] = [];
    
    try {
      for (const file of filesToProcess) {
        const fileData = await file.arrayBuffer();
        const workbook = XLSX.read(fileData);
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json<ExcelRow>(sheet, { defval: '' });
        allData = allData.concat(json);
      }

      // === INICIO LÓGICA DE PRECIOS CORREGIDA ===
      // Objetivo: Detectar si hay una segunda columna de precio con datos (Dual Pricing)
      
      let hasSecondPrice = false;

      // Buscamos en las primeras filas (para no iterar todo si es grande) o en todas
      for (const row of allData) {
          // Buscamos valores en las llaves típicas de un segundo precio
          const p2 = getValue(row, ['Price2', 'price2', 'Price 2', 'MSRP', 'RRP', 'Retail_Price']);
          
          // Si encontramos ALGÚN valor en estas columnas que no esté vacío
          if (p2 && String(p2).trim() !== '') {
              hasSecondPrice = true;
              break; // Ya encontramos uno, suficiente para cambiar la imagen
          }
      }

      console.log("¿Tiene segundo precio?:", hasSecondPrice);

      // Si tiene segundo precio -> sample1.jpg
      // Si solo tiene uno -> sample.jpg
      if (hasSecondPrice) {
          setActiveImageName('sample1.jpg');
      } else {
          setActiveImageName('sample.jpg');
      }
      // === FIN LÓGICA DE PRECIOS ===

      setConsolidatedData(allData); 
      setShowPreview(true);

    } catch (err: any) { 
        setError('Error: ' + err.message); 
    } finally { 
        setIsProcessing(false); 
    }
  };

    const handleDownloadPDF = async () => {
    setIsPdfGenerating(true);
    try {
      const blob = await pdf(
        <DynamicPDFDocument data={consolidatedData} imgBase64={imgBase64} logoBase64={logoBase64} config={currentConfig} />
      ).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a'); link.href = url; link.download = `${currentConfig.id}_Report_${Date.now()}.pdf`;
      document.body.appendChild(link); link.click(); document.body.removeChild(link);
    } catch (error) { console.error('Error:', error); setError('Error crítico generando PDF.'); } finally { setIsPdfGenerating(false); }
  };

  return (
    <main className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <Button variant="ghost" asChild className="text-indigo-700 hover:bg-indigo-100"><a href="/OF"><ArrowLeft className="mr-2 h-4 w-4" /> Volver al Menú</a></Button>
        <h1 className="text-3xl font-bold text-indigo-700 flex items-center gap-3"><Package className="h-8 w-8" /> Generador TB RFID</h1>
      </div>

      <div className="grid gap-6">
        <Card className="border-l-4 border-l-blue-500 shadow-lg">
          <CardHeader><CardTitle className="flex items-center gap-2"><Settings className="text-blue-500" /> Configuración Activa</CardTitle><CardDescription>Producto: {currentConfig.name}</CardDescription></CardHeader>
          <CardContent>
            <Button asChild variant="secondary" size="lg"><label className="cursor-pointer"><FolderSearch className="mr-2 h-4 w-4" /> Choose folder <Input type="file" className="hidden" {...({ webkitdirectory: '', directory: '' } as any)} onChange={handleFolderUpload} /></label></Button>
            {allFiles.length > 0 && <span className="ml-4 text-sm font-bold text-green-600">{allFiles.length} Folders found</span>}
            <div className="mt-4 text-xs flex flex-col gap-1"><div className="flex items-center gap-2">{imgStatus === 'ok' && <span className="text-green-600 font-bold flex items-center"><CheckCircle2 className="h-4 w-4 mr-1"/> Preview imagen ready.</span>}{imgStatus !== 'ok' && <span className="text-amber-600 font-bold flex items-center"><Loader2 className="h-4 w-4 mr-1 animate-spin"/> Buscando imagen...</span>}</div></div>
          </CardContent>
        </Card>

        <Card className={`border-l-4 shadow-lg ${filesToProcess.length > 0 ? 'border-l-green-500' : ''}`}>
          <CardHeader><CardTitle className="flex items-center gap-2"><List className="text-green-500" /> Paso 2: Lista de Carpetas</CardTitle></CardHeader>
          <CardContent>
            <Textarea placeholder={`7605D009792\n7605D009793`} className="font-mono h-40" value={folderListText} onChange={(e) => setFolderListText(e.target.value)} />
            <div className="mt-2 flex justify-end"><Button onClick={processFiles} disabled={filesToProcess.length === 0 || isProcessing} className="bg-green-600 hover:bg-green-700">{isProcessing ? <><Loader2 className="animate-spin mr-2" /> Procesando...</> : <><Eye className="mr-2" /> Procesar</>}</Button></div>
            {error && <Alert variant="destructive" className="mt-4"><AlertTitle>Error</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>}
          </CardContent>
        </Card>

        {showPreview && consolidatedData.length > 0 && isClient && (
          <Card className="border-l-4 border-l-indigo-500 bg-indigo-50">
            <CardHeader><CardTitle className="text-indigo-700 flex gap-2"><CheckCircle2 /> Listo para descargar</CardTitle><CardDescription>{consolidatedData.length} registros listos.</CardDescription></CardHeader>
            <CardFooter><Button size="lg" className="w-full bg-indigo-600 hover:bg-indigo-700 h-14" onClick={handleDownloadPDF} disabled={isPdfGenerating}>{isPdfGenerating ? <><Loader2 className="animate-spin mr-2" /> Generando PDF...</> : <><FileDown className="mr-2 h-5 w-5" /> Descargar PDF</>}</Button></CardFooter>
          </Card>
        )}
      </div>
    </main>
  );
}