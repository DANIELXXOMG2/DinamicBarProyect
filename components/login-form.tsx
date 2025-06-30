'use client';

import { useState } from 'react';

import { Eye, EyeOff, LogIn } from 'lucide-react';

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
import { toast } from '@/hooks/use-toast';

interface User {
  readonly id: string;
  readonly username: string;
  readonly role: 'ADMIN' | 'CASHIER' | 'WAITER';
}

interface LoginFormProperties {
  readonly onSuccess: (userData: User) => void;
}

export function LoginForm({ onSuccess }: LoginFormProperties) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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

    try {
      setLoading(true);

      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al iniciar sesión');
      }

      // Guardar en localStorage para persistencia
      localStorage.setItem('user', JSON.stringify(data.user));

      toast({
        title: 'Sesión iniciada',
        description: `Bienvenido ${data.user.username}`,
      });

      onSuccess(data.user);
    } catch (error) {
      console.error('Login error:', error);
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
    <div className="flex min-h-[80vh] items-center justify-center">
      <Card className="w-full max-w-sm">
        <CardHeader className="space-y-1">
          <CardTitle className="text-center text-2xl">Iniciar Sesión</CardTitle>
          <CardDescription className="text-center">
            Ingresa tus credenciales para acceder al sistema
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="username">
                Usuario
              </label>
              <Input
                id="username"
                placeholder="Ingresa tu usuario"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                disabled={loading}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="password">
                Contraseña
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Ingresa tu contraseña"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  disabled={loading}
                  required
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
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
            <Button className="w-full" type="submit" disabled={loading}>
              {loading ? (
                <span className="flex items-center gap-1">
                  <span className="animate-spin">⏳</span> Cargando...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <LogIn className="size-4" /> Ingresar
                </span>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
