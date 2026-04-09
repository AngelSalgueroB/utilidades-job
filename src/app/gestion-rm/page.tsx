"use client";

import { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  Download,
  Database,
  Box,
  FileSpreadsheet,
  CheckSquare,
  Edit,
  FileDown,
  UploadCloud,
  X,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { pdf, Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";
import { Checkbox } from "@/components/ui/checkbox";

// === TIPOS DE DATOS ===
type RawMaterial = {
  id: string; 
  sort: string;
  itemNumber: string;
  productName: string;
  physicalInventory: number | string;
  supplier: string;
};

type FinishedProduct = {
  id: string;
  rmId: string; 
  sort: string;
  productNumber: string;
  callOut: string;
  workShop: string;
  mainProgram: string;
};

// Tipo para la tabla editable de D365
type D365EditableRow = {
  id: string;
  itemNumber: string;
  productName: string;
  inventory: number;
  program: string;
  wip: string;
  projection: string;
};

// === FUNCIONES DE FORMATEO Y LIMPIEZA ===
const sanitizeText = (text: string) => {
  if (!text) return "";
  return String(text).replace(/[^\x00-\x7F\xC0-\xFF]/g, "").trim();
};

const formatInventory = (num: number | string) => {
  const parsed = Number(num);
  if (isNaN(parsed)) return "0";
  
  if (parsed >= 1000000) {
    const millions = Math.floor(parsed / 1000000);
    const remainder = parsed % 1000000;
    return `${millions}'${remainder.toLocaleString('en-US', { minimumIntegerDigits: 6, useGrouping: true })}`;
  }
  
  return parsed.toLocaleString('en-US');
};

// === ESTILOS PARA EL PDF ===
const pdfStyles: any = StyleSheet.create({
  page: { padding: 25, fontFamily: "Helvetica", fontSize: 8, color: "#334155", backgroundColor: "#ffffff" },
  headerContainer: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", borderBottomWidth: 2, borderBottomColor: "#991b1b", paddingBottom: 10, marginBottom: 15 },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  logo: { width: 60, height: "auto" },
  title: { fontSize: 16, fontWeight: "bold", color: "#991b1b", textTransform: "uppercase" },
  dateText: { fontSize: 8, color: "#64748b", fontWeight: "bold" },
  
  tableContainer: { borderWidth: 1, borderColor: "#cbd5e1", borderRadius: 6, overflow: "hidden" },
  tableHeader: { flexDirection: "row", backgroundColor: "#b91c1c", paddingVertical: 6 },
  tableRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#e2e8f0", backgroundColor: "#ffffff", alignItems: "center", minHeight: 20 },
  tableRowAlt: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#e2e8f0", backgroundColor: "#f8fafc", alignItems: "center", minHeight: 20 },
  
  // Flex dinámico según columnas seleccionadas
  colIndex: { flex: 0.5, paddingHorizontal: 4, borderRightWidth: 1, borderRightColor: "#e2e8f0", justifyContent: 'center' },
  colItem: { flex: 2.0, paddingHorizontal: 4, borderRightWidth: 1, borderRightColor: "#e2e8f0", justifyContent: 'center' },
  colName: { flex: 4.0, paddingHorizontal: 4, borderRightWidth: 1, borderRightColor: "#e2e8f0", justifyContent: 'center' },
  colDynamic: { flex: 1.5, paddingHorizontal: 4, borderRightWidth: 1, borderRightColor: "#e2e8f0", justifyContent: 'center' },
  colInventory: { flex: 1.5, paddingHorizontal: 4, justifyContent: 'center', alignItems: 'flex-end' },
  
  thText: { color: "#ffffff", fontWeight: "bold", fontSize: 7, textAlign: "center", textTransform: "uppercase" },
  tdTextCenter: { fontSize: 6.5, color: "#475569", textAlign: "center" },
  tdText: { fontSize: 6.5, color: "#334155", overflow: "hidden" },
  tdTextBold: { fontSize: 6.5, fontWeight: "bold", color: "#991b1b" },
  tdInventory: { fontSize: 7, fontWeight: "bold", color: "#0f172a", textAlign: "right" },
});

// === COMPONENTE PDF ===
const D365ReportPDF = ({ 
  data, 
  logoBase64, 
  showProgram, 
  showWip, 
  showProjection 
}: { 
  data: D365EditableRow[], 
  logoBase64: string | null,
  showProgram: boolean,
  showWip: boolean,
  showProjection: boolean
}) => {
  
  // Ajuste dinámico de anchos basado en cuántas columnas opcionales se muestran
  let activeOptionalCount = 0;
  if (showProgram) activeOptionalCount++;
  if (showWip) activeOptionalCount++;
  if (showProjection) activeOptionalCount++;

  const nameFlex = activeOptionalCount === 0 ? 5.5 : 
                   activeOptionalCount === 1 ? 4.5 : 
                   activeOptionalCount === 2 ? 3.5 : 3.0;

  return (
  <Document>
    <Page size="A4" orientation="portrait" style={pdfStyles.page}>
      <View style={pdfStyles.headerContainer}>
        <View style={pdfStyles.headerLeft}>
          {logoBase64 ? <Image style={pdfStyles.logo} src={logoBase64} /> : <Text style={{fontSize: 16, fontWeight: 'bold', color: '#991b1b'}}>SML</Text>}
          <Text style={pdfStyles.title}>PrintShop Inventory</Text>
        </View>
        <Text style={pdfStyles.dateText}>Date: {new Date().toLocaleDateString()}</Text>
      </View>

      <View style={pdfStyles.tableContainer}>
        <View style={pdfStyles.tableHeader}>
          <View style={pdfStyles.colIndex}><Text style={pdfStyles.thText}>#</Text></View>
          <View style={pdfStyles.colItem}><Text style={pdfStyles.thText}>Item Number</Text></View>
          <View style={{...pdfStyles.colName, flex: nameFlex}}><Text style={pdfStyles.thText}>Product Name</Text></View>
          {showProgram && <View style={pdfStyles.colDynamic}><Text style={pdfStyles.thText}>Program</Text></View>}
          {showWip && <View style={pdfStyles.colDynamic}><Text style={pdfStyles.thText}>WIP</Text></View>}
          {showProjection && <View style={pdfStyles.colDynamic}><Text style={pdfStyles.thText}>Proyeccion</Text></View>}
          <View style={pdfStyles.colInventory}><Text style={{...pdfStyles.thText, textAlign: 'right'}}>Inventory (pcs)</Text></View>
        </View>
        
        {data.map((row, idx) => (
          <View key={row.id} style={idx % 2 === 0 ? pdfStyles.tableRow : pdfStyles.tableRowAlt}>
            <View style={pdfStyles.colIndex}><Text style={pdfStyles.tdTextCenter}>{idx + 1}</Text></View>
            <View style={pdfStyles.colItem}><Text style={pdfStyles.tdTextBold} {...({ maxLines: 2 } as any)}>{row.itemNumber}</Text></View>
            <View style={{...pdfStyles.colName, flex: nameFlex}}><Text style={pdfStyles.tdText} {...({ maxLines: 2 } as any)}>{row.productName}</Text></View>
            {showProgram && <View style={pdfStyles.colDynamic}><Text style={pdfStyles.tdTextCenter} {...({ maxLines: 1 } as any)}>{row.program || "-"}</Text></View>}
            {showWip && <View style={pdfStyles.colDynamic}><Text style={pdfStyles.tdTextCenter} {...({ maxLines: 1 } as any)}>{row.wip || "-"}</Text></View>}
            {showProjection && <View style={pdfStyles.colDynamic}><Text style={pdfStyles.tdTextCenter} {...({ maxLines: 1 } as any)}>{row.projection || "-"}</Text></View>}
            <View style={pdfStyles.colInventory}><Text style={pdfStyles.tdInventory}>{formatInventory(row.inventory)}</Text></View>
          </View>
        ))}
      </View>
    </Page>
  </Document>
  );
};

export default function GestionRMPage() {
  const [activeTab, setActiveTab] = useState<"RM" | "PRODUCTOS" | "REPORTE" | "D365">("RM");

  const [rawMaterials, setRawMaterials] = useState<RawMaterial[]>([]);
  const [products, setProducts] = useState<FinishedProduct[]>([]);
  const [selectedRMIds, setSelectedRMIds] = useState<string[]>([]);
  
  const [editingRM, setEditingRM] = useState<RawMaterial | null>(null);
  const [editingProd, setEditingProd] = useState<FinishedProduct | null>(null);

  // Estados D365 Interactivo
  const [d365EditableData, setD365EditableData] = useState<D365EditableRow[]>([]);
  const [isPdfGenerating, setIsPdfGenerating] = useState(false);
  const [logoBase64, setLogoBase64] = useState<string | null>(null);

  // Estados Checkboxes Columnas
  const [showProgram, setShowProgram] = useState(true);
  const [showWip, setShowWip] = useState(true);
  const [showProjection, setShowProjection] = useState(true);

  useEffect(() => {
    const savedRM = localStorage.getItem("d365_rm_data");
    const savedProd = localStorage.getItem("d365_prod_data");
    if (savedRM) setRawMaterials(JSON.parse(savedRM));
    if (savedProd) setProducts(JSON.parse(savedProd));

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
  }, []);

  const saveToLocal = (newRMs: RawMaterial[], newProds: FinishedProduct[]) => {
    localStorage.setItem("d365_rm_data", JSON.stringify(newRMs));
    localStorage.setItem("d365_prod_data", JSON.stringify(newProds));
  };

  const [newRM, setNewRM] = useState<Omit<RawMaterial, "id" | "sort">>({ itemNumber: "", productName: "", physicalInventory: "", supplier: "" });
  const [newProd, setNewProd] = useState<Omit<FinishedProduct, "id" | "sort">>({ rmId: "", productNumber: "", callOut: "", workShop: "", mainProgram: "" });

  const handleAddRM = () => {
    if (!newRM.itemNumber || !newRM.productName) return alert("Falta Item Number o Name");
    const nextSort = rawMaterials.length > 0 ? Math.max(...rawMaterials.map(rm => parseInt(rm.sort) || 0)) + 1 : 1;
    const added = [...rawMaterials, { ...newRM, sort: String(nextSort), id: Date.now().toString() }];
    setRawMaterials(added);
    saveToLocal(added, products);
    setNewRM({ itemNumber: "", productName: "", physicalInventory: "", supplier: "" });
  };

  const handleSaveEditRM = () => {
    if (!editingRM) return;
    const updated = rawMaterials.map(rm => rm.id === editingRM.id ? editingRM : rm);
    setRawMaterials(updated);
    saveToLocal(updated, products);
    setEditingRM(null);
  };

  const handleDeleteRM = (id: string) => {
    if(!confirm("¿Seguro que deseas eliminar esta Materia Prima? También se borrarán sus productos asociados.")) return;
    const filteredRMs = rawMaterials.filter(rm => rm.id !== id);
    const filteredProds = products.filter(p => p.rmId !== id);
    setRawMaterials(filteredRMs);
    setProducts(filteredProds);
    saveToLocal(filteredRMs, filteredProds);
  };

  const handleAddProduct = () => {
    if (!newProd.rmId || !newProd.productNumber) return alert("Selecciona una Materia Prima y pon un Product Number");
    const nextSort = products.length > 0 ? Math.max(...products.map(p => parseInt(p.sort) || 0)) + 1 : 1;
    const added = [...products, { ...newProd, sort: String(nextSort), id: Date.now().toString() }];
    setProducts(added);
    saveToLocal(rawMaterials, added);
    setNewProd({ rmId: newProd.rmId, productNumber: "", callOut: "", workShop: "", mainProgram: "" });
  };

  const handleSaveEditProd = () => {
    if (!editingProd) return;
    const updated = products.map(p => p.id === editingProd.id ? editingProd : p);
    setProducts(updated);
    saveToLocal(rawMaterials, updated);
    setEditingProd(null);
  };

  const handleDeleteProduct = (id: string) => {
    if(!confirm("¿Seguro que deseas eliminar este Producto?")) return;
    const filtered = products.filter(p => p.id !== id);
    setProducts(filtered);
    saveToLocal(rawMaterials, filtered);
  };

  const toggleRMSelection = (id: string) => {
    setSelectedRMIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const exportOnlyRM = () => {
    if (selectedRMIds.length === 0) return alert("Selecciona al menos una materia prima.");
    const exportData = selectedRMIds.map(rmId => {
      const rm = rawMaterials.find(r => r.id === rmId);
      return {
        "Sort": rm?.sort || "-", "Item Number": rm?.itemNumber || "-", "Product Name": rm?.productName || "-",
        "Physical Inventory": rm?.physicalInventory || "0", "Supplier": rm?.supplier || "-"
      };
    });
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Solo RM");
    XLSX.writeFile(wb, `Reporte_Solo_RM_${Date.now()}.xlsx`);
  };

  const exportRMandFG = () => {
    if (selectedRMIds.length === 0) return alert("Selecciona al menos una materia prima.");
    const exportData: any[] = [];
    selectedRMIds.forEach(rmId => {
      const rm = rawMaterials.find(r => r.id === rmId);
      const relatedProds = products.filter(p => p.rmId === rmId);
      if (rm) {
        if (relatedProds.length === 0) {
            exportData.push({ "RM Sort": rm.sort, "RM Item Number": rm.itemNumber, "RM Product Name": rm.productName, "RM Inventory": rm.physicalInventory, "RM Supplier": rm.supplier, "PROD Sort": "-", "PROD Number": "SIN ASIGNAR", "Call Out": "-", "WorkShop": "-", "Main Program": "-" });
        } else {
            relatedProds.forEach(prod => exportData.push({ "RM Sort": rm.sort, "RM Item Number": rm.itemNumber, "RM Product Name": rm.productName, "RM Inventory": rm.physicalInventory, "RM Supplier": rm.supplier, "PROD Sort": prod.sort, "PROD Number": prod.productNumber, "Call Out": prod.callOut, "WorkShop": prod.workShop, "Main Program": prod.mainProgram }));
        }
      }
    });
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "RM + FG");
    XLSX.writeFile(wb, `Reporte_RM_y_FG_${Date.now()}.xlsx`);
  };

  const handleD365Upload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const data = await file.arrayBuffer();
    const wb = XLSX.read(data);
    const ws = wb.Sheets[wb.SheetNames[0]];
    const json = XLSX.utils.sheet_to_json<any>(ws, { defval: "" }); 
    
    const editableData: D365EditableRow[] = json.map((row, index) => ({
        id: `d365_${index}_${Date.now()}`,
        itemNumber: sanitizeText(String(row["Item number"] || row["Item Number"] || row["Código"] || "")),
        productName: sanitizeText(String(row["Product name"] || row["Product Name"] || row["Descripción"] || "")),
        inventory: Number(row["Physical inventory"] || row["Inventory"] || row["Inventario"]) || 0,
        program: "",
        wip: "",
        projection: ""
    }));

    setD365EditableData(editableData);
    e.target.value = ""; 
  };

  const handleFieldChange = (id: string, field: keyof D365EditableRow, value: string) => {
      setD365EditableData(prev => prev.map(row => row.id === id ? { ...row, [field]: value } : row));
  };

  const generateD365PDF = async () => {
    if (d365EditableData.length === 0) return;
    setIsPdfGenerating(true);
    try {
      const blob = await pdf(
        <D365ReportPDF 
          data={d365EditableData} 
          logoBase64={logoBase64} 
          showProgram={showProgram}
          showWip={showWip}
          showProjection={showProjection}
        />
      ).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a"); link.href = url; link.download = `PrintShop_Inventory_${Date.now()}.pdf`;
      document.body.appendChild(link); link.click(); document.body.removeChild(link);
    } catch (e) { 
      console.error(e);
      alert("Error crítico generando el PDF.");
    } finally { 
      setIsPdfGenerating(false); 
    }
  };

  return (
    <main className="container mx-auto px-4 py-8 max-w-7xl relative">
      <div className="flex items-center justify-between mb-8">
        <Button variant="ghost" asChild className="text-slate-600 hover:bg-slate-100">
          <a href="/"><ArrowLeft className="mr-2 h-4 w-4" /> Volver al Menú</a>
        </Button>
        <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
          <Database className="h-8 w-8 text-blue-600" /> Gestión de Códigos RM
        </h1>
      </div>

      <div className="flex flex-wrap gap-2 mb-6 border-b pb-2">
        <Button variant={activeTab === "RM" ? "default" : "outline"} onClick={() => setActiveTab("RM")}><Database className="mr-2 h-4 w-4"/> 1. Materias Primas</Button>
        <Button variant={activeTab === "PRODUCTOS" ? "default" : "outline"} onClick={() => setActiveTab("PRODUCTOS")}><Box className="mr-2 h-4 w-4"/> 2. Productos / Salidas</Button>
        <Button variant={activeTab === "REPORTE" ? "default" : "outline"} onClick={() => setActiveTab("REPORTE")} className="bg-green-50 text-green-700 hover:bg-green-100 border-green-200"><FileSpreadsheet className="mr-2 h-4 w-4"/> 3. Reportes Excel</Button>
        <Button variant={activeTab === "D365" ? "default" : "outline"} onClick={() => setActiveTab("D365")} className="bg-red-50 text-red-700 hover:bg-red-100 border-red-200"><FileDown className="mr-2 h-4 w-4"/> 4. PDF SML PrintShop</Button>
      </div>

      {activeTab === "RM" && (
        <div className="space-y-6">
          <Card className="border-t-4 border-t-blue-500 shadow-md">
            <CardHeader>
              <CardTitle>Agregar Materia Prima</CardTitle>
              <CardDescription>Crea el código raíz del material. El Sort se genera automáticamente.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-1"><Label>Item Number *</Label><Input value={newRM.itemNumber} onChange={e => setNewRM({...newRM, itemNumber: e.target.value})} placeholder="Código RM" /></div>
                <div className="space-y-1"><Label>Product Name *</Label><Input value={newRM.productName} onChange={e => setNewRM({...newRM, productName: e.target.value})} placeholder="Descripción" /></div>
                <div className="space-y-1"><Label>Inventory</Label><Input type="number" value={newRM.physicalInventory} onChange={e => setNewRM({...newRM, physicalInventory: e.target.value})} placeholder="0" /></div>
                <div className="space-y-1"><Label>Proveedor</Label><Input value={newRM.supplier} onChange={e => setNewRM({...newRM, supplier: e.target.value})} placeholder="Nombre" /></div>
              </div>
              <Button onClick={handleAddRM} className="mt-4 bg-blue-600 hover:bg-blue-700"><Plus className="mr-2 h-4 w-4" /> Agregar RM</Button>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardContent className="pt-6">
              <div className="border rounded-md overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-100 text-slate-600 font-bold border-b">
                    <tr><th className="p-3 text-center">Sort</th><th className="p-3">Item Number</th><th className="p-3">Product Name</th><th className="p-3">Inventory</th><th className="p-3">Proveedor</th><th className="p-3 text-center">Acciones</th></tr>
                  </thead>
                  <tbody>
                    {rawMaterials.map(rm => (
                      <tr key={rm.id} className="border-b hover:bg-slate-50">
                        <td className="p-3 text-center text-slate-500">{rm.sort}</td><td className="p-3 font-bold text-blue-700">{rm.itemNumber}</td><td className="p-3">{rm.productName}</td><td className="p-3">{rm.physicalInventory}</td><td className="p-3">{rm.supplier}</td>
                        <td className="p-3 text-center flex justify-center gap-2">
                          <Button variant="ghost" size="sm" className="text-blue-600" onClick={() => setEditingRM(rm)}><Edit className="h-4 w-4"/></Button>
                          <Button variant="ghost" size="sm" className="text-red-500" onClick={() => handleDeleteRM(rm.id)}><Trash2 className="h-4 w-4"/></Button>
                        </td>
                      </tr>
                    ))}
                    {rawMaterials.length === 0 && <tr><td colSpan={6} className="p-4 text-center text-slate-400">No hay datos.</td></tr>}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "PRODUCTOS" && (
        <div className="space-y-6">
          <Card className="border-t-4 border-t-amber-500 shadow-md">
            <CardHeader>
              <CardTitle>Agregar Producto / Salida</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4 space-y-1 w-1/2">
                  <Label className="text-amber-700 font-bold">Selecciona RM Origen *</Label>
                  <Select value={newProd.rmId} onValueChange={val => setNewProd({...newProd, rmId: val})}>
                    <SelectTrigger className="border-amber-300"><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                    <SelectContent>{rawMaterials.map(rm => (<SelectItem key={rm.id} value={rm.id}>{rm.itemNumber} - {rm.productName}</SelectItem>))}</SelectContent>
                  </Select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-md border border-slate-200">
                <div className="space-y-1"><Label>Product Number *</Label><Input value={newProd.productNumber} onChange={e => setNewProd({...newProd, productNumber: e.target.value})} placeholder="Código" /></div>
                <div className="space-y-1"><Label>Call Out</Label><Input value={newProd.callOut} onChange={e => setNewProd({...newProd, callOut: e.target.value})} placeholder="Desc" /></div>
                <div className="space-y-1"><Label>WorkShop</Label><Input value={newProd.workShop} onChange={e => setNewProd({...newProd, workShop: e.target.value})} placeholder="Taller" /></div>
                <div className="space-y-1"><Label>Main Program</Label><Input value={newProd.mainProgram} onChange={e => setNewProd({...newProd, mainProgram: e.target.value})} placeholder="Prog" /></div>
              </div>
              <Button onClick={handleAddProduct} className="mt-4 bg-amber-600 hover:bg-amber-700"><Plus className="mr-2 h-4 w-4" /> Agregar Producto</Button>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardContent className="pt-6">
              <div className="border rounded-md overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-100 text-slate-600 font-bold border-b">
                    <tr><th className="p-3">RM Origen</th><th className="p-3 text-center">Sort</th><th className="p-3">Product Number</th><th className="p-3">Call Out</th><th className="p-3">WorkShop</th><th className="p-3">Program</th><th className="p-3 text-center">Acciones</th></tr>
                  </thead>
                  <tbody>
                    {products.map(prod => {
                      const parent = rawMaterials.find(rm => rm.id === prod.rmId);
                      return (
                      <tr key={prod.id} className="border-b hover:bg-slate-50">
                        <td className="p-3 font-bold text-amber-700">{parent?.itemNumber}</td>
                        <td className="p-3 text-center">{prod.sort}</td><td className="p-3 font-bold">{prod.productNumber}</td><td className="p-3">{prod.callOut}</td><td className="p-3">{prod.workShop}</td><td className="p-3">{prod.mainProgram}</td>
                        <td className="p-3 text-center flex justify-center gap-2">
                          <Button variant="ghost" size="sm" className="text-blue-600" onClick={() => setEditingProd(prod)}><Edit className="h-4 w-4"/></Button>
                          <Button variant="ghost" size="sm" className="text-red-500" onClick={() => handleDeleteProduct(prod.id)}><Trash2 className="h-4 w-4"/></Button>
                        </td>
                      </tr>
                    )})}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "REPORTE" && (
        <Card className="border-t-4 border-t-green-500 shadow-md">
          <CardHeader>
            <CardTitle>1. Selecciona Códigos para Reporte</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 mb-4"><Button onClick={() => setSelectedRMIds(rawMaterials.map(rm => rm.id))} variant="outline">Seleccionar Todo</Button><Button onClick={() => setSelectedRMIds([])} variant="outline">Limpiar</Button></div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {rawMaterials.map(rm => (
                <div key={rm.id} onClick={() => toggleRMSelection(rm.id)} className={`p-3 border rounded-md cursor-pointer flex gap-3 ${selectedRMIds.includes(rm.id) ? 'bg-green-50 border-green-500' : 'bg-white'}`}>
                  <div className="mt-1">{selectedRMIds.includes(rm.id) ? <CheckSquare className="text-green-600 h-4 w-4"/> : <div className="h-4 w-4 border-2 rounded-sm" />}</div>
                  <div><p className="font-bold text-sm">{rm.itemNumber}</p><p className="text-xs text-slate-500">{products.filter(p => p.rmId === rm.id).length} Salidas</p></div>
                </div>
              ))}
            </div>

            <div className="border-t pt-6">
              <CardTitle className="mb-4 text-slate-700">2. Elige tu formato de descarga</CardTitle>
              <div className="flex gap-4">
                <Button size="lg" onClick={exportOnlyRM} className="bg-blue-600 hover:bg-blue-700"><Download className="mr-2 h-5 w-5"/> Descargar 1: SOLO RM</Button>
                <Button size="lg" onClick={exportRMandFG} className="bg-emerald-600 hover:bg-emerald-700"><Download className="mr-2 h-5 w-5"/> Descargar 2: RM + FG</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === "D365" && (
        <Card className="border-t-4 border-t-red-600 shadow-xl">
          <CardHeader className="bg-red-50 rounded-t-xl border-b border-red-100">
            <CardTitle className="text-red-700 text-2xl flex items-center"><FileDown className="mr-2 h-6 w-6"/> Generador de Reporte PrintShop (PDF)</CardTitle>
            <CardDescription className="text-red-600/80 font-medium">Sube tu Excel de D365, asigna programas y obtén un reporte formal.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            
            <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
                <Button asChild size="lg" className="bg-red-600 hover:bg-red-700 text-white shadow-md w-full md:w-auto">
                  <label className="cursor-pointer"><UploadCloud className="mr-2 h-5 w-5"/> 1. Subir Excel Dynamics 365<Input type="file" className="hidden" accept=".xlsx,.xls,.csv" onChange={handleD365Upload} /></label>
                </Button>
                {d365EditableData.length > 0 && <span className="text-green-600 font-bold bg-green-50 px-3 py-1 rounded-full border border-green-200"><CheckSquare className="inline h-4 w-4 mr-1"/> {d365EditableData.length} items listos.</span>}
            </div>

            {d365EditableData.length > 0 && (
              <div className="space-y-4">
                <div className="bg-slate-50 p-4 rounded-md border border-slate-200">
                  <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
                    <div>
                      <h3 className="font-bold text-slate-700 mb-1">2. Asignar Columnas Adicionales</h3>
                      <p className="text-xs text-slate-500">Selecciona qué columnas quieres mostrar y llénalas.</p>
                    </div>
                    <div className="flex flex-wrap gap-4 bg-white p-2 rounded border shadow-sm">
                       <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-700">
                          <Checkbox checked={showProgram} onCheckedChange={(c) => setShowProgram(!!c)} /> Program
                       </label>
                       <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-700">
                          <Checkbox checked={showWip} onCheckedChange={(c) => setShowWip(!!c)} /> WIP
                       </label>
                       <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-700">
                          <Checkbox checked={showProjection} onCheckedChange={(c) => setShowProjection(!!c)} /> Proyeccion
                       </label>
                    </div>
                  </div>
                  
                  <div className="border rounded-md overflow-y-auto max-h-[400px] shadow-sm bg-white">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-slate-100 text-slate-600 font-bold sticky top-0 shadow-sm z-10">
                        <tr>
                          <th className="p-3 w-10">#</th>
                          <th className="p-3">Item Number</th>
                          <th className="p-3">Product Name</th>
                          <th className="p-3 text-right">Inventory</th>
                          {showProgram && <th className="p-3 bg-blue-50 text-blue-700 border-l border-blue-100">Program</th>}
                          {showWip && <th className="p-3 bg-amber-50 text-amber-700 border-l border-amber-100">WIP</th>}
                          {showProjection && <th className="p-3 bg-emerald-50 text-emerald-700 border-l border-emerald-100">Proyeccion</th>}
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {d365EditableData.map((row, idx) => (
                          <tr key={row.id} className="hover:bg-slate-50">
                            <td className="p-3 text-slate-400">{idx + 1}</td>
                            <td className="p-3 font-bold text-red-700">{row.itemNumber}</td>
                            <td className="p-3 text-xs">{row.productName}</td>
                            <td className="p-3 text-right font-bold">{formatInventory(row.inventory)}</td>
                            {showProgram && (
                              <td className="p-2 border-l border-blue-50 bg-blue-50/20">
                                 <Input value={row.program} onChange={(e) => handleFieldChange(row.id, "program", e.target.value)} className="h-8 text-xs border-slate-200" />
                              </td>
                            )}
                            {showWip && (
                              <td className="p-2 border-l border-amber-50 bg-amber-50/20">
                                 <Input value={row.wip} onChange={(e) => handleFieldChange(row.id, "wip", e.target.value)} className="h-8 text-xs border-slate-200" />
                              </td>
                            )}
                            {showProjection && (
                              <td className="p-2 border-l border-emerald-50 bg-emerald-50/20">
                                 <Input value={row.projection} onChange={(e) => handleFieldChange(row.id, "projection", e.target.value)} className="h-8 text-xs border-slate-200" />
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t">
                  <Button size="lg" onClick={generateD365PDF} disabled={isPdfGenerating} className="bg-red-600 hover:bg-red-700 text-white w-full md:w-auto shadow-lg text-lg h-12">
                    {isPdfGenerating ? <><Loader2 className="mr-2 animate-spin"/> Generando PDF...</> : <><FileDown className="mr-2 h-6 w-6"/> 3. Descargar PDF</>}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {editingRM && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg shadow-2xl">
            <CardHeader className="flex flex-row justify-between items-center pb-2">
              <CardTitle>Editar Materia Prima</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setEditingRM(null)}><X className="h-5 w-5"/></Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1"><Label>Item Number</Label><Input value={editingRM.itemNumber} onChange={e => setEditingRM({...editingRM, itemNumber: e.target.value})} /></div>
              <div className="space-y-1"><Label>Product Name</Label><Input value={editingRM.productName} onChange={e => setEditingRM({...editingRM, productName: e.target.value})} /></div>
              <div className="space-y-1"><Label>Inventory</Label><Input type="number" value={editingRM.physicalInventory} onChange={e => setEditingRM({...editingRM, physicalInventory: e.target.value})} /></div>
              <div className="space-y-1"><Label>Proveedor</Label><Input value={editingRM.supplier} onChange={e => setEditingRM({...editingRM, supplier: e.target.value})} /></div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2 bg-slate-50 pt-4 rounded-b-xl border-t">
              <Button variant="outline" onClick={() => setEditingRM(null)}>Cancelar</Button>
              <Button onClick={handleSaveEditRM} className="bg-blue-600 hover:bg-blue-700">Guardar Cambios</Button>
            </CardFooter>
          </Card>
        </div>
      )}

      {editingProd && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg shadow-2xl">
            <CardHeader className="flex flex-row justify-between items-center pb-2">
              <CardTitle>Editar Producto / Salida</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setEditingProd(null)}><X className="h-5 w-5"/></Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1"><Label>Product Number</Label><Input value={editingProd.productNumber} onChange={e => setEditingProd({...editingProd, productNumber: e.target.value})} /></div>
              <div className="space-y-1"><Label>Call Out</Label><Input value={editingProd.callOut} onChange={e => setEditingProd({...editingProd, callOut: e.target.value})} /></div>
              <div className="space-y-1"><Label>WorkShop</Label><Input value={editingProd.workShop} onChange={e => setEditingProd({...editingProd, workShop: e.target.value})} /></div>
              <div className="space-y-1"><Label>Main Program</Label><Input value={editingProd.mainProgram} onChange={e => setEditingProd({...editingProd, mainProgram: e.target.value})} /></div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2 bg-slate-50 pt-4 rounded-b-xl border-t">
              <Button variant="outline" onClick={() => setEditingProd(null)}>Cancelar</Button>
              <Button onClick={handleSaveEditProd} className="bg-amber-600 hover:bg-amber-700">Guardar Cambios</Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </main>
  );
}
