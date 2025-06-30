'use client';

import { useState, useEffect } from 'react';

import { Trash2, Calendar, Clock, Package, Building, Eye } from 'lucide-react';
import Image from 'next/image';

import { Purchase } from '../types/purchase';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

export function PurchasesList() {
  const [allPurchases, setAllPurchases] = useState<Purchase[]>([]);
  const [filteredPurchases, setFilteredPurchases] = useState<Purchase[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [expandedPurchase, setExpandedPurchase] = useState<string | null>(null);

  useEffect(() => {
    const loadPurchases = async () => {
      try {
        const response = await fetch('/api/purchases');
        if (response.ok) {
          const data = await response.json();
          const purchasesData = data.purchases || [];
          setAllPurchases(
            purchasesData.sort(
              (a: Purchase, b: Purchase) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
            )
          );
        } else {
          throw new Error('API error');
        }
      } catch (error) {
        console.error(
          'Error loading purchases from API, falling back to localStorage:',
          error
        );
        // Fallback a localStorage
        const stored = JSON.parse(localStorage.getItem('purchases') || '[]');
        setAllPurchases(
          stored.sort(
            (a: Purchase, b: Purchase) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
        );
      }
    };

    loadPurchases();
  }, []);

  useEffect(() => {
    if (selectedDate) {
      const filtered = allPurchases.filter(
        (p) => p.date.split('T')[0] === selectedDate
      );
      setFilteredPurchases(filtered);
    } else {
      setFilteredPurchases(allPurchases);
    }
  }, [selectedDate, allPurchases]);

  const handleDelete = async (id: string) => {
    if (confirm('¿Está seguro de que desea eliminar esta compra?')) {
      try {
        const response = await fetch(`/api/purchases/${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          const updatedPurchases = allPurchases.filter((p) => p.id !== id);
          setAllPurchases(updatedPurchases);

          toast({
            title: 'Éxito',
            description: 'Compra eliminada correctamente',
          });
        } else {
          throw new Error('Error deleting from API');
        }
      } catch (error) {
        console.error(
          'Error deleting from API, falling back to localStorage:',
          error
        );
        // Fallback a localStorage
        const updatedPurchases = allPurchases.filter((p) => p.id !== id);
        setAllPurchases(updatedPurchases);
        localStorage.setItem('purchases', JSON.stringify(updatedPurchases));

        toast({
          title: 'Éxito',
          description: 'Compra eliminada correctamente',
        });
      }
    }
  };

  const getTotalAmount = () => {
    return filteredPurchases.reduce(
      (sum, purchase) => sum + purchase.grandTotal,
      0
    );
  };

  const toggleExpanded = (purchaseId: string) => {
    setExpandedPurchase(expandedPurchase === purchaseId ? null : purchaseId);
  };

  if (allPurchases.length === 0) {
    return (
      <div className="py-8 text-center text-gray-500">
        <Package className="mx-auto mb-4 size-12 opacity-50" />
        <p>No hay compras registradas</p>
        <p className="text-sm">
          Haga clic en &apos;Nueva&apos; para agregar una
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Resumen total */}
      <Card className="bg-blue-50">
        <CardContent className="p-4">
          <div className="text-center">
            <p className="text-sm text-gray-600">Total Compras (Filtrado)</p>
            <p className="text-2xl font-bold text-blue-600">
              ${getTotalAmount().toFixed(2)}
            </p>
            <p className="text-xs text-gray-500">
              {filteredPurchases.length} compra
              {filteredPurchases.length === 1 ? '' : 's'}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Filtro de fecha */}
      <div className="flex items-end space-x-4">
        <div className="grow">
          <Label htmlFor="date-filter">Filtrar por fecha</Label>
          <Input
            id="date-filter"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>
        <Button onClick={() => setSelectedDate('')}>Limpiar</Button>
      </div>

      {/* Lista de compras */}
      <div className="max-h-96 space-y-2 overflow-y-auto">
        {filteredPurchases.map((purchase) => (
          <Card key={purchase.id} className="transition-shadow hover:shadow-md">
            <CardContent className="p-4">
              <div className="space-y-3">
                {/* Header de la compra */}
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    {purchase.companyImage ? (
                      <Image
                        src={purchase.companyImage}
                        alt="Empresa"
                        width={48}
                        height={48}
                        className="rounded border object-cover"
                        onError={(event) => {
                          const target = event.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="flex size-12 items-center justify-center rounded bg-gray-200">
                        <Building className="size-6 text-gray-500" />
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        {purchase.supplierName}
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Calendar className="size-3" />
                          <span>{formatDate(purchase.date)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="size-3" />
                          <span>{purchase.time}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Package className="size-3" />
                          <span>
                            {purchase.items.length} producto
                            {purchase.items.length === 1 ? '' : 's'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="text-right">
                      <p className="font-bold text-blue-600">
                        ${purchase.grandTotal.toFixed(2)}
                      </p>
                      {purchase.totalIva > 0 && (
                        <p className="text-xs text-gray-500">
                          IVA: ${purchase.totalIva.toFixed(2)}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleExpanded(purchase.id)}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      <Eye className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(purchase.id)}
                      className="text-red-500 hover:bg-red-50 hover:text-red-700"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>

                {/* Detalles expandidos */}
                {expandedPurchase === purchase.id && (
                  <div className="space-y-2 border-t pt-3">
                    <h4 className="text-sm font-medium text-gray-700">
                      Productos:
                    </h4>
                    <div className="space-y-2">
                      {purchase.items.map((item, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between rounded bg-gray-50 p-2"
                        >
                          <div className="flex items-center space-x-2">
                            {item.product.image ? (
                              <Image
                                src={item.product.image}
                                alt={item.product.name}
                                width={32}
                                height={32}
                                className="rounded object-cover"
                              />
                            ) : (
                              <div className="flex size-8 items-center justify-center rounded bg-gray-200">
                                <Package className="size-4 text-gray-500" />
                              </div>
                            )}
                            <div>
                              <p className="text-sm font-medium">
                                {item.product.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {item.quantity} x $
                                {item.purchasePrice.toFixed(2)}
                                {item.iva &&
                                  item.iva > 0 &&
                                  ` + ${item.iva}% IVA`}
                              </p>
                            </div>
                          </div>
                          <span className="text-sm font-medium">
                            ${item.total.toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Totales detallados */}
                    <div className="space-y-1 border-t pt-2 text-sm">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>${purchase.subtotal.toFixed(2)}</span>
                      </div>
                      {purchase.totalIva > 0 && (
                        <div className="flex justify-between">
                          <span>IVA Total:</span>
                          <span>${purchase.totalIva.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-bold">
                        <span>Total:</span>
                        <span>${purchase.grandTotal.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
