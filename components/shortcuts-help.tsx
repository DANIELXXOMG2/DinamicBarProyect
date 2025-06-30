import { Keyboard } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export function ShortcutsHelp() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Keyboard className="size-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Atajos de Teclado</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <h4 className="mb-2 font-medium">Navegación</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Inicio</span>
                <kbd className="rounded bg-gray-100 px-2 py-1 text-xs">
                  Alt+1
                </kbd>
              </div>
              <div className="flex justify-between">
                <span>Bebidas</span>
                <kbd className="rounded bg-gray-100 px-2 py-1 text-xs">
                  Alt+2
                </kbd>
              </div>
              <div className="flex justify-between">
                <span>Inventario</span>
                <kbd className="rounded bg-gray-100 px-2 py-1 text-xs">
                  Alt+3
                </kbd>
              </div>
              <div className="flex justify-between">
                <span>Mesas Abiertas</span>
                <kbd className="rounded bg-gray-100 px-2 py-1 text-xs">
                  Alt+4
                </kbd>
              </div>
              <div className="flex justify-between">
                <span>Contabilidad</span>
                <kbd className="rounded bg-gray-100 px-2 py-1 text-xs">
                  Alt+5
                </kbd>
              </div>
              <div className="flex justify-between">
                <span>Configuración</span>
                <kbd className="rounded bg-gray-100 px-2 py-1 text-xs">
                  Alt+6
                </kbd>
              </div>
              <div className="flex justify-between">
                <span>Ayuda</span>
                <kbd className="rounded bg-gray-100 px-2 py-1 text-xs">
                  Alt+H
                </kbd>
              </div>
            </div>
          </div>
          <div>
            <h3 className="mb-2 font-medium">Categorías</h3>
            <ul className="space-y-1 text-sm">
              <li className="flex justify-between">
                <span>Cervezas</span>
                <kbd className="rounded bg-gray-100 px-2 py-1">Alt + 1</kbd>
              </li>
              <li className="flex justify-between">
                <span>Licores</span>
                <kbd className="rounded bg-gray-100 px-2 py-1">Alt + 2</kbd>
              </li>
              <li className="flex justify-between">
                <span>Snaks</span>
                <kbd className="rounded bg-gray-100 px-2 py-1">Alt + 3</kbd>
              </li>
              <li className="flex justify-between">
                <span>Gaseosas</span>
                <kbd className="rounded bg-gray-100 px-2 py-1">Alt + 4</kbd>
              </li>
              <li className="flex justify-between">
                <span>Miscelánea</span>
                <kbd className="rounded bg-gray-100 px-2 py-1">Alt + 5</kbd>
              </li>
              <li className="flex justify-between">
                <span>Cigarrería</span>
                <kbd className="rounded bg-gray-100 px-2 py-1">Alt + 6</kbd>
              </li>
              <li className="flex justify-between">
                <span>Cacharrería</span>
                <kbd className="rounded bg-gray-100 px-2 py-1">Alt + 7</kbd>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="mb-2 font-medium">Navegación de Productos</h3>
            <ul className="space-y-1 text-sm">
              <li className="flex justify-between">
                <span>Navegar arriba/abajo</span>
                <kbd className="rounded bg-gray-100 px-2 py-1">↑ / ↓</kbd>
              </li>
              <li className="flex justify-between">
                <span>Añadir producto</span>
                <kbd className="rounded bg-gray-100 px-2 py-1">Enter</kbd>
              </li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
