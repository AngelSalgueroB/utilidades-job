"use client";
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  ArrowLeft, 
  Image as ImageIcon,
  Loader2, 
  Download,
  Sparkles,
  Upload,
  FileText,
  Trash2
} from 'lucide-react';

type ProcessedImage = {
  name: string;
  url: string;
};

export default function Erase47thPage() {
  
  const [files, setFiles] = useState<File[]>([]);
  const [processedImages, setProcessedImages] = useState<ProcessedImage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
      setProcessedImages([]);
      setError(null);
    }
  };

  const removeFile = (fileToRemove: File) => {
    setFiles(files.filter(file => file !== fileToRemove));
  };

  const processImage = (file: File): Promise<ProcessedImage> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            return reject(new Error('No se pudo obtener el contexto 2D'));
          }
          
          ctx.drawImage(img, 0, 0);
          
          const x = 400;
          const y = 180;
          const width = 785 - 400;
          const height = 230 - 180;
          
          ctx.fillStyle = "#FFFFFF";
          ctx.fillRect(x, y, width, height);
          
          const dataUrl = canvas.toDataURL('image/jpeg');
          
          resolve({
            name: file.name.replace(/\.jpg/i, '_ERASED.jpg'),
            url: dataUrl
          });
        };
        
        img.onerror = reject;
        img.src = event.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleProcessImages = async () => {
    if (!files || files.length === 0) {
      setError("Por favor, selecciona al menos un archivo JPG.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setProcessedImages([]);
    
    const processingPromises: Promise<ProcessedImage>[] = [];
    
    for (const file of files) {
      if (file.type !== 'image/jpeg') {
        setError(`El archivo ${file.name} no es un JPG y será omitido.`);
        continue;
      }
      processingPromises.push(processImage(file));
    }
    try {
      const results = await Promise.all(processingPromises);
      setProcessedImages(results);
    } catch (err) {
      console.error(err);
      setError("Ocurrió un error al procesar una imagen.");
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <main className="flex-grow container mx-auto px-4 py-8 md:py-12">
        
        <div className="mb-0.5">
          <Button asChild variant="ghost" className="text-indigo-700 dark:text-indigo-400 hover:bg-indigo-500 dark:hover:bg-indigo-950 font-medium">
            <a href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Regresar al Menú Principal
            </a>
          </Button>
        </div>
        <div className="text-center mb-0.5">
          <h1 className="text-4xl md:text-5xl font-headline font-bold text-indigo-700 dark:text-indigo-400">
            Erase 47TH
          </h1>
          <p className="text-muted-foreground mt-2">
            Sube tus imágenes JPG para borrar un área específica.
          </p>
        </div>
        
        {error && (
          <Alert variant="destructive" className="max-w-2xl mx-auto mb-4">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <Card className="w-full shadow-lg lg:max-w-2xl lg:mx-auto border-indigo-500 dark:border-indigo-400">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400">
              <ImageIcon className="h-6 w-6"/>
              1. Cargar Imágenes
            </CardTitle>
            <CardDescription>
              Selecciona uno o varios archivos .jpg de tu computador.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h3 className="font-semibold">1. Cargar Imágenes (.jpg)</h3>
              <div className="flex flex-col items-center gap-4 rounded-md border p-6 border-indigo-500/50 dark:border-indigo-400/50">
                <Button 
                  asChild 
                  size="lg" 
                  disabled={isLoading}
                  className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
                >
                  <label htmlFor="file-upload" className={`cursor-pointer ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    <Upload className="mr-2 h-5 w-5" />
                    Seleccionar Imágenes
                  </label>
                </Button>
                <p className="text-sm text-muted-foreground">
                  {files.length > 0
                    ? `${files.length} imágen(es) seleccionada(s)`
                    : "Sube una o más imágenes JPG"}
                </p>

                <Input
                  id="file-upload"
                  type="file"
                  multiple
                  accept="image/jpeg"
                  className="hidden"
                  onChange={handleFileChange}
                  disabled={isLoading}
                />
              </div>

              {files.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Imágenes en cola:</h4>
                  <ul className="space-y-2 max-h-48 overflow-y-auto pr-2 border rounded-md p-2 border-indigo-500/50 dark:border-indigo-400/50">
                    {files.map((file, index) => (
                      <li key={index} className="flex items-center justify-between bg-secondary/30 p-2 rounded-md text-sm">
                        <div className="flex items-center gap-2 truncate">
                          <FileText className="h-4 w-4 shrink-0" />
                          <span className="truncate">{file.name}</span>
                        </div>
                        <Button variant="destructive" size="icon" className="h-8 w-8 shrink-0" onClick={() => removeFile(file)} disabled={isLoading}>
                          <Trash2 className="h-5 w-5" />
                          <span className="sr-only">Remove file</span>
                        </Button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            
            <Button 
              onClick={handleProcessImages} 
              disabled={isLoading || files.length === 0} 
              className="w-full bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Procesando...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Procesar {files.length || 0} imágenes
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {processedImages.length > 0 && (
          <div className="mt-8">
            <h2 className="text-center text-3xl font-headline font-bold text-indigo-700 dark:text-indigo-400 mb-4">
              Resultados
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {processedImages.map((image) => (
                <Card key={image.name} className="overflow-hidden">
                  <CardHeader>
                    <CardTitle className="text-base truncate">{image.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <img 
                      src={image.url} 
                      alt={`Procesada - ${image.name}`}
                      className="w-full h-auto rounded-md border"
                    />
                    <Button asChild className="w-full mt-4 bg-indigo-500 hover:bg-indigo-600">
                      <a 
                        href={image.url}
                        download={image.name}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Descargar
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>
  );
}