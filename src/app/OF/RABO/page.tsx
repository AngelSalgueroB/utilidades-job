"use client";

import { useState, useMemo, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { Loader2, ArrowLeft, UploadCloud, CheckCircle2, FileDown, Eye, Package, Settings, FileText, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { pdf, Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { RABO_CONFIGS, ProductConfig } from './config';

type ExcelRow = { [key: string]: any };

// Helper para obtener valores del excel
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
  page: { padding: 20, fontFamily: 'Helvetica', fontSize: 8, color: '#334155', backgroundColor: '#ffffff' },
  
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5, borderBottomWidth: 1, borderBottomColor: '#cbd5e1', paddingBottom: 5, height: 35 },
  logoImage: { height: 28, width: 'auto', objectFit: 'contain' },
  dateText: { fontSize: 8, color: '#94a3b8' },

  clientContainer: { marginBottom: 10 },
  customerTitle: { fontSize: 18, fontWeight: 'bold', color: '#0f172a' },
  
  infoGrid: { flexDirection: 'row', gap: 8, marginBottom: 15 },
  infoCard: { flex: 1, padding: 6, backgroundColor: '#f8fafc', borderRadius: 6, borderWidth: 1, borderColor: '#cbd5e1', borderStyle: 'solid' },
  infoLabel: { fontSize: 7, color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 3 },
  infoValue: { fontSize: 9, color: '#0f172a', fontWeight: 'bold' },
  
  middleSection: { flexDirection: 'row', gap: 10, marginBottom: 15, height: 130 },
  
  moContainer: { flex: 1.3, borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 4, overflow: 'hidden' },
  moHeader: { flexDirection: 'row', backgroundColor: '#e2e8f0', padding: 5, borderBottomWidth: 1, borderBottomColor: '#cbd5e1' },
  moHeaderText: { fontSize: 8, fontWeight: 'bold', color: '#334155' },
  moRow: { flexDirection: 'row', padding: 5, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  moText: { fontSize: 9, color: '#334155' },
  totalRow: { flexDirection: 'row', backgroundColor: '#f1f5f9', padding: 5, marginTop: 'auto', borderTopWidth: 1, borderTopColor: '#cbd5e1' },

  imageWrapper: { flex: 1.0, borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 4, justifyContent: 'center', alignItems: 'center', padding: 5, backgroundColor: '#ffffff' },
  // IMAGEN AL 75%
  sampleImage: { width: '75%', height: '75%', objectFit: 'contain' },

  tableContainer: { borderTopWidth: 1, borderLeftWidth: 1, borderRightWidth: 1, borderBottomWidth: 1, borderColor: '#64748b', borderRadius: 4, overflow: 'hidden' },
  tableHeader: { flexDirection: 'row', backgroundColor: '#1e293b', paddingVertical: 5 },
  th: { fontSize: 7, fontWeight: 'bold', color: '#ffffff', textAlign: 'center', borderRightWidth: 1, borderRightColor: '#475569' },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#e2e8f0', height: 13, alignItems: 'center' },
  td: { fontSize: 7, textAlign: 'center', paddingHorizontal: 2, color: '#334155', borderRightWidth: 1, borderRightColor: '#e2e8f0' },
});

// ==================== LÓGICA DE PRE-CÁLCULO ====================
const calculateRowMetadata = (rows: ExcelRow[]) => {
    const metadata = new Array(rows.length).fill(null).map(() => ({
        blockId: 0,
        isGray: false,
        showBlockLabel: false, 
        subtotal: 0
    }));

    let currentBlockId = 0;
    let isGray = false;
    let i = 0;
    while (i < rows.length) {
        currentBlockId++;
        isGray = !isGray;
        
        const currentColor = String(getValue(rows[i], ['COLOR', 'Color', 'Colour']) || '').toLowerCase();
        let start = i;
        let sum = 0;

        let j = i;
        while (j < rows.length) {
            const nextColor = String(getValue(rows[j], ['COLOR', 'Color', 'Colour']) || '').toLowerCase();
            if (nextColor !== currentColor) break;
            sum += parseQty(getValue(rows[j], ['ROUNDED', 'Rounded', 'Qty']));
            j++;
        }
        
        const groupLength = j - start;
        const middleOffset = Math.floor((groupLength - 1) / 2); 
        const middleIndex = start + middleOffset;

        for (let k = start; k < j; k++) {
            metadata[k].blockId = currentBlockId;
            metadata[k].isGray = isGray;
            metadata[k].subtotal = sum;
            if (k === middleIndex) metadata[k].showBlockLabel = true;
        }
        i = j;
    }
    return metadata;
};

// ==================== COMPONENTE PDF ====================
const RaboPDFDocument = ({ 
  data, imgBase64, logoBase64, config, manualSO, manualMO, manualClient 
}: { 
  data: ExcelRow[]; imgBase64: string | null; logoBase64: string | null; config: ProductConfig;
  manualSO: string; manualMO: string; manualClient: string;
}) => {
  
  const activeColumns = useMemo(() => {
    return config.columns.filter(col => {
      if (col.isCorrelative || col.isSubtotal) return true;
      if (!col.isOptional) return true;
      return data.some(row => {
        const val = getValue(row, col.keys);
        return val !== undefined && val !== null && String(val).trim() !== '';
      });
    });
  }, [config, data]);

  const groupedData = useMemo(() => {
    const groups: Record<string, ExcelRow[]> = {};
    if (manualSO) {
        groups[manualSO] = data;
    } else {
        data.forEach(row => {
            // Usamos el PO extraído de B6 si existe (_headerPO)
            const po = getValue(row, ['_headerPO', 'PO#', 'PO', 'Cust_PO_NO']) || 'SIN_PO';
            if (!groups[po]) groups[po] = [];
            groups[po].push(row);
        });
    }
    return groups;
  }, [data, manualSO]);

  return (
    <Document>
      {Object.entries(groupedData).map(([soKey, rawRows], index) => {
        const rows = rawRows.filter(r => {
            const style = getValue(r, ['STYLE', 'Style', 'Style_No']);
            return style && String(style).trim() !== '';
        });

        const rowMeta = calculateRowMetadata(rows);

        const firstRow = rows[0];
        // Aquí tomamos el PO de B6 que guardamos en _headerPO
        const poValue = getValue(firstRow, ['_headerPO', 'PO#', 'PO', 'Cust_PO_NO']) || '';
        const clientName = manualClient || 'CLIENTE'; 

        const activeMO = manualMO || 'N/A';
        let sumQty = 0;
        rows.forEach(row => {
            sumQty += parseQty(getValue(row, ['ROUNDED', 'Rounded']));
        });

        return (
          <Page key={index} size="A4" orientation="landscape" style={styles.page}>
            <View style={styles.topBar}>
              <View>
                {logoBase64 ? <Image style={styles.logoImage} src={logoBase64} /> : <Text style={{ fontWeight: 'bold', color: '#e74c3c' }}>SML</Text>}
              </View>
              <View><Text style={styles.dateText}>Print Date: {new Date().toLocaleDateString()}</Text></View>
            </View>

            <View style={styles.clientContainer}>
                <Text style={styles.customerTitle}>{clientName}</Text>
            </View>

            <View style={styles.infoGrid}>
                <View style={styles.infoCard}><Text style={styles.infoLabel}>Item Name</Text><Text style={styles.infoValue}>{config.fixedItemName}</Text></View>
                <View style={styles.infoCard}><Text style={styles.infoLabel}>Product Code</Text><Text style={styles.infoValue}>{config.fixedProductCode}</Text></View>
                <View style={styles.infoCard}>
                    <Text style={styles.infoLabel}>PO #</Text>
                    {/* Mostramos el valor de la celda B6 */}
                    <Text style={{ ...styles.infoValue, color: '#ef4444' }}>{poValue}</Text>
                </View>
                <View style={styles.infoCard}><Text style={styles.infoLabel}>SO #</Text><Text style={styles.infoValue}>{soKey}</Text></View>
            </View>

            <View style={styles.middleSection}>
              <View style={styles.moContainer}>
                <View style={styles.moHeader}>
                  <Text style={{ ...styles.moHeaderText, flex: 1 }}>MO #</Text>
                  <Text style={{ ...styles.moHeaderText, flex: 1, textAlign: 'right' }}>Total Qty</Text>
                </View>
                <View style={styles.moRow}>
                    {/* @ts-ignore */}
                    <Text style={{ ...styles.moText, flex: 1, fontWeight: 'bold' }} maxLines={1}>{activeMO}</Text>
                    <Text style={{ ...styles.moText, flex: 1, textAlign: 'right' }}>{sumQty}</Text>
                </View>
                <View style={styles.totalRow}>
                  <Text style={{ ...styles.moText, flex: 1, fontWeight: 'bold' }}>TOTAL ORDER</Text>
                  <Text style={{ ...styles.moText, flex: 1, textAlign: 'right', fontWeight: 'bold' }}>{sumQty}</Text>
                </View>
              </View>
              <View style={styles.imageWrapper}>
                  {imgBase64 ? <Image style={styles.sampleImage} src={imgBase64} /> : <Text style={{ fontSize: 8, color: '#94a3b8' }}>{config.sampleImageName}</Text>}
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

              {rows.map((row, idx) => {
                  const meta = rowMeta[idx];
                  const rowBg = meta.isGray ? '#f1f5f9' : '#ffffff';

                  return (
                    <View key={idx} style={{ ...styles.tableRow, backgroundColor: rowBg }}>
                      {activeColumns.map((col, i) => {
                        let val = '';
                        
                        if (col.isCorrelative) {
                            val = String(idx + 1);
                        } 
                        else if (col.isSubtotal) {
                            // FORMATO: "150 (1)"
                            // Solo mostramos si es la fila central
                            val = meta.showBlockLabel ? `${meta.subtotal} (${meta.blockId})` : '';
                        } 
                        else if (col.header === 'Qty (R)') {
                            val = String(parseQty(getValue(row, ['ROUNDED', 'Rounded'])));
                        } else {
                            val = getValue(row, col.keys);
                        }
                        
                        return (
                          // @ts-ignore
                          <Text 
                            key={i} 
                            style={{ 
                                ...styles.td, 
                                flex: col.width, 
                                textAlign: col.align || 'center', 
                                fontWeight: col.isBold ? 'bold' : 'normal',
                                borderRightWidth: i === activeColumns.length - 1 ? 0 : 1 
                            }} 
                            maxLines={1}
                          >
                            {String(val)}
                          </Text>
                        );
                      })}
                    </View>
                  );
              })}
            </View>
          </Page>
        );
      })}
    </Document>
  );
};

// ==================== MAIN PAGE ====================
export default function RaboPage() {
  const [selectedProductId, setSelectedProductId] = useState<string>('rb_rabo_0896');
  const [manualSO, setManualSO] = useState('');
  const [manualMO, setManualMO] = useState('');
  const [manualClient, setManualClient] = useState('');

  const [files, setFiles] = useState<File[]>([]); 
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPdfGenerating, setIsPdfGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [consolidatedData, setConsolidatedData] = useState<ExcelRow[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  
  const [imgBase64, setImgBase64] = useState<string | null>(null);
  const [imgStatus, setImgStatus] = useState<string>('cargando');
  const [logoBase64, setLogoBase64] = useState<string | null>(null);

  const currentConfig = RABO_CONFIGS[selectedProductId];

  useEffect(() => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    fetch(`${origin}/images/logosml2.jpg`)
        .then(r => r.ok ? r.blob() : null)
        .then(b => {
            if (b) {
                const reader = new FileReader();
                reader.onloadend = () => setLogoBase64(reader.result as string);
                reader.readAsDataURL(b);
            }
        });
  }, []);

  useEffect(() => {
    if (!currentConfig) return;
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    setImgBase64(null); setImgStatus('cargando');
    
    fetch(`${origin}/images/${currentConfig.sampleImageName}`)
        .then(r => r.ok ? r.blob() : Promise.reject())
        .then(b => {
            if (b.type.includes('image')) {
                const reader = new FileReader();
                reader.onloadend = () => { setImgBase64(reader.result as string); setImgStatus('ok'); };
                reader.readAsDataURL(b);
            } else { setImgStatus('error_type'); }
        })
        .catch(() => setImgStatus('error_404'));
  }, [selectedProductId, currentConfig]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const selectedFiles = Array.from(event.target.files);
      const validFiles = selectedFiles.filter(f => f.name.match(/\.(xlsx|xls|csv)$/i) && !f.name.startsWith('~$'));
      if (validFiles.length === 0) { setError("Archivos inválidos."); return; }
      setFiles(prev => [...prev, ...validFiles]); 
      setConsolidatedData([]); setShowPreview(false); setError(null);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setConsolidatedData([]); setShowPreview(false);
  };

  const processFiles = async () => {
    if (files.length === 0) { setError('Sin archivos.'); return; }
    setIsProcessing(true);
    let allData: ExcelRow[] = [];
    try {
        for (const file of files) {
            const data = await file.arrayBuffer();
            const wb = XLSX.read(data);
            const sheet = wb.Sheets[wb.SheetNames[0]];
            
            // 1. LEER CELDA B6 (PO) ANTES DE CONVERTIR
            // B6 en coordenadas Excel = col 1, row 5 (0-indexed)
            // XLSX usa direcciones tipo "B6" directamente
            const cellB6 = sheet['B6'] ? sheet['B6'].v : '';

            // 2. CONVERTIR TABLA (Desde fila 18)
            const json = XLSX.utils.sheet_to_json<ExcelRow>(sheet, { range: currentConfig.headerRow, defval: '' });
            
            // 3. INYECTAR PO DE B6 EN CADA FILA
            const enrichedJson = json.map(row => ({
                ...row,
                _headerPO: cellB6 // Guardamos el valor de B6 en una propiedad oculta
            }));

            allData = allData.concat(enrichedJson);
        }
        setConsolidatedData(allData);
        setShowPreview(true);
    } catch (e: any) { setError(e.message); } finally { setIsProcessing(false); }
  };

  const handleDownload = async () => {
    setIsPdfGenerating(true);
    try {
        const blob = await pdf(
            <RaboPDFDocument 
                data={consolidatedData} 
                imgBase64={imgBase64} 
                logoBase64={logoBase64} 
                config={currentConfig}
                manualSO={manualSO}
                manualMO={manualMO}
                manualClient={manualClient}
            />
        ).toBlob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a'); link.href = url; link.download = `${currentConfig.id}_${Date.now()}.pdf`;
        document.body.appendChild(link); link.click(); document.body.removeChild(link);
    } catch (e) { console.error(e); } finally { setIsPdfGenerating(false); }
  };

  return (
    <main className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <Button variant="ghost" asChild className="text-indigo-700 hover:bg-indigo-50"><a href="/OF"><ArrowLeft className="mr-2 h-4 w-4" /> Volver al Menú</a></Button>
        <h1 className="text-3xl font-bold text-indigo-700 flex items-center gap-3"><Package className="h-8 w-8" /> Generador RABO</h1>
        <div className="w-64"><Select value={selectedProductId} onValueChange={setSelectedProductId}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{Object.values(RABO_CONFIGS).map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent></Select></div>
      </div>

      <div className="grid gap-6">
        <Card className="border-l-4 border-l-amber-500 shadow-md">
            <CardHeader className="pb-3"><CardTitle className="text-lg flex gap-2"><FileText className="h-5 w-5 text-amber-600"/> 1. Datos Manuales</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols- gap-4">
                <div><Label>SO (Sales Order)</Label><Input value={manualSO} onChange={e => setManualSO(e.target.value)} placeholder="Ej: 123456" className="border-amber-200" /></div>
                <div><Label>MO (Manufacturing)</Label><Input value={manualMO} onChange={e => setManualMO(e.target.value)} placeholder="Ej: 987654" className="border-amber-200" /></div>
                <div><Label>Cliente</Label><Input value={manualClient} onChange={e => setManualClient(e.target.value)} placeholder="Nombre del Cliente" className="border-amber-200" /></div>
            </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500 shadow-md">
            <CardHeader className="pb-3"><CardTitle className="text-lg flex gap-2"><UploadCloud className="h-5 w-5 text-blue-600"/> 2. Cargar Archivos Excel</CardTitle></CardHeader>
            <CardContent>
                <div className="flex items-center gap-4 mb-4">
                    <Button asChild variant="secondary" size="lg" className="bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200"><label className="cursor-pointer"><UploadCloud className="mr-2 h-5 w-5"/> Seleccionar Archivos<Input type="file" multiple className="hidden" accept=".xlsx,.xls,.csv" onChange={handleFileUpload} /></label></Button>
                    <div className="text-sm text-slate-500">{imgStatus === 'ok' ? <span className="text-green-600 flex items-center font-medium"><CheckCircle2 className="h-4 w-4 mr-1"/> Muestra OK.</span> : <span className="text-amber-500 flex items-center"><Loader2 className="h-4 w-4 mr-1 animate-spin"/> Buscando...</span>}</div>
                </div>
                {files.length > 0 && <div className="border rounded-md divide-y">{files.map((f, i) => (<div key={i} className="flex justify-between items-center p-3 text-sm hover:bg-slate-50"><span className="flex items-center gap-2 text-slate-700"><FileText className="h-4 w-4 text-blue-400"/> {f.name}</span><Button variant="ghost" size="sm" onClick={() => removeFile(i)} className="text-red-500 hover:text-red-700 h-8 w-8 p-0"><Trash2 className="h-4 w-4"/></Button></div>))}</div>}
                {files.length > 0 && <div className="mt-4 flex justify-end"><Button onClick={processFiles} disabled={isProcessing} className="bg-blue-600 hover:bg-blue-700">{isProcessing ? <><Loader2 className="animate-spin mr-2"/> Procesando...</> : <><Eye className="mr-2"/> Procesar Datos</>}</Button></div>}
            </CardContent>
        </Card>

        {showPreview && consolidatedData.length > 0 && (
            <Card className="border-l-4 border-l-green-500 bg-green-50 shadow-md">
                <CardHeader><CardTitle className="text-green-800 flex gap-2"><CheckCircle2/> Listo</CardTitle><CardDescription className="text-green-700">{consolidatedData.length} filas leídas.</CardDescription></CardHeader>
                <CardFooter><Button size="lg" className="w-full bg-green-600 hover:bg-green-700 shadow-lg text-lg h-12" onClick={handleDownload} disabled={isPdfGenerating}>{isPdfGenerating ? <><Loader2 className="animate-spin mr-2"/> Generando...</> : <><FileDown className="mr-2 h-6 w-6"/> Descargar PDF</>}</Button></CardFooter>
            </Card>
        )}
      </div>
    </main>
  );
}