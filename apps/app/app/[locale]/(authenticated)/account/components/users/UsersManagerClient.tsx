'use client';

import { useState, useTransition } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/design-system/components/ui/card';
import { Button } from '@repo/design-system/components/ui/button';
import { Input } from '@repo/design-system/components/ui/input';
import { Label } from '@repo/design-system/components/ui/label';
import { Badge } from '@repo/design-system/components/ui/badge';
import { Switch } from '@repo/design-system/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@repo/design-system/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@repo/design-system/components/ui/alert-dialog';
import { toast } from 'sonner';
import { User, Mail, Plus, Edit, Trash2, Eye } from 'lucide-react';
import type { UserData } from '@repo/data-services/src/types/user';
import { UserRole } from '@repo/database/generated/client';
import type { Dictionary } from '@repo/internationalization';
import { createUser, updateUser, deleteUser } from '../../actions';
import { ScrollArea } from '@repo/design-system/components/ui/scroll-area';
import { Permission } from '@repo/auth/server-permissions';

interface UsersManagerClientProps {
    users: UserData[];
    currentUser: any;
    dictionary: any;
    allPermissions: Permission[];
    canCreateUsers?: boolean;
    canEditUsers?: boolean;
    canDeleteUsers?: boolean;
    canManageUsers?: boolean;
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

// Función para traducir los nombres de los grupos de permisos
const translatePermissionGroup = (group: string, dictionary: Dictionary): string => {
    const groupTranslations: Record<string, string> = {
        'dishes': dictionary.app?.account?.users?.permissionGroups?.dishes || 'Platos',
        'categories': dictionary.app?.account?.users?.permissionGroups?.categories || 'Categorías',
        'daily_specials': dictionary.app?.account?.users?.permissionGroups?.dailySpecials || 'Especiales del Día',
        'restaurant': dictionary.app?.account?.users?.permissionGroups?.restaurant || 'Restaurante',
        'orders': dictionary.app?.account?.users?.permissionGroups?.orders || 'Órdenes',
        'kitchen': dictionary.app?.account?.users?.permissionGroups?.kitchen || 'Cocina',
        'waiter': dictionary.app?.account?.users?.permissionGroups?.waiter || 'Mozo',
        'menu': dictionary.app?.account?.users?.permissionGroups?.menu || 'Menú',
        'account': dictionary.app?.account?.users?.permissionGroups?.account || 'Cuenta',
        'admin': dictionary.app?.account?.users?.permissionGroups?.admin || 'Administración'
    };

    return groupTranslations[group] || group;
};

// Función para traducir los nombres de los permisos
const translatePermission = (permission: string, dictionary: Dictionary): string => {
    const permissionTranslations: Record<string, string> = {
        // Menu Management
        'menu:view': dictionary.app?.account?.users?.permissions?.menuView || 'Ver menú',
        'menu:edit': dictionary.app?.account?.users?.permissions?.menuEdit || 'Editar menú',
        // Restaurant Management
        'restaurant:view': dictionary.app?.account?.users?.permissions?.restaurantView || 'Ver restaurante',
        'restaurant:edit': dictionary.app?.account?.users?.permissions?.restaurantEdit || 'Editar restaurante',
        'restaurant:design': dictionary.app?.account?.users?.permissions?.restaurantDesign || 'Diseño del restaurante',
        'restaurant:qr_codes': dictionary.app?.account?.users?.permissions?.restaurantQrCodes || 'Códigos QR de mesas',
        // Orders Management
        'orders:view': dictionary.app?.account?.users?.permissions?.ordersView || 'Ver órdenes',
        'orders:edit': dictionary.app?.account?.users?.permissions?.ordersEdit || 'Editar órdenes',
        // Services Management
        'services:view': dictionary.app?.account?.users?.permissions?.servicesView || 'Ver servicios',
        'services:edit': dictionary.app?.account?.users?.permissions?.servicesEdit || 'Editar servicios',
        // Account
        'account:view_own': dictionary.app?.account?.users?.permissions?.accountViewOwn || 'Ver cuenta propia',
        'account:edit_own': dictionary.app?.account?.users?.permissions?.accountEditOwn || 'Editar cuenta propia',
        'account:change_password': dictionary.app?.account?.users?.permissions?.accountChangePassword || 'Cambiar contraseña',
        // Admin
        'admin:full_access': dictionary.app?.account?.users?.permissions?.adminFullAccess || 'Acceso completo de administrador',
        'admin:manage_users': dictionary.app?.account?.users?.permissions?.adminManageUsers || 'Gestionar usuarios',
        'admin:system_settings': dictionary.app?.account?.users?.permissions?.adminSystemSettings || 'Configuración del sistema',
    };
    return permissionTranslations[permission] || permission.split(':')[1]?.replace(/_/g, ' ') || permission;
};

export function UsersManagerClient({
    users,
    currentUser,
    dictionary,
    allPermissions,
    canCreateUsers = false,
    canEditUsers = false,
    canDeleteUsers = false,
    canManageUsers = false
}: UsersManagerClientProps) {
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
            role: 'premium', // Siempre premium
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
            role: 'premium', // Siempre premium para usuarios gestionados
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

    const handleUserSubmit = () => {
        if (!userForm.name || !userForm.lastName || !userForm.email) {
            toast.error(dictionary.app?.account?.users?.validation?.nameRequired || "Nombre, apellido y email son requeridos");
            return;
        }
        if (!editingUser && !userForm.password) {
            toast.error(dictionary.app?.account?.users?.validation?.passwordRequired || "La contraseña es requerida para nuevos usuarios");
            return;
        }
        if (userForm.password && userForm.password.length < 6) {
            toast.error(dictionary.app?.account?.users?.validation?.passwordMin || "La contraseña debe tener al menos 6 caracteres");
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
                ? await updateUser(editingUser.id, formData, dictionary)
                : await createUser(formData, dictionary);

            if (!result.success) {
                throw new Error(result.message);
            }
            return result;
        };

        startTransition(() => {
            toast.promise(promise(), {
                loading: editingUser ? (dictionary.app?.account?.users?.toast?.updating || 'Actualizando usuario...') : (dictionary.app?.account?.users?.toast?.creating || 'Creando usuario...'),
                success: (data) => {
                    setIsUserDialogOpen(false);
                    return `${data.message || (editingUser ? (dictionary.app?.account?.users?.toast?.updated || 'Usuario actualizado correctamente.') : (dictionary.app?.account?.users?.toast?.created || 'Usuario creado correctamente.'))}`;
                },
                error: (err) => err.message,
            });
        });
    };

    const handleDeleteUser = (user: UserData) => {
        const promise = async () => {
            const result = await deleteUser(user.id, dictionary);
            if (!result.success) {
                throw new Error(result.message);
            }
            return result;
        };

        startTransition(() => {
            toast.promise(promise(), {
                loading: dictionary.app?.account?.users?.toast?.deleting || 'Eliminando usuario...',
                success: (data) => {
                    setDeleteUserDialog({ open: false, user: null });
                    return `${data.message || (dictionary.app?.account?.users?.toast?.deleted || 'Usuario eliminado correctamente.')}`;
                },
                error: (err) => err.message,
            });
        });
    };

    const groupedPermissions = groupPermissions(allPermissions);

    return (
        <>
            <Card>
                <CardHeader className="p-3 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
                        <div className="flex-1">
                            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                                <User className="h-4 w-4 sm:h-5 sm:w-5" />
                                {dictionary.app?.account?.users?.title || 'Usuarios del Sistema'}
                            </CardTitle>
                            <CardDescription className="text-sm sm:text-base">
                                {dictionary.app?.account?.users?.description || 'Gestiona los usuarios y sus permisos'}
                            </CardDescription>
                        </div>
                        {canCreateUsers && (
                            <div className="flex shrink-0 gap-2">
                                <Button className="w-full sm:w-auto text-sm sm:text-base" onClick={handleCreateUser}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    <span className="hidden sm:inline">{dictionary.app?.account?.users?.newUser?.desktop || 'Nuevo Usuario'}</span>
                                    <span className="sm:hidden">{dictionary.app?.account?.users?.newUser?.mobile || 'Nuevo'}</span>
                                </Button>
                            </div>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="p-3 sm:p-6">
                    <div className="space-y-3 sm:space-y-4">
                        {users.filter(user => user.id !== currentUser?.id).map((user) => (
                            <div key={user.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 border rounded-lg gap-3 sm:gap-4">
                                <div className="flex items-center gap-3 sm:gap-4">
                                    <div className="flex flex-col">
                                        <p className="font-semibold text-sm sm:text-base">{user.name} {user.lastName}</p>
                                        <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1"><Mail className="h-3 w-3" />{user.email}</p>
                                        <Badge variant="outline" className="capitalize mt-1 w-fit text-xs sm:text-sm">{user.role}</Badge>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 sm:gap-2">
                                    {canEditUsers && (
                                        <Button variant="ghost" size="icon" onClick={() => handleEditUser(user)} className="h-8 w-8 sm:h-10 sm:w-10">
                                            <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                                        </Button>
                                    )}

                                    {canDeleteUsers && (
                                        <Button variant="ghost" size="icon" onClick={() => setDeleteUserDialog({ open: true, user })} disabled={user.id === currentUser?.id} className="h-8 w-8 sm:h-10 sm:w-10">
                                            <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 text-red-500" />
                                        </Button>
                                    )}

                                    {/* Si no tiene permisos para editar/eliminar, mostrar solo vista */}
                                    {!canEditUsers && !canDeleteUsers && canManageUsers && (
                                        <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-10 sm:w-10">
                                            <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
                <DialogContent className="max-w-[95vw] sm:max-w-[425px] md:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-lg sm:text-xl">{editingUser ? (dictionary.app?.account?.users?.editUser || 'Editar Usuario') : (dictionary.app?.account?.users?.createUser || 'Crear Usuario')}</DialogTitle>
                        <DialogDescription className="text-sm sm:text-base">
                            {editingUser ? (dictionary.app?.account?.users?.editUserDescription || 'Actualiza los detalles del usuario.') : (dictionary.app?.account?.users?.createUserDescription || 'Crea un nuevo usuario y asigna sus permisos.')}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-3 sm:gap-4 py-3 sm:py-4">
                        <div className="grid grid-cols-1 sm:grid-cols-4 items-start sm:items-center gap-2 sm:gap-4">
                            <Label htmlFor="name" className="text-left sm:text-right text-sm sm:text-base">{dictionary.app?.account?.profile?.name || 'Nombre'}</Label>
                            <Input id="name" value={userForm.name} onChange={e => setUserForm({ ...userForm, name: e.target.value })} className="col-span-1 sm:col-span-3 text-sm sm:text-base" />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-4 items-start sm:items-center gap-2 sm:gap-4">
                            <Label htmlFor="lastName" className="text-left sm:text-right text-sm sm:text-base">{dictionary.app?.account?.profile?.lastName || 'Apellido'}</Label>
                            <Input id="lastName" value={userForm.lastName} onChange={e => setUserForm({ ...userForm, lastName: e.target.value })} className="col-span-1 sm:col-span-3 text-sm sm:text-base" />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-4 items-start sm:items-center gap-2 sm:gap-4">
                            <Label htmlFor="email" className="text-left sm:text-right text-sm sm:text-base">{dictionary.app?.account?.profile?.email || 'Email'}</Label>
                            <Input id="email" type="email" value={userForm.email} onChange={e => setUserForm({ ...userForm, email: e.target.value })} className="col-span-1 sm:col-span-3 text-sm sm:text-base" />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-4 items-start sm:items-center gap-2 sm:gap-4">
                            <Label htmlFor="password" className="text-left sm:text-right text-sm sm:text-base">{dictionary.app?.account?.users?.password || 'Contraseña'}</Label>
                            <Input id="password" type="password" placeholder={editingUser ? (dictionary.app?.account?.users?.passwordPlaceholder || 'Dejar en blanco para no cambiar') : ''} value={userForm.password} onChange={e => setUserForm({ ...userForm, password: e.target.value })} className="col-span-1 sm:col-span-3 text-sm sm:text-base" />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-4 items-start gap-2 sm:gap-4 pt-3 sm:pt-4">
                            <Label className="text-left sm:text-right pt-2 text-sm sm:text-base">{dictionary.app?.account?.users?.permissionsLabel || 'Permisos'}</Label>
                            <ScrollArea className="col-span-1 sm:col-span-3 h-32 sm:h-48 rounded-md border p-2 sm:p-4">
                                <div className="space-y-3 sm:space-y-4">
                                    {Object.entries(groupedPermissions).map(([group, permissions]) => (
                                        <div key={group}>
                                            <h4 className="font-semibold capitalize mb-2 text-sm sm:text-base">{translatePermissionGroup(group, dictionary)}</h4>
                                            {permissions.map(permission => (
                                                <div key={permission} className="flex items-center space-x-2">
                                                    <Switch
                                                        id={permission}
                                                        checked={userForm.permissions.includes(permission)}
                                                        onCheckedChange={checked => handlePermissionChange(permission, checked)}
                                                    />
                                                    <Label htmlFor={permission} className="font-normal text-xs sm:text-sm">{translatePermission(permission, dictionary)}</Label>
                                                </div>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsUserDialogOpen(false)} className="text-sm sm:text-base">{dictionary.app?.account?.users?.cancel || 'Cancelar'}</Button>
                        <Button onClick={handleUserSubmit} disabled={isPending} className="text-sm sm:text-base">
                            <span className="hidden sm:inline">{isPending ? (dictionary.app?.account?.users?.saving || 'Guardando...') : (editingUser ? (dictionary.app?.account?.users?.saveChanges?.desktop || 'Guardar Cambios') : (dictionary.app?.account?.users?.create?.desktop || 'Crear Usuario'))}</span>
                            <span className="sm:hidden">{isPending ? (dictionary.app?.account?.users?.saving || 'Guardando...') : (editingUser ? (dictionary.app?.account?.users?.saveChanges?.mobile || 'Guardar') : (dictionary.app?.account?.users?.create?.mobile || 'Crear'))}</span>
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <AlertDialog open={deleteUserDialog.open} onOpenChange={(open) => !open && setDeleteUserDialog({ open: false, user: null })}>
                <AlertDialogContent className="max-w-[95vw] sm:max-w-md">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-lg sm:text-xl">{dictionary.app?.account?.users?.deleteConfirmation || '¿Estás seguro?'}</AlertDialogTitle>
                        <AlertDialogDescription className="text-sm sm:text-base">
                            {dictionary.app?.account?.users?.deleteDescription || 'Esta acción no se puede deshacer. Se eliminará permanentemente al usuario'} "{deleteUserDialog.user?.name} {deleteUserDialog.user?.lastName}".
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="text-sm sm:text-base">{dictionary.app?.account?.users?.cancel || 'Cancelar'}</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteUser(deleteUserDialog.user!)} disabled={isPending} className="text-sm sm:text-base">
                            {isPending ? (dictionary.app?.account?.users?.deleting || "Eliminando...") : (dictionary.app?.account?.users?.deleteUser || "Eliminar")}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
} 