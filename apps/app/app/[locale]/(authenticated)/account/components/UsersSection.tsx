'use client';

import { useState, useTransition } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/design-system/components/ui/card';
import { Button } from '@repo/design-system/components/ui/button';
import { Input } from '@repo/design-system/components/ui/input';
import { Label } from '@repo/design-system/components/ui/label';
import { Badge } from '@repo/design-system/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/design-system/components/ui/select';
import { Switch } from '@repo/design-system/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@repo/design-system/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@repo/design-system/components/ui/alert-dialog';
import { useToast } from '@repo/design-system/hooks/use-toast';
import { User, Mail, Plus, Edit, Trash2, AlertCircle } from 'lucide-react';
import type { UserData } from '@repo/data-services/src/types/user';
import { UserRole } from '@repo/database';
import type { Dictionary } from '@repo/internationalization';
import { createUser, updateUser, deleteUser } from '../actions';
import { ScrollArea } from '@repo/design-system/components/ui/scroll-area';
import { Permission } from '@repo/auth/server-permissions';

interface UsersSectionProps {
    users: UserData[];
    currentUser: any;
    dictionary: Dictionary;
    allPermissions: Permission[];
}

// Función para agrupar permisos por categoría (ej. 'clients:view' -> 'clients')
const groupPermissions = (permissions: Permission[]) => {
    return permissions.reduce((acc, permission) => {
        const [group] = permission.split(':');
        if (!acc[group]) {
            acc[group] = [];
        }
        acc[group].push(permission);
        return acc;
    }, {} as Record<string, Permission[]>);
};

export function UsersSection({ users, currentUser, dictionary, allPermissions }: UsersSectionProps) {
    const { toast } = useToast();
    const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<UserData | null>(null);
    const [deleteUserDialog, setDeleteUserDialog] = useState<{ open: boolean; user: UserData | null }>({ open: false, user: null });
    const [isPending, startTransition] = useTransition();

    const [userForm, setUserForm] = useState({
        name: '',
        lastName: '',
        email: '',
        password: '',
        role: 'seller' as UserRole,
        permissions: [] as string[],
    });

    const handleCreateUser = () => {
        setEditingUser(null);
        setUserForm({
            name: '',
            lastName: '',
            email: '',
            password: '',
            role: 'user',
            permissions: ['account:view_own', 'account:edit_own', 'account:change_password'], // Permisos por defecto para usuarios
        });
        setIsUserDialogOpen(true);
    };

    const handleEditUser = (user: UserData) => {
        setEditingUser(user);
        setUserForm({
            name: user.name,
            lastName: user.lastName,
            email: user.email,
            password: '',
            role: user.role as UserRole,
            permissions: user.permissions || [],
        });
        setIsUserDialogOpen(true);
    };

    const handlePermissionChange = (permission: Permission, checked: boolean) => {
        setUserForm(prev => {
            const newPermissions = checked
                ? [...prev.permissions, permission]
                : prev.permissions.filter(p => p !== permission);
            return { ...prev, permissions: newPermissions };
        });
    };

    const handleRoleChange = (role: UserRole) => {
        if (role === 'admin') {
            // Si el rol es admin, los permisos específicos no son necesarios.
            setUserForm(prev => ({ ...prev, role, permissions: [] }));
        } else if (role === 'user') {
            // Si el rol es user, asignar permisos por defecto
            setUserForm(prev => ({
                ...prev,
                role,
                permissions: ['account:view_own', 'account:edit_own', 'account:change_password']
            }));
        } else {
            setUserForm(prev => ({ ...prev, role }));
        }
    };

    const handleUserSubmit = async () => {
        // Validaciones básicas del lado del cliente para UX
        if (!userForm.name || !userForm.lastName || !userForm.email) {
            toast({ title: "Error", description: "Nombre, apellido y email son requeridos", variant: "destructive" });
            return;
        }
        if (!editingUser && !userForm.password) {
            toast({ title: "Error", description: "La contraseña es requerida para nuevos usuarios", variant: "destructive" });
            return;
        }
        if (userForm.password && userForm.password.length < 6) {
            toast({ title: "Error", description: "La contraseña debe tener al menos 6 caracteres", variant: "destructive" });
            return;
        }

        startTransition(async () => {
            const formData = new FormData();
            formData.append('name', userForm.name);
            formData.append('lastName', userForm.lastName);
            formData.append('email', userForm.email);
            formData.append('password', userForm.password);
            formData.append('role', userForm.role);
            formData.append('permissions', JSON.stringify(userForm.permissions));

            const result = editingUser
                ? await updateUser(editingUser.id, formData)
                : await createUser(formData);

            if (result.success) {
                toast({
                    title: "Éxito",
                    description: result.message,
                });
                setIsUserDialogOpen(false);
            } else {
                toast({
                    title: "Error",
                    description: result.message,
                    variant: "destructive",
                });
            }
        });
    };

    const handleDeleteUser = async (user: UserData) => {
        startTransition(async () => {
            const result = await deleteUser(user.id);
            if (result.success) {
                toast({
                    title: "Éxito",
                    description: result.message,
                });
                setDeleteUserDialog({ open: false, user: null });
            } else {
                toast({
                    title: "Error",
                    description: result.message,
                    variant: "destructive",
                });
            }
        });
    };

    return (
        <>
            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div className="flex-1">
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5" />
                                Usuarios del Sistema
                            </CardTitle>
                            <CardDescription>
                                Gestiona los usuarios y sus permisos
                            </CardDescription>
                        </div>
                        <Button className="w-full sm:w-auto" onClick={handleCreateUser}>
                            <Plus className="h-4 w-4 mr-2" />
                            Nuevo Usuario
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {users.length === 0 ? (
                            <div className="text-center py-8">
                                <p className="text-muted-foreground">
                                    No hay usuarios registrados
                                </p>
                            </div>
                        ) : (
                            users.map((user) => (
                                <div key={user.id} className="flex flex-col lg:flex-row lg:items-center justify-between p-4 border rounded-lg gap-4">
                                    <div className="flex items-center gap-4 flex-1">
                                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                            <span className="text-sm font-medium">
                                                {user.name[0]}{user.lastName[0]}
                                            </span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium truncate">
                                                {user.name} {user.lastName}
                                            </p>
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Mail className="h-3 w-3 shrink-0" />
                                                <span className="truncate">{user.email}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                                        <div className="flex-1 sm:text-right space-y-1">
                                            <div className="flex flex-col gap-1">
                                                <Badge
                                                    variant={user.role === 'admin' ? 'default' : 'secondary'}
                                                    className="w-fit"
                                                >
                                                    {user.role === 'admin' ? 'Administrador' : 'Usuario'}
                                                </Badge>
                                                <Badge
                                                    variant={user.permissions.length > 0 ? 'default' : 'destructive'}
                                                    className="w-fit text-xs"
                                                >
                                                    {user.permissions.length > 0 ? `✓ ${user.permissions.length} permisos` : '✗ Sin permisos'}
                                                </Badge>
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                Creado: {new Date(user.createdAt).toLocaleDateString('es-ES')}
                                            </p>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleEditUser(user)}
                                                disabled={isPending}
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setDeleteUserDialog({ open: true, user })}
                                                disabled={user.id === currentUser?.id || isPending}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>

            <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
                <DialogContent className="max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {editingUser ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
                        </DialogTitle>
                        <DialogDescription>
                            {editingUser ?
                                'Actualiza los datos del usuario.' :
                                'Completa el formulario para agregar un nuevo usuario.'
                            }
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">Nombre</Label>
                            <Input id="name" value={userForm.name} onChange={e => setUserForm({ ...userForm, name: e.target.value })} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="lastName" className="text-right">Apellido</Label>
                            <Input id="lastName" value={userForm.lastName} onChange={e => setUserForm({ ...userForm, lastName: e.target.value })} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="email" className="text-right">Email</Label>
                            <Input id="email" type="email" value={userForm.email} onChange={e => setUserForm({ ...userForm, email: e.target.value })} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="password" className="text-right">Contraseña</Label>
                            <Input id="password" type="password" placeholder={editingUser ? 'Dejar en blanco para no cambiar' : ''} value={userForm.password} onChange={e => setUserForm({ ...userForm, password: e.target.value })} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="role" className="text-right">Rol</Label>
                            <Select value={userForm.role} onValueChange={(value) => handleRoleChange(value as UserRole)}>
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Selecciona un rol" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="admin">Admin</SelectItem>
                                    <SelectItem value="seller">Seller</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Sección de Permisos */}
                        <div className="grid grid-cols-4 items-start gap-4 pt-4">
                            <Label className="text-right pt-2">Permisos</Label>
                            <div className="col-span-3 space-y-2">
                                <ScrollArea
                                    className="h-60 rounded-md border p-4"
                                    style={{ opacity: userForm.role === 'admin' ? 0.5 : 1 }}
                                >
                                    <div className="space-y-4" style={{ pointerEvents: userForm.role === 'admin' ? 'none' : 'auto' }}>
                                        {Object.entries(groupPermissions(allPermissions)).map(([group, permissions]) => (
                                            <div key={group}>
                                                <h4 className="font-medium capitalize mb-3 text-base text-gray-800 dark:text-gray-200">
                                                    {dictionary.app.admin.permissions.groups[group as keyof typeof dictionary.app.admin.permissions.groups] || group}
                                                </h4>
                                                <div className="space-y-4 pl-2">
                                                    {permissions.map(permission => (
                                                        <div key={permission} className="flex items-start justify-between">
                                                            <div className="flex-1">
                                                                <label htmlFor={permission} className="text-sm font-normal text-gray-700 dark:text-gray-300">
                                                                    {dictionary.app.admin.permissions.labels[permission as keyof typeof dictionary.app.admin.permissions.labels] || permission.split(':')[1].replace(/_/g, ' ')}
                                                                </label>
                                                                <p className="text-xs text-muted-foreground pr-2">
                                                                    {dictionary.app.admin.permissions.descriptions[permission as keyof typeof dictionary.app.admin.permissions.descriptions] || 'Sin descripción'}
                                                                </p>
                                                            </div>
                                                            <Switch
                                                                id={permission}
                                                                checked={userForm.permissions.includes(permission)}
                                                                onCheckedChange={(checked) => handlePermissionChange(permission, !!checked)}
                                                                className="mt-1"
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </ScrollArea>
                                {userForm.role === 'admin' && (
                                    <p className="text-xs text-muted-foreground italic">
                                        Los administradores tienen todos los permisos por defecto.
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsUserDialogOpen(false)}>Cancelar</Button>
                        <Button onClick={handleUserSubmit} disabled={isPending}>
                            {isPending ? 'Guardando...' : 'Guardar Cambios'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <AlertDialog
                open={deleteUserDialog.open}
                onOpenChange={(open) => setDeleteUserDialog(prev => ({ ...prev, open }))}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            <AlertCircle className="h-5 w-5 text-destructive" />
                            Confirmar eliminación
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            ¿Estás seguro de que deseas eliminar este usuario?
                            <br />
                            <strong>
                                {deleteUserDialog.user?.name} {deleteUserDialog.user?.lastName}
                            </strong>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => deleteUserDialog.user && handleDeleteUser(deleteUserDialog.user)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            disabled={isPending}
                        >
                            {isPending ? 'Eliminando...' : 'Eliminar'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
} 