//src\app\move-ty-rfid\page.tsx
"use client";

// Importa los componentes y hooks necesarios
import { useState, type ChangeEvent, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  ArrowLeft, 
  Image, 
  Upload, 
  FileText, 
  Trash2, 
  Loader2, 
  AlertTriangle,
  Download
} from 'lucide-react';

export default function MoveImgTyRfidPage() {
  
  // --- Estados para la lógica ---
  const [filesToProcess, setFilesToProcess] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logMessages, setLogMessages] = useState<string[]>([]);
  const [zipUrl, setZipUrl] = useState<string | null>(null);

  // --- NUEVO: Estado para el modal ---
  const [showModal, setShowModal] = useState(false);

  // --- Estados para los parámetros ---
  const [shiftA, setShiftA] = useState<number>(50);
  const [shiftB, setShiftB] = useState<number>(40);

  // --- Estados para cargar la librería ---
  const [jszipLib, setJszipLib] = useState<any>(null);
  const [isScriptLoading, setIsScriptLoading] = useState(true);

  // --- Cargar el script de JSZip dinámicamente ---
  useEffect(() => {
    const scriptUrl = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';

    const handleScriptLoad = () => {
      if (typeof (window as any).JSZip === 'function') {
        setJszipLib(() => (window as any).JSZip);
        setIsScriptLoading(false);
      } else {
        setError("Error al cargar la librería JSZip (tipo incorrecto).");
        setIsScriptLoading(false);
      }
    };

    const handleScriptError = () => {
      setError("No se pudo cargar la librería JSZip. Por favor, recarga la página.");
      setIsScriptLoading(false);
    };

    let script = document.querySelector(`script[src="${scriptUrl}"]`) as HTMLScriptElement | null;
    
    if (!script) {
      script = document.createElement('script');
      script.src = scriptUrl;
      script.async = true;
      script.onload = handleScriptLoad;
      script.onerror = handleScriptError;
      document.body.appendChild(script);
    } else {
      script.addEventListener('load', handleScriptLoad);
      script.addEventListener('error', handleScriptError);

      if ((window as any).JSZip && typeof (window as any).JSZip === 'function') {
        handleScriptLoad();
      }
    }

    return () => {
      script?.removeEventListener('load', handleScriptLoad);
      script?.removeEventListener('error', handleScriptError);
    };
  }, []);

  // --- Manejador para la subida de archivos ---
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newFiles = Array.from(event.target.files).filter(file => 
        file.type === 'image/jpeg' || file.name.toLowerCase().endsWith('.jpg')
      );
      
      setFilesToProcess(prevFiles => {
        const existingFileKeys = new Set(
          prevFiles.map(f => `${f.name}-${f.size}`)
        );
        const uniqueNewFiles = newFiles.filter(f => {
          const fileKey = `${f.name}-${f.size}`;
          return !existingFileKeys.has(fileKey);
        });
        return [...prevFiles, ...uniqueNewFiles];
      });

      setError(null);
      setLogMessages([]);
      setZipUrl(null);
    }
  };

  // --- Quitar un archivo de la lista ---
  const removeFile = (fileToRemove: File) => {
    setFilesToProcess(files => files.filter(file => file !== fileToRemove));
  };

  // --- Función para cargar un archivo a un objeto de Imagen ---
  const loadImage = (file: File): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve(img);
      };
      img.onerror = (err) => {
        URL.revokeObjectURL(url);
        reject(new Error(`No se pudo cargar la imagen: ${file.name}`));
      };
      img.src = url;
    });
  };

  // --- EL PROCESO PRINCIPAL ---
  const processImages = async () => {
    // NUEVO: Verificar si hay archivos antes de procesar
    if (filesToProcess.length === 0) {
      setShowModal(true);
      return;
    }

    if (!jszipLib) {
      setError("La librería de compresión (JSZip) aún no está cargada. Intenta de nuevo en unos segundos.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setLogMessages([]);
    setZipUrl(null);

    const zip = new jszipLib();
    const newLogs: string[] = [];

    for (const file of filesToProcess) {
      try {
        const image = await loadImage(file);

        const canvas = document.createElement('canvas');
        canvas.width = image.width;
        canvas.height = image.height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          throw new Error("No se pudo obtener el contexto del canvas.");
        }

        ctx.drawImage(image, 0, 0);

        const margin = 70;
        const minWidth = (margin * 2) + 1;

        if (image.width < minWidth) {
          const warning = `ADVERTENCIA: ${file.name} es demasiado angosta (${image.width}px) y será omitida.`;
          newLogs.push(warning);
          setLogMessages([...newLogs]);
          continue;
        }

        const contentWidth = image.width - (margin * 2);
        
        // Área A
        const xA = margin;
        const yA = 150;
        const widthA = contentWidth;
        const heightA = 800;
        const newYA = yA - Number(shiftA);

        ctx.fillStyle = "white";
        ctx.fillRect(xA, yA, widthA, heightA);
        ctx.drawImage(image, xA, yA, widthA, heightA, xA, newYA, widthA, heightA);

        // Área B
        const xB = margin;
        const yB = 1270;
        const widthB = contentWidth;
        const heightB = 190;
        const newYB = yB + Number(shiftB);

        ctx.fillStyle = "white";
        ctx.fillRect(xB, yB, widthB, heightB);
        ctx.drawImage(image, xB, yB, widthB, heightB, xB, newYB, widthB, heightB);

        const blob = await new Promise<Blob | null>(resolve => {
          canvas.toBlob(resolve, 'image/jpeg', 0.95);
        });

        if (!blob) {
          throw new Error(`No se pudo convertir el canvas a Blob para ${file.name}`);
        }

        zip.file(file.name, blob);
        newLogs.push(`ÉXITO: ${file.name} procesada.`);
        setLogMessages([...newLogs]);

      } catch (e: any) {
        const errorMsg = `ERROR: ${file.name} - ${e.message}`;
        newLogs.push(errorMsg);
        setLogMessages([...newLogs]);
      }
    }

    try {
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(zipBlob);
      setZipUrl(url);
      newLogs.push("--- Proceso completado. Listo para descargar. ---");
      setLogMessages([...newLogs]);
    } catch (e: any) {
      setError(`Error al generar el archivo ZIP: ${e.message}`);
    }

    setIsLoading(false);
  };

  // NUEVO: Función para manejar el intento de descarga sin archivos
  const handleDownloadClick = (e: React.MouseEvent) => {
    if (!zipUrl) {
      e.preventDefault();
      setShowModal(true);
    }
  };
  
  return (
    <main className="flex-grow container mx-auto px-4 py-8 md:py-12">
        
        {/* --- MODAL DE ADVERTENCIA --- */}
        <AlertDialog open={showModal} onOpenChange={setShowModal}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                No hay archivos para procesar
              </AlertDialogTitle>
              <AlertDialogDescription>
                Por favor, sube al menos una imagen JPG antes de procesar o descargar.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction 
                onClick={() => setShowModal(false)}
                className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
              >
                Entendido
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* --- BOTÓN DE REGRESAR --- */}
        <div className="mb-0.1">
          <Button asChild variant="ghost" className="text-blue-700 dark:text-blue-400 hover:bg-blue-500 dark:hover:bg-blue-950 font-medium">
            <a href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Regresar al Menú Principal
            </a>
          </Button>
        </div>

        <div className="text-center mb-2">
          <h1 className="text-4xl md:text-5xl font-headline font-bold text-blue-700 dark:text-blue-400">
            Move img TY RFID
          </h1>
          <p className="text-muted-foreground mt-2">
            Esta herramienta moverá y renombrará imágenes basado en un archivo Excel.
          </p>
        </div>
        
        {error && (
          <Alert variant="destructive" className="max-w-2xl mx-auto mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {isScriptLoading && (
          <Alert variant="default" className="max-w-2xl mx-auto mb-4 bg-secondary/50">
            <Loader2 className="h-4 w-4 animate-spin" />
            <AlertTitle>Cargando librerías...</AlertTitle>
            <AlertDescription>Iniciando la herramienta de compresión ZIP.</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-1 gap-8 items-start max-w-7xl mx-auto">
          <Card className="w-full shadow-lg lg:max-w-2xl lg:mx-auto border-blue-500 dark:border-blue-400">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
                <Image className="h-6 w-6"/>
                Procesador de Imágenes TY RFID
              </CardTitle>
              <CardDescription>
                Sigue los pasos para modificar tus imágenes.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              
              {/* --- PASO 1: CARGAR IMÁGENES --- */}
              <div className="space-y-4">
                <h3 className="font-semibold">1. Cargar Imágenes (.jpg)</h3>
                <div className="flex flex-col items-center gap-4 rounded-md border p-4 border-blue-500/50 dark:border-blue-400/50">
                  <Button 
                    asChild 
                    size="lg" 
                    disabled={isLoading || isScriptLoading}
                    className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                  >
                    <label htmlFor="file-upload" className={`cursor-pointer ${isLoading || isScriptLoading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                      <Upload className="mr-2 h-5 w-5" />
                      Seleccionar Imágenes
                    </label>
                  </Button>
                  <p className="text-sm text-muted-foreground">
                    {filesToProcess.length > 0
                      ? `${filesToProcess.length} imágen(es) seleccionada(s)`
                      : "Sube una o más imágenes JPG"}
                  </p>

                  <Input
                    id="file-upload"
                    type="file"
                    multiple
                    accept="image/jpeg"
                    className="hidden"
                    onChange={handleFileChange}
                    disabled={isLoading || isScriptLoading}
                  />
                </div>

                {filesToProcess.length > 0 && (
                  <div className="space-y-2">
                      <h4 className="font-semibold text-sm">Imágenes en cola:</h4>
                      <ul className="space-y-2 max-h-48 overflow-y-auto pr-2 border rounded-md p-2 border-blue-500/50 dark:border-blue-400/50">
                        {filesToProcess.map((file, index) => (
                          <li key={index} className="flex items-center justify-between bg-secondary/30 p-2 rounded-md text-sm">
                            <div className="flex items-center gap-2 truncate">
                              <FileText className="h-4 w-4 shrink-0" />
                              <span className="truncate">{file.name}</span>
                            </div>
                            <Button variant="destructive" size="icon" className="h-8 w-8 shrink-0" onClick={() => removeFile(file)} disabled={isLoading || isScriptLoading}>
                              <Trash2 className="h-5 w-5" />
                              <span className="sr-only">Remove file</span>
                            </Button>
                          </li>
                        ))}
                      </ul>
                  </div>
                )}
              </div>

              {/* --- PASO 2: CONFIGURAR PARÁMETROS --- */}
              <div className="space-y-4">
                <h3 className="font-semibold">2. Configurar Parámetros (px)</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-md border p-4 border-blue-500/50 dark:border-blue-400/50">
                  <div className="space-y-2">
                    <Label htmlFor="shiftA">Mover Área A (Arriba)</Label>
                    <Input
                      id="shiftA"
                      type="number"
                      value={shiftA}
                      onChange={(e) => setShiftA(Number(e.target.value))}
                      disabled={isLoading || isScriptLoading}
                      placeholder="Ej: 50"
                    />
                    <p className="text-xs text-muted-foreground">Default: 50</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="shiftB">Mover Área B (Abajo)</Label>
                    <Input
                      id="shiftB"
                      type="number"
                      value={shiftB}
                      onChange={(e) => setShiftB(Number(e.target.value))}
                      disabled={isLoading || isScriptLoading}
                      placeholder="Ej: 40"
                    />
                    <p className="text-xs text-muted-foreground">Default: 40</p>
                  </div>
                </div>
              </div>

              {/* --- PASO 3: PROCESAR Y VER REGISTRO --- */}
              <div className="space-y-4">
                <h3 className="font-semibold">3. Procesar</h3>
                <Button 
                  onClick={processImages} 
                  disabled={isLoading || isScriptLoading} 
                  className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Procesando...
                    </>
                  ) : filesToProcess.length > 0 ? `Procesar ${filesToProcess.length} imágen(es)` : 'Procesar Imágenes'}
                </Button>

                {logMessages.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Registro del proceso:</h4>
                    <Alert variant="default" className="max-h-48 overflow-y-auto bg-secondary/50 border-blue-500/50 dark:border-blue-400/50">
                      <AlertDescription>
                        <pre className="text-xs whitespace-pre-wrap">
                          {logMessages.join('\n')}
                        </pre>
                      </AlertDescription>
                    </Alert>
                  </div>
                )}
              </div>
            </CardContent>

            {/* --- PIE DE PÁGINA CON DESCARGA --- */}
            <CardFooter>
              <Button 
                variant="default" 
                className=" w-full bg-gray-500 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!zipUrl || isLoading || isScriptLoading}
                onClick={handleDownloadClick}
                asChild={zipUrl ? true : false}
              >
                {zipUrl ? (
                  <a href={zipUrl} download="imagenes_procesadas.zip">
                    <Download className="mr-2 h-5 w-5"/>
                    Descargar ZIP con Imágenes
                  </a>
                ) : (
                  <>
                    <Download className="mr-2 h-5 w-5"/>
                    Descargar ZIP con Imágenes
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </main>
  );
}