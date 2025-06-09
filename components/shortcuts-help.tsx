import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Keyboard } from "lucide-react"

export function ShortcutsHelp() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Keyboard className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Atajos de Teclado</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Navegación</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Inicio</span>
                <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Alt+1</kbd>
              </div>
              <div className="flex justify-between">
                <span>Bebidas</span>
                <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Alt+2</kbd>
              </div>
              <div className="flex justify-between">
                <span>Inventario</span>
                <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Alt+3</kbd>
              </div>
              <div className="flex justify-between">
                <span>Mesas Abiertas</span>
                <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Alt+4</kbd>
              </div>
              <div className="flex justify-between">
                <span>Contabilidad</span>
                <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Alt+5</kbd>
              </div>
              <div className="flex justify-between">
                <span>Configuración</span>
                <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Alt+6</kbd>
              </div>
              <div className="flex justify-between">
                <span>Ayuda</span>
                <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Alt+H</kbd>
              </div>
            </div>
          </div>
          <div>
            <h3 className="font-medium mb-2">Categorías</h3>
            <ul className="space-y-1 text-sm">
              <li className="flex justify-between">
                <span>Cervezas</span>
                <kbd className="px-2 py-1 bg-gray-100 rounded">Alt + 1</kbd>
              </li>
              <li className="flex justify-between">
                <span>Licores</span>
                <kbd className="px-2 py-1 bg-gray-100 rounded">Alt + 2</kbd>
              </li>
              <li className="flex justify-between">
                <span>Snaks</span>
                <kbd className="px-2 py-1 bg-gray-100 rounded">Alt + 3</kbd>
              </li>
              <li className="flex justify-between">
                <span>Gaseosas</span>
                <kbd className="px-2 py-1 bg-gray-100 rounded">Alt + 4</kbd>
              </li>
              <li className="flex justify-between">
                <span>Miscelánea</span>
                <kbd className="px-2 py-1 bg-gray-100 rounded">Alt + 5</kbd>
              </li>
              <li className="flex justify-between">
                <span>Cigarrería</span>
                <kbd className="px-2 py-1 bg-gray-100 rounded">Alt + 6</kbd>
              </li>
              <li className="flex justify-between">
                <span>Cacharrería</span>
                <kbd className="px-2 py-1 bg-gray-100 rounded">Alt + 7</kbd>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium mb-2">Navegación de Productos</h3>
            <ul className="space-y-1 text-sm">
              <li className="flex justify-between">
                <span>Navegar arriba/abajo</span>
                <kbd className="px-2 py-1 bg-gray-100 rounded">↑ / ↓</kbd>
              </li>
              <li className="flex justify-between">
                <span>Añadir producto</span>
                <kbd className="px-2 py-1 bg-gray-100 rounded">Enter</kbd>
              </li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
