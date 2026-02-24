"use client";

import { useState, type ChangeEvent, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Download,
  LayoutTemplate,
  Maximize,
} from "lucide-react";

export default function MoveImgTyRfidPage() {
  // --- Estados para la lógica ---
  const [filesToProcess, setFilesToProcess] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logMessages, setLogMessages] = useState<string[]>([]);
  const [zipUrl, setZipUrl] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  // --- NUEVO: Estado para el MODO ---
  const [mode, setMode] = useState<"con-marco" | "sin-marco">("con-marco");

  // --- Estados para los parámetros ---
  const [shiftA, setShiftA] = useState<number>(50);
  const [shiftB, setShiftB] = useState<number>(40);

  // --- Estados para cargar la librería ---
  const [jszipLib, setJszipLib] = useState<any>(null);
  const [isScriptLoading, setIsScriptLoading] = useState(true);

  // Efecto para cambiar los valores por defecto según el modo seleccionado
  useEffect(() => {
    if (mode === "con-marco") {
      setShiftA(40);
      setShiftB(40);
    } else {
      setShiftA(40); // Como en tu código Java (yA - 40)
      setShiftB(20); // Como en tu código Java (yB + 20)
    }
  }, [mode]);

  // Cargar el script de JSZip dinámicamente
  useEffect(() => {
    const scriptUrl =
      "https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js";

    const handleScriptLoad = () => {
      if (typeof (window as any).JSZip === "function") {
        setJszipLib(() => (window as any).JSZip);
        setIsScriptLoading(false);
      } else {
        setError("Error al cargar la librería JSZip (tipo incorrecto).");
        setIsScriptLoading(false);
      }
    };

    const handleScriptError = () => {
      setError(
        "No se pudo cargar la librería JSZip. Por favor, recarga la página.",
      );
      setIsScriptLoading(false);
    };

    let script = document.querySelector(
      `script[src="${scriptUrl}"]`,
    ) as HTMLScriptElement | null;

    if (!script) {
      script = document.createElement("script");
      script.src = scriptUrl;
      script.async = true;
      script.onload = handleScriptLoad;
      script.onerror = handleScriptError;
      document.body.appendChild(script);
    } else {
      script.addEventListener("load", handleScriptLoad);
      script.addEventListener("error", handleScriptError);

      if (
        (window as any).JSZip &&
        typeof (window as any).JSZip === "function"
      ) {
        handleScriptLoad();
      }
    }

    return () => {
      script?.removeEventListener("load", handleScriptLoad);
      script?.removeEventListener("error", handleScriptError);
    };
  }, []);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newFiles = Array.from(event.target.files).filter(
        (file) =>
          file.type === "image/jpeg" ||
          file.name.toLowerCase().endsWith(".jpg"),
      );

      setFilesToProcess((prevFiles) => {
        const existingFileKeys = new Set(
          prevFiles.map((f) => `${f.name}-${f.size}`),
        );
        const uniqueNewFiles = newFiles.filter((f) => {
          const fileKey = `${f.name}-${f.size}`;
          return !existingFileKeys.has(fileKey);
        });
        return [...prevFiles, ...uniqueNewFiles];
      });

      setError(null);
      setLogMessages([]);
      setZipUrl(null);
      event.target.value = ""; // Limpiar input para permitir resubida
    }
  };

  const removeFile = (fileToRemove: File) => {
    setFilesToProcess((files) => files.filter((file) => file !== fileToRemove));
  };

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
    if (filesToProcess.length === 0) {
      setShowModal(true);
      return;
    }

    if (!jszipLib) {
      setError(
        "La librería de compresión (JSZip) aún no está cargada. Intenta de nuevo en unos segundos.",
      );
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

        const canvas = document.createElement("canvas");
        canvas.width = image.width;
        canvas.height = image.height;
        const ctx = canvas.getContext("2d");

        if (!ctx) throw new Error("No se pudo obtener el contexto del canvas.");

        // Dibujar imagen base original
        ctx.drawImage(image, 0, 0);

        if (mode === "con-marco") {
          // ==========================================
          // LÓGICA: CON MARCO (Original)
          // ==========================================
          const margin = 70;
          const minWidth = margin * 2 + 1;

          if (image.width < minWidth) {
            newLogs.push(
              `ADVERTENCIA: ${file.name} es demasiado angosta (${image.width}px) y será omitida.`,
            );
            setLogMessages([...newLogs]);
            continue;
          }

          const contentWidth = image.width - margin * 2;

          // Área A
          const xA = margin;
          const yA = 150;
          const widthA = contentWidth;
          const heightA = 800;
          const newYA = yA - Number(shiftA);

          ctx.fillStyle = "white";
          ctx.fillRect(xA, yA, widthA, heightA);
          ctx.drawImage(
            image,
            xA,
            yA,
            widthA,
            heightA,
            xA,
            newYA,
            widthA,
            heightA,
          );

          // Área B
          const xB = margin;
          const yB = 1270;
          const widthB = contentWidth;
          const heightB = 190;
          const newYB = yB + Number(shiftB);

          ctx.fillStyle = "white";
          ctx.fillRect(xB, yB, widthB, heightB);
          ctx.drawImage(
            image,
            xB,
            yB,
            widthB,
            heightB,
            xB,
            newYB,
            widthB,
            heightB,
          );
        } else {
          // ==========================================
          // LÓGICA: SIN MARCO (Traducción de Java)
          // ==========================================

          // Área A
          const xA = 0;
          const yA = 100;
          const widthA = image.width; // Usamos el ancho total de la imagen (993 en tu Java)
          const heightA = 800;
          const newYA = yA - Number(shiftA);

          ctx.fillStyle = "white";
          ctx.fillRect(xA, yA, widthA, heightA);
          ctx.drawImage(
            image,
            xA,
            yA,
            widthA,
            heightA,
            xA,
            newYA,
            widthA,
            heightA,
          );

          // Área B
          const xB = 0;
          const yB = 1300;
          const widthB = image.width;
          const heightB = 200;
          const newYB = yB + Number(shiftB);

          ctx.fillStyle = "white";
          ctx.fillRect(xB, yB, widthB, heightB);
          ctx.drawImage(
            image,
            xB,
            yB,
            widthB,
            heightB,
            xB,
            newYB,
            widthB,
            heightB,
          );
        }

        const blob = await new Promise<Blob | null>((resolve) => {
          canvas.toBlob(resolve, "image/jpeg", 0.95);
        });

        if (!blob)
          throw new Error(
            `No se pudo convertir el canvas a Blob para ${file.name}`,
          );

        zip.file(file.name, blob);
        newLogs.push(`ÉXITO: ${file.name} procesada. (${mode})`);
        setLogMessages([...newLogs]);
      } catch (e: any) {
        newLogs.push(`ERROR: ${file.name} - ${e.message}`);
        setLogMessages([...newLogs]);
      }
    }

    try {
      const zipBlob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(zipBlob);
      setZipUrl(url);
      newLogs.push("--- Proceso completado. Listo para descargar. ---");
      setLogMessages([...newLogs]);
    } catch (e: any) {
      setError(`Error al generar el archivo ZIP: ${e.message}`);
    }

    setIsLoading(false);
  };

  const handleDownloadClick = (e: React.MouseEvent) => {
    if (!zipUrl) {
      e.preventDefault();
      setShowModal(true);
    }
  };

  return (
    <main className="flex-grow container mx-auto px-4 py-8 md:py-12">
      {/* MODAL DE ADVERTENCIA */}
      <AlertDialog open={showModal} onOpenChange={setShowModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              No hay archivos para procesar
            </AlertDialogTitle>
            <AlertDialogDescription>
              Por favor, sube al menos una imagen JPG antes de procesar o
              descargar.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={() => setShowModal(false)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Entendido
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="mb-4">
        <Button
          asChild
          variant="ghost"
          className="text-blue-700 hover:bg-blue-50"
        >
          <a href="/">
            <ArrowLeft className="mr-2 h-4 w-4" /> Regresar al Menú Principal
          </a>
        </Button>
      </div>

      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-bold text-blue-700">
          Move img TY RFID
        </h1>
        <p className="text-slate-500 mt-2">
          Herramienta para reposicionar zonas en imágenes JPG.
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
        <Alert className="max-w-2xl mx-auto mb-4 bg-blue-50 border-blue-200">
          <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
          <AlertTitle>Cargando librerías...</AlertTitle>
          <AlertDescription>
            Iniciando la herramienta de compresión ZIP.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-1 gap-8 items-start max-w-2xl mx-auto">
        {/* SWITCH DE MODO */}
        <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 shadow-sm">
          <Button
            variant={mode === "con-marco" ? "default" : "ghost"}
            className={`flex-1 h-12 text-md font-semibold ${mode === "con-marco" ? "bg-blue-600 shadow-md text-white" : "text-slate-600 hover:bg-slate-200"}`}
            onClick={() => setMode("con-marco")}
          >
            <LayoutTemplate className="mr-2 h-5 w-5" /> Con Marco
          </Button>
          <Button
            variant={mode === "sin-marco" ? "default" : "ghost"}
            className={`flex-1 h-12 text-md font-semibold ${mode === "sin-marco" ? "bg-blue-600 shadow-md text-white" : "text-slate-600 hover:bg-slate-200"}`}
            onClick={() => setMode("sin-marco")}
          >
            <Maximize className="mr-2 h-5 w-5" /> Sin Marco
          </Button>
        </div>

        <Card className="w-full shadow-lg border-blue-200">
          <CardHeader className="bg-blue-50/50 border-b border-blue-100">
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <Image className="h-6 w-6" />
              Configuración ({mode === "con-marco" ? "Con Marco" : "Sin Marco"})
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6 pt-6">
            {/* PASO 1: CARGAR IMÁGENES */}
            <div className="space-y-4">
              <h3 className="font-semibold text-slate-700">
                1. Cargar Imágenes (.jpg)
              </h3>
              <div className="flex flex-col items-center gap-4 rounded-md border-2 border-dashed p-6 border-blue-200 bg-blue-50/30">
                <Button
                  asChild
                  size="lg"
                  disabled={isLoading || isScriptLoading}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <label className="cursor-pointer">
                    <Upload className="mr-2 h-5 w-5" /> Seleccionar Imágenes
                    <Input
                      type="file"
                      multiple
                      accept="image/jpeg"
                      className="hidden"
                      onChange={handleFileChange}
                      disabled={isLoading || isScriptLoading}
                    />
                  </label>
                </Button>
                <p className="text-sm text-slate-500">
                  {filesToProcess.length > 0
                    ? `${filesToProcess.length} imágen(es) en cola`
                    : "Sube una o más imágenes JPG"}
                </p>
              </div>

              {filesToProcess.length > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center bg-slate-100 p-2 rounded-t-md border-b">
                    <span className="text-sm font-bold text-slate-700">
                      Archivos:
                    </span>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="h-7"
                      onClick={() => setFilesToProcess([])}
                      disabled={isLoading}
                    >
                      Limpiar Lista
                    </Button>
                  </div>
                  <ul className="max-h-32 overflow-y-auto pr-2 border rounded-b-md p-2 bg-slate-50">
                    {filesToProcess.map((file, index) => (
                      <li
                        key={index}
                        className="flex items-center justify-between p-1 border-b last:border-0"
                      >
                        <span className="truncate text-sm text-slate-600 w-3/4">
                          {file.name}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-red-500"
                          onClick={() => removeFile(file)}
                          disabled={isLoading}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* PASO 2: CONFIGURAR PARÁMETROS */}
            <div className="space-y-4">
              <h3 className="font-semibold text-slate-700">
                2. Parámetros de Desplazamiento (px)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-md border p-4 bg-slate-50">
                <div className="space-y-2">
                  <Label htmlFor="shiftA">Mover Área A (Arriba)</Label>
                  <Input
                    id="shiftA"
                    type="number"
                    value={shiftA}
                    onChange={(e) => setShiftA(Number(e.target.value))}
                    disabled={isLoading || isScriptLoading}
                  />
                  <p className="text-xs text-slate-500">
                    Default: {mode === "con-marco" ? "40" : "40"}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shiftB">Mover Área B (Abajo)</Label>
                  <Input
                    id="shiftB"
                    type="number"
                    value={shiftB}
                    onChange={(e) => setShiftB(Number(e.target.value))}
                    disabled={isLoading || isScriptLoading}
                  />
                  <p className="text-xs text-slate-500">
                    Default: {mode === "con-marco" ? "40" : "20"}
                  </p>
                </div>
              </div>
            </div>

            {/* PASO 3: PROCESAR */}
            <div className="space-y-4 pt-2 border-t">
              <Button
                onClick={processImages}
                disabled={
                  isLoading || isScriptLoading || filesToProcess.length === 0
                }
                className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-lg shadow-md"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />{" "}
                    Procesando...
                  </>
                ) : (
                  `Procesar ${filesToProcess.length} Imágenes`
                )}
              </Button>

              {logMessages.length > 0 && (
                <div className="space-y-2 mt-4">
                  <h4 className="font-semibold text-sm text-slate-700">
                    Registro del proceso:
                  </h4>
                  <Alert className="bg-slate-900 text-green-400 border-0 max-h-48 overflow-y-auto">
                    <pre className="text-xs whitespace-pre-wrap font-mono">
                      {logMessages.join("\n")}
                    </pre>
                  </Alert>
                </div>
              )}
            </div>
          </CardContent>

          {/* PIE DE PÁGINA CON DESCARGA */}
          {zipUrl && (
            <CardFooter className="bg-green-50 border-t border-green-200 p-6">
              <Button
                asChild
                className="w-full bg-green-600 hover:bg-green-700 text-white h-14 text-lg shadow-lg"
              >
                <a
                  href={zipUrl}
                  download={`Imagenes_${mode}_${Date.now()}.zip`}
                >
                  <Download className="mr-2 h-6 w-6" /> Descargar ZIP Completado
                </a>
              </Button>
            </CardFooter>
          )}
        </Card>
      </div>
    </main>
  );
}
