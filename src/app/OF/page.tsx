import Link from 'next/link';
import { Package, FileText, Tag, ArrowRight, LayoutGrid, Home, Layers, Box } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingBag } from 'lucide-react'; // Ícono sugerido Riachuelo.


export default function OrderFormsMenu() {
  return (
    <main className="container mx-auto px-4 py-12 max-w-7xl">
      {/* CABECERA */}
      <div className="flex flex-col items-center mb-12 text-center relative">
        <div className="absolute left-0 top-0 hidden md:block">
             <Button variant="ghost" asChild>
                <Link href="/"><Home className="mr-2 h-4 w-4"/> Inicio</Link>
             </Button>
        </div>

        <h1 className="text-4xl font-bold text-slate-800 mb-4 flex items-center gap-3 mt-8 md:mt-0">
          <LayoutGrid className="h-10 w-10 text-indigo-600" /> 
          Centro de Generación de packing list SML
        </h1>
        <p className="text-slate-500 text-lg">Selecciona el item a procesar.</p>
      </div>

      {/* GRILLA DE OPCIONES (4 Columnas) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"> 
        
        {/* 1. TB RFID */}
        <Card className="hover:shadow-xl transition-all border-2 border-indigo-500 cursor-pointer group hover:-translate-y-1">
          <CardHeader>
            <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <Tag className="h-7 w-7 text-indigo-600 group-hover:text-white" />
            </div>
            <CardTitle className="text-2xl">TB RFID</CardTitle>
            <CardDescription>Formatos Standard TMTMM9V001.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="text-sm text-slate-500 space-y-2">
              <li className="flex items-center"><CheckCircle className="h-4 w-4 mr-2 text-green-500"/> Múltiples MOs</li>
              <li className="flex items-center"><CheckCircle className="h-4 w-4 mr-2 text-green-500"/> Formato Standard</li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full bg-indigo-600 hover:bg-indigo-700 h-12 text-lg">
              <Link href="/OF/TB">Ir a TB RFID <ArrowRight className="ml-2 h-5 w-5" /></Link>
            </Button>
          </CardFooter>
        </Card>

        {/* 2. R&B RABO */}
        <Card className="hover:shadow-xl transition-all border-2 border-amber-500 cursor-pointer group hover:-translate-y-1">
          <CardHeader>
            <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-amber-500 group-hover:text-white transition-colors">
              <FileText className="h-7 w-7 text-amber-600 group-hover:text-white" />
            </div>
            <CardTitle className="text-2xl">R&B RABO</CardTitle>
            <CardDescription>Stickers Rag & Bone (0896, 1068).</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="text-sm text-slate-500 space-y-2">
              <li className="flex items-center"><CheckCircle className="h-4 w-4 mr-2 text-green-500"/> Inputs Manuales</li>
              <li className="flex items-center"><CheckCircle className="h-4 w-4 mr-2 text-green-500"/> Agrupación por Color</li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full bg-amber-600 hover:bg-amber-700 h-12 text-lg">
              <Link href="/OF/RABO">Ir a RABO <ArrowRight className="ml-2 h-5 w-5" /></Link>
            </Button>
          </CardFooter>
        </Card>

        {/* 3. COLECCIÓN VV */}
        <Card className="hover:shadow-xl transition-all border-2 border-emerald-500 cursor-pointer group hover:-translate-y-1">
          <CardHeader>
            <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <Layers className="h-7 w-7 text-emerald-600 group-hover:text-white" />
            </div>
            <CardTitle className="text-2xl">Colección VV</CardTitle>
            <CardDescription>Price Tickets, Polybags, Boxers.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="text-sm text-slate-500 space-y-2">
              <li className="flex items-center"><CheckCircle className="h-4 w-4 mr-2 text-green-500"/> 4 Variantes</li>
              <li className="flex items-center"><CheckCircle className="h-4 w-4 mr-2 text-green-500"/> Configuración Flexible</li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full bg-emerald-600 hover:bg-emerald-700 h-12 text-lg">
              <Link href="/OF/VV">Ir a VV <ArrowRight className="ml-2 h-5 w-5" /></Link>
            </Button>
          </CardFooter>
        </Card>

        {/* 4. TY RFID (NUEVO) */}
        <Card className="hover:shadow-xl transition-all border-2 border-blue-500 cursor-pointer group hover:-translate-y-1">
          <CardHeader>
            <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Box className="h-7 w-7 text-blue-600 group-hover:text-white" />
            </div>
            <CardTitle className="text-2xl">TY RFID</CardTitle>
            <CardDescription>Generación General TY.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="text-sm text-slate-500 space-y-2">
              <li className="flex items-center"><CheckCircle className="h-4 w-4 mr-2 text-green-500"/> Lectura Automática</li>
              <li className="flex items-center"><CheckCircle className="h-4 w-4 mr-2 text-green-500"/> Formato TY</li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-lg">
              <Link href="/OF/TY">Ir a TY <ArrowRight className="ml-2 h-5 w-5" /></Link>
            </Button>
          </CardFooter>
        </Card>

        {/* 5. RIACHUELO (NUEVO) */}
        <Card className="hover:shadow-xl transition-all border-2 border-pink-500 cursor-pointer group hover:-translate-y-1">
          <CardHeader>
            <div className="w-14 h-14 bg-pink-100 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-pink-600 group-hover:text-white transition-colors">
              <ShoppingBag className="h-7 w-7 text-pink-600 group-hover:text-white" />
            </div>
            <CardTitle className="text-2xl">RIACHUELO</CardTitle>
            <CardDescription>Consolidado y Rangos de Barcode.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="text-sm text-slate-500 space-y-2">
              <li className="flex items-center"><CheckCircle className="h-4 w-4 mr-2 text-green-500"/> Agrupación Automática</li>
              <li className="flex items-center"><CheckCircle className="h-4 w-4 mr-2 text-green-500"/> Cálculo Start/End</li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full bg-pink-600 hover:bg-pink-700 h-12 text-lg">
              <Link href="/OF/RIACHUELO">Ir a Riachuelo <ArrowRight className="ml-2 h-5 w-5" /></Link>
            </Button>
          </CardFooter>
        </Card>

        {/* 6. 47TH RFID */}
        <Card className="hover:shadow-xl transition-all border-2 border-orange-500 cursor-pointer group hover:-translate-y-1">
          <CardHeader>
            <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-orange-600 group-hover:text-white transition-colors">
              <Package className="h-7 w-7 text-orange-600 group-hover:text-white" />
            </div>
            <CardTitle className="text-2xl">47TH</CardTitle>
            <CardDescription>Generador para 47TH Brand.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="text-sm text-slate-500 space-y-2">
              <li className="flex items-center"><CheckCircle className="h-4 w-4 mr-2 text-green-500"/> RFID Labels</li>
              <li className="flex items-center"><CheckCircle className="h-4 w-4 mr-2 text-green-500"/> Reportes Packing</li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full bg-orange-600 hover:bg-orange-700 h-12 text-lg">
              <Link href="/OF/47TH">Ir a 47TH <ArrowRight className="ml-2 h-5 w-5" /></Link>
            </Button>
          </CardFooter>
        </Card>

        {/* 7. RIPLEY */} 
        <Card className="hover:shadow-xl transition-all border-2 border-red-500 cursor-pointer group hover:-translate-y-1">
          <CardHeader>
            <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-red-600 group-hover:text-white transition-colors">
              <FileText className="h-7 w-7 text-red-600 group-hover:text-white" />
            </div>
            <CardTitle className="text-2xl">RIPLEY</CardTitle>
            <CardDescription>Generador para RIPLEY.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="text-sm text-slate-500 space-y-2">
              <li className="flex items-center"><CheckCircle className="h-4 w-4 mr-2 text-green-500"/> Generación de PDF</li>
              <li className="flex items-center"><CheckCircle className="h-4 w-4 mr-2 text-green-500"/> Formato RIPLEY</li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full bg-red-600 hover:bg-red-700 h-12 text-lg">
              <Link href="/OF/RIPLEY">Ir a Ripley <ArrowRight className="ml-2 h-5 w-5" /></Link>
            </Button>
          </CardFooter>
        </Card>

        {/* 8. PRÓXIMAMENTE */}
        <Card className="border-2 border-gray-300 cursor-not-allowed opacity-50">
          <CardHeader>
            <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
              <Layers className="h-7 w-7 text-gray-400" />
            </div>
            <CardTitle className="text-2xl text-gray-400">Próximamente</CardTitle>  
            <CardDescription className="text-gray-400">Estamos trabajando en nuevas funcionalidades.</CardDescription>
          </CardHeader>
          </Card>

      </div>
    </main>
  );
      

}

function CheckCircle({ className }: { className?: string }) {
    return <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
}