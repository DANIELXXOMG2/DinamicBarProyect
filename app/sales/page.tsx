"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Download, Search, Filter } from "lucide-react"
import { toast } from "sonner"

interface SaleItem {
  id: string
  productName: string
  quantity: number
  unitPrice: number
  totalPrice: number
}

interface Sale {
  id: string
  total: number
  paymentMethod: 'CASH' | 'CARD' | 'TRANSFER'
  createdAt: string
  items: SaleItem[]
}

interface SalesReport {
  totalSales: number
  totalRevenue: number
  salesByPaymentMethod: {
    cash: number
    card: number
    transfer: number
  }
  topProducts: Array<{
    name: string
    quantity: number
    revenue: number
  }>
  salesByHour: Array<{
    hour: number
    count: number
    revenue: number
  }>
}

export default function SalesPage() {
  const [sales, setSales] = useState<Sale[]>([])
  const [report, setReport] = useState<SalesReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [dateFilter, setDateFilter] = useState("today")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  useEffect(() => {
    loadSales()
    loadReport()
  }, [dateFilter, startDate, endDate])

  const loadSales = async () => {
    try {
      setLoading(true)
      let url = '/api/sales'
      
      if (dateFilter === 'today') {
        url += '?period=today'
      } else if (dateFilter === 'custom' && startDate && endDate) {
        url += `?startDate=${startDate}&endDate=${endDate}`
      }
      
      const response = await fetch(url)
      if (response.ok) {
        const { sales } = await response.json()
        setSales(sales)
      } else {
        toast.error('Error al cargar las ventas')
      }
    } catch (error) {
      console.error('Error loading sales:', error)
      toast.error('Error al cargar las ventas')
    } finally {
      setLoading(false)
    }
  }

  const loadReport = async () => {
    try {
      let url = '/api/sales/reports'
      
      if (dateFilter === 'custom' && startDate && endDate) {
        url += `?startDate=${startDate}&endDate=${endDate}`
      }
      
      const response = await fetch(url)
      if (response.ok) {
        const reportData = await response.json()
        setReport(reportData)
      }
    } catch (error) {
      console.error('Error loading report:', error)
    }
  }

  const getPaymentMethodBadge = (method: string) => {
    const variants = {
      CASH: 'default',
      CARD: 'secondary',
      TRANSFER: 'outline'
    } as const
    
    const labels = {
      CASH: 'Efectivo',
      CARD: 'Tarjeta',
      TRANSFER: 'Transferencia'
    }
    
    return (
      <Badge variant={variants[method as keyof typeof variants]}>
        {labels[method as keyof typeof labels]}
      </Badge>
    )
  }

  const filteredSales = sales.filter(sale => 
    sale.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.items.some(item => 
      item.productName.toLowerCase().includes(searchTerm.toLowerCase())
    )
  )

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header />
      <main className="flex-1 overflow-auto p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Ventas</h1>
              <p className="text-muted-foreground">
                Historial de ventas y reportes
              </p>
            </div>
            <Button>
              <Download className="mr-2 h-4 w-4" />
              Exportar
            </Button>
          </div>

          {/* Filtros */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filtros
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar ventas..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                  <CardTitle className="text-sm font-medium">
                    Tarjeta
                  </CardTitle>
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
              {loading ? (
                <div className="text-center py-8">
                  <p>Cargando ventas...</p>
                </div>
              ) : filteredSales.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No se encontraron ventas</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredSales.map((sale) => (
                    <div
                      key={sale.id}
                      className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-medium">Venta #{sale.id}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(sale.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg">${sale.total.toFixed(2)}</p>
                          {getPaymentMethodBadge(sale.paymentMethod)}
                        </div>
                      </div>
                      <div className="space-y-1">
                        {sale.items.map((item, index) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span>
                              {item.quantity}x {item.productName}
                            </span>
                            <span>${item.totalPrice.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}