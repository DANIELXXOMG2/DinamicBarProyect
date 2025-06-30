'use client';

import { useState, useEffect, useCallback } from 'react';

import { Download, Search, Filter } from 'lucide-react';
import { toast } from 'sonner';

import { Header } from '@/components/header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';

interface SaleItem {
  id: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface Sale {
  id: string;
  total: number;
  paymentMethod: 'CASH' | 'CARD' | 'TRANSFER';
  createdAt: string;
  items: SaleItem[];
}

interface SalesReport {
  totalSales: number;
  totalRevenue: number;
  salesByPaymentMethod: {
    cash: number;
    card: number;
    transfer: number;
  };
  topProducts: {
    name: string;
    quantity: number;
    revenue: number;
  }[];
  salesByHour: {
    hour: number;
    count: number;
    revenue: number;
  }[];
}

export default function SalesPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [report, setReport] = useState<SalesReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('today');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const loadSales = useCallback(async () => {
    try {
      setLoading(true);
      let url = '/api/sales';

      if (dateFilter === 'today') {
        url += '?period=today';
      } else if (dateFilter === 'custom' && startDate && endDate) {
        url += `?startDate=${startDate}&endDate=${endDate}`;
      }

      const response = await fetch(url);
      if (response.ok) {
        const { sales } = await response.json();
        setSales(sales);
      } else {
        toast.error('Error al cargar las ventas');
      }
    } catch (error) {
      console.error('Error loading sales:', error);
      toast.error('Error al cargar las ventas');
    } finally {
      setLoading(false);
    }
  }, [dateFilter, startDate, endDate]);

  const loadReport = useCallback(async () => {
    try {
      let url = '/api/sales/reports';

      if (dateFilter === 'custom' && startDate && endDate) {
        url += `?startDate=${startDate}&endDate=${endDate}`;
      }

      const response = await fetch(url);
      if (response.ok) {
        const reportData = await response.json();
        setReport(reportData);
      }
    } catch (error) {
      console.error('Error loading report:', error);
    }
  }, [dateFilter, startDate, endDate]);

  useEffect(() => {
    loadSales();
    loadReport();
  }, [loadSales, loadReport]);

  const getPaymentMethodBadge = (method: string) => {
    const variants = {
      CASH: 'default',
      CARD: 'secondary',
      TRANSFER: 'outline',
    } as const;

    const labels = {
      CASH: 'Efectivo',
      CARD: 'Tarjeta',
      TRANSFER: 'Transferencia',
    };

    return (
      <Badge variant={variants[method as keyof typeof variants]}>
        {labels[method as keyof typeof labels]}
      </Badge>
    );
  };

  const filteredSales = sales.filter(
    (sale) =>
      sale.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.items.some((item) =>
        item.productName.toLowerCase().includes(searchTerm.toLowerCase())
      )
  );

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <Header />
      <main className="flex-1 overflow-auto p-6">
        <div className="mx-auto max-w-7xl space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Ventas</h1>
              <p className="text-muted-foreground">
                Historial de ventas y reportes
              </p>
            </div>
            <Button>
              <Download className="mr-2 size-4" />
              Exportar
            </Button>
          </div>

          {/* Filtros */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="size-5" />
                Filtros
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 size-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar ventas..."
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    className="pl-10"
                  />
                </div>
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                >
                  <option value="today">Hoy</option>
                  <option value="week">Esta semana</option>
                  <option value="month">Este mes</option>
                  <option value="custom">Rango personalizado</option>
                </select>
                {dateFilter === 'custom' && (
                  <>
                    <Input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      placeholder="Fecha inicio"
                    />
                    <Input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      placeholder="Fecha fin"
                    />
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Resumen */}
          {report && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Ventas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{report.totalSales}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Ingresos Totales
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ${report.totalRevenue.toFixed(2)}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Efectivo
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {report.salesByPaymentMethod.cash}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Tarjeta</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {report.salesByPaymentMethod.card}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Lista de ventas */}
          <Card>
            <CardHeader>
              <CardTitle>Historial de Ventas</CardTitle>
              <CardDescription>
                {filteredSales.length} ventas encontradas
              </CardDescription>
            </CardHeader>
            <CardContent>
              {(() => {
                if (loading) {
                  return (
                    <div className="py-8 text-center">
                      <p>Cargando ventas...</p>
                    </div>
                  );
                }
                if (filteredSales.length === 0) {
                  return (
                    <div className="py-8 text-center">
                      <p className="text-muted-foreground">
                        No se encontraron ventas
                      </p>
                    </div>
                  );
                }
                return (
                  <div className="space-y-4">
                    {filteredSales.map((sale) => (
                      <div
                        key={sale.id}
                        className="rounded-lg border p-4 transition-colors hover:bg-muted/50"
                      >
                        <div className="mb-2 flex items-start justify-between">
                          <div>
                            <p className="font-medium">Venta #{sale.id}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(sale.createdAt).toLocaleString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold">
                              ${sale.total.toFixed(2)}
                            </p>
                            {getPaymentMethodBadge(sale.paymentMethod)}
                          </div>
                        </div>
                        <div className="space-y-1">
                          {sale.items.map((item) => (
                            <div
                              key={item.id}
                              className="flex justify-between text-sm"
                            >
                              <span>
                                {item.productName} x {item.quantity}
                              </span>
                              <span>${item.totalPrice.toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
