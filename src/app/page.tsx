import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FileText, Image, FolderPlus, Layers } from 'lucide-react'; // Agregamos Layers para el icono

export default function HomePage() {
  return (
    <main className="flex-grow container mx-auto px-4 py-8 md:py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary">
          Utilidades Job
        </h1>
        <p className="text-muted-foreground mt-2">
          Selecciona una acción para comenzar.
        </p>
      </div>

      {/* Grid para los botones grandes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">

        {/* 1. Merge EXCEL TB (Verde) */}
        <Link href="/merge-excel" passHref>
          <Button 
            variant="outline" 
            className="h-32 text-xl w-full flex flex-col items-center justify-center shadow-lg 
                       border-green-500 text-green-700 hover:bg-green-500 hover:text-white
                       dark:border-green-400 dark:text-green-400 dark:hover:bg-green-950"
          >
            <FileText className="h-8 w-8 mb-2" />
            <span>Merge EXCEL TB</span>
          </Button>
        </Link>

        {/* 2. Move img TY RFID (Azul) */}
        <Link href="/move-ty-rfid" passHref>
          <Button 
            variant="outline" 
            className="h-32 text-xl w-full flex flex-col items-center justify-center shadow-lg
                       border-blue-500 text-blue-700 hover:bg-blue-500 hover:text-white
                       dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-950"
          >
            <Image className="h-8 w-8 mb-2" />
            <span>Move img TY RFID</span>
          </Button>
        </Link>

        {/* 3. Erase img 47TH (Índigo) */}
        <Link href="/eraser-47" passHref>
          <Button 
            variant="outline"           
            className="h-32 text-xl w-full flex flex-col items-center justify-center shadow-lg
                       border-indigo-500 text-indigo-700 hover:bg-indigo-500 hover:text-white
                       dark:border-indigo-400 dark:text-indigo-400 dark:hover:bg-indigo-950"
          >
            <Image className="h-8 w-8 mb-2" />
            <span>Erase img 47TH</span>
          </Button>
        </Link>

        {/* 4. Creating folders (Amarillo) */}
        <Link href="/creating-folders" passHref>
          <Button 
            variant="outline"
            className="h-32 text-xl w-full flex flex-col items-center justify-center shadow-lg
                       border-yellow-500 text-yellow-700 hover:bg-yellow-500 hover:text-white
                       dark:border-yellow-400 dark:text-yellow-400 dark:hover:bg-yellow-950"
          >
            <FolderPlus className="h-8 w-8 mb-2" />
            <span>Creating folders</span>
          </Button>
        </Link>

        {/* 5. Creating OF (Rojo - Módulo Independiente) */}
        <Link href="/OF" passHref>
          <Button 
            variant="outline"
            className="h-32 text-xl w-full flex flex-col items-center justify-center shadow-lg
                       border-red-500 text-red-700 hover:bg-red-500 hover:text-white
                       dark:border-red-400 dark:text-red-400 dark:hover:bg-red-950"
          >
            <FolderPlus className="h-8 w-8 mb-2" />
            <span>Creating OF</span>
          </Button>
        </Link>

        {/* 6. Creating Layouts (Violeta - Módulo Independiente) */}
        <Link href="/Layouts" passHref>
          <Button 
            variant="outline"
            className="h-32 text-xl w-full flex flex-col items-center justify-center shadow-lg
                       border-violet-500 text-violet-700 hover:bg-violet-500 hover:text-white
                       dark:border-violet-400 dark:text-violet-400 dark:hover:bg-violet-950"
          >
            <Layers className="h-8 w-8 mb-2" />
            <span>Creating Layouts</span>
          </Button>
        </Link>

      </div>
    </main>
  );
}