// "use client";

// import { useState, useMemo, useEffect } from 'react'; // Agregamos useEffect
// import * as XLSX from 'xlsx';
// import { Loader2, AlertTriangle, ArrowLeft, FolderSearch, List, CheckCircle2, FileDown, Eye, Package } from 'lucide-react';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Textarea } from '@/components/ui/textarea';
// import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
// import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
// import { Badge } from "@/components/ui/badge";

// // Importamos el Renderer de PDF
// import { PDFDownloadLink } from '@react-pdf/renderer';
// import { RFIDDocument } from './RFIDDocument'; // Asegúrate de importar el componente que creamos arriba

// type ExcelRow = { [key: string]: any };

// interface FileWithPath extends File {
//   webkitRelativePath: string;
// }

// export default function PDFRFIDGenerator() {
//   const [allFiles, setAllFiles] = useState<FileWithPath[]>([]);
//   const [folderListText, setFolderListText] = useState("");
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [consolidatedData, setConsolidatedData] = useState<ExcelRow[]>([]);
//   const [showPreview, setShowPreview] = useState(false);
//   const [isClient, setIsClient] = useState(false);

//   // Necesario para evitar errores de hidratación con react-pdf en Next.js
//   useEffect(() => {
//     setIsClient(true);
//   }, []);

//   const handleFolderUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
//     if (event.target.files && event.target.files.length > 0) {
//       const files = Array.from(event.target.files) as FileWithPath[];
//       const validFiles = files.filter(f => f.name.match(/\.(xlsx|xls)$/i) && !f.name.startsWith('~$'));

//       if (validFiles.length === 0) {
//         setError("No se encontraron archivos Excel.");
//         return;
//       }
//       setAllFiles(validFiles);
//       setConsolidatedData([]);
//       setShowPreview(false);
//       setError(null);
//     }
//   };

//   const filesToProcess = useMemo(() => {
//     if (!folderListText.trim()) return [];
//     const targetFolders = folderListText.split(/[\n,]+/).map(s => s.trim()).filter(s => s.length > 0);
//     if (targetFolders.length === 0) return [];
//     const orderedFiles: FileWithPath[] = [];
//     targetFolders.forEach(folderName => {
//       const matches = allFiles.filter(file => file.webkitRelativePath.includes(folderName));
//       orderedFiles.push(...matches);
//     });
//     return Array.from(new Set(orderedFiles));
//   }, [allFiles, folderListText]);

//   const processFiles = async () => {
//     if (filesToProcess.length === 0) {
//       setError("No hay archivos coincidentes.");
//       return;
//     }
//     setIsProcessing(true);
//     setError(null);
//     let allData: ExcelRow[] = [];
//     try {
//       for (const file of filesToProcess) {
//         const fileData = await file.arrayBuffer();
//         const workbook = XLSX.read(fileData);
//         const sheet = workbook.Sheets[workbook.SheetNames[0]];
//         const json = XLSX.utils.sheet_to_json<ExcelRow>(sheet, { defval: "" });
//         allData = allData.concat(json);
//       }
//       setConsolidatedData(allData);
//       setShowPreview(true);
//     } catch (err: any) {
//       setError("Error: " + err.message);
//     } finally {
//       setIsProcessing(false);
//     }
//   };

//   return (
//     <main className="container mx-auto px-4 py-8 max-w-6xl">
//       <div className="flex items-center justify-between mb-8">
//         <Button variant="ghost" asChild className="text-indigo-700 hover:bg-indigo-100">
//           <a href="/"><ArrowLeft className="mr-2 h-4 w-4" /> Volver</a>
//         </Button>
//         <h1 className="text-3xl font-bold text-indigo-700 flex items-center gap-3">
//           <Package className="h-8 w-8" /> Generador PDF RFID (Download)
//         </h1>
//         <div className="w-32"></div>
//       </div>

//       <div className="grid gap-6">
//         {/* PASO 1 */}
//         <Card className="border-l-4 border-l-blue-500 shadow-lg">
//           <CardHeader>
//             <CardTitle className="flex items-center gap-2"><FolderSearch className="text-blue-500"/> Paso 1: Carpeta Raíz</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <Button asChild variant="secondary" size="lg">
//               <label className="cursor-pointer">
//                 <FolderSearch className="mr-2 h-4 w-4" /> Seleccionar Carpeta
//                 <Input type="file" className="hidden" {...({ webkitdirectory: "", directory: "" } as any)} onChange={handleFolderUpload} />
//               </label>
//             </Button>
//             <span className="ml-4 text-sm font-bold text-green-600">{allFiles.length > 0 && `${allFiles.length} archivos`}</span>
//           </CardContent>
//         </Card>

//         {/* PASO 2 */}
//         <Card className={`border-l-4 shadow-lg ${filesToProcess.length > 0 ? 'border-l-green-500' : ''}`}>
//           <CardHeader>
//              <CardTitle className="flex items-center gap-2"><List className="text-green-500"/> Paso 2: Lista de Carpetas</CardTitle>
//           </CardHeader>
//           <CardContent>
//              <Textarea placeholder="7605D009792..." className="font-mono h-40" value={folderListText} onChange={(e) => setFolderListText(e.target.value)} />
//              <div className="mt-2 flex justify-end">
//                 <Button onClick={processFiles} disabled={filesToProcess.length === 0 || isProcessing} className="bg-green-600 hover:bg-green-700">
//                     {isProcessing ? <Loader2 className="animate-spin mr-2"/> : <Eye className="mr-2"/>} Previsualizar ({filesToProcess.length})
//                 </Button>
//              </div>
//              {error && <Alert variant="destructive" className="mt-4"><AlertTitle>Error</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>}
//           </CardContent>
//         </Card>

//         {/* PASO 3: DESCARGA DIRECTA */}
//         {showPreview && consolidatedData.length > 0 && isClient && (
//             <Card className="border-l-4 border-l-indigo-500 bg-indigo-50">
//                 <CardHeader>
//                     <CardTitle className="text-indigo-700 flex gap-2"><CheckCircle2/> Listo para descargar</CardTitle>
//                     <CardDescription>
//                         {consolidatedData.length} registros listos. El archivo se generará y descargará automáticamente.
//                     </CardDescription>
//                 </CardHeader>
//                 <CardFooter>
//                     {/* Botón Mágico de descarga PDF */}
//                     <PDFDownloadLink 
//                         document={<RFIDDocument data={consolidatedData} />} 
//                         fileName={`RFID_Report_${new Date().getTime()}.pdf`}
//                         className="w-full"
//                     >
//                         {({ blob, url, loading, error }) => (
//                             <Button 
//                                 size="lg" 
//                                 className="w-full bg-indigo-600 hover:bg-indigo-700 h-14" 
//                                 disabled={loading}
//                             >
//                                 {loading ? (
//                                     <><Loader2 className="animate-spin mr-2"/> Generando PDF...</>
//                                 ) : (
//                                     <><FileDown className="mr-2 h-5 w-5"/> Descargar PDF RFID (TB Format)</>
//                                 )}
//                             </Button>
//                         )}
//                     </PDFDownloadLink>
//                 </CardFooter>
//             </Card>
//         )}
//       </div>
//     </main>
//   );
// }