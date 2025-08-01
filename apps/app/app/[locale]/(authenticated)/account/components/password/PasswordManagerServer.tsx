import { getCurrentUser } from '@repo/data-services/src/services/authService';
import { hasPermission } from '@repo/auth/server-permissions';
import type { Dictionary } from '@repo/internationalization';
import { PasswordManagerClient } from './PasswordManagerClient';

interface PasswordManagerServerProps {
    dictionary: Dictionary;
    locale: string;
}

export async function PasswordManagerServer({ dictionary, locale }: PasswordManagerServerProps) {
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

    // Verificar permisos para cambiar contraseña
    const canChange = await hasPermission('account:change_password');

    // Si no tiene permisos para cambiar contraseña, no mostrar nada
    if (!canChange) {
        return null;
    }

    return (
        <PasswordManagerClient
            currentUser={currentUser}
            dictionary={dictionary}
            canChange={canChange}
        />
    );
} 