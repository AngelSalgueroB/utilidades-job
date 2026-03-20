"use client";

import { useState, useMemo, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { Loader2, ArrowLeft, UploadCloud, CheckCircle2, FileDown, Eye, Package, FileText, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { pdf, Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { TH47_CONFIGS, ProductConfig } from './config';

type ExcelRow = { [key: string]: any };

const getValue = (row: any, keys: string[]): any => {
  if (!row) return '';
  if (keys.length === 0) return '';
  for (const k of keys) {
    if (row[k] !== undefined && row[k] !== null && String(row[k]).trim() !== '') {
      return row[k];
    }
  }
  return '';
};

const parseQty = (val: any): number => {
  if (typeof val === 'number') return isNaN(val) ? 0 : val;
  if (!val) return 0;
  const parsed = parseFloat(String(val).replace(/,/g, '').trim());
  return isNaN(parsed) ? 0 : parsed;
};

// ==================== ESTILOS PDF (Gris/Monocromático) ====================
const styles = StyleSheet.create({
  page: { padding: 20, fontFamily: 'Helvetica', fontSize: 6.0, color: '#334155', backgroundColor: '#ffffff' },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 12, borderBottomWidth: 1, borderBottomColor: '#cbd5e1', paddingBottom: 6 },
  logoImage: { height: 26, width: 'auto', objectFit: 'contain' },
  dateText: { fontSize: 8, color: '#94a3b8', fontWeight: 'bold' },
  masterContainer: { flexDirection: 'row', gap: 12, marginBottom: 10, height: 115 }, 
  leftColumn: { flex: 1.8, flexDirection: 'column', justifyContent: 'space-between' },
  rightColumn: { flex: 0.8, backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 8, padding: 4, alignItems: 'center', justifyContent: 'center' },
  sampleImage: { width: '100%', height: '100%', objectFit: 'contain' },
  clientContainer: { marginBottom: 6 },
  customerTitle: { fontSize: 18, fontWeight: 'bold', color: '#0f172a', textTransform: 'uppercase', lineHeight: 1 },
  custNo: { fontSize: 7, color: '#64748b', fontWeight: 'bold', marginTop: 2 },
  infoRow: { flexDirection: 'row', gap: 8, marginBottom: 6 },
  infoCard: { paddingVertical: 4, paddingHorizontal: 6, backgroundColor: '#f8fafc', borderRadius: 4, borderWidth: 1, borderColor: '#cbd5e1', flex: 1 },
  infoLabel: { fontSize: 6, color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 2 },
  infoValue: { fontSize: 9, color: '#0f172a', fontWeight: 'bold' },
  moWrapper: { marginTop: 'auto', flexDirection: 'row', borderRadius: 6, overflow: 'hidden', height: 36, borderWidth: 1, borderColor: '#cbd5e1' },
  moSection: { flex: 1.5, padding: 6, justifyContent: 'center', backgroundColor: '#ffffff', borderRightWidth: 1, borderRightColor: '#e2e8f0' },
  totalSection: { flex: 1, padding: 6, justifyContent: 'center', alignItems: 'flex-end', backgroundColor: '#ffffff' }, 
  moLabel: { fontSize: 6, color: '#64748b', textTransform: 'uppercase', fontWeight: 'bold', marginBottom: 1 },
  moValue: { fontSize: 11, fontWeight: 'bold', color: '#0f172a' },
  totalLabel: { fontSize: 6, color: '#64748b', textTransform: 'uppercase', fontWeight: 'bold', marginBottom: 1 },
  totalValue: { fontSize: 10, fontWeight: 'bold', color: '#000000' }, 
  tableContainer: { borderRadius: 4, overflow: 'hidden', marginTop: 5, borderWidth: 1, borderColor: '#64748b' },
  tableHeader: { flexDirection: 'row', backgroundColor: '#1e293b', paddingVertical: 5 }, 
  th: { fontSize: 5.5, fontWeight: 'bold', color: '#ffffff', textAlign: 'center', borderRightWidth: 1, borderRightColor: '#475569' },
  tableRow: { flexDirection: 'row', minHeight: 14, alignItems: 'center' },
  td: { fontSize: 5.5, textAlign: 'center', paddingHorizontal: 2, color: '#334155' },
});

// ==================== COMPONENTE PDF ====================
const TH47PDFDocument = ({ 
  data, manualClient, imgBase64, logoBase64, config 
}: { 
  data: ExcelRow[]; manualClient: string; imgBase64: string | null; logoBase64: string | null; config: ProductConfig;
}) => {
  
  const activeColumns = useMemo(() => {
    return config.columns.filter(col => {
        if (col.isCheck || col.isGroupTotal) return true;
        return !col.isOptional || data.some(row => getValue(row, col.keys));
    });
  }, [config, data]);

  const groupedData = useMemo(() => {
    const groups: Record<string, ExcelRow[]> = {};
    data.forEach(row => {
        const so = getValue(row, ['SO_NO', 'SO', 'so_no']) || 'UNKNOWN';
        if (!groups[so]) groups[so] = [];
        groups[so].push(row);
    });
    return groups;
  }, [data]);

  return (
    <Document>
      {Object.entries(groupedData).map(([soKey, rows], index) => {
        const first = rows[0];
        
        // Cliente manual
        const clientName = manualClient || ' ';
        const custNo = getValue(first, ['Cust_no', 'Cust_No']) || 'N/A';
        const epSo = getValue(first, ['EP_SO_NO', 'EP_SO']);
        const itemCode = getValue(first, ['Item_code', 'Item_Code']);
        const prodId = getValue(first, ['Prod_id', 'Prod_ID']);
        const program = getValue(first, ['Program', 'program']);
        const mo = getValue(first, ['MO_NO', 'MO', 'MO_No']);
        
        // SUMA DIRECTA PURA (Sin formateadores complejos)
        let sumQty = 0;
        rows.forEach(r => sumQty += parseQty(getValue(r, ['Qty_So', 'Qty', 'qty', 'Quantity'])));

        return (
          <Page key={index} size="A4" orientation="landscape" style={styles.page}>
            <View style={styles.topBar}>
              <View>{logoBase64 ? <Image style={styles.logoImage} src={logoBase64} /> : <Text style={{fontSize: 14, fontWeight: 'bold'}}>SML</Text>}</View>
              <View><Text style={styles.dateText}>Print Date: {new Date().toLocaleDateString()}</Text></View>
            </View>

            <View style={styles.masterContainer}>
                <View style={styles.leftColumn}>
                    <View style={styles.clientContainer}>
                        <Text style={styles.customerTitle}>{String(clientName)}</Text>
                        <Text style={styles.custNo}>CUST NO: {String(custNo)}</Text>
                    </View>
                    
                    <View style={styles.infoRow}>
                        <View style={styles.infoCard}><Text style={styles.infoLabel}>SO No</Text><Text style={styles.infoValue}>{String(soKey)}</Text></View>
                        <View style={styles.infoCard}><Text style={styles.infoLabel}>EP SO No</Text><Text style={styles.infoValue}>{String(epSo)}</Text></View>
                        <View style={{...styles.infoCard, flex: 1.5}}>
                            <Text style={styles.infoLabel}>Program</Text>
                            <Text style={styles.infoValue}>{String(program)}</Text>
                        </View>
                    </View>

                    <View style={styles.infoRow}>
                        <View style={styles.infoCard}><Text style={styles.infoLabel}>Prod ID</Text><Text style={styles.infoValue}>{String(prodId)}</Text></View>
                        <View style={{...styles.infoCard, flex: 2}}><Text style={styles.infoLabel}>Item Code</Text><Text style={styles.infoValue}>{String(itemCode)}</Text></View>
                    </View>

                    <View style={styles.moWrapper}>
                         <View style={styles.moSection}>
                             <Text style={styles.moLabel}>MO Number</Text>
                             <Text style={styles.moValue}>{String(mo)}</Text>
                         </View>
                         <View style={styles.totalSection}>
                             <Text style={styles.totalLabel}>TOTAL ORDER QTY</Text>
                             {/* Mostramos el número como String puro */}
                             <Text style={styles.totalValue}>{String(sumQty)}</Text>
                         </View>
                    </View>
                </View>

                <View style={styles.rightColumn}>
                     {imgBase64 ? <Image style={styles.sampleImage} src={imgBase64} /> : <Text style={{fontSize: 8, color:'#94a3b8'}}>{config.sampleImageName}</Text>}
                </View>
            </View>

            <View style={styles.tableContainer}>
              <View style={styles.tableHeader}>
                {activeColumns.map((col, i) => {
                  const isLast = i === activeColumns.length - 1;
                  return (
                    <Text key={i} style={{ ...styles.th, flex: col.width, textAlign: col.align || 'center', borderRightWidth: isLast ? 0 : 1 }}>{col.header}</Text>
                  );
                })}
              </View>

              {/* LÓGICA DE AGRUPACIÓN POR ESTILOS */}
              {(() => {
                  const styleBlocks: ExcelRow[][] = [];
                  let currentStyle: string | null = null;
                  let currentBlock: ExcelRow[] = [];
                  
                  rows.forEach(r => {
                      const style = String(getValue(r, ['style_des', 'Style_Desc', 'item_des']));
                      if (style !== currentStyle) {
                          if (currentBlock.length > 0) styleBlocks.push(currentBlock);
                          currentStyle = style;
                          currentBlock = [r];
                      } else {
                          currentBlock.push(r);
                      }
                  });
                  if (currentBlock.length > 0) styleBlocks.push(currentBlock);

                  return styleBlocks.map((block, blockIdx) => {
                      const blockTotal = block.reduce((acc, r) => acc + parseQty(getValue(r, ['Qty_So', 'Qty', 'qty', 'Quantity'])), 0);
                      const midIdx = Math.floor((block.length - 1) / 2); 
                      
                      return block.map((row, rowIdx) => {
                          const isLastRowInBlock = rowIdx === block.length - 1;
                          
                          return (
                              <View 
                                  key={`${blockIdx}-${rowIdx}`} 
                                  style={{ 
                                      ...styles.tableRow, 
                                      backgroundColor: rowIdx % 2 === 0 ? '#ffffff' : '#f8fafc',
                                      borderBottomWidth: isLastRowInBlock ? 1.5 : 1,
                                      borderBottomColor: isLastRowInBlock ? '#64748b' : '#e2e8f0'
                                  }}
                              >
                                  {activeColumns.map((col, colIdx) => {
                                      const isLastCol = colIdx === activeColumns.length - 1;
                                      
                                      if (col.isGroupTotal) {
                                          return (
                                              <View key={colIdx} style={{ ...styles.td, flex: col.width, borderRightWidth: isLastCol ? 0 : 1, borderRightColor: '#e2e8f0', justifyContent: 'center' }}>
                                                  <Text style={{ fontWeight: 'bold', fontSize: 7, color: '#0f172a' }}>
                                                      {rowIdx === midIdx ? String(blockTotal) : ' '}
                                                  </Text>
                                              </View>
                                          );
                                      }

                                      if (col.isCheck) {
                                          return (<View key={colIdx} style={{ ...styles.td, flex: col.width, borderRightWidth: isLastCol ? 0 : 1, borderRightColor: '#e2e8f0' }}><Text> </Text></View>);
                                      }
                                      
                                      return (
                                          <Text key={colIdx} style={{ ...styles.td, flex: col.width, textAlign: col.align || 'center', fontWeight: col.isBold ? 'bold' : 'normal', borderRightWidth: isLastCol ? 0 : 1, borderRightColor: '#e2e8f0' }} {...({ maxLines: 1 } as any)}>
                                              {String(getValue(row, col.keys))}
                                          </Text>
                                      );
                                  })}
                              </View>
                          );
                      });
                  });
              })()}

            </View>
          </Page>
        );
      })}
    </Document>
  );
};

export default function TH47Page() {
  const [selectedProductId, setSelectedProductId] = useState<string>('47th_apparel'); 
  const [files, setFiles] = useState<File[]>([]); 
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPdfGenerating, setIsPdfGenerating] = useState(false);
  const [consolidatedData, setConsolidatedData] = useState<ExcelRow[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [imgBase64, setImgBase64] = useState<string | null>(null);
  const [imgStatus, setImgStatus] = useState<string>('cargando');
  const [logoBase64, setLogoBase64] = useState<string | null>(null);
  
  // INICIA VACÍO
  const [manualClient, setManualClient] = useState<string>('');

  const currentConfig = TH47_CONFIGS[selectedProductId];

  useEffect(() => {
    if (!currentConfig) return;
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const logoName = currentConfig.logoImageName || 'logosml.jpg';
    fetch(`${origin}/images/${logoName}`).then(r => r.ok ? r.blob() : null).then(b => { if (b) { const reader = new FileReader(); reader.onloadend = () => setLogoBase64(reader.result as string); reader.readAsDataURL(b); } });
  }, [selectedProductId, currentConfig]);

  useEffect(() => {
    if (!currentConfig) return;
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    setImgBase64(null); setImgStatus('cargando');
    fetch(`${origin}/images/${currentConfig.sampleImageName}`).then(r => r.ok ? r.blob() : Promise.reject()).then(b => { if (b.type.includes('image')) { const reader = new FileReader(); reader.onloadend = () => { setImgBase64(reader.result as string); setImgStatus('ok'); }; reader.readAsDataURL(b); } else { setImgStatus('error_type'); } }).catch(() => setImgStatus('error_404'));
  }, [selectedProductId, currentConfig]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const selectedFiles = Array.from(event.target.files);
      setFiles(prev => [...prev, ...selectedFiles]); setConsolidatedData([]); setShowPreview(false);
    }
  };

  const removeFile = (index: number) => { setFiles(prev => prev.filter((_, i) => i !== index)); setConsolidatedData([]); setShowPreview(false); };

  const processFiles = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);
    let allData: ExcelRow[] = [];
    try {
        for (const file of files) {
            const data = await file.arrayBuffer();
            const wb = XLSX.read(data);
            const sheet = wb.Sheets[wb.SheetNames[0]];
            const json = XLSX.utils.sheet_to_json<ExcelRow>(sheet, { range: currentConfig.headerRow, defval: '' });
            allData = allData.concat(json);
        }
        setConsolidatedData(allData); setShowPreview(true);
    } catch (e) { console.error(e); } finally { setIsProcessing(false); }
  };

  const handleDownload = async () => {
    setIsPdfGenerating(true);
    try {
        const blob = await pdf(
            <TH47PDFDocument 
                data={consolidatedData} 
                manualClient={manualClient} 
                imgBase64={imgBase64} 
                logoBase64={logoBase64} 
                config={currentConfig} 
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
        <Button variant="ghost" asChild className="text-teal-700 hover:bg-teal-50"><a href="/OF"><ArrowLeft className="mr-2 h-4 w-4" /> Volver al Menú</a></Button>
        <h1 className="text-3xl font-bold text-teal-700 flex items-center gap-3"><Package className="h-8 w-8" /> Generador 47TH Apparel</h1>
        <div className="w-96">
            <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                <SelectTrigger className="w-full border-teal-200 shadow-sm"><SelectValue /></SelectTrigger>
                <SelectContent>{Object.values(TH47_CONFIGS).map(p => (<SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>))}</SelectContent>
            </Select>
        </div>
      </div>
      <div className="grid gap-6">
        
        <Card className="border-2 border-teal-500 shadow-md">
            <CardHeader className="pb-3"><CardTitle className="text-lg flex gap-2"><UploadCloud className="h-5 w-5 text-teal-600"/> Cargar Excel</CardTitle></CardHeader>
            <CardContent>
                <div className="flex items-center gap-4 mb-4">
                    <Button asChild variant="secondary" size="lg" className="bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200"><label className="cursor-pointer"><UploadCloud className="mr-2 h-5 w-5"/> Seleccionar Archivos<Input type="file" multiple className="hidden" accept=".xlsx,.xls,.csv" onChange={handleFileUpload} /></label></Button>
                    <div className="text-sm text-slate-500">{imgStatus === 'ok' ? <span className="text-green-600 flex items-center font-medium"><CheckCircle2 className="h-4 w-4 mr-1"/> Imagen lista: {currentConfig.sampleImageName}</span> : <span className="text-amber-500 flex items-center"><Loader2 className="h-4 w-4 mr-1 animate-spin"/> Buscando imagen...</span>}</div>
                </div>
                {files.length > 0 && <div className="border rounded-md divide-y">{files.map((f, i) => (<div key={i} className="flex justify-between items-center p-3 text-sm hover:bg-slate-50"><span className="flex items-center gap-2 text-slate-700"><FileText className="h-4 w-4 text-teal-400"/> {f.name}</span><Button variant="ghost" size="sm" onClick={() => removeFile(i)} className="text-red-500 hover:text-red-700 h-8 w-8 p-0"><Trash2 className="h-4 w-4"/></Button></div>))}</div>}
                {files.length > 0 && <div className="mt-4 flex justify-end"><Button onClick={processFiles} disabled={isProcessing} className="bg-teal-600 hover:bg-teal-700 text-white shadow-md">{isProcessing ? <><Loader2 className="animate-spin mr-2"/> Procesando...</> : <><Eye className="mr-2"/> Procesar Datos</>}</Button></div>}
            </CardContent>
        </Card>

        {showPreview && consolidatedData.length > 0 && (
            <Card className="border-2 border-green-500 bg-green-50 shadow-md">
                <CardHeader><CardTitle className="text-green-800 flex gap-2"><CheckCircle2/> Listo</CardTitle><CardDescription className="text-green-700">{consolidatedData.length} filas leídas.</CardDescription></CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
                        <div className="space-y-1">
                            <Label className="text-slate-600 font-bold">CLIENTE (Impreso en PDF)</Label>
                            <Input 
                                value={manualClient} 
                                onChange={(e) => setManualClient(e.target.value)} 
                                className="border-slate-300 bg-white shadow-sm"
                            />
                        </div>
                    </div>
                </CardContent>
                <CardFooter><Button size="lg" className="w-full bg-green-600 hover:bg-green-700 shadow-md text-lg h-12 text-white" onClick={handleDownload} disabled={isPdfGenerating}>{isPdfGenerating ? <><Loader2 className="animate-spin mr-2"/> Generando PDF...</> : <><FileDown className="mr-2 h-6 w-6"/> Descargar Order Form</>}</Button></CardFooter>
            </Card>
        )}
      </div>
    </main>
  );
}