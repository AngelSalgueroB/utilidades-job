import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FileText, Image, FolderPlus, Layers, Calculator, Database } from 'lucide-react'; // Agregamos Layers para el icono

export default function HomePage() {
  return (
    <main className="flex-grow container mx-auto px-4 py-8 md:py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary">
          Utilities for job
        </h1>
        <p className="text-muted-foreground mt-2">
          Select your tool.
        </p>
      </div>

      {/* Grid para los botones grandes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">

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
            <h3 className="text-xs text-muted-foreground mt-1">Merge Excel files into one</h3>
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
            <span>Move sector TY RFID</span>
            <h3 className="text-xs text-muted-foreground mt-1">Move images within TY RFID sector</h3>
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
            <span>Erase part at img 47TH</span>
            <h3 className="text-xs text-muted-foreground mt-1">Erase images in 47TH sector</h3>
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
            <h3 className="text-xs text-muted-foreground mt-1">Create new folders</h3>
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
            <h3 className="text-xs text-muted-foreground mt-1">Create packing list from OF</h3>
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
            <h3 className="text-xs text-muted-foreground mt-1">Create layouts for packing</h3>
          </Button>
        </Link>

        {/* 7. Consump Calculates */}
        <Link href="/consump-calculates" passHref>
          <Button 
            variant="outline"
            className="h-32 text-xl w-full flex flex-col items-center justify-center shadow-lg
                       border-purple-500 text-purple-700 hover:bg-purple-500 hover:text-white
                       dark:border-purple-400 dark:text-purple-400 dark:hover:bg-purple-950"
          >
            <Calculator className="h-8 w-8 mb-2" />
            <span>Consump Calculates</span>
            <h3 className="text-xs text-muted-foreground mt-1">Calculate consumption for OF</h3>
          </Button>
        </Link>
        {/* 8. RM Gestion (Gris - Módulo Independiente) */}
        <Link href="/gestion-rm" passHref>
          <Button 
            variant="outline"
            className="h-32 text-xl w-full flex flex-col items-center justify-center shadow-lg
                       border-gray-500 text-gray-700 hover:bg-gray-500 hover:text-white
                       dark:border-gray-400 dark:text-gray-400 dark:hover:bg-gray-950"
          >
            <Database className="h-8 w-8 mb-2" />
            <span>RM Gestion</span>
            <h3 className="text-xs text-muted-foreground mt-1">Manage raw materials</h3>
          </Button>
        </Link>
        {/*9. ratios-sml (Naranja - Módulo Independiente) */}
        <Link href="/ratios-sml" passHref>
          <Button 
            variant="outline"
            className="h-32 text-xl w-full flex flex-col items-center justify-center shadow-lg
                       border-orange-500 text-orange-700 hover:bg-orange-500 hover:text-white
                       dark:border-orange-400 dark:text-orange-400 dark:hover:bg-orange-950"
          >
            <Calculator className="h-8 w-8 mb-2" />
            <span>Ratios SML</span>
            <h3 className="text-xs text-muted-foreground mt-1">Calculate ratios based on SML</h3>
          </Button>
        </Link>
      </div>
    </main>
  );
}