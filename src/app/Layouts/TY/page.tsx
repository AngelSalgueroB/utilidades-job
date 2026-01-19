"use client";

import { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
//import bwipjs from 'bwip-js'; REVISAR!

import { Loader2, ArrowLeft, UploadCloud, Layers, Layout, FileImage, Settings, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { pdf, Document, Page, Text, View, StyleSheet, Image, Font } from '@react-pdf/renderer';
import { TY_LAYOUT_CONFIGS, LayoutConfig } from './config';

// === REGISTRO DE FUENTES (Simulación) ===
// Nota: Como no tenemos los archivos .ttf cargados, usamos Helvetica como base.
// Si subes las fuentes a la carpeta public/fonts/, descomenta estas líneas:
/*
Font.register({ family: 'UniversLight', src: '/fonts/UniversLTStd-Light.ttf' });
Font.register({ family: 'DaxRegular', src: '/fonts/Dax-Regular.ttf' });
*/

const FONTS = {
  light: 'Helvetica', // Reemplazar por 'UniversLight' cuando tengas la fuente
  regular: 'Helvetica', // Reemplazar por 'DaxRegular'
  bold: 'Helvetica-Bold'
};

// Tipo extendido para incluir la imagen del barcode generada
type LayoutRow = { 
  [key: string]: any;
  barcodeBase64?: string; 
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

// ==================== ESTILOS DEL STICKER (Medidas en Puntos/Pixels) ====================
const stickerStyles = StyleSheet.create({
    // Contenedor principal (Borde exterior negro)
    container: {
        width: 170, // Ancho aproximado (~6cm)
        height: 240, // Alto aproximado (~8.5cm)
        borderWidth: 1,
        borderColor: '#000000',
        padding: 8,
        flexDirection: 'column',
        alignItems: 'center', // Centrado horizontal
        justifyContent: 'flex-start',
        margin: 10, // Margen entre stickers en la hoja
        position: 'relative'
    },
    // TALLA (Univers LT Std 45 Light 23.0 Pt)
    sizeText: {
        fontFamily: FONTS.light,
        fontSize: 23,
        textAlign: 'center',
        marginTop: 5,
        marginBottom: 12,
    },
    // Bloque de datos (Alineado a la izquierda)
    infoBlock: {
        width: '100%',
        paddingHorizontal: 4,
        marginBottom: 8,
    },
    // Etiquetas (WAP STYLE, COLOR, LOT - 7.0 Pt)
    labelSmall: {
        fontFamily: FONTS.light,
        fontSize: 7,
        color: '#000000',
        textTransform: 'uppercase',
        marginBottom: 1,
    },
    // Valores (Datos - 10.0 Pt)
    valueMedium: {
        fontFamily: FONTS.light,
        fontSize: 10,
        color: '#000000',
        marginBottom: 8, // Espacio entre cada grupo de datos
    },
    // Contenedor del Barcode (Con borde propio)
    barcodeBox: {
        width: '95%',
        height: 65, // Altura suficiente para el código
        borderWidth: 1,
        borderColor: '#000000',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 2,
        marginTop: 2,
    },
    barcodeImage: {
        width: '90%',
        height: '85%',
        objectFit: 'contain',
    },
    barcodeText: {
        fontFamily: FONTS.regular,
        fontSize: 8,
        textAlign: 'center',
        marginTop: 2
    },
    // Cantidad (Abajo Izquierda)
    qtyText: {
        position: 'absolute',
        bottom: 3,
        left: 5,
        fontSize: 7,
        fontFamily: FONTS.light,
        color: '#000000'
    }
});

// ==================== COMPONENTE PDF VISUAL ====================
const LayoutPDF = ({ data }: { data: LayoutRow[] }) => {
    return (
        <Document>
            <Page size="A4" style={{ padding: 20, flexDirection: 'row', flexWrap: 'wrap', alignContent: 'flex-start' }}>
                {data.map((item, idx) => {
                    const size = getValue(item, ['size_des', 'Size', 'Size_Desc', 'size']);
                    const style = getValue(item, ['style', 'Style']); // WAP Style
                    const colorNum = getValue(item, ['color_num', 'Color_Num']);
                    const colorDesc = getValue(item, ['color', 'Color']);
                    const lot = getValue(item, ['Lot_no', 'Lot', 'lot']);
                    const qty = getValue(item, ['Qty_So', 'qty', 'Qty']);
                    
                    // Combinación de Color
                    const fullColor = `${colorNum || ''} ${colorDesc || ''}`.trim();

                    return (
                        <View key={idx} style={stickerStyles.container}>
                            {/* 1. TALLA */}
                            <Text style={stickerStyles.sizeText}>{size}</Text>

                            {/* 2. DATOS (Style, Color, Lot) */}
                            <View style={stickerStyles.infoBlock}>
                                <Text style={stickerStyles.labelSmall}>WAP STYLE</Text>
                                <Text style={stickerStyles.valueMedium}>{style}</Text>
                                
                                <Text style={stickerStyles.labelSmall}>COLOR</Text>
                                <Text style={stickerStyles.valueMedium}>{fullColor}</Text>
                                
                                <Text style={stickerStyles.labelSmall}>LOT</Text>
                                <Text style={stickerStyles.valueMedium}>{lot}</Text>
                            </View>

                            {/* 3. BARCODE CON CUADRO */}
                            <View style={stickerStyles.barcodeBox}>
                                {item.barcodeBase64 ? (
                                    <Image src={item.barcodeBase64} style={stickerStyles.barcodeImage} />
                                ) : (
                                    <Text style={{fontSize: 6}}>NO BARCODE</Text>
                                )}
                            </View>

                            {/* 4. CANTIDAD (Abajo Izquierda) */}
                            <Text style={stickerStyles.qtyText}>Qty: {qty}</Text>
                        </View>
                    );
                })}
            </Page>
        </Document>
    );
};

// ==================== PÁGINA PRINCIPAL ====================
export default function TYLayoutPage() {
  const [selectedLayoutId, setSelectedLayoutId] = useState<string>('ty_packing');
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [data, setData] = useState<LayoutRow[]>([]);
  const [isReady, setIsReady] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const currentConfig: LayoutConfig = TY_LAYOUT_CONFIGS[selectedLayoutId];

  // Generador de Barcode usando BWIP-JS
  const generateBarcode = async (text: string): Promise<string> => {
    return new Promise((resolve) => {
        try {
            const canvas = document.createElement('canvas');
            bwipjs.toCanvas(canvas, {
                bcid: 'upca',       // Tipo UPC-A
                text: text,         // Texto del código
                scale: 3,           // Escala de calidad
                height: 10,         // Altura relativa de barras
                includetext: true,  // Mostrar números abajo
                textxalign: 'center',
                textsize: 8,        // Tamaño fuente números (8pt)
                barwidth: 1         // Ancho de barra (ajustable)
            });
            resolve(canvas.toDataURL('image/png'));
        } catch (e) {
            // Si falla (ej: texto no numérico o longitud incorrecta), retornamos vacío
            resolve('');
        }
    });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setFiles(Array.from(event.target.files));
      setData([]);
      setIsReady(false);
    }
  };

  const processFiles = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);
    let processedData: LayoutRow[] = [];
    
    try {
      for (const file of files) {
        const buffer = await file.arrayBuffer();
        const wb = XLSX.read(buffer);
        const sheet = wb.Sheets[wb.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json<LayoutRow>(sheet, { defval: '' });
        
        // Generamos códigos de barras asíncronamente
        const rowsWithBarcodes = await Promise.all(json.map(async (row) => {
            // Buscamos UPC en varias columnas posibles
            const upc = getValue(row, ['upc', 'UPC', 'Barcode', 'barcode']);
            let barcodeImg = '';
            
            if (upc) {
                // Limpieza: UPC-A solo números
                const cleanUpc = String(upc).replace(/[^0-9]/g, '');
                // Generar solo si tiene longitud razonable (11 o 12 dígitos)
                if (cleanUpc.length >= 11 && cleanUpc.length <= 12) {
                    barcodeImg = await generateBarcode(cleanUpc);
                }
            }
            return { ...row, barcodeBase64: barcodeImg };
        }));

        processedData = processedData.concat(rowsWithBarcodes);
      }

      setData(processedData);
      setIsReady(true);
    } catch (error) {
      console.error("Error procesando:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGenerateLayout = async () => {
    setIsGenerating(true);
    try {
        const blob = await pdf(<LayoutPDF data={data} />).toBlob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `TY_LAYOUT_${selectedLayoutId}_${Date.now()}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } catch (e) {
        console.error(e);
    } finally {
        setIsGenerating(false);
    }
  };

  return (
    <main className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <Button variant="ghost" asChild className="text-violet-700 hover:bg-violet-50">
          <a href="/Layouts"><ArrowLeft className="mr-2 h-4 w-4" /> Volver a Layouts</a>
        </Button>
        <h1 className="text-3xl font-bold text-violet-700 flex items-center gap-3">
          <Layout className="h-8 w-8" /> Generador TY Layouts
        </h1>
        
        <div className="w-72">
            <Label className="text-xs text-slate-500 mb-1 block font-bold">TIPO DE ETIQUETA:</Label>
            <Select value={selectedLayoutId} onValueChange={(val) => { setSelectedLayoutId(val); setData([]); setIsReady(false); }}>
                <SelectTrigger className="w-full border-violet-200 bg-white shadow-sm h-10 font-medium text-violet-900">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    {Object.values(TY_LAYOUT_CONFIGS).map(cfg => (
                        <SelectItem key={cfg.id} value={cfg.id}>{cfg.name}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COLUMNA IZQUIERDA */}
        <div className="lg:col-span-1 space-y-6">
            <Card className="border-l-4 border-l-violet-500 shadow-lg">
                <CardHeader>
                    <CardTitle className="text-violet-800 flex items-center gap-2">
                        <Settings className="h-5 w-5" /> Configuración
                    </CardTitle>
                    <CardDescription>{currentConfig?.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label className="text-sm font-bold text-slate-700">Cargar Datos (Excel)</Label>
                        <Button asChild variant="outline" className="w-full border-dashed border-2 border-violet-200 hover:bg-violet-50 hover:border-violet-400 h-24 flex flex-col gap-2">
                            <label className="cursor-pointer">
                                <UploadCloud className="h-8 w-8 text-violet-400" />
                                <span className="text-violet-600 font-medium">Click para subir Excel</span>
                                <Input type="file" className="hidden" multiple accept=".xlsx,.xls,.csv" onChange={handleFileUpload} />
                            </label>
                        </Button>
                        {files.length > 0 && (
                            <div className="text-xs text-center text-slate-500 font-medium">
                                {files.length} archivo(s) seleccionado(s)
                            </div>
                        )}
                    </div>
                </CardContent>
                <CardFooter>
                    <Button onClick={processFiles} disabled={files.length === 0 || isProcessing} className="w-full bg-violet-600 hover:bg-violet-700">
                        {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Layers className="mr-2 h-4 w-4" />}
                        {isProcessing ? 'Generando Barcodes...' : 'Procesar Datos'}
                    </Button>
                </CardFooter>
            </Card>
        </div>

        {/* COLUMNA DERECHA */}
        <div className="lg:col-span-2">
            {isReady ? (
                <Card className="border-t-4 border-t-green-500 shadow-lg h-full flex flex-col">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-green-700">
                            <CheckCircle2 className="h-6 w-6" /> Layout Generado
                        </CardTitle>
                        <CardDescription>
                            Se han generado {data.length} stickers listos para visualización.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow flex flex-col items-center justify-center bg-slate-50 m-6 border-2 border-dashed border-slate-200 rounded-xl min-h-[300px]">
                        <div className="text-center">
                            <FileImage className="h-16 w-16 text-green-500 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-slate-800">Visual Listo</h3>
                            <p className="text-slate-500 text-sm max-w-xs mx-auto mt-2">
                                Haz clic en descargar para ver el PDF con los stickers y códigos de barras.
                            </p>
                        </div>
                    </CardContent>
                    <CardFooter className="bg-slate-50 p-6 border-t border-slate-100">
                        <Button size="lg" className="w-full bg-green-600 hover:bg-green-700 text-lg h-14" onClick={handleGenerateLayout} disabled={isGenerating}>
                            {isGenerating ? <Loader2 className="animate-spin mr-2" /> : <FileImage className="mr-2 h-6 w-6" />}
                            Descargar PDF Visual
                        </Button>
                    </CardFooter>
                </Card>
            ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 p-12">
                    <Layers className="h-20 w-20 mb-4 opacity-20" />
                    <p className="text-lg font-medium">Sube el Excel para generar los visuales</p>
                </div>
            )}
        </div>

      </div>
    </main>
  );
}