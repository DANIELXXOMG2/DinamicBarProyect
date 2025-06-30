'use client';

import { useState, useEffect } from 'react';

import { Plus, X, Edit2, Check } from 'lucide-react';

/**
 * Icono para cerrar una pestaña, que cambia si se está confirmando la eliminación.
 * @param props - Propiedades del componente.
 * @param props.isConfirming - Indica si se está confirmando la eliminación.
 * @returns El icono de cerrar o de confirmar.
 */
const CloseTabIcon = ({ isConfirming }: { readonly isConfirming: boolean }) => {
  if (isConfirming) {
    return <Check className="size-3" />;
  }
  return <X className="size-3" />;
};

/**
 * Botón para cerrar una pestaña, con confirmación.
 * @param props - Propiedades del componente.
 * @param props.tabId - ID de la pestaña.
 * @param props.deleteConfirm - ID de la pestaña que se está confirmando para eliminar.
 * @param props.handleCloseTab - Función para manejar el cierre de la pestaña.
 * @returns El botón de cerrar.
 */
const CloseTabButton = ({
  tabId,
  deleteConfirm,
  handleCloseTab,
}: {
  readonly tabId: string;
  readonly deleteConfirm: string | null;
  readonly handleCloseTab: (tabId: string) => void;
}) => {
  const isConfirming = deleteConfirm === tabId;
  const variant = isConfirming ? 'destructive' : 'ghost';
  const title = isConfirming ? 'Confirmar eliminar' : 'Eliminar mesa';

  return (
    <Button
      size="icon"
      variant={variant}
      onClick={(event) => {
        event.stopPropagation();
        handleCloseTab(tabId);
      }}
      className="size-7"
      title={title}
    >
      <CloseTabIcon isConfirming={isConfirming} />
    </Button>
  );
};

import { TabDetail } from './tab-detail';
import { Button } from '@/components/ui/button';

import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';

// Definir los tipos basados en la API
interface Product {
  readonly id: string;
  readonly name: string;
  readonly salePrice: number;
  readonly purchasePrice: number;
  readonly stock: number;
  readonly type: 'ALCOHOLIC' | 'NON_ALCOHOLIC';
  readonly image?: string;
  readonly categoryId: string;
  readonly category: {
    readonly id: string;
    readonly name: string;
  };
}

interface TabItem {
  readonly id: string;
  readonly tabId: string;
  readonly productId: string;
  readonly quantity: number;
  readonly price: number;
  readonly product: Product;
}

interface Tab {
  readonly id: string;
  readonly name: string;
  readonly items: readonly TabItem[];
  readonly isActive: boolean;
  readonly subtotal?: number;
  readonly total?: number;
  readonly createdAt?: string;
  readonly updatedAt?: string;
}

/**
 * Determina el número de columnas de la cuadrícula según la cantidad de pestañas.
 * @param tabCount - El número de pestañas.
 * @returns Las clases de CSS para las columnas de la cuadrícula.
 */
const getGridCols = (tabCount: number) => {
  if (tabCount <= 4) return 'grid-cols-1 md:grid-cols-2';
  if (tabCount <= 9) return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
  if (tabCount <= 16)
    return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
  return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5';
};

/**
 * Componente para gestionar las mesas (pestañas) del restaurante.
 * @returns El componente de gestión de mesas.
 */
export function TableManagement() {
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTabName, setNewTabName] = useState('Mesa');
  const [nameError, setNameError] = useState('');
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [editingTabId, setEditingTabId] = useState<string | null>(null);
  const [editingTabName, setEditingTabName] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    loadTabs();
  }, []);

  /**
   * Carga las pestañas desde la API.
   * @returns
   */
  const loadTabs = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/tabs');
      if (response.ok) {
        const { tabs } = await response.json();
        setTabs(tabs);
      } else {
        toast({
          title: 'Error',
          description: 'Error al cargar las mesas',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error loading tabs:', error);
      toast({
        title: 'Error',
        description: 'Error al cargar las mesas',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Actualiza la cantidad de un artículo en una pestaña.
   * @param tabId - El ID de la pestaña.
   * @param productId - El ID del producto.
   * @param newQuantity - La nueva cantidad.
   * @returns
   */
  const updateItemQuantity = async (
    tabId: string,
    productId: string,
    newQuantity: number
  ) => {
    try {
      if (newQuantity <= 0) {
        const response = await fetch(`/api/tabs/${tabId}/items/${productId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          const { tab } = await response.json();
          setTabs((previousTabs) =>
            previousTabs.map((t) => (t.id === tabId ? tab : t))
          );
          toast({
            title: 'Producto eliminado',
            description: 'Producto eliminado de la mesa',
          });
        }
      } else {
        const response = await fetch(`/api/tabs/${tabId}/items/${productId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ quantity: newQuantity }),
        });

        if (response.ok) {
          const { tab } = await response.json();
          setTabs((previousTabs) =>
            previousTabs.map((t) => (t.id === tabId ? tab : t))
          );
        }
      }
    } catch (error) {
      console.error('Error updating item quantity:', error);
      toast({
        title: 'Error',
        description: 'Error al actualizar la cantidad',
        variant: 'destructive',
      });
    }
  };

  /**
   * Maneja la creación de una nueva pestaña.
   * @returns
   */
  const handleCreateTab = async () => {
    if (!newTabName.trim()) {
      toast({
        title: 'Error',
        description: 'Por favor ingresa un nombre para la mesa',
        variant: 'destructive',
      });
      return;
    }

    // Verificar si ya existe una mesa con el mismo nombre
    const tableExists = tabs.some(
      (tab) => tab.name.toLowerCase() === newTabName.trim().toLowerCase()
    );
    if (tableExists) {
      setNameError('Ya existe una mesa con este nombre');
      return;
    }

    try {
      setNameError(''); // Limpiar error previo
      const response = await fetch('/api/tabs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newTabName.trim() }),
      });

      if (response.ok) {
        const { tab } = await response.json();
        setTabs([...tabs, tab]);
        setNewTabName('Mesa');
        toast({
          title: 'Mesa creada',
          description: `Mesa '${tab.name}' creada exitosamente`,
        });
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Error al crear la mesa');
      }
    } catch (error) {
      console.error('Error creating tab:', error);
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Error al crear la mesa',
        variant: 'destructive',
      });
    }
  };

  /**
   * Maneja el cierre de una pestaña.
   * @param tabId - El ID de la pestaña a cerrar.
   * @returns
   */
  const handleCloseTab = async (tabId: string) => {
    if (deleteConfirm !== tabId) {
      // Primer clic - activar confirmación
      setDeleteConfirm(tabId);
      setTimeout(() => setDeleteConfirm(null), 3000);
      return;
    }

    // Segundo clic - confirmar eliminación
    try {
      const response = await fetch(`/api/tabs/${tabId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setTabs(tabs.filter((tab) => tab.id !== tabId));
        if (activeTab === tabId) {
          setActiveTab(null);
        }
        setDeleteConfirm(null);
        toast({
          title: 'Mesa cerrada',
          description: 'Mesa cerrada exitosamente',
        });
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Error al cerrar la mesa');
      }
    } catch (error) {
      console.error('Error closing tab:', error);
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Error al cerrar la mesa',
        variant: 'destructive',
      });
    }
  };

  /**
   * Maneja la edición del nombre de una pestaña.
   * @param tab - La pestaña a editar.
   */
  const handleEditTabName = (tab: Tab) => {
    setEditingTabId(tab.id);
    setEditingTabName(tab.name);
  };

  /**
   * Actualiza el nombre de una pestaña en la API.
   * @returns
   */
  const updateTabName = async () => {
    if (!editingTabId || !editingTabName.trim()) {
      setEditingTabId(null);
      return;
    }

    try {
      const response = await fetch(`/api/tabs/${editingTabId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: editingTabName.trim() }),
      });

      if (response.ok) {
        const { tab } = await response.json();
        setTabs(tabs.map((t) => (t.id === editingTabId ? tab : t)));
        toast({
          title: 'Mesa actualizada',
          description: `Nombre de mesa actualizado a '${tab.name}'`,
        });
      } else {
        const error = await response.json();
        throw new Error(
          error.error || 'Error al actualizar el nombre de la mesa'
        );
      }
    } catch (error) {
      console.error('Error updating tab name:', error);
      toast({
        title: 'Error',
        description:
          error instanceof Error
            ? error.message
            : 'Error al actualizar la mesa',
        variant: 'destructive',
      });
    }
    setEditingTabId(null);
  };

  /**
   * Cancela la edición del nombre de una pestaña.
   */
  const cancelEditTabName = () => {
    setEditingTabId(null);
    setEditingTabName('');
  };

  /**
   * Maneja el evento de presionar una tecla en el campo de entrada de nueva pestaña.
   * @param event - El evento del teclado.
   */
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleCreateTab();
    }
  };

  /**
   * Maneja el clic en una pestaña.
   * @param tabId - El ID de la pestaña en la que se hizo clic.
   */
  const handleTabClick = (tabId: string) => {
    setActiveTab(activeTab === tabId ? null : tabId);
  };

  /**
   * Calcula el total de una pestaña.
   * @param tab - La pestaña para la que se calculará el total.
   * @returns El total de la pestaña como una cadena con dos decimales.
   */
  const getTabTotal = (tab: Tab): string => {
    if (tab.total) return tab.total.toFixed(2);
    return tab.items
      .reduce((sum, item) => sum + item.product.salePrice * item.quantity, 0)
      .toFixed(2);
  };

  return (
    <div className="flex h-full flex-col">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Mesas abiertas</h2>
        <div className="flex flex-col items-end">
          <div className="flex space-x-2">
            <Input
              placeholder="Nueva mesa..."
              value={newTabName}
              onChange={(event) => {
                setNewTabName(event.target.value);
                setNameError('');
              }}
              onKeyDown={handleKeyDown}
              className="w-40"
            />
            <Button onClick={handleCreateTab} size="sm">
              <Plus className="mr-2 size-4" />
              Nueva Mesa
            </Button>
          </div>
          {nameError && (
            <span className="mt-1 text-xs text-red-500">{nameError}</span>
          )}
        </div>
      </div>

      {(() => {
        if (loading) {
          return (
            <div className="flex flex-1 items-center justify-center">
              <p>Cargando mesas...</p>
            </div>
          );
        }

        if (tabs.length === 0) {
          return (
            <div className="flex flex-1 flex-col items-center justify-center">
              <p className="mb-2 text-gray-500">No hay mesas abiertas</p>
              <p className="text-sm text-gray-400">
                Crea una nueva mesa con el botón correspondiente.
              </p>
            </div>
          );
        }

        return (
          <div className="flex-1 overflow-y-auto">
            <div className={`grid gap-4 ${getGridCols(tabs.length)}`}>
              {tabs.map((tab) => (
                <button
                  type="button"
                  key={tab.id}
                  className={`cursor-pointer rounded-lg border p-4 text-left transition-shadow hover:shadow-md ${activeTab === tab.id ? 'border-blue-500 bg-gray-50' : ''}`}
                  onClick={() => handleTabClick(tab.id)}
                >
                  <div className="mb-2 flex w-full items-center justify-between">
                    {editingTabId === tab.id ? (
                      <div className="flex items-center space-x-2">
                        <Input
                          value={editingTabName}
                          onChange={(event) =>
                            setEditingTabName(event.target.value)
                          }
                          onKeyDown={(event) =>
                            event.key === 'Enter' && updateTabName()
                          }
                          className="w-32"
                        />
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={updateTabName}
                        >
                          <Check className="size-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={cancelEditTabName}
                        >
                          <X className="size-4" />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <h3 className="font-medium">{tab.name}</h3>
                        <div className="flex items-center space-x-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={(event) => {
                              event.stopPropagation();
                              handleEditTabName(tab);
                            }}
                            className="size-7"
                          >
                            <Edit2 className="size-3" />
                          </Button>
                          <CloseTabButton
                            tabId={tab.id}
                            deleteConfirm={deleteConfirm}
                            handleCloseTab={handleCloseTab}
                          />
                        </div>
                      </>
                    )}
                  </div>
                  <div className="text-sm text-gray-500">
                    {tab.items.length}{' '}
                    {tab.items.length === 1 ? 'producto' : 'productos'}
                  </div>
                  <div className="mt-2 font-semibold">${getTabTotal(tab)}</div>
                </button>
              ))}
            </div>
          </div>
        );
      })()}

      {activeTab &&
        (() => {
          const tab = tabs.find((t) => t.id === activeTab);
          return tab ? (
            <div className="mt-4">
              <TabDetail
                tab={tab}
                onUpdateQuantity={updateItemQuantity}
                onCloseTab={() => handleCloseTab(activeTab)}
                onMinimize={() => setActiveTab(null)}
              />
            </div>
          ) : null;
        })()}
    </div>
  );
}
