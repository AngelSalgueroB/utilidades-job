"use client";

import { useState, useMemo, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { Loader2, ArrowLeft, FolderSearch, List, CheckCircle2, FileDown, Eye, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
// IMPORTANTE: pdf para generar manual
import { pdf, Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

type ExcelRow = { [key: string]: any };

interface FileWithPath extends File {
  webkitRelativePath: string;
}

// RUTA DE LA IMAGEN ESTÁTICA
const STATIC_IMAGE_PATH = '/images/sample.jpg';

// ==================== 1. ESTILOS PDF (CORREGIDOS Y SEGUROS) ====================
const styles = StyleSheet.create({
  page: {
    padding: 20,
    fontFamily: 'Helvetica',
    fontSize: 9,
    color: '#334155',
    backgroundColor: '#ffffff',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#64748b',
    borderBottomStyle: 'solid',
    paddingBottom: 5,
  },
  logoGroup: { flexDirection: 'row', gap: 4 },
  logoBadge: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    color: 'white',
    fontSize: 8,
    fontWeight: 'bold',
    borderRadius: 2,
  },
  dateText: { fontSize: 7, color: '#94a3b8', fontWeight: 'normal' },
  headerSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
    alignItems: 'flex-start',
  },
  clientContainer: { flex: 1 },
  customerTitle: { fontSize: 16, fontWeight: 'bold', color: '#0f172a', marginBottom: 2 },
  custNo: { fontSize: 9, color: '#64748b', fontWeight: 'bold' },
  docBadge: {
    backgroundColor: '#f1f5f9',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#94a3b8',
    borderStyle: 'solid',
  },
  docBadgeText: { fontSize: 10, fontWeight: 'bold', color: '#334155', letterSpacing: 1 },
  infoGrid: { flexDirection: 'row', gap: 8, marginBottom: 15 },
  infoCard: {
    flex: 1,
    padding: 6,
    backgroundColor: '#f8fafc',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#94a3b8',
    borderStyle: 'solid',
  },
  infoLabel: {
    fontSize: 6,
    color: '#475569',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  infoValue: { fontSize: 10, fontWeight: 'bold', color: '#0f172a', lineHeight: 1.1 },
  rmText: { color: '#a0522d', fontWeight: 'bold' },
  poValue: { fontSize: 11, fontWeight: 'bold', color: '#ef4444' },
  
  // SECCIÓN CENTRAL
  middleSection: { flexDirection: 'row', gap: 10, marginBottom: 15, height: 140 },
  
  moContainer: {
    flex: 1, 
    borderWidth: 1,
    borderColor: '#64748b',
    borderStyle: 'solid',
    borderRadius: 4,
    overflow: 'hidden',
  },
  moHeader: {
    flexDirection: 'row',
    backgroundColor: '#cbd5e1',
    paddingVertical: 4,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#64748b',
    borderBottomStyle: 'solid',
  },
  moHeaderText: { fontSize: 7, fontWeight: 'bold', color: '#1e293b' },
  moRow: {
    flexDirection: 'row',
    paddingVertical: 3,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#cbd5e1',
    borderBottomStyle: 'solid',
  },
  moText: { fontSize: 8, color: '#334155' },
  totalRow: {
    flexDirection: 'row',
    backgroundColor: '#e2e8f0',
    paddingVertical: 4,
    paddingHorizontal: 4,
    borderTopWidth: 1,
    borderTopColor: '#64748b',
    borderTopStyle: 'solid',
    marginTop: 'auto',
  },
  
  // Contenedor de Imagen
  imageContainer: {
    flex: 2, 
    borderWidth: 1,
    borderColor: '#64748b', 
    borderStyle: 'solid',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 2,
    backgroundColor: '#ffffff',
    overflow: 'hidden',
  },
  sampleImage: { 
    width: '100%', 
    height: '100%', 
    objectFit: 'contain' 
  },
  
  // TABLA DETALLE (DISEÑO MEJORADO)
  tableContainer: {
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#64748b',
    borderStyle: 'solid',
    borderRadius: 4,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#1e293b', 
    paddingVertical: 5,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#64748b',
    borderBottomStyle: 'solid',
  },
  th: {
    fontSize: 6.5,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    borderRightWidth: 1,
    borderRightColor: '#475569',
    borderRightStyle: 'solid',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    borderBottomStyle: 'solid',
    alignItems: 'center',
    height: 15,
  },
  td: {
    fontSize: 6.5,
    textAlign: 'center',
    paddingHorizontal: 3,
    color: '#334155',
    borderRightWidth: 1,
    borderRightColor: '#e2e8f0',
    borderRightStyle: 'solid',
    overflow: 'hidden', 
  },
  // Estilos específicos para alineación
  tdLeft: { textAlign: 'left' },
  tdCenter: { textAlign: 'center' },
  tdRight: { textAlign: 'right' },
});

// Helper para parsear cantidades
const parseQty = (val: any): number => {
  if (typeof val === 'number') return val;
  if (!val) return 0;
  return parseFloat(String(val).replace(/,/g, ''));
};

// ==================== 2. COMPONENTE INTERNO DEL PDF ====================
const RFIDDocument = ({ data }: { data: ExcelRow[] }) => {
  // Detección automática de si hay dos precios en todo el dataset
  const hasPrice2 = data.some(row => {
    const p2 = row.Price2 || row.price2;
    return p2 !== undefined && p2 !== null && String(p2).trim() !== '';
  });

  // Ajuste dinámico de anchos
  const gNameFlex = hasPrice2 ? 2.65 : 3.15;

  const groupedBySO: Record<string, ExcelRow[]> = {};
  data.forEach((row) => {
    const soNo = row.SO_No || row.so_no || 'SIN_SO';
    if (!groupedBySO[soNo]) groupedBySO[soNo] = [];
    groupedBySO[soNo].push(row);
  });

  return (
    <Document>
      {Object.entries(groupedBySO).map(([soKey, rows], index) => {
        
        // ORDENAMIENTO ALFABÉTICO POR COLOR
        rows.sort((a, b) => {
            const colorA = String(a.g_color || a.color || '').toLowerCase();
            const colorB = String(b.g_color || b.color || '').toLowerCase();
            return colorA.localeCompare(colorB);
        });

        const firstRow = rows[0];
        const customerName = String(firstRow.Cust_Name || firstRow.cust_name || '');
        const custNo = String(firstRow.Cust_No || firstRow.cust_no || 'P10017');
        const itemCode = String(firstRow.Prod_Code || firstRow.prod_code || '');
        const sysCallout = String(firstRow.SYS_Callout || firstRow.sys_callout || 'TB-HT-A1');
        const rmNo = String(firstRow.RM_No || firstRow.rm_no || 'TMTMTRM9V003');
        const epSoNo = String(firstRow.EP_SO_NO || firstRow.ep_so_no || '');
        const poOc = String(firstRow.Cust_PO_NO || firstRow.cust_po_no || '');
        const ordFrom = String(firstRow.Ord_From || firstRow.ord_from || '');

        // === CÁLCULO INTELIGENTE DE CANTIDADES POR MO ===
        const moGroups: Record<string, { qty: number; sizes: Set<string> }> = {};
        
        const rowsByMO: Record<string, ExcelRow[]> = {};
        rows.forEach(row => {
            const mo = String(row.MO_No || row.mo_no || 'N/A');
            if (!rowsByMO[mo]) rowsByMO[mo] = [];
            rowsByMO[mo].push(row);
        });

        Object.entries(rowsByMO).forEach(([mo, groupRows]) => {
            const sizes = new Set<string>();
            let sumOriginal = 0;
            let hasOriginal = false;

            groupRows.forEach(row => {
                const size = String(row.Size || row.size || row.us_size || '');
                if (size) sizes.add(size);

                const valOrig = row.Qty_Original !== undefined ? row.Qty_Original : row.qty_original;
                if (valOrig !== undefined && valOrig !== null && String(valOrig).trim() !== '') {
                    hasOriginal = true;
                    sumOriginal += parseQty(valOrig);
                }
            });

            let finalQty = 0;
            if (hasOriginal) {
                finalQty = sumOriginal;
            } else {
                const first = groupRows[0];
                const valTotal = first.Qty_Total !== undefined ? first.Qty_Total : first.qty_total;
                finalQty = parseQty(valTotal);
            }

            moGroups[mo] = { qty: finalQty, sizes };
        });

        const totalQty = Object.values(moGroups).reduce((sum, g) => sum + g.qty, 0);

        return (
          <Page key={index} size="A4" orientation="landscape" style={styles.page}>
            <View style={styles.topBar}>
              <View style={styles.logoGroup}>
                <Text style={{ ...styles.logoBadge, backgroundColor: '#e74c3c' }}>SML</Text>
                <Text style={{ ...styles.logoBadge, backgroundColor: '#3498db' }}>RFID</Text>
              </View>
              <Text style={styles.dateText}>
                Print: {new Date().toLocaleDateString()} {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
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
              
              {/* === ORIGIN + AREA DE TRABAJO === */}
              <View style={{ ...styles.infoCard, flex: 0.5 }}>
                <Text style={styles.infoLabel}>Origin</Text>
                <Text style={styles.infoValue}>{ordFrom}</Text>
                {/* Texto agregado */}
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
                    {/* @ts-ignore */}
                    <Text style={{ ...styles.moText, flex: 2, fontWeight: 'bold' }} maxLines={1}>{mo.replace('7605-', '...')}</Text>
                    {/* @ts-ignore */}
                    <Text style={{ ...styles.moText, flex: 1.5 }} maxLines={1}>{Array.from(data.sizes).join(',')}</Text>
                    <Text style={{ ...styles.moText, flex: 1, textAlign: 'right' }}>{data.qty}</Text>
                  </View>
                ))}
                <View style={styles.totalRow}>
                  <Text style={{ ...styles.moText, flex: 3.5, fontWeight: 'bold' }}>TOTAL</Text>
                  <Text style={{ ...styles.moText, flex: 1, textAlign: 'right', fontWeight: 'bold' }}>{totalQty}</Text>
                </View>
              </View>

              <View style={styles.imageContainer}>
                  <Image 
                    style={styles.sampleImage} 
                    src={STATIC_IMAGE_PATH} 
                  />
              </View>
            </View>

            <View style={styles.tableContainer}>
              <View style={styles.tableHeader}>
                <Text style={{ ...styles.th, flex: 0.7 }}>Sorting</Text>
                <Text style={{ ...styles.th, flex: 0.6 }}>Lot</Text>
                <Text style={{ ...styles.th, flex: 1.0 }}>Color By</Text>
                <Text style={{ ...styles.th, flex: 1.1 }}>Un_Key</Text>
                <Text style={{ ...styles.th, flex: 0.35 }}>Unit</Text>
                
                {/* G. NAME - Ancho Dinámico */}
                <Text style={{ ...styles.th, flex: gNameFlex, textAlign: 'left', paddingLeft: 4 }}>G. Name</Text> 
                
                <Text style={{ ...styles.th, flex: 1.0 }}>Style</Text>
                <Text style={{ ...styles.th, flex: 1.2, textAlign: 'left', paddingLeft: 4 }}>Color</Text>
                <Text style={{ ...styles.th, flex: 1.0 }}>Barcode</Text>
                
                {/* UNIT antes de Qty */}
                <Text style={{ ...styles.th, flex: 0.35 }}>Unit</Text>
                <Text style={{ ...styles.th, flex: 0.5 }}>Qty</Text>
                
                <Text style={{ ...styles.th, flex: 0.8 }}>Size</Text>
                
                {/* PRECIOS */}
                <Text style={{ ...styles.th, flex: 0.5 }}>Price</Text>
                {hasPrice2 && <Text style={{ ...styles.th, flex: 0.5 }}>Price 2</Text>}
                
                <Text style={{ ...styles.th, flex: 0.35 }}>Fmt</Text>
                <Text style={{ ...styles.th, flex: 0.35, borderRightWidth: 0 }}>QC</Text>
              </View>

              {rows.map((row, idx) => {
                return (
                <View
                  key={idx}
                  style={{
                    ...styles.tableRow,
                    backgroundColor: idx % 2 === 0 ? 'white' : '#f8fafc',
                  }}
                >
                  {/* @ts-ignore */}
                  <Text style={{ ...styles.td, ...styles.tdCenter, flex: 0.7 }} maxLines={1}>{String(row.Sorting_No || '')}</Text>
                  {/* @ts-ignore */}
                  <Text style={{ ...styles.td, ...styles.tdCenter, flex: 0.6 }} maxLines={1}>{String(row.Lot_No || '')}</Text>
                  {/* @ts-ignore */}
                  <Text style={{ ...styles.td, ...styles.tdLeft, flex: 1.0 }} maxLines={1}>{String(row.color_by || '')}</Text>
                  {/* @ts-ignore */}
                  <Text style={{ ...styles.td, ...styles.tdCenter, flex: 1.1 }} maxLines={1}>{String(row.Un_Key || '')}</Text>
                  
                  {/* G. NAME */}
                  {/* @ts-ignore */}
                  <Text style={{ ...styles.td, ...styles.tdLeft, flex: gNameFlex }} maxLines={1}>{String(row.g_name || '')}</Text>
                  
                  {/* @ts-ignore */}
                  <Text style={{ ...styles.td, ...styles.tdLeft, flex: 1.0 }} maxLines={1}>{String(row.g_style || '')}</Text>
                  {/* @ts-ignore */}
                  <Text style={{ ...styles.td, ...styles.tdLeft, flex: 1.2 }} maxLines={1}>{String(row.g_color || '')}</Text>
                  {/* @ts-ignore */}
                  <Text style={{ ...styles.td, ...styles.tdCenter, flex: 1.0 }} maxLines={1}>{String(row.barcode || '')}</Text>
                  
                  {/* @ts-ignore */}
                  <Text style={{ ...styles.td, ...styles.tdCenter, flex: 0.35 }} maxLines={1}>{String(row.Unit || 'PCS')}</Text>
                  
                  {/* CANTIDAD */}
                  {/* @ts-ignore */}
                  <Text style={{ ...styles.td, ...styles.tdCenter, flex: 0.5, fontWeight: 'bold' }} maxLines={1}>
                    {String(row.Qty_Original !== undefined ? row.Qty_Original : (row.Qty_Total || ''))}
                  </Text>
                  
                  {/* @ts-ignore */}
                  <Text style={{ ...styles.td, ...styles.tdCenter, flex: 0.8 }} maxLines={1}>{String(row.Size || row.size || row.us_size || '')}</Text>
                  
                  {/* PRECIO 1 */}
                  {/* @ts-ignore */}
                  <Text style={{ ...styles.td, ...styles.tdCenter, flex: 0.5 }} maxLines={1}>{String(row.Price || row.price || '')}</Text>
                  
                  {/* PRECIO 2 (Opcional) */}
                  {hasPrice2 && (
                    /* @ts-ignore */
                    <Text style={{ ...styles.td, ...styles.tdCenter, flex: 0.5 }} maxLines={1}>{String(row.Price2 || row.price2 || '')}</Text>
                  )}
                  
                  {/* @ts-ignore */}
                  <Text style={{ ...styles.td, ...styles.tdCenter, flex: 0.35 }} maxLines={1}>{String(row.format || '')}</Text>
                  
                  {/* QC */}
                  <View style={{ ...styles.td, flex: 0.35, borderRightWidth: 0 }} />
                </View>
              )})}
            </View>
          </Page>
        );
      })}
    </Document>
  );
};

// ==================== 3. COMPONENTE PRINCIPAL ====================
export default function PDFRFIDGenerator() {
  const [allFiles, setAllFiles] = useState<FileWithPath[]>([]);
  const [folderListText, setFolderListText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPdfGenerating, setIsPdfGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [consolidatedData, setConsolidatedData] = useState<ExcelRow[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleFolderUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const files = Array.from(event.target.files) as FileWithPath[];
      const validFiles = files.filter((f) => f.name.match(/\.(xlsx|xls)$/i) && !f.name.startsWith('~$'));

      if (validFiles.length === 0) {
        setError('No se encontraron archivos Excel.');
        return;
      }
      setAllFiles(validFiles);
      setConsolidatedData([]);
      setShowPreview(false);
      setError(null);
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
    if (filesToProcess.length === 0) {
      setError('No hay archivos coincidentes.');
      return;
    }
    setIsProcessing(true);
    setError(null);
    let allData: ExcelRow[] = [];
    try {
      for (const file of filesToProcess) {
        const fileData = await file.arrayBuffer();
        const workbook = XLSX.read(fileData);
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json<ExcelRow>(sheet, { defval: '' });
        allData = allData.concat(json);
      }
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
      const blob = await pdf(<RFIDDocument data={consolidatedData} />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `RFID_Report_${Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error al generar PDF:', error);
      setError('Error crítico generando el PDF. Ver consola.');
    } finally {
      setIsPdfGenerating(false);
    }
  };

  return (
    <main className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <Button variant="ghost" asChild className="text-indigo-700 hover:bg-indigo-100">
          <a href="/">
            <ArrowLeft className="mr-2 h-4 w-4" /> Volver
          </a>
        </Button>
        <h1 className="text-3xl font-bold text-indigo-700 flex items-center gap-3">
          <Package className="h-8 w-8" /> Generador PDF RFID
        </h1>
        <div className="w-32"></div>
      </div>

      <div className="grid gap-6">
        <Card className="border-l-4 border-l-blue-500 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FolderSearch className="text-blue-500" /> Paso 1: Carpeta Raíz
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button asChild variant="secondary" size="lg">
              <label className="cursor-pointer">
                <FolderSearch className="mr-2 h-4 w-4" /> Seleccionar Carpeta
                <Input type="file" className="hidden" {...({ webkitdirectory: '', directory: '' } as any)} onChange={handleFolderUpload} />
              </label>
            </Button>
            {allFiles.length > 0 && <span className="ml-4 text-sm font-bold text-green-600">{allFiles.length} archivos encontrados</span>}
            
            <div className="mt-4 text-xs text-gray-500">
              <Eye className="inline h-3 w-3 mr-1"/>
              Imagen estática: <strong>{STATIC_IMAGE_PATH}</strong> (Debe existir en public/images/)
            </div>
          </CardContent>
        </Card>

        <Card className={`border-l-4 shadow-lg ${filesToProcess.length > 0 ? 'border-l-green-500' : ''}`}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <List className="text-green-500" /> Paso 2: Lista de Carpetas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder={`7605D009792\n7605D009793\n7605D009794`}
              className="font-mono h-40"
              value={folderListText}
              onChange={(e) => setFolderListText(e.target.value)}
            />
            <div className="mt-2 flex justify-end">
              <Button onClick={processFiles} disabled={filesToProcess.length === 0 || isProcessing} className="bg-green-600 hover:bg-green-700">
                {isProcessing ? (
                  <>
                    <Loader2 className="animate-spin mr-2" /> Procesando...
                  </>
                ) : (
                  <>
                    <Eye className="mr-2" /> Procesar ({filesToProcess.length})
                  </>
                )}
              </Button>
            </div>
            {error && (
              <Alert variant="destructive" className="mt-4">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {showPreview && consolidatedData.length > 0 && isClient && (
          <Card className="border-l-4 border-l-indigo-500 bg-indigo-50">
            <CardHeader>
              <CardTitle className="text-indigo-700 flex gap-2">
                <CheckCircle2 /> Listo para descargar
              </CardTitle>
              <CardDescription>{consolidatedData.length} registros listos.</CardDescription>
            </CardHeader>
            <CardFooter>
              <Button 
                size="lg" 
                className="w-full bg-indigo-600 hover:bg-indigo-700 h-14" 
                onClick={handleDownloadPDF} 
                disabled={isPdfGenerating}
              >
                {isPdfGenerating ? (
                  <>
                    <Loader2 className="animate-spin mr-2" /> Generando PDF...
                  </>
                ) : (
                  <>
                    <FileDown className="mr-2 h-5 w-5" /> Descargar PDF RFID
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </main>
  );
}