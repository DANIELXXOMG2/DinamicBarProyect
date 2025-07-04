'use client';

import type React from 'react';
import { useState, useEffect } from 'react';

import { Save, Upload, Store, Trash2, FileUp, FileDown } from 'lucide-react';
import Image from 'next/image';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface StoreData {
  id?: string;
  name: string;
  address?: string;
  phone?: string;
  image?: string;
}

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isCleaning, setIsCleaning] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isBackupImporting, setIsBackupImporting] = useState(false);
  const [isBackupExporting, setIsBackupExporting] = useState(false);

  // Configuración del local
  const [storeConfig, setStoreConfig] = useState<StoreData>({
    name: '',
    address: '',
    phone: '',
    image: '',
  });

  // Cargar datos iniciales
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);

      // Cargar configuración del local
      const storeResponse = await fetch('/api/store');
      if (storeResponse.ok) {
        const { store } = await storeResponse.json();
        if (store) {
          setStoreConfig(store);
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveStoreConfig = async () => {
    try {
      setSaving(true);

      const method = storeConfig.id ? 'PUT' : 'POST';
      const response = await fetch('/api/store', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(storeConfig),
      });

      if (response.ok) {
        const { store } = await response.json();
        setStoreConfig(store);

        // Disparar evento personalizado para notificar al sidebar
        globalThis.dispatchEvent(new CustomEvent('storeConfigUpdated'));

        toast.success('Configuración del local guardada exitosamente');
      } else {
        toast.error('Error al guardar la configuración');
      }
    } catch (error) {
      console.error('Error saving store config:', error);
      toast.error('Error al guardar la configuración');
    } finally {
      setSaving(false);
    }
  };

  const handleClearRecords = async () => {
    try {
      setIsCleaning(true);
      const response = await fetch('/api/settings/clear-records', {
        method: 'POST',
      });

      if (response.ok) {
        toast.success('Todos los registros han sido eliminados.');
        // Opcional: Recargar datos o redirigir
        loadInitialData(); // Para reflejar cualquier cambio si es necesario
      } else {
        toast.error('Error al limpiar los registros.');
      }
    } catch (error) {
      console.error('Error clearing records:', error);
      toast.error('Error al conectar con el servidor.');
    } finally {
      setIsCleaning(false);
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setIsImporting(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/inventory-backup/import', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        toast.success('Inventario importado exitosamente');
        loadInitialData(); // Recargar datos
      } else {
        const { error } = await response.json();
        toast.error(`Error al importar: ${error}`);
      }
    } catch (error) {
      console.error('Error importing data:', error);
      toast.error('Error al conectar con el servidor para importar.');
    } finally {
      setIsImporting(false);
    }
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const response = await fetch('/api/inventory-backup/export');

      if (response.ok) {
        const blob = await response.blob();
        const url = globalThis.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'exportacion-dinamicbar.csv';
        document.body.append(a);
        a.click();
        a.remove();
        globalThis.URL.revokeObjectURL(url);
        toast.success('Datos exportados exitosamente');
      } else {
        toast.error('Error al exportar los datos.');
      }
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error('Error al conectar con el servidor para exportar.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleBackupExport = async () => {
    try {
      setIsBackupExporting(true);
      const response = await fetch('/api/backup/export');

      if (response.ok) {
        const blob = await response.blob();
        const url = globalThis.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `backup-dinamicbar-${new Date().toISOString().split('T')[0]}.json`;
        document.body.append(a);
        a.click();
        a.remove();
        globalThis.URL.revokeObjectURL(url);
        toast.success('Backup de datos exportado exitosamente');
      } else {
        toast.error('Error al exportar el backup de datos.');
      }
    } catch (error) {
      console.error('Error exporting backup data:', error);
      toast.error('Error al conectar con el servidor para exportar el backup.');
    } finally {
      setIsBackupExporting(false);
    }
  };

  const handleBackupImport = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setIsBackupImporting(true);

    try {
      const fileContent = await file.text();
      const jsonData = JSON.parse(fileContent);

      const response = await fetch('/api/backup/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(jsonData),
      });

      if (response.ok) {
        toast.success('Backup importado exitosamente');
        loadInitialData(); // Recargar datos
      } else {
        const { error } = await response.json();
        toast.error(`Error al importar el backup: ${error}`);
      }
    } catch (error) {
      console.error('Error importing backup data:', error);
      toast.error('Error al conectar con el servidor para importar el backup.');
    } finally {
      setIsBackupImporting(false);
    }
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.addEventListener('load', (loadEvent) => {
        setStoreConfig({
          ...storeConfig,
          image: loadEvent.target?.result as string,
        });
      });
      reader.readAsDataURL(file);
    }
  };

  const handlePhoneChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    const phoneRegex = /^[0-9+\-() ]*$/;
    if (value === '' || phoneRegex.test(value)) {
      setStoreConfig({ ...storeConfig, phone: value });
    }
  };

  if (loading) {
    return (
      <div className="flex flex-1 flex-col overflow-hidden">
        <main className="flex-1 overflow-auto p-4">
          <div className="flex h-64 items-center justify-center">
            <div className="text-lg">Cargando configuración...</div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <main className="flex-1 overflow-auto p-4">
        <h1 className="mb-6 text-2xl font-bold">Configuración</h1>

        <div className="grid w-full grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store className="size-5" />
                Información del Local
              </CardTitle>
              <CardDescription>
                Configura la información básica de tu establecimiento
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Logo del Local</Label>
                <div className="flex items-center gap-4">
                  <Image
                    src={storeConfig.image || '/placeholder.svg'}
                    alt="Logo del local"
                    width={64}
                    height={64}
                    className="rounded-lg border object-cover"
                  />
                  <Button asChild variant="outline">
                    <label htmlFor="logo-upload" className="cursor-pointer">
                      <Upload className="mr-2 size-4" />
                      Subir Logo
                      <input
                        id="logo-upload"
                        type="file"
                        className="sr-only"
                        onChange={handleLogoUpload}
                        accept="image/*"
                      />
                    </label>
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="storeName">Nombre del Local</Label>
                  <Input
                    id="storeName"
                    value={storeConfig.name}
                    onChange={(e) =>
                      setStoreConfig({ ...storeConfig, name: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="storePhone">Teléfono</Label>
                  <Input
                    id="storePhone"
                    value={storeConfig.phone || ''}
                    onChange={handlePhoneChange}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="storeAddress">Dirección</Label>
                <Input
                  id="storeAddress"
                  value={storeConfig.address || ''}
                  onChange={(e) =>
                    setStoreConfig({ ...storeConfig, address: e.target.value })
                  }
                />
              </div>
              <Button onClick={handleSaveStoreConfig} disabled={saving}>
                <Save className="mr-2 size-4" />
                {saving ? 'Guardando...' : 'Guardar Configuración'}
              </Button>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileUp className="size-5" />
                  Importar y Exportar Datos
                </CardTitle>
                <CardDescription>
                  Importa tu inventario desde un archivo CSV o exporta los datos
                  actuales a Excel.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <Button asChild variant="outline" disabled={isImporting}>
                  <label htmlFor="import-file" className="cursor-pointer">
                    <Upload className="mr-2 size-4" />
                    {isImporting
                      ? 'Importando...'
                      : 'Importar Inventario (CSV)'}
                    <input
                      id="import-file"
                      type="file"
                      className="sr-only"
                      onChange={handleImport}
                      accept=".csv"
                    />
                  </label>
                </Button>
                <Button
                  variant="outline"
                  onClick={handleExport}
                  disabled={isExporting}
                >
                  <FileDown className="mr-2 size-4" />
                  {isExporting ? 'Exportando...' : 'Exportar a CSV'}
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileUp className="size-5" />
                  Backup de Datos
                </CardTitle>
                <CardDescription>
                  Exporta o importa todos los datos de la aplicación. Utiliza
                  esta función para crear copias de seguridad.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <Button
                  variant="outline"
                  onClick={handleBackupExport}
                  disabled={isBackupExporting}
                >
                  <FileDown className="mr-2 size-4" />
                  {isBackupExporting ? 'Exportando...' : 'Exportar Backup'}
                </Button>
                <Button asChild variant="outline" disabled={isBackupImporting}>
                  <label
                    htmlFor="backup-import-file"
                    className="cursor-pointer"
                  >
                    <Upload className="mr-2 size-4" />
                    {isBackupImporting ? 'Importando...' : 'Importar Backup'}
                    <input
                      id="backup-import-file"
                      type="file"
                      className="sr-only"
                      onChange={handleBackupImport}
                      accept=".json"
                    />
                  </label>
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trash2 className="size-5 text-destructive" />
                  Zona de Peligro
                </CardTitle>
                <CardDescription>
                  Estas acciones son irreversibles. Asegúrate de lo que estás
                  haciendo.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" disabled={isCleaning}>
                      <Trash2 className="mr-2 size-4" />
                      {isCleaning
                        ? 'Limpiando...'
                        : 'Limpiar Todos los Registros'}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        ¿Estás absolutamente seguro?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta acción no se puede deshacer. Esto eliminará
                        permanentemente todos los productos, ventas, compras,
                        proveedores y registros de caja.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={handleClearRecords}>
                        Sí, limpiar registros
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
