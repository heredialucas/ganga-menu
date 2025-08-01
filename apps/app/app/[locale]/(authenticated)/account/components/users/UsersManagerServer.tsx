import { getCurrentUser } from '@repo/data-services/src/services/authService';
import { getSubordinateUsers } from '@repo/data-services/src/services/userManagementService';
import { hasPermission, ADMIN_PERMISSIONS } from '@repo/auth/server-permissions';
import type { Dictionary } from '@repo/internationalization';
import { UsersManagerClient } from './UsersManagerClient';

interface UsersManagerServerProps {
    dictionary: Dictionary;
    locale: string;
}

export async function UsersManagerServer({ dictionary, locale }: UsersManagerServerProps) {
    // Cargar datos del usuario actual
    const currentUser = await getCurrentUser();

    if (!currentUser) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="text-center">
                    <p className="text-sm sm:text-base text-muted-foreground">
                        {dictionary.app?.account?.userNotFound || 'Usuario no encontrado'}
                    </p>
                </div>
            </div>
        );
    }

    // Verificar permisos granulares para gestión de usuarios
    const [canManageUsers, canViewUsers] = await Promise.all([
        hasPermission('admin:manage_users'),
        hasPermission('admin:manage_users') // Por ahora usamos el mismo permiso para todo
    ]);

    // Si no tiene permisos para gestionar usuarios, mostrar mensaje de acceso denegado
    if (!canManageUsers) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="text-center">
                    <p className="text-sm sm:text-base text-muted-foreground">
                        {dictionary.app?.account?.userNotFound || 'Acceso denegado'}
                    </p>
                </div>
            </div>
        );
    }

    // Obtener usuarios subordinados
    const usersResult = await getSubordinateUsers(currentUser.id);
    const users = usersResult.success ? (usersResult.users || []).filter(user => user.id !== currentUser.id) : [];

    // Filtrar los permisos de administrador para que no se puedan asignar desde la UI
    const assignablePermissions = ADMIN_PERMISSIONS.filter(p => !p.startsWith('admin:'));

    return (
        <UsersManagerClient
            users={users}
            currentUser={currentUser}
            dictionary={dictionary}
            allPermissions={assignablePermissions}
            canCreateUsers={canManageUsers}
            canEditUsers={canManageUsers}
            canDeleteUsers={canManageUsers}
            canManageUsers={canManageUsers}
        />
    );
} 