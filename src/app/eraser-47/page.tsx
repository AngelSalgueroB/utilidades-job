"use client";

import { useState, useEffect, type ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  ArrowLeft, 
  Image as ImageIcon,
  Loader2, 
  Download,
  Sparkles,
  Upload,
  FileText,
  Trash2,
  Archive,
  AlertTriangle
} from 'lucide-react';

// Tipos
type ProcessedImage = {
  name: string;
  url: string;
};

export default function Erase47thPage() {
  
  // --- Estados Principales ---
  const [files, setFiles] = useState<File[]>([]);
  const [processedImages, setProcessedImages] = useState<ProcessedImage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- Estados para ZIP ---
  const [zipUrl, setZipUrl] = useState<string | null>(null);
  const [jszipLib, setJszipLib] = useState<any>(null);
  const [isScriptLoading, setIsScriptLoading] = useState(true);

  // 1. CARGA DINÁMICA DE JSZIP (CDN)
  useEffect(() => {
    const scriptUrl = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';

    const handleScriptLoad = () => {
      if (typeof (window as any).JSZip === 'function') {
        setJszipLib(() => (window as any).JSZip);
        setIsScriptLoading(false);
      } else {
        setError("Error al cargar la librería JSZip.");
        setIsScriptLoading(false);
      }
    };

    let script = document.querySelector(`script[src="${scriptUrl}"]`) as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement('script');
      script.src = scriptUrl;
      script.async = true;
      script.onload = handleScriptLoad;
      document.body.appendChild(script);
    } else {
      if ((window as any).JSZip) handleScriptLoad();
      else script.addEventListener('load', handleScriptLoad);
    }
  }, []);

  // --- CORRECCIÓN AQUÍ ---
  // Manejo de carga de archivos
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      // 1. Capturamos los archivos
      const newFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...newFiles]);
      
      // 2. Reiniciar estados de procesamiento
      setProcessedImages([]);
      setZipUrl(null); 
      setError(null);

      // 3. ¡IMPORTANTE! Limpiamos el valor del input para permitir 
      // volver a subir los mismos archivos si se borran.
      e.target.value = ''; 
    }
  };

  // Función: Limpiar todo de una vez
  const clearAllFiles = () => {
    setFiles([]);
    setProcessedImages([]);
    setZipUrl(null);
    setError(null);
  };

  // 2. FUNCIÓN DE PROCESAMIENTO
  const processImage = (file: File): Promise<{ preview: ProcessedImage, blob: Blob, filename: string }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        const img = new window.Image();
        
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          
          const ctx = canvas.getContext('2d');
          if (!ctx) return reject(new Error('No se pudo obtener contexto 2D'));
          
          // A. Dibujar imagen original
          ctx.drawImage(img, 0, 0);
          
          // B. Borrar Zona (Lógica fija)
          const x = 400;
          const y = 180;
          const width = 785 - 400;  
          const height = 230 - 180; 
          
          ctx.fillStyle = "#FFFFFF";
          ctx.fillRect(x, y, width, height);
          
          // C. Generar el archivo resultante
          const newFilename = file.name.replace(/\.(jpg|jpeg|png)/i, '.jpg');

          // Generar Blob para el ZIP y URL para previsualizar
          canvas.toBlob((blob) => {
            if (!blob) return reject(new Error('Error generando blob'));
            
            const dataUrl = URL.createObjectURL(blob);

            resolve({
                preview: { name: newFilename, url: dataUrl },
                blob: blob,
                filename: newFilename
            });
          }, 'image/jpeg', 0.95);
        };
        
        img.onerror = reject;
        img.src = event.target?.result as string;
      };
      
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // 3. PROCESAR TODO Y CREAR ZIP
  const handleProcessImages = async () => {
    if (!files || files.length === 0) {
      setError("Por favor, selecciona al menos un archivo JPG.");
      return;
    }
    if (!jszipLib) {
      setError("La librería ZIP aún no ha cargado. Espera unos segundos.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setProcessedImages([]);
    setZipUrl(null);
    
    try {
      const zip = new jszipLib();
      const previews: ProcessedImage[] = [];

      // Procesamos todas las imágenes en paralelo
      const promises = files.map(file => processImage(file));
      const results = await Promise.all(promises);

      // Agregamos cada resultado al ZIP y a la lista de vista previa
      results.forEach(res => {
          previews.push(res.preview);
          zip.file(res.filename, res.blob);
      });

      setProcessedImages(previews);

      // Generamos el archivo ZIP final
      const zipContent = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(zipContent);
      setZipUrl(url);

    } catch (err) {
      console.error(err);
      setError("Ocurrió un error al procesar las imágenes.");
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <main className="flex-grow container mx-auto px-4 py-8 md:py-12">
        
        <div className="mb-4">
          <Button asChild variant="ghost" className="text-indigo-700 hover:bg-indigo-50">
            <a href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Regresar al Menú Principal
            </a>
          </Button>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-headline font-bold text-indigo-700">
            Erase 47TH
          </h1>
          <p className="text-muted-foreground mt-2">
            Borrado de zona fija y descarga masiva en ZIP.
          </p>
        </div>
        
        {error && (
          <Alert variant="destructive" className="max-w-2xl mx-auto mb-4">
            <AlertTriangle className="h-4 w-4"/>
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isScriptLoading && (
             <Alert className="max-w-2xl mx-auto mb-4 bg-blue-50 border-blue-200">
                <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                <AlertTitle>Cargando...</AlertTitle>
                <AlertDescription>Preparando el sistema de compresión.</AlertDescription>
             </Alert>
        )}
        
        <Card className="w-full shadow-lg lg:max-w-2xl lg:mx-auto border-indigo-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-indigo-700">
              <ImageIcon className="h-6 w-6"/>
              Cargar Imágenes
            </CardTitle>
            <CardDescription>
              Selecciona tus archivos .jpg (Formato fijo)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            
            {/* AREA DE CARGA */}
            <div className="flex flex-col items-center gap-4 rounded-md border p-6 border-indigo-500/50">
                <Button asChild size="lg" disabled={isLoading} className="bg-indigo-600 hover:bg-indigo-700">
                  <label className="cursor-pointer">
                    <Upload className="mr-2 h-5 w-5" />
                    Seleccionar Imágenes
                    <Input type="file" multiple accept="image/jpeg" className="hidden" onChange={handleFileChange} disabled={isLoading} />
                  </label>
                </Button>
                <p className="text-sm text-muted-foreground">
                  {files.length > 0 ? `${files.length} seleccionadas` : "Sube imágenes JPG"}
                </p>
            </div>

            {/* LISTA DE ARCHIVOS */}
            {files.length > 0 && (
                <div className="space-y-2">
                    <div className="flex justify-between items-center bg-indigo-50 p-2 rounded-t-md border-b border-indigo-100">
                        <span className="text-sm font-bold text-indigo-800">
                            Archivos en cola: {files.length}
                        </span>
                        {/* BOTÓN ELIMINAR TODOS */}
                        <Button 
                            variant="destructive" 
                            size="sm" 
                            onClick={clearAllFiles} 
                            disabled={isLoading}
                            className="h-8"
                        >
                            <Trash2 className="mr-2 h-4 w-4" /> Eliminar Todos
                        </Button>
                    </div>
                    
                    <div className="border rounded-b-md p-2 max-h-48 overflow-y-auto bg-slate-50 text-sm text-slate-600">
                        {files.map((f, i) => (
                            <div key={i} className="truncate p-1 border-b last:border-0 border-slate-200">
                                {i + 1}. {f.name}
                            </div>
                        ))}
                    </div>
                </div>
            )}
            
            {/* BOTÓN PROCESAR */}
            <Button 
              onClick={handleProcessImages} 
              disabled={isLoading || files.length === 0 || isScriptLoading} 
              className="w-full bg-indigo-600 hover:bg-indigo-700 h-12 text-lg"
            >
              {isLoading ? <><Loader2 className="mr-2 animate-spin"/> Procesando...</> : <><Sparkles className="mr-2"/> Procesar Todo</>}
            </Button>
          </CardContent>

          {/* FOOTER: BOTÓN DE DESCARGA ZIP */}
          {zipUrl && (
              <CardFooter className="bg-green-50 border-t border-green-200 p-4">
                  <Button asChild className="w-full bg-green-600 hover:bg-green-700 text-white shadow-md h-12 text-lg">
                      <a href={zipUrl} download={`ERASED_47TH_${Date.now()}.zip`}>
                          <Archive className="mr-2 h-5 w-5"/> Descargar ZIP ({processedImages.length} imgs)
                      </a>
                  </Button>
              </CardFooter>
          )}
        </Card>

        {/* PREVIEW DE RESULTADOS (Opcional) */}
        {processedImages.length > 0 && (
          <div className="mt-8 max-w-4xl mx-auto">
            <h2 className="text-center text-xl font-bold text-gray-700 mb-4">Vista Previa (Primeras 8)</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {processedImages.slice(0, 8).map((image) => (
                <Card key={image.name} className="overflow-hidden">
                  <div className="aspect-square relative flex items-center justify-center bg-slate-100">
                      <img src={image.url} alt={image.name} className="max-w-full max-h-full p-2 object-contain" />
                  </div>
                  <div className="p-2 text-center text-xs bg-white truncate border-t">{image.name}</div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>
  );
}