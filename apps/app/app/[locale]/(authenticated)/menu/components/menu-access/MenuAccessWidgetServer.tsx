import { getCurrentUser } from '@repo/data-services/src/services/authService';
import { getRestaurantConfig } from '@repo/data-services/src/services/restaurantConfigService';
import { hasPermission } from '@repo/auth/server-permissions';
import { MenuAccessWidgetClient } from './MenuAccessWidgetClient';
import { getAppUrl } from '@/lib/utils';
import type { Dictionary } from '@repo/internationalization';

interface MenuAccessWidgetServerProps {
    dictionary: Dictionary;
    locale: string;
}

export async function MenuAccessWidgetServer({ dictionary, locale }: MenuAccessWidgetServerProps) {
    const [user, canEdit, canView] = await Promise.all([
        getCurrentUser(),
        hasPermission('menu:edit'),
        hasPermission('menu:view')
    ]);

    if (!user) {
        return (
            <div className="p-4 text-center text-muted-foreground">
                {dictionary.app?.menu?.access?.userNotAuthenticated || 'Usuario no autenticado.'}
            </div>
        );
    }

    if (!canView) {
        return (
            <div className="p-4 text-center text-muted-foreground">
                {dictionary.app?.menu?.access?.noPermission || 'No tienes permisos para ver la configuración de acceso.'}
            </div>
        );
    }

    const restaurantConfig = await getRestaurantConfig(user.id);
    const appUrl = getAppUrl();

    return (
        <MenuAccessWidgetClient
            config={restaurantConfig}
            appUrl={appUrl}
            dictionary={dictionary}
            locale={locale}
            canEdit={canEdit}
            canView={canView}
        />
    );
} 