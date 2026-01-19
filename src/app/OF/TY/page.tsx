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
import { TY_CONFIGS, ProductConfig } from './config';

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
  if (typeof val === 'number') return val;
  if (!val) return 0;
  return parseFloat(String(val).replace(/,/g, ''));
};

// ==================== ESTILOS PDF ====================
const styles = StyleSheet.create({
  page: { padding: 20, fontFamily: 'Helvetica', fontSize: 7.0, color: '#334155', backgroundColor: '#ffffff' },
  
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5, borderBottomWidth: 1, borderBottomColor: '#cbd5e1', paddingBottom: 5, height: 30 },
  logoImage: { height: 24, width: 'auto', objectFit: 'contain' },
  dateText: { fontSize: 8, color: '#94a3b8' },

  masterContainer: { flexDirection: 'row', gap: 10, marginBottom: 5, height: 110 }, 
  leftColumn: { flex: 1.8, flexDirection: 'column', justifyContent: 'space-between' },
  rightColumn: { flex: 0.8, borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 4, padding: 2, alignItems: 'center', justifyContent: 'center' },
  sampleImage: { width: '100%', height: '100%', objectFit: 'contain' },

  clientContainer: { marginBottom: 4 },
  customerTitle: { fontSize: 16, fontWeight: 'bold', color: '#0f172a', lineHeight: 1 },
  custNo: { fontSize: 7, color: '#64748b', fontWeight: 'bold', marginTop: 5 },

  infoRow: { flexDirection: 'row', gap: 5, marginBottom: 4 },
  infoCard: { padding: 4, backgroundColor: '#f8fafc', borderRadius: 4, borderWidth: 1, borderColor: '#cbd5e1', borderStyle: 'solid', flex: 1 },
  infoLabel: { fontSize: 6, color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 1 },
  infoValue: { fontSize: 8.5, color: '#0f172a', fontWeight: 'bold' },

  moWrapper: { marginTop: 'auto', flexDirection: 'row', borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 4, overflow: 'hidden', backgroundColor: '#fff', height: 35 },
  moSection: { flex: 1.5, padding: 5, justifyContent: 'center', borderRightWidth: 1, borderRightColor: '#e2e8f0', backgroundColor: '#f8fafc' },
  totalSection: { flex: 1, padding: 5, justifyContent: 'center', alignItems: 'flex-end', paddingRight: 10, backgroundColor: '#ffffff' },
  moLabel: { fontSize: 6, color: '#64748b', textTransform: 'uppercase', fontWeight: 'bold' },
  moValue: { fontSize: 10, fontWeight: 'bold', color: '#334155' },
  totalLabel: { fontSize: 6, color: '#64748b', textTransform: 'uppercase', fontWeight: 'bold', marginBottom: 1 },
  totalValue: { fontSize: 11, fontWeight: 'bold', color: '#000000' }, 

  tableContainer: { borderTopWidth: 1, borderLeftWidth: 1, borderRightWidth: 1, borderBottomWidth: 1, borderColor: '#64748b', borderRadius: 4, overflow: 'hidden', marginTop: 5 },
  tableHeader: { flexDirection: 'row', backgroundColor: '#1e293b', paddingVertical: 4 },
  th: { fontSize: 6.5, fontWeight: 'bold', color: '#ffffff', textAlign: 'center', borderRightWidth: 1, borderRightColor: '#475569' },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#e2e8f0', height: 12, alignItems: 'center' },
  td: { fontSize: 7, textAlign: 'center', paddingHorizontal: 2, color: '#334155', borderRightWidth: 1, borderRightColor: '#e2e8f0' },
});

// ==================== COMPONENTE PDF ====================
const TYPDFDocument = ({ 
  data, manualClient, imgBase64, logoBase64, config 
}: { 
  data: ExcelRow[]; manualClient: string; imgBase64: string | null; logoBase64: string | null; config: ProductConfig;
}) => {
  
  const activeColumns = useMemo(() => {
    return config.columns.filter(col => {
        if (col.isCheck) return true;
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
        
        const clientName = manualClient || 'CLIENTE';
        const custNo = getValue(first, ['Cust_no', 'Cust_No', 'CUST_NO']) || 'P10437';
        const mo = getValue(first, ['MO_NO', 'MO', 'MO_No']);
        const lot = getValue(first, ['lot', 'Lot', 'Lot_No']);
        const labelName = getValue(first, ['LabelName', 'Label']);
        const epSo = getValue(first, ['EP_SO_NO', 'ep_so_no', 'EP_SO']);
        const prodId = getValue(first, ['Prod_id', 'prod_id', 'Prod_ID']);
        let sumQty = 0;
        rows.forEach(r => sumQty += parseQty(getValue(r, ['Qty_So', 'Qty', 'QTY'])));

        return (
          <Page key={index} size="A4" orientation="landscape" style={styles.page}>
            <View style={styles.topBar}>
              <View>{logoBase64 ? <Image style={styles.logoImage} src={logoBase64} /> : <Text>SML</Text>}</View>
              <View><Text style={styles.dateText}>Print: {new Date().toLocaleDateString()}</Text></View>
            </View>
            <View style={styles.masterContainer}>
                <View style={styles.leftColumn}>
                    <View style={styles.clientContainer}>
                        <Text style={styles.customerTitle}>{clientName}</Text>
                        <Text style={styles.custNo}>Cust No: {custNo}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <View style={styles.infoCard}><Text style={styles.infoLabel}>SO No</Text><Text style={styles.infoValue}>{soKey}</Text></View>
                        <View style={styles.infoCard}><Text style={styles.infoLabel}>EP SO No</Text><Text style={styles.infoValue}>{epSo}</Text></View>
                        <View style={styles.infoCard}><Text style={styles.infoLabel}>Lot</Text><Text style={{ ...styles.infoValue, color: '#ef4444' }}>{lot}</Text></View>
                    </View>
                    <View style={styles.infoRow}>
                        <View style={{ ...styles.infoCard, flex: 1.5 }}><Text style={styles.infoLabel}>Label Name</Text><Text style={styles.infoValue}>{labelName}</Text></View>
                        <View style={{ ...styles.infoCard, flex: 1 }}><Text style={styles.infoLabel}>Prod ID</Text><Text style={styles.infoValue}>{prodId}</Text></View>
                    </View>
                    <View style={styles.moWrapper}>
                         <View style={styles.moSection}><Text style={styles.moLabel}>MO Number</Text><Text style={styles.moValue}>{mo}</Text></View>
                         <View style={styles.totalSection}><Text style={styles.totalLabel}>TOTAL ORDER QTY</Text><Text style={styles.totalValue}>{sumQty}</Text></View>
                    </View>
                </View>
                <View style={styles.rightColumn}>
                     {imgBase64 ? <Image style={styles.sampleImage} src={imgBase64} /> : <Text style={{fontSize: 8, color:'#94a3b8'}}>{config.sampleImageName}</Text>}
                </View>
            </View>
            <View style={styles.tableContainer}>
              <View style={styles.tableHeader}>
                {activeColumns.map((col, i) => (
                  <Text key={i} style={{ ...styles.th, flex: col.width, textAlign: col.align || 'center', borderRightWidth: 1, borderRightColor: '#475569' }}>{col.header}</Text>
                ))}
              </View>
              {rows.map((row, idx) => (
                <View key={idx} style={{ ...styles.tableRow, backgroundColor: idx % 2 === 0 ? 'white' : '#f8fafc' }}>
                  {activeColumns.map((col, i) => {
                    if (col.isCheck) {
                        return (
                            <View key={i} style={{ ...styles.td, flex: col.width, justifyContent: 'center', borderRightWidth: 1, borderRightColor: '#e2e8f0' }}><Text> </Text></View>
                        );
                    }
                    
                    // OBTENER VALOR Y FORMATEAR PRECIO
                    let val = getValue(row, col.keys);
                    if (col.header === 'Price' && val) {
                        val = `$${val}`; // AGREGAR SÍMBOLO DE DÓLAR
                    }

                    return (
                        <Text key={i} style={{ ...styles.td, flex: col.width, textAlign: col.align || 'center', fontWeight: col.isBold ? 'bold' : 'normal', borderRightWidth: 1, borderRightColor: '#e2e8f0' }} 
                        // @ts-ignore
                        maxLines={1}>
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
export default function TYPage() {
  const [selectedProductId, setSelectedProductId] = useState<string>('ty_rfid');
  const [files, setFiles] = useState<File[]>([]); 
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPdfGenerating, setIsPdfGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [consolidatedData, setConsolidatedData] = useState<ExcelRow[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  
  const [imgBase64, setImgBase64] = useState<string | null>(null);
  const [imgStatus, setImgStatus] = useState<string>('cargando');
  const [logoBase64, setLogoBase64] = useState<string | null>(null);
  
  const [manualClient, setManualClient] = useState<string>('');

  const currentConfig = TY_CONFIGS[selectedProductId];

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
      setFiles(prev => [...prev, ...selectedFiles]); setConsolidatedData([]); setShowPreview(false); setError(null);
    }
  };

  const removeFile = (index: number) => { setFiles(prev => prev.filter((_, i) => i !== index)); setConsolidatedData([]); setShowPreview(false); };

  const processFiles = async () => {
    if (files.length === 0) { setError('Sin archivos.'); return; }
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
        
        if (allData.length > 0) {
            const first = allData[0];
            const detectedClient = currentConfig.defaultClientName 
                ? currentConfig.defaultClientName 
                : getValue(first, ['contractor', 'Contractor', 'factory', 'Factory', 'Cliente', 'Cust_Name', 'Customer']);
            setManualClient(detectedClient || '');
        }

        setConsolidatedData(allData); setShowPreview(true);
    } catch (e: any) { setError(e.message); } finally { setIsProcessing(false); }
  };

  const handleDownload = async () => {
    setIsPdfGenerating(true);
    try {
        const blob = await pdf(
            <TYPDFDocument 
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
        <Button variant="ghost" asChild className="text-indigo-700 hover:bg-indigo-50"><a href="/OF"><ArrowLeft className="mr-2 h-4 w-4" /> Volver al Menú</a></Button>
        <h1 className="text-3xl font-bold text-indigo-700 flex items-center gap-3"><Package className="h-8 w-8" /> Generador TY</h1>
        <div className="w-80">
            <Label className="text-xs text-slate-500 mb-1 block">Selecciona Producto TY:</Label>
            <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                <SelectTrigger className="w-full border-indigo-200 bg-white shadow-sm h-10"><SelectValue /></SelectTrigger>
                <SelectContent>{Object.values(TY_CONFIGS).map(p => (<SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>))}</SelectContent>
            </Select>
        </div>
      </div>
      <div className="grid gap-6">
        <Card className="border-l-4 border-l-blue-500 shadow-md">
            <CardHeader className="pb-3"><CardTitle className="text-lg flex gap-2 items-center"><UploadCloud className="h-5 w-5 text-blue-600"/> Cargar Excel ({currentConfig.name})</CardTitle></CardHeader>
            <CardContent>
                <div className="flex items-center gap-4 mb-4">
                    <Button asChild variant="secondary" size="lg" className="bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200"><label className="cursor-pointer"><UploadCloud className="mr-2 h-5 w-5"/> Seleccionar Archivos<Input type="file" multiple className="hidden" accept=".xlsx,.xls,.csv" onChange={handleFileUpload} /></label></Button>
                    <div className="text-sm text-slate-500">{imgStatus === 'ok' ? <span className="text-green-600 flex items-center font-medium"><CheckCircle2 className="h-4 w-4 mr-1"/> Imagen lista: {currentConfig.sampleImageName}</span> : <span className="text-amber-500 flex items-center"><Loader2 className="h-4 w-4 mr-1 animate-spin"/> Buscando {currentConfig.sampleImageName}...</span>}</div>
                </div>
                {files.length > 0 && <div className="border rounded-md divide-y">{files.map((f, i) => (<div key={i} className="flex justify-between items-center p-3 text-sm hover:bg-slate-50"><span className="flex items-center gap-2 text-slate-700"><FileText className="h-4 w-4 text-blue-400"/> {f.name}</span><Button variant="ghost" size="sm" onClick={() => removeFile(i)} className="text-red-500 hover:text-red-700 h-8 w-8 p-0"><Trash2 className="h-4 w-4"/></Button></div>))}</div>}
                {files.length > 0 && <div className="mt-4 flex justify-end"><Button onClick={processFiles} disabled={isProcessing} className="bg-blue-600 hover:bg-blue-700">{isProcessing ? <><Loader2 className="animate-spin mr-2"/> Procesando...</> : <><Eye className="mr-2"/> Procesar Datos</>}</Button></div>}
            </CardContent>
        </Card>
        {showPreview && consolidatedData.length > 0 && (
            <Card className="border-l-4 border-l-green-500 bg-green-50 shadow-md">
                <CardHeader><CardTitle className="text-green-800 flex gap-2"><CheckCircle2/> Listo</CardTitle><CardDescription className="text-green-700">{consolidatedData.length} filas leídas.</CardDescription></CardHeader>
                
                {/* INPUT PARA CLIENTE */}
                <CardContent>
                    <div className="space-y-1 max-w-md">
                        <Label htmlFor="clientInput" className="text-xs font-bold text-slate-500">CLIENTE (Editable)</Label>
                        <Input 
                            id="clientInput" 
                            value={manualClient} 
                            onChange={(e) => setManualClient(e.target.value)} 
                            className="border-slate-300 bg-white"
                        />
                    </div>
                </CardContent>

                <CardFooter><Button size="lg" className="w-full bg-green-600 hover:bg-green-700 shadow-lg text-lg h-12" onClick={handleDownload} disabled={isPdfGenerating}>{isPdfGenerating ? <><Loader2 className="animate-spin mr-2"/> Generando...</> : <><FileDown className="mr-2 h-6 w-6"/> Descargar PDF</>}</Button></CardFooter>
            </Card>
        )}
      </div>
    </main>
  );
}
//