"use client";

import { useState, useEffect } from "react";
import * as XLSX from "xlsx"; // <-- Importamos XLSX
import {
  ArrowLeft,
  Calculator,
  Plus,
  Trash2,
  FileDown,
  Settings2,
  Loader2,
  ListOrdered,
  FileSpreadsheet // <-- Ícono para Excel
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { pdf, Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";
import { Checkbox } from "@/components/ui/checkbox";

// === CONSTANTES ===
const PRINTERS = [
  "Zebra R110Xi4",
  "FP300",
  "UL-04SF (Avery Dennison)",
  "Mercury",
  "Avery 6404",
  "Pronto",
  "Zebra ZT610R"
];

const CLS_MACHINES = [
  "Machine CLS Cut Singles",
  "Machine CLS Roll-Form"
];

// === TIPOS DE DATOS ===
type RatioItem = {
  id: string;
  program: string;
  productNumber: string;
  printer: string;
  widthMm: number;
  lengthMm: number;
  printSpeed: number; 
  qtyPerHourPrint: number; 
  qtyPerDayPrint: number;
  hasCls: boolean;
  clsMachine: string;
  clsEncodeSpeed: number; 
  clsQcSpeed: number;     
  qtyPerHourCls: number; 
  qtyPerDayCls: number;
};

// === ESTILOS PARA EL PDF (ALINEACIÓN MATEMÁTICA PERFECTA) ===
const pdfStyles: any = StyleSheet.create({
  page: { padding: 30, fontFamily: "Helvetica", fontSize: 8, color: "#1e293b", backgroundColor: "#ffffff" },
  headerContainer: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", borderBottomWidth: 1, borderBottomColor: "#94a3b8", paddingBottom: 15, marginBottom: 20 },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 15 },
  logo: { width: 110, height: 35, objectFit: "contain" }, 
  title: { fontSize: 18, fontWeight: "bold", color: "#b91c1c", textTransform: "uppercase" },
  dateText: { fontSize: 9, color: "#64748b" },
  
  sectionTitle: { fontSize: 10, fontWeight: "bold", color: "#0f172a", marginBottom: 8, marginTop: 10 },
  
  tableContainer: { borderWidth: 1, borderColor: "#cbd5e1", borderRadius: 4, overflow: "hidden", marginBottom: 20 },
  
  // Cabecera Agrupada 
  groupHeaderRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#cbd5e1", alignItems: "stretch" },
  groupHeaderCell: { paddingVertical: 6, justifyContent: "center", alignItems: "center", borderRightWidth: 1, borderRightColor: "#cbd5e1" },
  groupHeaderText: { color: "#0f172a", fontWeight: "bold", fontSize: 7.5, textTransform: "uppercase" },

  // Fondos suaves pastel
  bgGeneral: { backgroundColor: "#fee2e2" },  
  bgPrinting: { backgroundColor: "#dcfce7" }, 
  bgCls: { backgroundColor: "#dbeafe" },      

  // Cabecera de Columnas
  tableHeader: { flexDirection: "row", alignItems: "stretch" }, 
  colHeader: { backgroundColor: "#f8fafc", borderBottomWidth: 2, borderBottomColor: "#dc2626" }, 
  
  // Filas
  tableRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#cbd5e1", backgroundColor: "#ffffff", alignItems: "stretch", minHeight: 22 },
  tableRowAlt: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#cbd5e1", backgroundColor: "#fafafa", alignItems: "stretch", minHeight: 22 },
  
  colBase: { paddingHorizontal: 3, paddingVertical: 4, borderRightWidth: 1, borderRightColor: "#cbd5e1", justifyContent: 'center' },
  colCenter: { alignItems: 'center' },

  // ANCHOS EXACTOS EN PORCENTAJES
  wGen: { width: "38%" },
  wProg: { width: "17%" }, 
  wProd: { width: "13%" }, 
  wSize: { width: "8%" }, 
  
  wPrint: { width: "28%" },
  wPrintMach: { width: "10%" },
  wPrintSpd: { width: "4%" }, 
  wPrintQty: { width: "7%" },  
  wPrintQtyDay: { width: "7%" },
  
  wCls: { width: "34%", borderRightWidth: 0 }, 
  wClsMach: { width: "10%" },
  wClsEnc: { width: "5%" }, 
  wClsQc: { width: "5%" }, 
  wClsQty: { width: "7%" },
  wClsQtyDay: { width: "7%", borderRightWidth: 0 },

  thText: { color: "#334155", fontWeight: "bold", fontSize: 5.5, textAlign: "center", textTransform: "uppercase" },
  tdTextCenter: { fontSize: 6.5, color: "#475569", textAlign: "center" },
  tdText: { fontSize: 6.5, color: "#334155" },
  tdTextBold: { fontSize: 6.5, fontWeight: "bold", color: "#0f172a" },
  tdHighlightDay: { fontSize: 7, fontWeight: "bold", color: "#b91c1c" }, 
  
  summaryBox: { padding: 12, backgroundColor: "#f8fafc", borderWidth: 1, borderColor: "#cbd5e1", borderRadius: 4, marginTop: 10 },
  summaryText: { fontSize: 7, color: "#475569", marginBottom: 4, lineHeight: 1.4 }
});

const formatNum = (num: number) => {
  return Math.round(num).toLocaleString('en-US');
};

// === COMPONENTE PDF ===
const RatiosReportPDF = ({ data, logoBase64, hoursPerDay }: { data: RatioItem[], logoBase64: string | null, hoursPerDay: number }) => (
  <Document>
    <Page size="A4" orientation="landscape" style={pdfStyles.page}>
      <View style={pdfStyles.headerContainer}>
        <View style={pdfStyles.headerLeft}>
          {logoBase64 ? <Image style={pdfStyles.logo} src={logoBase64} /> : <Text style={{fontSize: 18, fontWeight: 'bold', color: '#dc2626'}}>SML</Text>}
          <Text style={pdfStyles.title}>Production Ratios Report</Text>
        </View>
        <Text style={pdfStyles.dateText}>Generated: {new Date().toLocaleDateString()}</Text>
      </View>

      <Text style={pdfStyles.sectionTitle}>PRODUCTION CAPACITIES (Based on {hoursPerDay} hours/day)</Text>

      <View style={pdfStyles.tableContainer}>
        <View style={pdfStyles.groupHeaderRow}>
          <View style={[pdfStyles.groupHeaderCell, pdfStyles.bgGeneral, pdfStyles.wGen]}><Text style={pdfStyles.groupHeaderText}>General Information</Text></View>
          <View style={[pdfStyles.groupHeaderCell, pdfStyles.bgPrinting, pdfStyles.wPrint]}><Text style={pdfStyles.groupHeaderText}>Printing Process</Text></View>
          <View style={[pdfStyles.groupHeaderCell, pdfStyles.bgCls, pdfStyles.wCls]}><Text style={pdfStyles.groupHeaderText}>CLS Roll-Form / Cut Singles Process</Text></View>
        </View>

        <View style={pdfStyles.tableHeader}>
          <View style={[pdfStyles.colBase, pdfStyles.colCenter, pdfStyles.colHeader, pdfStyles.wProg]}><Text style={pdfStyles.thText}>Program</Text></View>
          <View style={[pdfStyles.colBase, pdfStyles.colCenter, pdfStyles.colHeader, pdfStyles.wProd]}><Text style={pdfStyles.thText}>Product Number</Text></View>
          <View style={[pdfStyles.colBase, pdfStyles.colCenter, pdfStyles.colHeader, pdfStyles.wSize]}><Text style={pdfStyles.thText}>Size{"\n"}(W x L mm)</Text></View>
          
          <View style={[pdfStyles.colBase, pdfStyles.colCenter, pdfStyles.colHeader, pdfStyles.wPrintMach]}><Text style={pdfStyles.thText}>Printer</Text></View>
          <View style={[pdfStyles.colBase, pdfStyles.colCenter, pdfStyles.colHeader, pdfStyles.wPrintSpd]}><Text style={pdfStyles.thText}>Speed{"\n"}(/s)</Text></View>
          <View style={[pdfStyles.colBase, pdfStyles.colCenter, pdfStyles.colHeader, pdfStyles.wPrintQty]}><Text style={pdfStyles.thText}>Qty / Hr</Text></View>
          <View style={[pdfStyles.colBase, pdfStyles.colCenter, pdfStyles.colHeader, pdfStyles.wPrintQtyDay]}><Text style={pdfStyles.thText}>Qty / Day</Text></View>

          <View style={[pdfStyles.colBase, pdfStyles.colCenter, pdfStyles.colHeader, pdfStyles.wClsMach]}><Text style={pdfStyles.thText}>CLS Machine</Text></View>
          <View style={[pdfStyles.colBase, pdfStyles.colCenter, pdfStyles.colHeader, pdfStyles.wClsEnc]}><Text style={pdfStyles.thText}>Enc Spd{"\n"}(M/m)</Text></View>
          <View style={[pdfStyles.colBase, pdfStyles.colCenter, pdfStyles.colHeader, pdfStyles.wClsQc]}><Text style={pdfStyles.thText}>QC Spd{"\n"}(M/m)</Text></View>
          <View style={[pdfStyles.colBase, pdfStyles.colCenter, pdfStyles.colHeader, pdfStyles.wClsQty]}><Text style={pdfStyles.thText}>Qty / Hr</Text></View>
          <View style={[pdfStyles.colBase, pdfStyles.colCenter, pdfStyles.colHeader, pdfStyles.wClsQtyDay]}><Text style={pdfStyles.thText}>Qty / Day</Text></View>
        </View>
        
        {data.map((row, idx) => (
          <View key={row.id} style={idx % 2 === 0 ? pdfStyles.tableRow : pdfStyles.tableRowAlt}>
            <View style={[pdfStyles.colBase, pdfStyles.wProg]}><Text style={pdfStyles.tdTextBold} {...({ maxLines: 2 } as any)}>{row.program || "-"}</Text></View>
            <View style={[pdfStyles.colBase, pdfStyles.wProd]}><Text style={pdfStyles.tdText} {...({ maxLines: 2 } as any)}>{row.productNumber}</Text></View>
            <View style={[pdfStyles.colBase, pdfStyles.colCenter, pdfStyles.wSize]}><Text style={pdfStyles.tdTextCenter}>{row.widthMm} x {row.lengthMm}</Text></View>
            
            <View style={[pdfStyles.colBase, pdfStyles.colCenter, pdfStyles.wPrintMach]}><Text style={pdfStyles.tdTextCenter} {...({ maxLines: 2 } as any)}>{row.printer}</Text></View>
            <View style={[pdfStyles.colBase, pdfStyles.colCenter, pdfStyles.wPrintSpd]}><Text style={pdfStyles.tdTextCenter}>{row.printSpeed || "-"}</Text></View>
            <View style={[pdfStyles.colBase, pdfStyles.colCenter, pdfStyles.wPrintQty]}><Text style={pdfStyles.tdTextBold}>{formatNum(row.qtyPerHourPrint)}</Text></View>
            <View style={[pdfStyles.colBase, pdfStyles.colCenter, pdfStyles.wPrintQtyDay, { backgroundColor: "#fffbeb" }]}><Text style={pdfStyles.tdHighlightDay}>{formatNum(row.qtyPerDayPrint)}</Text></View>
            
            {row.hasCls ? (
              <>
                <View style={[pdfStyles.colBase, pdfStyles.colCenter, pdfStyles.wClsMach]}><Text style={pdfStyles.tdTextCenter} {...({ maxLines: 2 } as any)}>{row.clsMachine}</Text></View>
                <View style={[pdfStyles.colBase, pdfStyles.colCenter, pdfStyles.wClsEnc]}><Text style={pdfStyles.tdTextCenter}>{row.clsEncodeSpeed || "-"}</Text></View>
                <View style={[pdfStyles.colBase, pdfStyles.colCenter, pdfStyles.wClsQc]}><Text style={pdfStyles.tdTextCenter}>{row.clsQcSpeed || "-"}</Text></View>
                <View style={[pdfStyles.colBase, pdfStyles.colCenter, pdfStyles.wClsQty]}><Text style={pdfStyles.tdTextBold}>{formatNum(row.qtyPerHourCls)}</Text></View>
                <View style={[pdfStyles.colBase, pdfStyles.colCenter, pdfStyles.wClsQtyDay, { backgroundColor: "#fffbeb" }]}><Text style={pdfStyles.tdHighlightDay}>{formatNum(row.qtyPerDayCls)}</Text></View>
              </>
            ) : (
              <>
                <View style={[pdfStyles.colBase, pdfStyles.colCenter, pdfStyles.wClsMach]}><Text style={{...pdfStyles.tdTextCenter, color: "#cbd5e1"}}>-</Text></View>
                <View style={[pdfStyles.colBase, pdfStyles.colCenter, pdfStyles.wClsEnc]}><Text style={{...pdfStyles.tdTextCenter, color: "#cbd5e1"}}>-</Text></View>
                <View style={[pdfStyles.colBase, pdfStyles.colCenter, pdfStyles.wClsQc]}><Text style={{...pdfStyles.tdTextCenter, color: "#cbd5e1"}}>-</Text></View>
                <View style={[pdfStyles.colBase, pdfStyles.colCenter, pdfStyles.wClsQty]}><Text style={{...pdfStyles.tdTextCenter, color: "#cbd5e1"}}>-</Text></View>
                <View style={[pdfStyles.colBase, pdfStyles.colCenter, pdfStyles.wClsQtyDay, { backgroundColor: "#fffbeb" }]}><Text style={{...pdfStyles.tdTextCenter, color: "#cbd5e1"}}>-</Text></View>
              </>
            )}
          </View>
        ))}
      </View>

      <View style={pdfStyles.summaryBox}>
        <Text style={{...pdfStyles.summaryText, fontWeight: "bold"}}>Notes:</Text>
        <Text style={pdfStyles.summaryText}>• Printing and CLS Roll-Form capacities are calculated independently.</Text>
        <Text style={pdfStyles.summaryText}>• Qty / Day is calculated based on a standard {hoursPerDay}-hour shift.</Text>
      </View>
    </Page>
  </Document>
);

export default function RatiosPage() {
  const [ratiosList, setRatiosList] = useState<RatioItem[]>([]);
  const [hoursPerDay, setHoursPerDay] = useState<number>(9); 
  const [isPdfGenerating, setIsPdfGenerating] = useState(false);
  const [logoBase64, setLogoBase64] = useState<string | null>(null);

  const [newItem, setNewItem] = useState({
    program: "",
    productNumber: "",
    printer: PRINTERS[0],
    widthMm: "",
    lengthMm: "",
    printSpeed: "",
    qtyPerHourPrint: "",
    hasCls: true, 
    clsMachine: CLS_MACHINES[0],
    clsEncodeSpeed: "30",
    clsQcSpeed: "30",
    qtyPerHourCls: "",
  });

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
      }).catch(e => console.log("Logo no encontrado", e));

    const saved = localStorage.getItem("sml_ratios_data");
    if (saved) setRatiosList(JSON.parse(saved));
    const savedHours = localStorage.getItem("sml_ratios_hours");
    if (savedHours) setHoursPerDay(Number(savedHours));
  }, []);

  const saveToLocal = (data: RatioItem[], hours: number) => {
    localStorage.setItem("sml_ratios_data", JSON.stringify(data));
    localStorage.setItem("sml_ratios_hours", hours.toString());
  };

  const handleHoursChange = (val: string) => {
    const hours = Number(val) || 9;
    setHoursPerDay(hours);
    
    const updatedList = ratiosList.map(item => {
        return {
            ...item,
            qtyPerDayPrint: item.qtyPerHourPrint * hours,
            qtyPerDayCls: item.qtyPerHourCls * hours
        };
    });
    setRatiosList(updatedList);
    saveToLocal(updatedList, hours);
  };

  const handleClsMachineChange = (val: string) => {
    let enc = "";
    let qc = "";
    if (val === "Machine CLS Roll-Form") {
      enc = "16";
      qc = "14";
    } else if (val === "Machine CLS Cut Singles") {
      enc = "30";
      qc = "30";
    }
    setNewItem({...newItem, clsMachine: val, clsEncodeSpeed: enc, clsQcSpeed: qc});
  };

  const handleCalculateAndAdd = () => {
    if (!newItem.productNumber || !newItem.lengthMm || !newItem.widthMm || !newItem.qtyPerHourPrint) {
      alert("Product Number, Width, Length y Print Qty/h son obligatorios.");
      return;
    }

    const width = Number(newItem.widthMm) || 0;
    const length = Number(newItem.lengthMm) || 0;
    const printQph = Number(newItem.qtyPerHourPrint) || 0;
    const clsQph = newItem.hasCls ? (Number(newItem.qtyPerHourCls) || 0) : 0;

    const newRatio: RatioItem = {
      id: Date.now().toString(),
      program: newItem.program,
      productNumber: newItem.productNumber,
      printer: newItem.printer,
      widthMm: width,
      lengthMm: length,
      printSpeed: Number(newItem.printSpeed) || 0,
      qtyPerHourPrint: printQph,
      qtyPerDayPrint: printQph * hoursPerDay,
      hasCls: newItem.hasCls,
      clsMachine: newItem.clsMachine,
      clsEncodeSpeed: Number(newItem.clsEncodeSpeed) || 0,
      clsQcSpeed: Number(newItem.clsQcSpeed) || 0,
      qtyPerHourCls: clsQph,
      qtyPerDayCls: clsQph * hoursPerDay,
    };

    const updatedList = [...ratiosList, newRatio];
    setRatiosList(updatedList);
    saveToLocal(updatedList, hoursPerDay);
  };

  const handleDelete = (id: string) => {
    const updated = ratiosList.filter(item => item.id !== id);
    setRatiosList(updated);
    saveToLocal(updated, hoursPerDay);
  };

  // === EXPORTAR A EXCEL ===
  const exportToExcel = () => {
    if (ratiosList.length === 0) return alert("Agrega al menos un item a la tabla para exportar.");

    const exportData = ratiosList.map(item => ({
      "Program": item.program || "-",
      "Product Number": item.productNumber,
      "Size (W x L mm)": `${item.widthMm} x ${item.lengthMm}`,
      "Printer": item.printer,
      "Print Speed (/s)": item.printSpeed || "-",
      "Print Qty / Hr": item.qtyPerHourPrint,
      "Print Qty / Day": item.qtyPerDayPrint,
      "CLS Machine": item.hasCls ? item.clsMachine : "N/A",
      "CLS Enc Speed (M/m)": item.hasCls ? (item.clsEncodeSpeed || "-") : "N/A",
      "CLS QC Speed (M/m)": item.hasCls ? (item.clsQcSpeed || "-") : "N/A",
      "CLS Qty / Hr": item.hasCls ? item.qtyPerHourCls : "N/A",
      "CLS Qty / Day": item.hasCls ? item.qtyPerDayCls : "N/A"
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Production Ratios");
    XLSX.writeFile(wb, `SML_Production_Ratios_${Date.now()}.xlsx`);
  };

  // === EXPORTAR A PDF ===
  const generatePDF = async () => {
    if (ratiosList.length === 0) return alert("Agrega al menos un item a la tabla.");
    setIsPdfGenerating(true);
    try {
      const blob = await pdf(<RatiosReportPDF data={ratiosList} logoBase64={logoBase64} hoursPerDay={hoursPerDay} />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a"); link.href = url; link.download = `SML_Production_Ratios_${Date.now()}.pdf`;
      document.body.appendChild(link); link.click(); document.body.removeChild(link);
    } catch (e) { 
      console.error(e);
      alert("Error generando PDF.");
    } finally { 
      setIsPdfGenerating(false); 
    }
  };

  return (
    <main className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" asChild className="text-slate-600 hover:bg-slate-100">
          <a href="/"><ArrowLeft className="mr-2 h-4 w-4" /> Volver al Menú</a>
        </Button>
        <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
          <Calculator className="h-8 w-8 text-blue-600" /> Ratios de Producción
        </h1>
      </div>

      <div className="flex flex-col gap-6">
        
        {/* === FORMULARIO === */}
        <Card className="border-t-4 border-t-slate-800 shadow-md">
          <CardHeader className="bg-slate-50 border-b flex flex-row justify-between items-center pb-4">
            <div>
              <CardTitle className="text-xl flex items-center gap-2"><Settings2 className="h-5 w-5 text-slate-700"/> Panel de Configuración</CardTitle>
              <CardDescription>Los datos no se borran tras agregar para facilitar ingresos múltiples.</CardDescription>
            </div>
            <div className="flex items-center gap-3 bg-white p-2 rounded-md border shadow-sm">
                <Label className="font-bold text-slate-700">Horas / Día:</Label>
                <Input type="number" value={hoursPerDay} onChange={(e) => handleHoursChange(e.target.value)} className="w-20 font-bold text-center text-slate-800" />
            </div>
          </CardHeader>
          
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                
                {/* Info General */}
                <div className="md:col-span-4 space-y-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
                  <h3 className="font-bold text-slate-800 border-b border-slate-300 pb-2">1. General Information</h3>
                  <div className="space-y-3">
                      <div className="space-y-1"><Label className="text-xs">Program</Label><Input value={newItem.program} onChange={e => setNewItem({...newItem, program: e.target.value})} className="bg-white" /></div>
                      <div className="space-y-1"><Label className="text-xs font-bold text-slate-700">Product Number *</Label><Input value={newItem.productNumber} onChange={e => setNewItem({...newItem, productNumber: e.target.value})} className="bg-white" /></div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1"><Label className="text-xs font-bold text-slate-700">Width (mm) *</Label><Input type="number" value={newItem.widthMm} onChange={e => setNewItem({...newItem, widthMm: e.target.value})} className="bg-white" /></div>
                        <div className="space-y-1"><Label className="text-xs font-bold text-slate-700">Length (mm) *</Label><Input type="number" value={newItem.lengthMm} onChange={e => setNewItem({...newItem, lengthMm: e.target.value})} className="bg-white" /></div>
                      </div>
                  </div>
                </div>

                {/* Impresión */}
                <div className="md:col-span-4 space-y-4 bg-green-50/50 p-4 rounded-lg border border-green-100">
                  <h3 className="font-bold text-green-900 border-b border-green-200 pb-2">2. Printing Process</h3>
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <Label className="text-xs text-green-800 font-bold">Impresora *</Label>
                      <Select value={newItem.printer} onValueChange={val => setNewItem({...newItem, printer: val})}>
                        <SelectTrigger className="bg-white border-green-200"><SelectValue/></SelectTrigger>
                        <SelectContent>{PRINTERS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1"><Label className="text-xs">Speed (/s)</Label><Input type="number" value={newItem.printSpeed} onChange={e => setNewItem({...newItem, printSpeed: e.target.value})} className="bg-white" /></div>
                      <div className="space-y-1"><Label className="text-xs font-bold text-green-800">Qty / Hr *</Label><Input type="number" value={newItem.qtyPerHourPrint} onChange={e => setNewItem({...newItem, qtyPerHourPrint: e.target.value})} className="bg-white border-green-300" /></div>
                    </div>
                  </div>
                </div>

                {/* CLS Rollform */}
                <div className={`md:col-span-4 space-y-4 p-4 rounded-lg border transition-colors ${newItem.hasCls ? 'bg-blue-50/50 border-blue-200' : 'bg-slate-50 border-slate-200'}`}>
                  <div className="flex items-center space-x-2 border-b border-blue-200/50 pb-2">
                    <Checkbox id="hasCls" checked={newItem.hasCls} onCheckedChange={(checked) => setNewItem({...newItem, hasCls: !!checked})} className="data-[state=checked]:bg-blue-700 data-[state=checked]:border-blue-700" />
                    <Label htmlFor="hasCls" className={`font-bold cursor-pointer ${newItem.hasCls ? 'text-blue-900' : 'text-slate-500'}`}>3. Incluir CLS Process</Label>
                  </div>
                  
                  {newItem.hasCls ? (
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <Label className="text-xs text-blue-800 font-bold">Máquina CLS *</Label>
                        <Select value={newItem.clsMachine} onValueChange={handleClsMachineChange}>
                          <SelectTrigger className="bg-white border-blue-200"><SelectValue/></SelectTrigger>
                          <SelectContent>{CLS_MACHINES.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="space-y-1"><Label className="text-[10px]">Enc. Spd (M/m)</Label><Input type="number" value={newItem.clsEncodeSpeed} onChange={e => setNewItem({...newItem, clsEncodeSpeed: e.target.value})} className="bg-white px-2" /></div>
                        <div className="space-y-1"><Label className="text-[10px]">QC Spd (M/m)</Label><Input type="number" value={newItem.clsQcSpeed} onChange={e => setNewItem({...newItem, clsQcSpeed: e.target.value})} className="bg-white px-2" /></div>
                        <div className="space-y-1"><Label className="text-[10px] font-bold text-blue-800">Qty / Hr *</Label><Input type="number" value={newItem.qtyPerHourCls} onChange={e => setNewItem({...newItem, qtyPerHourCls: e.target.value})} className="bg-white border-blue-300 px-2" /></div>
                      </div>
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center pt-8">
                       <p className="text-sm text-slate-400 italic text-center px-4">Proceso CLS desactivado para este item.</p>
                    </div>
                  )}
                </div>
            </div>

            <div className="mt-6 flex justify-end">
              <Button onClick={handleCalculateAndAdd} size="lg" className="w-full md:w-auto bg-slate-800 hover:bg-slate-900 shadow-md text-md px-10">
                <Plus className="mr-2 h-5 w-5" /> Agregar a la Tabla
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* === TABLA DE RESULTADOS === */}
        <Card className="border-t-4 border-t-red-600 shadow-lg flex flex-col">
          <CardHeader className="bg-slate-50 border-b flex flex-row flex-wrap gap-4 justify-between items-center pb-4">
            <div>
              <CardTitle className="text-xl text-slate-800 flex items-center gap-2"><ListOrdered className="h-5 w-5 text-red-600"/> Base de Datos de Ratios</CardTitle>
            </div>
            {/* AQUÍ ESTÁN LOS DOS BOTONES DE EXPORTACIÓN */}
            <div className="flex gap-3">
              <Button size="lg" onClick={exportToExcel} disabled={ratiosList.length === 0} className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-md">
                <FileSpreadsheet className="mr-2 h-5 w-5"/> Exportar Excel
              </Button>
              <Button size="lg" onClick={generatePDF} disabled={isPdfGenerating || ratiosList.length === 0} className="bg-red-600 hover:bg-red-700 text-white shadow-md">
                {isPdfGenerating ? <Loader2 className="mr-2 h-5 w-5 animate-spin"/> : <FileDown className="mr-2 h-5 w-5"/>} Descargar Reporte PDF
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0 overflow-auto">
            <div className="w-full overflow-x-auto">
              <table className="w-full text-sm text-left whitespace-nowrap">
                <thead className="bg-slate-800 text-white font-bold border-b sticky top-0 shadow-sm z-10">
                  <tr>
                    <th colSpan={3} className="p-2 text-center border-r border-red-200 uppercase text-xs bg-red-100 text-red-900">General Information</th>
                    <th colSpan={4} className="p-2 text-center border-r border-green-200 uppercase text-xs bg-green-100 text-green-900">Printing Process</th>
                    <th colSpan={5} className="p-2 text-center uppercase text-xs bg-blue-100 text-blue-900">CLS Roll-Form / Cut</th>
                    <th className="bg-white border-b-0"></th>
                  </tr>
                  <tr className="bg-slate-100 text-slate-700 text-xs">
                    <th className="p-3">Program</th>
                    <th className="p-3">Product</th>
                    <th className="p-3 text-center border-r">Size (W x L)</th>
                    
                    <th className="p-3 text-center">Printer</th>
                    <th className="p-3 text-center">Spd (/s)</th>
                    <th className="p-3 text-center">Qty/Hr</th>
                    <th className="p-3 text-center border-r text-red-700">Qty/Day</th>

                    <th className="p-3 text-center">Machine</th>
                    <th className="p-3 text-center">Enc Spd<br/><span className="text-[9px] font-normal">(M/m)</span></th>
                    <th className="p-3 text-center">QC Spd<br/><span className="text-[9px] font-normal">(M/m)</span></th>
                    <th className="p-3 text-center">Qty/Hr</th>
                    <th className="p-3 text-center border-r text-red-700">Qty/Day</th>
                    <th className="p-3 text-center bg-white"></th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {ratiosList.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="p-3 text-xs font-bold text-slate-600">{item.program || "-"}</td>
                      <td className="p-3 font-bold text-slate-900">{item.productNumber}</td>
                      <td className="p-3 text-center text-slate-600 border-r">{item.widthMm} x {item.lengthMm}</td>
                      
                      <td className="p-3 text-center text-xs text-slate-500">{item.printer}</td>
                      <td className="p-3 text-center text-slate-600">{item.printSpeed || "-"}</td>
                      <td className="p-3 text-center font-bold text-green-700 bg-green-50/20">{formatNum(item.qtyPerHourPrint)}</td>
                      <td className="p-3 text-center font-bold text-green-900 bg-green-100 border-r text-base">{formatNum(item.qtyPerDayPrint)}</td> 
                      
                      {item.hasCls ? (
                        <>
                          <td className="p-3 text-center text-xs text-slate-500">{item.clsMachine}</td>
                          <td className="p-3 text-center text-slate-600">{item.clsEncodeSpeed || "-"}</td>
                          <td className="p-3 text-center text-slate-600">{item.clsQcSpeed || "-"}</td>
                          <td className="p-3 text-center font-bold text-blue-700 bg-blue-50/20">{formatNum(item.qtyPerHourCls)}</td>
                          <td className="p-3 text-center font-bold text-blue-900 bg-blue-100 border-r text-base">{formatNum(item.qtyPerDayCls)}</td> 
                        </>
                      ) : (
                        <td colSpan={5} className="p-3 text-center text-slate-300 border-r bg-slate-50/50">N/A</td>
                      )}
                      
                      <td className="p-3 text-center">
                        <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => handleDelete(item.id)}>
                          <Trash2 className="h-4 w-4"/>
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {ratiosList.length === 0 && (
                    <tr><td colSpan={13} className="p-10 text-center text-slate-400 italic">La tabla está vacía.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}