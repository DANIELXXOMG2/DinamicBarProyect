'use client';

import { useEffect, useState } from 'react';

import { MoreVertical, PlusCircle, Trash, Edit, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';

type UserRole = 'ADMIN' | 'CASHIER' | 'WAITER';

interface User {
  id: string;
  username: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

// Traducir rol
const translateRole = (role: UserRole) => {
  switch (role) {
    case 'ADMIN': {
      return 'Administrador';
    }
    case 'CASHIER': {
      return 'Cajero';
    }
    case 'WAITER': {
      return 'Mesero';
    }
    default: {
      return role;
    }
  }
};

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Nuevo usuario
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('WAITER');

  // Usuario a editar
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editPassword, setEditPassword] = useState('');
  const [editRole, setEditRole] = useState<UserRole>('WAITER');

  // Usuario a eliminar
  const [deletingUser, setDeletingUser] = useState<User | null>(null);

  // Verificar si el usuario tiene acceso de administrador
  useEffect(() => {
    const checkAccess = () => {
      const storedUser = localStorage.getItem('user');
      if (!storedUser) {
        router.push('/login');
        return;
      }

      try {
        const user = JSON.parse(storedUser);
        if (user.role !== 'ADMIN') {
          toast({
            title: 'Acceso denegado',
            description:
              'Solo los administradores pueden acceder a esta página',
            variant: 'destructive',
          });
          router.push('/products');
        }
      } catch {
        router.push('/login');
      }
    };

    checkAccess();
    fetchUsers();
  }, [router]);

  // Obtener lista de usuarios
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/users');
      if (!response.ok) {
        throw new Error('Error al obtener usuarios');
      }

      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Error al cargar usuarios',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Crear nuevo usuario
  const handleCreateUser = async () => {
    if (!newUsername || !newPassword) {
      toast({
        title: 'Error',
        description: 'Todos los campos son obligatorios',
        variant: 'destructive',
      });
      return;
    }

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: newRole.toLowerCase() + '_' + newUsername,
          password: newPassword,
          role: newRole,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Error al crear usuario');
      }

      toast({
        title: 'Usuario creado',
        description: `El usuario ${newUsername} ha sido creado correctamente`,
      });

      // Limpiar formulario
      setNewUsername('');
      setNewPassword('');
      setNewRole('WAITER');
      setCreateDialogOpen(false);

      // Actualizar lista
      fetchUsers();
    } catch (error) {
      console.error('Error creating user:', error);
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Error al crear usuario',
        variant: 'destructive',
      });
    }
  };

  // Editar usuario
  const handleEditUser = async () => {
    if (!editingUser) return;

    const updateData: {
      password?: string;
      role?: UserRole;
    } = {};

    if (editPassword) {
      updateData.password = editPassword;
    }

    if (editRole !== editingUser.role) {
      updateData.role = editRole;
    }

    if (Object.keys(updateData).length === 0) {
      setEditDialogOpen(false);
      return;
    }

    try {
      const response = await fetch(`/api/users/${editingUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Error al actualizar usuario');
      }

      toast({
        title: 'Usuario actualizado',
        description: `El usuario ${editingUser.username} ha sido actualizado correctamente`,
      });

      setEditDialogOpen(false);
      fetchUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        title: 'Error',
        description:
          error instanceof Error
            ? error.message
            : 'Error al actualizar usuario',
        variant: 'destructive',
      });
    }
  };

  // Eliminar usuario
  const handleDeleteUser = async () => {
    if (!deletingUser) return;

    try {
      const response = await fetch(`/api/users/${deletingUser.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Error al eliminar usuario');
      }

      toast({
        title: 'Usuario eliminado',
        description: `El usuario ${deletingUser.username} ha sido eliminado correctamente`,
      });

      setDeleteDialogOpen(false);
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Error al eliminar usuario',
        variant: 'destructive',
      });
    }
  };

  // Iniciar edición de usuario
  const startEditUser = (user: User) => {
    setEditingUser(user);
    setEditPassword('');
    setEditRole(user.role);
    setEditDialogOpen(true);
  };

  // Iniciar eliminación de usuario
  const startDeleteUser = (user: User) => {
    setDeletingUser(user);
    setDeleteDialogOpen(true);
  };

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center">
          <Button
            variant="ghost"
            className="mr-2"
            onClick={() => router.push('/settings')}
          >
            <ArrowLeft className="mr-2 size-4" />
            Volver
          </Button>
          <h1 className="text-2xl font-bold">Administración de Usuarios</h1>
        </div>

        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 size-4" />
              Nuevo Usuario
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crear Nuevo Usuario</DialogTitle>
              <DialogDescription>
                Ingresa los datos del nuevo usuario
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="role" className="text-right">
                  Rol
                </Label>
                <Select
                  value={newRole}
                  onValueChange={(value) => setNewRole(value as UserRole)}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Selecciona un rol" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ADMIN">Administrador</SelectItem>
                    <SelectItem value="CASHIER">Cajero</SelectItem>
                    <SelectItem value="WAITER">Mesero</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="username" className="text-right">
                  Nombre
                </Label>
                <Input
                  id="username"
                  value={newUsername}
                  onChange={(event) => setNewUsername(event.target.value)}
                  className="col-span-3"
                  placeholder="Nombre del usuario"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="password" className="text-right">
                  Contraseña
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  className="col-span-3"
                  placeholder="Contraseña"
                />
              </div>

              {newRole && newUsername && (
                <div className="mt-2 text-sm text-gray-500">
                  El nombre de usuario será:{' '}
                  <strong>
                    {newRole.toLowerCase()}_{newUsername}
                  </strong>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setCreateDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button onClick={handleCreateUser}>Crear Usuario</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Lista de usuarios */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {loading && <p>Cargando usuarios...</p>}
        {!loading && users.length === 0 && <p>No hay usuarios registrados</p>}
        {!loading &&
          users.map((user) => (
            <Card key={user.id}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle className="text-lg">{user.username}</CardTitle>
                  <CardDescription>{translateRole(user.role)}</CardDescription>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="size-8 p-0">
                      <MoreVertical className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => startEditUser(user)}>
                      <Edit className="mr-2 size-4" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => startDeleteUser(user)}
                      className="text-red-600"
                    >
                      <Trash className="mr-2 size-4" />
                      Eliminar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-gray-500">
                  Creado: {new Date(user.createdAt).toLocaleDateString()}
                </div>
              </CardContent>
            </Card>
          ))}
      </div>

      {/* Dialog para editar usuario */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Usuario</DialogTitle>
            <DialogDescription>
              Edita los datos del usuario {editingUser?.username}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-role" className="text-right">
                Rol
              </Label>
              <Select
                value={editRole}
                onValueChange={(value) => setEditRole(value as UserRole)}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecciona un rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">Administrador</SelectItem>
                  <SelectItem value="CASHIER">Cajero</SelectItem>
                  <SelectItem value="WAITER">Mesero</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-password" className="text-right">
                Nueva Contraseña
              </Label>
              <Input
                id="edit-password"
                type="password"
                value={editPassword}
                onChange={(event) => setEditPassword(event.target.value)}
                className="col-span-3"
                placeholder="Dejar en blanco para mantener la actual"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleEditUser}>Guardar Cambios</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para confirmar eliminación */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar Usuario</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar al usuario{' '}
              {deletingUser?.username}? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteUser}>
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
