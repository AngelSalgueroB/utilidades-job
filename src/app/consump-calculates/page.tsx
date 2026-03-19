"use client";

import { useState } from 'react';
import { ArrowLeft, Calculator, Printer, Ruler, Scroll, Info, AlertCircle, TableProperties, Copy, X, Check, CheckCircle2, Hash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// --- CONSTANTES DE DATOS ---
const PRINTERS = [
  { id: '1', name: 'Zebra R110Xi4', head: 'FLAT HEAD' },
  { id: '2', name: 'Zebra ZT610R', head: 'FLAT HEAD' },
  { id: '3', name: 'UL-04SF', head: 'EDGE HEAD' },
  { id: '4', name: 'SML FP300', head: 'FLAT HEAD' },
  { id: '5', name: 'Mercury', head: 'FLAT HEAD' },
  { id: '6', name: 'Pronto', head: 'FLAT HEAD' },
];

const RIBBONS = [
  { id: 'DYHF125WR4060', width: '40', length: '600', desc: 'DYHF125WR4060 / HF12.5 40mm x 600m (IN) WAX/RESIN NEAR EDGE' },
  { id: 'DYHF125WR8060', width: '80', length: '600', desc: 'DYHF125WR8060 / HF12.5 80mm x 600m (IN) WAX/RESIN NEAR EDGE' },
  { id: 'DYLA3WR5545', width: '55', length: '450', desc: 'DYLA3WR5545 / LA3 PLUS 55mm x 450m (IN) WAX/RESIN FLAT HEAD' },
  { id: 'DYLA3WR8045', width: '80', length: '450', desc: 'DYLA3WR8045 / LA3 PLUS 80mm x 450m (IN) WAX/RESIN FLAT HEAD' },
  { id: 'DYLA3WR8545', width: '85', length: '450', desc: 'DYLA3WR8545 / LA3 PLUS 85mm x 450m (IN) WAX/RESIN FLAT HEAD' },
  { id: 'DYLA7WR6045', width: '60', length: '450', desc: 'DYLA7WR6045 / LA7 PLUS 60mm x 450 m (IN) WAX/RESIN FLAT HEAD' },
  { id: 'DYLA7WR8545', width: '85', length: '450', desc: 'DYLA7WR8545 / LA7 PLUS 85mm x 450m (IN)' },
];

export default function ConsumpCalculatesPage() {
  // --- ESTADOS ---

  // 0. Máquina (Printer)
  const [selectedPrinterId, setSelectedPrinterId] = useState<string>(PRINTERS[0].id);
  
  // 1. Producción
  const [productCode, setProductCode] = useState<string>(''); 
  const [productionQty, setProductionQty] = useState<string>('');
  const [labelsAcross, setLabelsAcross] = useState<string>(''); 
  const [wasteScrap, setWasteScrap] = useState<string>('3'); 

  // 2. Etiqueta / Producto
  const [itemRm, setItemRm] = useState<string>(''); 
  const [labelHeight, setLabelHeight] = useState<string>(''); 
  const [labelGap, setLabelGap] = useState<string>('2'); 
  const [labelWidth, setLabelWidth] = useState<string>('50'); 

  // 3. Ribbon / Material
  const [selectedRibbonId, setSelectedRibbonId] = useState<string>('CUSTOM'); 
  const [ribbonLength, setRibbonLength] = useState<string>('450'); 
  const [ribbonWidth, setRibbonWidth] = useState<string>('80'); 

  // --- ESTADOS PARA MODAL Y ALERTAS ---
  const [showModal, setShowModal] = useState<boolean>(false);
  const [copySuccess, setCopySuccess] = useState<boolean>(false);

  // --- MANEJADORES DE CAMBIOS ---
  const handleRibbonSelect = (id: string) => {
    setSelectedRibbonId(id);
    if (id !== 'CUSTOM') {
      const ribbon = RIBBONS.find(r => r.id === id);
      if (ribbon) {
        setRibbonWidth(ribbon.width);
        setRibbonLength(ribbon.length);
      }
    }
  };

  const handleManualRibbonChange = (setter: React.Dispatch<React.SetStateAction<string>>, value: string) => {
    setter(value);
    setSelectedRibbonId('CUSTOM');
  };

  // --- CONVERSIÓN A NÚMEROS ---
  const numProductionQty = parseFloat(productionQty) || 0;
  const numLabelsAcross = parseFloat(labelsAcross) || 1; 
  const numWasteScrap = parseFloat(wasteScrap) || 0;
  
  const numLabelHeight = parseFloat(labelHeight) || 0;
  const numLabelGap = parseFloat(labelGap) || 0;
  const numLabelWidth = parseFloat(labelWidth) || 0;
  
  const numRibbonLength = parseFloat(ribbonLength) || 1; 
  const numRibbonWidth = parseFloat(ribbonWidth) || 0;

  // --- LÓGICA DE CÁLCULO ---
  const safeAcross = numLabelsAcross > 0 ? numLabelsAcross : 1;
  const safeRibbonLength = numRibbonLength > 0 ? numRibbonLength : 1;

  const pitchMm = numLabelHeight + numLabelGap;
  const totalRows = Math.ceil(numProductionQty / safeAcross);
  const linearMetersNet = (totalRows * pitchMm) / 1000;
  const linearMetersWithWaste = linearMetersNet * (1 + (numWasteScrap / 100));

  const rollsNeededRaw = linearMetersWithWaste / safeRibbonLength;
  const rollsNeededRounded = Math.ceil(rollsNeededRaw);

  const totalPrintWidth = numLabelWidth * safeAcross;
  const isRibbonTooNarrow = totalPrintWidth > numRibbonWidth;

  const selectedPrinter = PRINTERS.find(p => p.id === selectedPrinterId);
  const getRibbonDescription = () => {
      if (selectedRibbonId === 'CUSTOM') return `Rollo Personalizado (${numRibbonWidth}mm x ${numRibbonLength}m)`;
      return RIBBONS.find(r => r.id === selectedRibbonId)?.desc || '';
  };

  // --- FUNCIÓN PARA COPIAR TABLA ---
  const copyTableToClipboard = () => {
    const table = document.getElementById("report-table");
    if (table) {
      const range = document.createRange();
      range.selectNode(table);
      window.getSelection()?.removeAllRanges();
      window.getSelection()?.addRange(range);
      
      try {
        document.execCommand("copy");
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 3000); 
      } catch (err) {
        console.error("Error al copiar", err);
      }
      window.getSelection()?.removeAllRanges();
    }
  };

  return (
    <main className="container mx-auto px-4 py-8 max-w-5xl relative">
      
      {/* --- MODAL DEL CUADRO RESUMEN --- */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 transition-opacity">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] border border-slate-200 dark:border-slate-700 animate-in zoom-in-95 duration-200">
            
            {/* Header Modal Monocromático */}
            <div className="flex justify-between items-center bg-slate-800 dark:bg-slate-950 p-4 text-white shadow-md z-10 border-b border-slate-700">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <TableProperties className="h-6 w-6" /> Cuadro Resumen de Consumo
              </h2>
              <button onClick={() => setShowModal(false)} className="hover:bg-slate-700 p-1 rounded-full transition-colors">
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Contenido de la Tabla (Estilos Inline Monocromáticos para Portapapeles) */}
            <div className="p-6 overflow-y-auto bg-slate-50 dark:bg-slate-900 flex-grow">
              <table 
                id="report-table" 
                style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'Arial, sans-serif', fontSize: '14px', border: '1px solid #94a3b8' }}
              >
                {/* SECCIÓN: ITEM */}
                <thead>
                  <tr>
                    <th colSpan={2} style={{ backgroundColor: '#334155', color: '#ffffff', padding: '10px', textAlign: 'left', border: '1px solid #94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>
                      Item
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ padding: '8px', border: '1px solid #94a3b8', backgroundColor: '#f1f5f9', fontWeight: 'bold', width: '40%', color: '#1e293b' }}>Product Code</td>
                    <td style={{ padding: '8px', border: '1px solid #94a3b8', color: '#000000', fontWeight: 'bold' }}>{productCode || '-'}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '8px', border: '1px solid #94a3b8', backgroundColor: '#f1f5f9', fontWeight: 'bold', color: '#1e293b' }}>Cantidad Total</td>
                    <td style={{ padding: '8px', border: '1px solid #94a3b8', color: '#000000' }}>{numProductionQty.toLocaleString('en-US')} unds</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '8px', border: '1px solid #94a3b8', backgroundColor: '#f1f5f9', fontWeight: 'bold', color: '#1e293b' }}>Columnas (Across)</td>
                    <td style={{ padding: '8px', border: '1px solid #94a3b8', color: '#000000' }}>{numLabelsAcross}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '8px', border: '1px solid #94a3b8', backgroundColor: '#f1f5f9', fontWeight: 'bold', color: '#1e293b' }}>Merma / Scrap</td>
                    <td style={{ padding: '8px', border: '1px solid #94a3b8', color: '#000000' }}>{numWasteScrap}%</td>
                  </tr>
                </tbody>

                {/* SECCIÓN: ESPECIFICACIONES */}
                <thead>
                  <tr>
                    <th colSpan={2} style={{ backgroundColor: '#354152', color: '#ffffff', padding: '10px', textAlign: 'left', border: '1px solid #94a3b8', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '10px' }}>
                      Especificaciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ padding: '8px', border: '1px solid #94a3b8', backgroundColor: '#f1f5f9', fontWeight: 'bold', color: '#1e293b' }}>Item RM</td>
                    <td style={{ padding: '8px', border: '1px solid #94a3b8', color: '#000000', fontWeight: 'bold' }}>{itemRm || '-'}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '8px', border: '1px solid #94a3b8', backgroundColor: '#f1f5f9', fontWeight: 'bold', color: '#1e293b' }}>Impresora Asignada</td>
                    <td style={{ padding: '8px', border: '1px solid #94a3b8', color: '#000000' }}>
                        <strong>{selectedPrinter?.name}</strong> <span style={{ color: '#475569', fontSize: '12px' }}>({selectedPrinter?.head})</span>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: '8px', border: '1px solid #94a3b8', backgroundColor: '#f1f5f9', fontWeight: 'bold', color: '#1e293b' }}>Dimensión Etiqueta</td>
                    <td style={{ padding: '8px', border: '1px solid #94a3b8', color: '#000000' }}>{numLabelWidth} x {numLabelHeight} mm</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '8px', border: '1px solid #94a3b8', backgroundColor: '#f1f5f9', fontWeight: 'bold', color: '#1e293b' }}>Gap</td>
                    <td style={{ padding: '8px', border: '1px solid #94a3b8', color: '#000000' }}>{numLabelGap} mm</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '8px', border: '1px solid #94a3b8', backgroundColor: '#e2e8f0', color: '#0f172a', fontWeight: 'bold' }}>Total Height</td>
                    <td style={{ padding: '8px', border: '1px solid #94a3b8', backgroundColor: '#e2e8f0', color: '#0f172a', fontWeight: 'bold' }}>{pitchMm.toFixed(2)} mm</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '8px', border: '1px solid #94a3b8', backgroundColor: '#f1f5f9', fontWeight: 'bold', color: '#1e293b' }}>Ribbon / Tinta</td>
                    <td style={{ padding: '8px', border: '1px solid #94a3b8', fontSize: '13px', color: '#000000' }}>{getRibbonDescription()}</td>
                  </tr>
                </tbody>

                {/* SECCIÓN: RESULTADOS */}
                <thead>
                  <tr>
                    <th colSpan={2} style={{ backgroundColor: 'grey', color: '#ffffff', padding: '10px', textAlign: 'left', border: '1px solid #94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>
                      Resultados
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ padding: '8px', border: '1px solid #94a3b8', backgroundColor: '#f8fafc', fontWeight: 'bold', color: '#334155' }}>Metros Lineales (Neto)</td>
                    <td style={{ padding: '8px', border: '1px solid #94a3b8', backgroundColor: '#ffffff', color: '#000000' }}>{linearMetersNet.toLocaleString('en-US', { maximumFractionDigits: 2 })} m</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '8px', border: '1px solid #94a3b8', backgroundColor: '#f8fafc', fontWeight: 'bold', color: '#334155' }}>Metros (con Merma)</td>
                    <td style={{ padding: '8px', border: '1px solid #94a3b8', backgroundColor: '#ffffff', color: '#000000', fontWeight: 'bold' }}>{linearMetersWithWaste.toLocaleString('en-US', { maximumFractionDigits: 2 })} m</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '12px 8px', border: '1px solid #94a3b8', backgroundColor: '#e2e8f0', fontWeight: 'bold', color: '#0f172a', fontSize: '16px', textTransform: 'uppercase' }}>Ribbon Requeridos</td>
                    <td style={{ padding: '12px 8px', border: '1px solid #94a3b8', backgroundColor: '#e2e8f0', color: '#000000', fontSize: '20px', fontWeight: 'bold' }}>
                      {rollsNeededRounded} pcs <span style={{ fontSize: '12px', fontWeight: 'normal', color: '#475569' }}>({rollsNeededRaw.toFixed(2)})</span>
                    </td>
                  </tr>
                </tbody>
              </table>
              <p className="text-xs text-slate-500 mt-4 text-center font-medium">
                * Los cálculos asumen configuración ideal y avance sin saltos de cabezal.
              </p>
            </div>

            <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 flex justify-between items-center gap-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-10">
              <div className="flex items-center text-sm font-bold text-emerald-600 transition-opacity duration-300" style={{ opacity: copySuccess ? 1 : 0 }}>
                <CheckCircle2 className="h-5 w-5 mr-1" /> ¡Copiado al portapapeles!
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowModal(false)} className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">
                  Cerrar
                </Button>
                <Button onClick={copyTableToClipboard} className={`${copySuccess ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600'} text-white shadow-md transition-colors`}>
                  {copySuccess ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />} 
                  {copySuccess ? 'Copiado' : 'Copiar Tabla'}
                </Button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* --- CABECERA PRINCIPAL --- */}
      <div className="flex items-center justify-between mb-8">
        <Button variant="ghost" asChild className="text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800">
          <a href="/">
            <ArrowLeft className="mr-2 h-4 w-4" /> Volver al Menú
          </a>
        </Button>
        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-3">
          <Calculator className="h-8 w-8" /> Consump Ribbon Calculates
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* --- COLUMNA IZQUIERDA: FORMULARIO --- */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* TARJETA 0: MÁQUINAS / IMPRESORAS */}
          <Card className="border-2 border-slate-300 dark:border-slate-700 shadow-sm">
            <CardHeader className="pb-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
              <CardTitle className="flex items-center text-lg text-slate-800 dark:text-slate-200">
                <Printer className="mr-2 h-5 w-5" /> Selección de Impresora
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {PRINTERS.map(printer => (
                  <Button
                    key={printer.id}
                    variant={selectedPrinterId === printer.id ? 'default' : 'outline'}
                    onClick={() => setSelectedPrinterId(printer.id)}
                    className={`h-14 flex flex-col items-center justify-center border-slate-300 dark:border-slate-600 ${selectedPrinterId === printer.id ? 'bg-slate-800 text-white hover:bg-slate-900 dark:bg-slate-200 dark:text-slate-900 shadow-md border-transparent' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                  >
                    <span className="font-bold">{printer.name}</span>
                    <span className={`text-[10px] ${selectedPrinterId === printer.id ? 'text-slate-300 dark:text-slate-600' : 'text-slate-400 dark:text-slate-500'} font-mono`}>
                        {printer.head}
                    </span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* TARJETA 1: DATOS DE PRODUCCIÓN */}
          <Card className="border-2 border-slate-300 dark:border-slate-700 shadow-sm">
            <CardHeader className="pb-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
              <CardTitle className="flex items-center text-lg text-slate-800 dark:text-slate-200">
                <Calculator className="mr-2 h-5 w-5" /> 1. Datos de Producción
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="prodCode" className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <Hash className="h-3 w-3"/> Prod. Code
                </Label>
                <Input id="prodCode" type="text" value={productCode} onChange={(e) => setProductCode(e.target.value)} className="bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="qty" className="font-bold text-slate-700 dark:text-slate-300 truncate">Cant. Total</Label>
                  <Input id="qty" type="number" value={productionQty} onChange={(e) => setProductionQty(e.target.value)} className="font-semibold bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="across" className="font-bold text-slate-700 dark:text-slate-300 text-sm truncate">Across</Label>
                  <Input id="across" type="number" min="1" value={labelsAcross} onChange={(e) => setLabelsAcross(e.target.value)} className="bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="waste" className="font-bold text-slate-700 dark:text-slate-300 text-sm truncate">Merma (%)</Label>
                  <Input id="waste" type="number" min="0" step="any" value={wasteScrap} onChange={(e) => setWasteScrap(e.target.value)} className="bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* TARJETA 2: DIMENSIONES DEL PRODUCTO */}
          <Card className="border-2 border-slate-300 dark:border-slate-700 shadow-sm">
            <CardHeader className="pb-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
              <CardTitle className="flex items-center text-lg text-slate-800 dark:text-slate-200">
                <Ruler className="mr-2 h-5 w-5" /> 2. Dimensiones de Etiqueta
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="itemRm" className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <Hash className="h-3 w-3"/> Item RM
                </Label>
                <Input id="itemRm" type="text" value={itemRm} onChange={(e) => setItemRm(e.target.value)} className="bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="height" className="font-bold text-slate-700 dark:text-slate-300 text-sm truncate">Alto (mm)</Label>
                  <Input id="height" type="number" step="any" value={labelHeight} onChange={(e) => setLabelHeight(e.target.value)} className="bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gap" className="font-bold text-slate-700 dark:text-slate-300 text-sm truncate">Gap (mm)</Label>
                  <Input id="gap" type="number" step="any" value={labelGap} onChange={(e) => setLabelGap(e.target.value)} className="bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="width" className="font-bold text-slate-700 dark:text-slate-300 text-sm truncate">Ancho (mm)</Label>
                  <Input id="width" type="number" step="any" value={labelWidth} onChange={(e) => setLabelWidth(e.target.value)} className="bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* TARJETA 3: DATOS DEL RIBBON */}
          <Card className="border-2 border-slate-300 dark:border-slate-700 shadow-sm">
            <CardHeader className="pb-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
              <CardTitle className="flex items-center text-lg text-slate-800 dark:text-slate-200">
                <Scroll className="mr-2 h-5 w-5" /> 3. Formato del Ribbon / Tinta
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div className="space-y-2">
                  <Label className="font-bold text-slate-700 dark:text-slate-300 text-sm">Seleccionar Insumo Estándar</Label>
                  <Select value={selectedRibbonId} onValueChange={handleRibbonSelect}>
                    <SelectTrigger className="w-full bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-600">
                        <SelectValue placeholder="Elige un formato de Ribbon" />
                    </SelectTrigger>
                    <SelectContent>
                        {RIBBONS.map(ribbon => (
                            <SelectItem key={ribbon.id} value={ribbon.id} className="text-xs">
                                {ribbon.desc}
                            </SelectItem>
                        ))}
                        <SelectItem value="CUSTOM" className="text-xs font-bold text-slate-900 dark:text-slate-100">
                            + Medidas Personalizadas
                        </SelectItem>
                    </SelectContent>
                  </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="rLength" className="font-bold text-slate-700 dark:text-slate-300 text-sm">Largo del Rollo (Metros)</Label>
                    <Input id="rLength" type="number" step="any" value={ribbonLength} onChange={(e) => handleManualRibbonChange(setRibbonLength, e.target.value)} className="bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="rWidth" className="font-bold text-slate-700 dark:text-slate-300 text-sm">Ancho del Rollo (mm)</Label>
                    <Input id="rWidth" type="number" step="any" value={ribbonWidth} onChange={(e) => handleManualRibbonChange(setRibbonWidth, e.target.value)} className="bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600" />
                </div>
              </div>
            </CardContent>
          </Card>

        </div>

        {/* --- COLUMNA DERECHA: RESULTADOS --- */}
        <div className="space-y-6">
          <Card className="shadow-lg border-2 border-slate-300 dark:border-slate-700 bg-gradient-to-b from-white to-slate-100 dark:from-slate-900 dark:to-slate-800/50 sticky top-6">
            <CardHeader className="border-b border-slate-200 dark:border-slate-700 pb-4">
              <CardTitle className="text-2xl text-center text-slate-800 dark:text-slate-100">
                Resultados
              </CardTitle>
              <CardDescription className="text-center">Consumo proyectado</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              
              <div className="text-center">
                <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Ribbon Requeridos</p>
                <div className="flex justify-center items-baseline gap-1">
                  <p className="text-6xl font-black text-slate-800 dark:text-slate-100 drop-shadow-sm">
                    {rollsNeededRounded}
                  </p>
                  <span className="text-xl font-bold text-slate-600 dark:text-slate-400">pcs</span>
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  (Cálculo exacto: {rollsNeededRaw.toFixed(2)} pcs)
                </p>
              </div>

              <div className="h-px bg-slate-200 dark:bg-slate-700 w-full my-4"></div>

              <div className="space-y-3">
                <div className="flex justify-between items-center bg-white dark:bg-slate-800 p-2 rounded border border-slate-200 dark:border-slate-600 shadow-sm">
                  <span className="text-sm text-slate-600 dark:text-slate-300 font-medium">Total Height:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-100">{pitchMm.toFixed(2)} mm</span>
                </div>
                
                <div className="flex justify-between items-center bg-white dark:bg-slate-800 p-2 rounded border border-slate-200 dark:border-slate-600 shadow-sm">
                  <span className="text-sm text-slate-600 dark:text-slate-300 font-medium">Metros Lineales (Neto):</span>
                  <span className="font-bold text-slate-800 dark:text-slate-100">{linearMetersNet.toLocaleString('en-US', { maximumFractionDigits: 0 })} m</span>
                </div>

                <div className="flex justify-between items-center bg-slate-200 dark:bg-slate-700 p-2 rounded border border-slate-300 dark:border-slate-600 shadow-sm">
                  <span className="text-sm text-slate-800 dark:text-slate-200 font-bold">Total con Merma ({numWasteScrap}%):</span>
                  <span className="font-black text-slate-900 dark:text-white">{linearMetersWithWaste.toLocaleString('en-US', { maximumFractionDigits: 0 })} m</span>
                </div>
              </div>

            </CardContent>
            
            <CardFooter className="bg-slate-100 dark:bg-slate-800/80 p-4 border-t border-slate-200 dark:border-slate-700 flex flex-col gap-4 rounded-b-xl">
                <div className="w-full">
                    {isRibbonTooNarrow ? (
                        <Alert variant="destructive" className="bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-900">
                            <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                            <AlertDescription className="text-xs text-red-800 dark:text-red-300 font-medium ml-2">
                                ¡Peligro! El Ribbon ({numRibbonWidth}mm) es más angosto que el área de impresión ({totalPrintWidth}mm).
                            </AlertDescription>
                        </Alert>
                    ) : (
                        <Alert className="bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-900">
                            <Info className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                            <AlertDescription className="text-xs text-emerald-800 dark:text-emerald-300 font-medium ml-2">
                                Ancho de Ribbon OK. (Sobran {(numRibbonWidth - totalPrintWidth).toFixed(1)}mm)
                            </AlertDescription>
                        </Alert>
                    )}
                </div>

                <Button 
                  onClick={() => setShowModal(true)} 
                  className="w-full bg-slate-800 hover:bg-slate-900 dark:bg-slate-200 dark:hover:bg-white dark:text-slate-900 text-white shadow-md h-12 text-lg transition-transform active:scale-95"
                >
                  <TableProperties className="mr-2 h-5 w-5" /> Ver Cuadro Resumen
                </Button>

            </CardFooter>
          </Card>
        </div>

      </div>
    </main>
  );
}