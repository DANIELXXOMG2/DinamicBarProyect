'use client';

import { useState, useEffect } from 'react';

import {
  Eye,
  EyeOff,
  LogIn,
  ShieldCheck,
  DollarSign,
  User,
} from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from '@/hooks/use-toast';

type UserRole = 'ADMIN' | 'CASHIER' | 'WAITER';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('WAITER');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [storeName, setStoreName] = useState<string>('Restaurant POS');

  // Cargar logo desde localStorage y verificar si ya existe una sesión
  useEffect(() => {
    // Verificar sesión existente
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        console.log('🔐 Usuario encontrado en localStorage:', user);
        // Si ya hay un usuario logueado, redirigir a la página principal
        globalThis.location.href = '/products';
      } catch (error) {
        console.error('Error al procesar usuario en localStorage:', error);
        localStorage.removeItem('user');
      }
    } else {
      console.log('🔐 No hay usuario en localStorage');
    }

    // Cargar configuración del local
    const storeConfig = localStorage.getItem('storeConfig');
    if (storeConfig) {
      try {
        const config = JSON.parse(storeConfig);
        if (config.logo) {
          setLogoUrl(config.logo);
        }
        if (config.name) {
          setStoreName(config.name);
        }
      } catch (error) {
        console.error('Error parsing store config:', error);
      }
    }

    // Si no hay configuración en localStorage, intentar obtenerla de la API
    const fetchStoreConfig = async () => {
      try {
        const response = await fetch('/api/store');
        if (response.ok) {
          const { store } = await response.json();
          if (store?.image) {
            setLogoUrl(store.image);
          }
          if (store?.name) {
            setStoreName(store.name);
          }
        }
      } catch (error) {
        console.error('Error fetching store config:', error);
      }
    };

    fetchStoreConfig();
  }, [router]);

  // Sugerir nombre de usuario basado en el rol seleccionado
  const handleRoleChange = (value: string) => {
    const role = value as UserRole;
    setSelectedRole(role);

    // Sugerir nombre de usuario basado en el rol
    switch (role) {
      case 'ADMIN': {
        setUsername('admin');

        break;
      }
      case 'CASHIER': {
        setUsername('cajero');

        break;
      }
      case 'WAITER': {
        setUsername('mesero');

        break;
      }
      // No default
    }
  };

  // Función para obtener el icono correspondiente al rol seleccionado
  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'ADMIN': {
        return <ShieldCheck className="size-5" />;
      }
      case 'CASHIER': {
        return <DollarSign className="size-5" />;
      }
      case 'WAITER': {
        return <User className="size-5" />;
      }
      default: {
        return null;
      }
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!username || !password) {
      toast({
        title: 'Error',
        description: 'Por favor ingresa usuario y contraseña',
        variant: 'destructive',
      });
      return;
    }

    // Bypass de emergencia para credenciales conocidas
    if (
      (username === 'admin' && password === 'admin123') ||
      (username === 'cajero' && password === 'cajero123') ||
      (username === 'mesero' && password === 'mesero123') ||
      (username === 'danielxxomg' && password === '40334277')
    ) {
      console.log('🚨 Usando bypass de emergencia para credenciales conocidas');

      // Crear usuario ficticio basado en el rol seleccionado
      const fakeUser = {
        id: '123456',
        username: username,
        role: selectedRole,
      };

      // Guardar en localStorage para persistencia
      localStorage.setItem('user', JSON.stringify(fakeUser));
      console.log('✅ Usuario guardado en localStorage:', fakeUser);

      toast({
        title: 'Sesión iniciada (modo emergencia)',
        description: `Bienvenido ${username}`,
      });

      // Redirigir a la página principal con retraso para dar tiempo al toast
      setTimeout(() => {
        console.log('🚀 Redirigiendo a /products...');
        globalThis.location.href = '/products';
      }, 1000);

      return;
    }

    try {
      setLoading(true);
      console.log('🔄 Enviando solicitud de login para:', username);

      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      console.log('📡 Respuesta del servidor:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Error al iniciar sesión');
      }

      // No verificamos si el rol coincide para permitir pruebas con cualquier usuario
      // if (data.user.role !== selectedRole) {
      //   throw new Error(`El usuario no tiene permisos de ${selectedRole.toLowerCase()}`)
      // }

      // Guardar en localStorage para persistencia
      localStorage.setItem('user', JSON.stringify(data.user));
      console.log('✅ Usuario guardado en localStorage:', data.user);

      toast({
        title: 'Sesión iniciada',
        description: `Bienvenido ${data.user.username}`,
      });

      // Aumentar el retraso para asegurar que el localStorage se actualice y el toast se muestre
      setTimeout(() => {
        console.log('🚀 Redirigiendo a /products...');
        globalThis.location.href = '/products';
      }, 1000);
    } catch (error) {
      console.error('❌ Error de login:', error);
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Error al iniciar sesión',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mb-4 flex justify-center">
            {logoUrl ? (
              <div className="relative size-20">
                <Image
                  src={logoUrl}
                  alt="Restaurant POS Logo"
                  width={80}
                  height={80}
                  className="object-contain"
                  onError={() => setLogoUrl(null)} // Fallback to SVG
                />
              </div>
            ) : (
              <div className="flex size-20 items-center justify-center rounded-full bg-gray-200">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="40"
                  height="40"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#475569"
                  strokeWidth="1"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 7v10c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2V7H3Z" />
                  <path d="M22 7 12 2 2 7h20Z" />
                  <path d="M12 12v5" />
                  <path d="M8 12v5" />
                  <path d="M16 12v5" />
                </svg>
              </div>
            )}
          </div>
          <h1 className="text-2xl font-bold">{storeName}</h1>
          <p className="text-sm text-gray-500">Sistema de punto de venta</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-center gap-2">
              <LogIn className="size-6" />
              Iniciar Sesión
            </CardTitle>
            <CardDescription>
              Ingresa tus credenciales para acceder al sistema
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Rol</Label>
                <RadioGroup
                  value={selectedRole}
                  onValueChange={handleRoleChange}
                  className="flex space-x-2"
                >
                  <div
                    className={`flex flex-1 cursor-pointer items-center justify-center space-x-2 rounded-md border p-2 hover:bg-gray-50 ${selectedRole === 'ADMIN' ? 'border-blue-500 bg-gray-100' : ''}`}
                  >
                    <RadioGroupItem value="ADMIN" id="admin" />
                    <Label
                      htmlFor="admin"
                      className="flex cursor-pointer items-center gap-2"
                    >
                      <ShieldCheck className="size-5 text-blue-500" />
                      <span>Admin</span>
                    </Label>
                  </div>
                  <div
                    className={`flex flex-1 cursor-pointer items-center justify-center space-x-2 rounded-md border p-2 hover:bg-gray-50 ${selectedRole === 'CASHIER' ? 'border-green-500 bg-gray-100' : ''}`}
                  >
                    <RadioGroupItem value="CASHIER" id="cashier" />
                    <Label
                      htmlFor="cashier"
                      className="flex cursor-pointer items-center gap-2"
                    >
                      <DollarSign className="size-5 text-green-500" />
                      <span>Cajero</span>
                    </Label>
                  </div>
                  <div
                    className={`flex flex-1 cursor-pointer items-center justify-center space-x-2 rounded-md border p-2 hover:bg-gray-50 ${selectedRole === 'WAITER' ? 'border-amber-500 bg-gray-100' : ''}`}
                  >
                    <RadioGroupItem value="WAITER" id="waiter" />
                    <Label
                      htmlFor="waiter"
                      className="flex cursor-pointer items-center gap-2"
                    >
                      <User className="size-5 text-amber-500" />
                      <span>Mesero</span>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-1">
                <Label htmlFor="username">Usuario</Label>
                <div className="relative">
                  <Input
                    id="username"
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    disabled={loading}
                    placeholder="Ingresa tu usuario"
                    className="pl-10"
                  />
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                    {getRoleIcon(selectedRole)}
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="password">Contraseña</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    disabled={loading}
                    placeholder="Ingresa tu contraseña"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </button>
                </div>
              </div>
            </CardContent>

            <CardFooter>
              <Button
                type="submit"
                className="flex w-full items-center justify-center gap-2"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    <span>Iniciando sesión...</span>
                  </>
                ) : (
                  <>
                    <LogIn className="size-4" />
                    <span>Iniciar Sesión</span>
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
