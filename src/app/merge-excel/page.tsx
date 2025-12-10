"use client";

import { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { Loader2, AlertTriangle, ArrowLeft, FolderSearch, List, CheckCircle2 } from 'lucide-react'; 
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

type ExcelRow = { [key: string]: any };

interface FileWithPath extends File {
  webkitRelativePath: string;
}

export default function JavaLogicReplica() {
  const [allFiles, setAllFiles] = useState<FileWithPath[]>([]);
  const [folderListText, setFolderListText] = useState(""); 
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 1. CARGA DE LA CARPETA RAÍZ
  const handleFolderUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const files = Array.from(event.target.files) as FileWithPath[];
      
      const validFiles = files.filter(f => 
        f.name.match(/\.(xlsx|xls|csv)$/i) && !f.name.startsWith('~$')
      );

      if (validFiles.length === 0) {
        setError("No se encontraron archivos Excel en la carpeta seleccionada.");
        return;
      }

      setAllFiles(validFiles);
      setError(null);
    }
  };

  // 2. FILTRADO Y ORDENAMIENTO (CORREGIDO)
  const filesToProcess = useMemo(() => {
    if (!folderListText.trim()) return [];

    // Obtenemos la lista ordenada tal cual la escribió el usuario
    const targetFolders = folderListText
      .split(/[\n,]+/) 
      .map(s => s.trim())
      .filter(s => s.length > 0);

    if (targetFolders.length === 0) return [];

    const orderedFiles: FileWithPath[] = [];

    // LÓGICA NUEVA:
    // Iteramos sobre LA LISTA DEL USUARIO (no sobre los archivos del navegador)
    // Esto fuerza a que el orden de procesamiento sea idéntico al del texto.
    targetFolders.forEach(folderName => {
        // Buscamos en 'allFiles' los que coincidan con este nombre de carpeta
        const matches = allFiles.filter(file => 
            file.webkitRelativePath.includes(folderName)
        );
        
        // Si hay varios archivos en esa carpeta (ej. Part1, Part2), 
        // los agregamos. Si solo hay uno, se agrega ese.
        // Nota: spread (...) añade los elementos al array principal en este orden exacto.
        orderedFiles.push(...matches);
    });

    // Eliminamos duplicados por seguridad (si el usuario repitió el código en el texto, 
    // decidimos si queremos repetirlo o no. Usando Set eliminamos repeticiones exactas de archivo).
    return Array.from(new Set(orderedFiles));

  }, [allFiles, folderListText]);

  // 3. FUSIÓN Y DESCARGA
  const processAndDownload = async () => {
    if (filesToProcess.length === 0) {
      setError("No hay archivos que coincidan con la lista de carpetas proporcionada.");
      return;
    }

    setIsProcessing(true);
    setError(null);

    let allData: ExcelRow[] = [];
    let headers: string[] = [];

    try {
      // Tomamos el primero de la lista YA ORDENADA para las cabeceras
      const firstFile = filesToProcess[0];
      const buffer = await firstFile.arrayBuffer();
      const wb = XLSX.read(buffer);
      const ws = wb.Sheets[wb.SheetNames[0]];
      const jsonDataFirst = XLSX.utils.sheet_to_json<ExcelRow>(ws, { header: 1, defval: "" });
      
      if (jsonDataFirst.length > 0) {
        headers = (jsonDataFirst[0] as string[]).map(String);
      }

      // Procesamos en el orden estricto de filesToProcess
      for (const file of filesToProcess) {
        const fileData = await file.arrayBuffer();
        const workbook = XLSX.read(fileData);
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json<ExcelRow>(sheet, { defval: "" });

        const normalizedRows = json.map(row => {
             const newRow: ExcelRow = {};
             headers.forEach(h => {
                 newRow[h] = row[h] ?? "";
             });
             return newRow;
        });

        allData = allData.concat(normalizedRows);
      }

      const wsNew = XLSX.utils.json_to_sheet(allData, { header: headers });
      const wbNew = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wbNew, wsNew, "Merged Data");
      XLSX.writeFile(wbNew, `Combine_${new Date().getTime()}.xlsx`);

    } catch (err: any) {
      setError("Error al procesar: " + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl">
        
      <div className="flex items-center justify-between mb-8">
        <Button variant="ghost" asChild className="text-green-700 hover:bg-green-100">
            <a href="/"><ArrowLeft className="mr-2 h-4 w-4" /> Volver</a>
        </Button>
        <h1 className="text-2xl font-bold text-green-700">Excel Merger (Orden Estricto)</h1>
      </div>

      <div className="grid gap-6">
        
        {/* --- PASO 1: SELECCIONAR SOURCE DIR --- */}
        <Card className="border-l-4 border-l-blue-500 shadow-sm">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                    <FolderSearch className="h-5 w-5 text-blue-500"/>
                    Paso 1: Seleccionar "Source Directory"
                </CardTitle>
                <CardDescription>
                    Selecciona la carpeta raíz donde están todos los archivos.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex items-center gap-4">
                    <Button asChild variant="secondary" className="cursor-pointer">
                        <label>
                            Seleccionar Carpeta Raíz
                            <Input 
                                type="file" 
                                className="hidden" 
                                {...({ webkitdirectory: "", directory: "" } as any)} 
                                onChange={handleFolderUpload}
                            />
                        </label>
                    </Button>
                    <div className="text-sm text-muted-foreground">
                        {allFiles.length > 0 ? (
                            <span className="text-green-600 flex items-center font-bold">
                                <CheckCircle2 className="mr-1 h-4 w-4"/> 
                                {allFiles.length} archivos Excel listos en memoria.
                            </span>
                        ) : "Ninguna carpeta seleccionada"}
                    </div>
                </div>
            </CardContent>
        </Card>

        {/* --- PASO 2: LISTA DE CARPETAS ESPECÍFICAS --- */}
        <Card className={`border-l-4 shadow-sm transition-opacity ${allFiles.length === 0 ? 'opacity-50 pointer-events-none' : 'border-l-green-500'}`}>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                    <List className="h-5 w-5 text-green-500"/>
                    Paso 2: Pegar Lista de Carpetas (Orden Estricto)
                </CardTitle>
                <CardDescription>
                    Pega los nombres de las carpetas. El Excel final respetará este orden exacto (de arriba a abajo).
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <Textarea 
                    placeholder={`7605D008422
7605D008423
7605D008424`} 
                    className="font-mono text-sm h-40"
                    value={folderListText}
                    onChange={(e) => setFolderListText(e.target.value)}
                />
                
                <div className="bg-slate-100 dark:bg-slate-900 p-3 rounded-md flex justify-between items-center">
                    <span className="text-sm font-medium">Archivos ordenados listos:</span>
                    <Badge variant={filesToProcess.length > 0 ? "default" : "destructive"} className="text-md px-3 py-1">
                        {filesToProcess.length}
                    </Badge>
                </div>

                {error && (
                    <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4"/>
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}
            </CardContent>
            <CardFooter>
                <Button 
                    className="w-full bg-green-600 hover:bg-green-700 text-lg h-12"
                    disabled={filesToProcess.length === 0 || isProcessing}
                    onClick={processAndDownload}
                >
                    {isProcessing ? (
                        <><Loader2 className="mr-2 h-5 w-5 animate-spin"/> Procesando...</>
                    ) : (
                        `Combinar ${filesToProcess.length} Archivos`
                    )}
                </Button>
            </CardFooter>
        </Card>

      </div>
    </main>
  );
}