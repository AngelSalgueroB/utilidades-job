"use client";

import { useState, type ChangeEvent, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  ArrowLeft, 
  FolderPlus,
  Loader2, 
  AlertTriangle,
  Download
} from 'lucide-react';

export default function CreatingFoldersPage() {
  
  const [basePath, setBasePath] = useState(String.raw`C:\Orders`);
  const [folderNames, setFolderNames] = useState(
    ""
  );
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scriptUrl, setScriptUrl] = useState<string | null>(null);
  const [folderCount, setFolderCount] = useState(0);

  useEffect(() => {
    return () => {
      if (scriptUrl) {
        URL.revokeObjectURL(scriptUrl);
      }
    };
  }, [scriptUrl]);

  const handleGenerateScript = () => {
    setIsLoading(true);
    setError(null);
    
    if (scriptUrl) {
      URL.revokeObjectURL(scriptUrl);
      setScriptUrl(null);
    }

    const folders = folderNames
      .split('\n')
      .map(name => name.trim())
      .filter(name => name.length > 0);

    if (folders.length === 0) {
      setError("La lista de carpetas está vacía. Por favor, introduce al menos un nombre.");
      setIsLoading(false);
      return;
    }

    let commands = [`@echo off`, `echo Creando carpetas...`, ``];
    
    for (const folderName of folders) {
      const fullPath = `${basePath}\\${folderName}`;
      commands.push(`mkdir "${fullPath}"`);
    }

    const total = folders.length;
    commands.push(``);
    commands.push(`echo.`);
    commands.push(`echo ${total} carpetas creadas exitosamente.`);
    commands.push(`echo.`);
    commands.push(`pause`);

    const scriptContent = commands.join('\r\n');
    const blob = new Blob([scriptContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    setScriptUrl(url);
    setFolderCount(total);
    setIsLoading(false);
  };
  
  return (
    <main className="flex-grow container mx-auto px-4 py-8 md:py-12">
        
        <div className="mb-0.5">
          <Button asChild variant="ghost" className="text-yellow-700 dark:text-yellow-400 hover:bg-yellow-500 dark:hover:bg-yellow-950 font-medium">
            <a href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Regresar al Menú Principal
            </a>
          </Button>
        </div>

        <div className="text-center mb-0.5">
          <h1 className="text-4xl md:text-5xl font-headline font-bold text-yellow-700 dark:text-yellow-400">
            Creador de Carpetas
          </h1>
          <p className="text-muted-foreground mt-2">
            Genera un script .bat para crear carpetas desde una lista.
          </p>
        </div>
        
        {error && (
          <Alert variant="destructive" className="max-w-2xl mx-auto mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {scriptUrl && folderCount > 0 && (
          <Alert className="max-w-2xl mx-auto mb-4 bg-yellow-50 dark:bg-yellow-950 border-yellow-500">
            <FolderPlus className="h-4 w-4 text-yellow-600" />
            <AlertTitle className="text-yellow-700 dark:text-yellow-400">¡Script Generado!</AlertTitle>
            <AlertDescription className="text-yellow-600 dark:text-yellow-300">
              Se crearán {folderCount} carpetas. Descarga el archivo .bat y ejecútalo en tu PC.
            </AlertDescription>
          </Alert>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-1 gap-8 items-start max-w-7xl mx-auto">
          <Card className="w-full shadow-lg lg:max-w-2xl lg:mx-auto border-yellow-500 dark:border-yellow-400">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-yellow-700 dark:text-yellow-400">
                <FolderPlus className="h-6 w-6"/>
                Parámetros de Creación
              </CardTitle>
              <CardDescription>
                Define la ruta base y pega la lista de nombres de carpetas.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="basePath" className="font-semibold">Ruta Base (Base Path)</Label>
                  <Input
                    id="basePath"
                    type="text"
                    value={basePath}
                    onChange={(e) => setBasePath(e.target.value)}
                    disabled={isLoading}
                    placeholder="Ej: C:\Orders"
                  />
                  <p className="text-xs text-muted-foreground">Ruta en tu PC donde se crearán las carpetas.</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="folderNames" className="font-semibold">Lista de Carpetas</Label>
                  <Textarea
                    id="folderNames"
                    value={folderNames}
                    onChange={(e) => setFolderNames(e.target.value)}
                    disabled={isLoading}
                    placeholder={"7605D009102\n7605D009103\n7605D009104\n7605D009105\n....."}
                    rows={10}
                  />
                  <p className="text-xs text-muted-foreground">Pega los nombres de las carpetas, uno por cada línea.</p>
                </div>
              </div>
              
              <Button 
                onClick={handleGenerateScript} 
                disabled={isLoading} 
                className="w-full bg-yellow-600 hover:bg-yellow-700 dark:bg-yellow-500 dark:hover:bg-yellow-600"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generando...
                  </>
                ) : "Generar Script (.bat)"}
              </Button>
            
            </CardContent>

            <CardFooter>
              <Button 
                variant="default" 
                className={`w-full transition-colors ${
                  scriptUrl 
                    ? 'bg-yellow-400 hover:bg-yellow-500 dark:bg-yellow-400 dark:hover:bg-yellow-500 text-gray-900' 
                    : 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
                }`}
                disabled={!scriptUrl || isLoading}
                asChild={scriptUrl ? true : false}
              >
                {scriptUrl ? (
                  <a href={scriptUrl} download="crear_carpetas.bat">
                    <Download className="mr-2 h-5 w-5"/>
                    Descargar Script (.bat) - {folderCount} carpetas
                  </a>
                ) : (
                  <>
                    <Download className="mr-2 h-5 w-5"/>
                    Descargar Script (.bat)
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </main>
  );
}