import Link from 'next/link';
import { ArrowLeft, ArrowRight, Layers, LayoutTemplate } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function LayoutsMenuPage() {
  return (
    <main className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <Button variant="ghost" asChild className="text-violet-700 hover:bg-violet-50">
          <Link href="/"><ArrowLeft className="mr-2 h-4 w-4" /> Volver al Inicio</Link>
        </Button>
        <h1 className="text-3xl font-bold text-violet-700 flex items-center gap-3">
          <Layers className="h-8 w-8" /> Menú de Layouts
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* 1. TY LAYOUTS */}
        <Card className="hover:shadow-xl transition-all border-l-4 border-l-indigo-500 cursor-pointer group hover:-translate-y-1">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2 text-slate-800">
              <LayoutTemplate className="h-6 w-6 text-indigo-500" />
              TY Layouts
            </CardTitle>
            <CardDescription>Generador de visuales para TY.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="text-sm text-slate-500 list-disc list-inside">
              <li>RFID Standard</li>
              <li>Packing Stickers</li>
              <li>Price Stickers</li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full bg-indigo-600 hover:bg-indigo-700 group-hover:shadow-md">
              <Link href="/Layouts/TY">
                Ingresar <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>

        {/* AQUÍ SE AGREGARÁ MÁS MARCAS EN EL FUTURO (EJ: TB, RIACHUELO) */}

      </div>
    </main>
  );
}