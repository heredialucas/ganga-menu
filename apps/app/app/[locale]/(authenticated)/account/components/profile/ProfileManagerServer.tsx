import { getCurrentUser } from '@repo/data-services/src/services/authService';
import { hasPermission } from '@repo/auth/server-permissions';
import type { Dictionary } from '@repo/internationalization';
import { ProfileManagerClient } from './ProfileManagerClient';

interface ProfileManagerServerProps {
    dictionary: Dictionary;
    locale: string;
}

export async function ProfileManagerServer({ dictionary, locale }: ProfileManagerServerProps) {
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

    // Verificar permisos específicos
    const [canEdit, canView] = await Promise.all([
        hasPermission('account:edit_own'),
        hasPermission('account:view_own')
    ]);

    // Si no tiene permisos para ver, no mostrar nada
    if (!canView) {
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

    return (
        <ProfileManagerClient
            currentUser={currentUser}
            dictionary={dictionary}
            canEdit={canEdit}
            canView={canView}
        />
    );
} 