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
import { toast } from 'sonner';
import { User, Mail, Plus, Edit, Trash2 } from 'lucide-react';
import type { UserData } from '@repo/data-services/src/types/user';
import { UserRole } from '@repo/database/generated/client';
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

const groupPermissions = (permissions: Permission[]) => {
    return permissions.reduce((acc, permission) => {
        const group = permission.split(':')[0] ?? '';
        if (!acc[group]) {
            acc[group] = [];
        }
        acc[group].push(permission);
        return acc;
    }, {} as Record<string, Permission[]>);
};

export function UsersSection({ users, currentUser, dictionary, allPermissions }: UsersSectionProps) {
    const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<UserData | null>(null);
    const [deleteUserDialog, setDeleteUserDialog] = useState<{ open: boolean; user: UserData | null }>({ open: false, user: null });
    const [isPending, startTransition] = useTransition();

    const [userForm, setUserForm] = useState({
        name: '',
        lastName: '',
        email: '',
        password: '',
        role: 'user' as UserRole,
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
            permissions: ['account:view_own', 'account:edit_own', 'account:change_password'],
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
            setUserForm(prev => ({ ...prev, role, permissions: allPermissions }));
        } else if (role === 'user') {
            setUserForm(prev => ({
                ...prev,
                role,
                permissions: ['account:view_own', 'account:edit_own', 'account:change_password']
            }));
        } else {
            setUserForm(prev => ({ ...prev, role }));
        }
    };

    const handleUserSubmit = () => {
        if (!userForm.name || !userForm.lastName || !userForm.email) {
            toast.error("Nombre, apellido y email son requeridos");
            return;
        }
        if (!editingUser && !userForm.password) {
            toast.error("La contraseña es requerida para nuevos usuarios");
            return;
        }
        if (userForm.password && userForm.password.length < 6) {
            toast.error("La contraseña debe tener al menos 6 caracteres");
            return;
        }

        const promise = async () => {
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

            if (!result.success) {
                throw new Error(result.message);
            }
            return result;
        };

        startTransition(() => {
            toast.promise(promise(), {
                loading: editingUser ? 'Actualizando usuario...' : 'Creando usuario...',
                success: (data) => {
                    setIsUserDialogOpen(false);
                    return `${data.message || `Usuario ${editingUser ? 'actualizado' : 'creado'} correctamente.`}`;
                },
                error: (err) => err.message,
            });
        });
    };

    const handleDeleteUser = (user: UserData) => {
        const promise = async () => {
            const result = await deleteUser(user.id);
            if (!result.success) {
                throw new Error(result.message);
            }
            return result;
        };

        startTransition(() => {
            toast.promise(promise(), {
                loading: 'Eliminando usuario...',
                success: (data) => {
                    setDeleteUserDialog({ open: false, user: null });
                    return `${data.message || 'Usuario eliminado correctamente.'}`;
                },
                error: (err) => err.message,
            });
        });
    };

    const groupedPermissions = groupPermissions(allPermissions);

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
                        <div className="flex shrink-0 gap-2">
                            <Button className="w-full sm:w-auto" onClick={handleCreateUser}>
                                <Plus className="h-4 w-4 mr-2" />
                                Nuevo Usuario
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {users.map((user) => (
                            <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                                <div className="flex items-center gap-4">
                                    <div className="flex flex-col">
                                        <p className="font-semibold">{user.name} {user.lastName}</p>
                                        <p className="text-sm text-muted-foreground flex items-center gap-1"><Mail className="h-3 w-3" />{user.email}</p>
                                        <Badge variant="outline" className="capitalize mt-1 w-fit">{user.role}</Badge>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button variant="ghost" size="icon" onClick={() => handleEditUser(user)}>
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={() => setDeleteUserDialog({ open: true, user })} disabled={user.id === currentUser?.id}>
                                        <Trash2 className="h-4 w-4 text-red-500" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
                <DialogContent className="sm:max-w-[425px] md:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{editingUser ? 'Editar Usuario' : 'Crear Usuario'}</DialogTitle>
                        <DialogDescription>
                            {editingUser ? 'Actualiza los detalles del usuario.' : 'Crea un nuevo usuario y asigna sus permisos.'}
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
                                    <SelectItem value="user">Encargado de restaurante</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-4 items-start gap-4 pt-4">
                            <Label className="text-right pt-2">Permisos</Label>
                            <ScrollArea className="col-span-3 h-48 rounded-md border p-4">
                                <div className="space-y-4">
                                    {Object.entries(groupedPermissions).map(([group, permissions]) => (
                                        <div key={group}>
                                            <h4 className="font-semibold capitalize mb-2">{group}</h4>
                                            {permissions.map(permission => (
                                                <div key={permission} className="flex items-center space-x-2">
                                                    <Switch
                                                        id={permission}
                                                        checked={userForm.permissions.includes(permission)}
                                                        onCheckedChange={checked => handlePermissionChange(permission, checked)}
                                                    />
                                                    <Label htmlFor={permission} className="font-normal">{permission.split(':')[1]?.replace(/_/g, ' ')}</Label>
                                                </div>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsUserDialogOpen(false)}>Cancelar</Button>
                        <Button onClick={handleUserSubmit} disabled={isPending}>
                            {isPending ? 'Guardando...' : (editingUser ? 'Guardar Cambios' : 'Crear Usuario')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <AlertDialog open={deleteUserDialog.open} onOpenChange={(open) => !open && setDeleteUserDialog({ open: false, user: null })}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción no se puede deshacer. Se eliminará permanentemente al usuario "{deleteUserDialog.user?.name} {deleteUserDialog.user?.lastName}".
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteUser(deleteUserDialog.user!)} disabled={isPending}>
                            {isPending ? "Eliminando..." : "Eliminar"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}