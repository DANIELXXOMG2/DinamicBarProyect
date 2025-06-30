'use client';

import type React from 'react';
import { useState, useEffect } from 'react';

import { Save, Upload, Store } from 'lucide-react';
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

  // Función para manejar cambios en el teléfono (solo números)
  const handlePhoneChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    // Solo permitir números y algunos caracteres especiales como + - ()
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

        <div className="w-full space-y-6">
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
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="storeName">Nombre del Local</Label>
                  <Input
                    id="storeName"
                    value={storeConfig.name}
                    onChange={(event) =>
                      setStoreConfig({
                        ...storeConfig,
                        name: event.target.value,
                      })
                    }
                    placeholder="Nombre de tu negocio"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="storePhone">Teléfono</Label>
                  <Input
                    id="storePhone"
                    type="tel"
                    value={storeConfig.phone || ''}
                    onChange={handlePhoneChange}
                    placeholder="+1 234 567 8900"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="storeAddress">Dirección</Label>
                <Input
                  id="storeAddress"
                  value={storeConfig.address || ''}
                  onChange={(event) =>
                    setStoreConfig({
                      ...storeConfig,
                      address: event.target.value,
                    })
                  }
                  placeholder="Dirección completa del local"
                />
              </div>

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
                  <div className="flex-1">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                      id="logoUpload"
                    />
                    <Label htmlFor="logoUpload" className="cursor-pointer">
                      <Button
                        variant="outline"
                        className="flex items-center gap-2"
                        asChild
                      >
                        <span>
                          <Upload className="size-4" />
                          Cambiar Logo
                        </span>
                      </Button>
                    </Label>
                    <p className="mt-1 text-xs text-gray-500">
                      Formatos soportados: JPG, PNG, GIF (máx. 2MB)
                    </p>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleSaveStoreConfig}
                disabled={saving}
                className="flex items-center gap-2"
              >
                <Save className="size-4" />
                {saving ? 'Guardando...' : 'Guardar Configuración'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
