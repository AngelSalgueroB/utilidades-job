"use client";

import { useState, type ChangeEvent } from 'react';
import * as XLSX from 'xlsx';
// Se añade 'ArrowLeft' para el ícono de regreso
import { Upload, Download, FileText, Loader2, AlertTriangle, Trash2, ArrowLeft } from 'lucide-react'; 
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Define a type for the merged data for better type safety
type ExcelRow = { [key: string]: any };

export default function MergeExcelPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [mergedData, setMergedData] = useState<ExcelRow[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newFiles = Array.from(event.target.files);

      setFiles(prevFiles => {
        const existingFileKeys = new Set(
          prevFiles.map(f => `${f.name}-${f.size}-${f.lastModified}`)
        );
        const uniqueNewFiles = newFiles.filter(f => {
          const fileKey = `${f.name}-${f.size}-${f.lastModified}`;
          return !existingFileKeys.has(fileKey);
        });
        return [...prevFiles, ...uniqueNewFiles];
      });

      setMergedData([]);
      setHeaders([]);
      setError(null);
    }
  };
  
  const removeFile = (fileToRemove: File) => {
    setFiles(files.filter(file => file !== fileToRemove));
  };

  const downloadFile = (data: ExcelRow[], dataHeaders: string[]) => {
    if (data.length === 0) {
      setError("No data available to download.");
      return;
    }
    try {
      const worksheet = XLSX.utils.json_to_sheet(data, { header: dataHeaders });
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'MergedData');
      XLSX.writeFile(workbook, `Merge_files.xlsx`);
    } catch (e) {
      console.error(e);
      setError("An error occurred while creating the download file.");
    }
  };
  
  const processFiles = async () => {
    if (files.length === 0) {
      setError("Please upload at least one Excel file.");
      return;
    }
    setIsLoading(true);
    setError(null);
    
    let allData: ExcelRow[] = [];
    let firstFileHeaders: string[] = [];

    try {
      const firstFile = files[0];
      const firstFileData = await firstFile.arrayBuffer();
      const firstWorkbook = XLSX.read(firstFileData);
      const firstSheetName = firstWorkbook.SheetNames[0];
      const firstWorksheet = firstWorkbook.Sheets[firstSheetName];
      const firstJsonData = XLSX.utils.sheet_to_json<ExcelRow>(firstWorksheet, { header: 1, defval: "" });
      
      if (firstJsonData.length > 0) {
        firstFileHeaders = (firstJsonData[0] as string[]).map(String);
      } else {
        throw new Error("The first Excel file is empty or does not contain headers.");
      }
      setHeaders(firstFileHeaders);

      for (const file of files) {
        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json<ExcelRow>(worksheet, { defval: "" });
        
        allData = allData.concat(jsonData);
      }
      
      const normalizedData = allData.map(row => {
        const newRow: ExcelRow = {};
        for (const header of firstFileHeaders) {
          newRow[header] = row[header] ?? "";
        }
        return newRow;
      });

      setMergedData(normalizedData);

      if (normalizedData.length > 0) {
        downloadFile(normalizedData, firstFileHeaders);
      } else {
        setError("No data was found to merge.");
      }

    } catch (e: any) {
      console.error(e);
      setError(e.message || "An error occurred while processing the files. Please ensure they are valid Excel files.");
      setMergedData([]);
      setHeaders([]);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
      <main className="flex-grow container mx-auto px-4 py-8 md:py-12">
        
        {/* --- BOTÓN DE REGRESAR AGREGADO --- */}
        <div className="mb-6">
          <Button asChild variant="ghost" className="text-green-700 dark:text-green-400 hover:bg-green-500 dark:hover:bg-green-950 font-medium">
            {/* Se usa una etiqueta <a> simple para navegar a la raíz */}
            <a href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Regresar al Menú Principal
            </a>
          </Button>
        </div>
        {/* --- FIN DEL BOTÓN DE REGRESAR --- */}

        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-headline font-bold text-green-600">TB RFID</h1>
          <p className="text-muted-foreground mt-2">Merge your Excel files from TB database into a single file with ease.</p>

        </div>
        <div className="max-w-7xl mx-auto mb-4 lg:max-w-2xl">
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-1 gap-8 items-start max-w-7xl mx-auto">
          <Card className="w-full shadow-lg lg:max-w-2xl lg:mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-6 w-6"/>
                1. Upload & Merge
              </CardTitle>
              <CardDescription>Select the Excel files (.xlsx, .xls, .csv) you want to combine. The first file's headers will be used as the template.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                  {/* INICIA OPCIÓN 1 */}
                  <div className="flex flex-col items-center gap-4">
                    <Button asChild size="lg" className="bg-green-600 hover:bg-green-700">
                      <label htmlFor="file-upload" className="cursor-pointer">
                        <Upload className="mr-2 h-5 w-5" />
                        Seleccionar Archivos
                      </label>
                    </Button>
                    <p className="text-sm text-muted-foreground">
                      {files.length > 0
                        ? `${files.length} archivo(s) seleccionado(s)`
                        : "Sube uno o más archivos Excel"}
                    </p>

                    {/* Input oculto que hace la magia */}
                    <Input
                      id="file-upload"
                      type="file"
                      multiple
                      accept=".xlsx, .xls, .csv"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </div>
                  {/* TERMINA OPCIÓN 1 */}

                  {/* Muestra la lista de archivos seleccionados */}
                  {files.length > 0 && (
                    <div className="space-y-2">
                       <h3 className="font-semibold text-sm">Selected Files:</h3>
                       <ul className="space-y-2 max-h-64 overflow-y-auto pr-2">
                         {files.map((file, index) => (
                           <li key={index} className="flex items-center justify-between bg-secondary/30 p-2 rounded-md text-sm">
                             <div className="flex items-center gap-2 truncate">
                               <FileText className="h-4 w-4 shrink-0" />
                               <span className="truncate">{file.name}</span>
                             </div>
                             <Button variant="destructive" size="icon" className="h-8 w-8 shrink-0" onClick={() => removeFile(file)}>
                               <Trash2 className="h-5 w-5" />
                               <span className="sr-only">Remove file</span>
                             </Button>
                           </li>
                         ))}
                       </ul>
                    </div>
                  )}
            </CardContent>
            <CardFooter>
                <Button onClick={processFiles} disabled={files.length === 0 || isLoading} className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400">
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : `Merge & Download ${files.length} File${files.length !== 1 ? 's' : ''}`}
                </Button>
            </CardFooter>
          </Card>
        </div>
      </main>
  );
}