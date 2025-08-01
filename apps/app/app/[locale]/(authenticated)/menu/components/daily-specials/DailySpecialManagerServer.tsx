import { getCurrentUser } from '@repo/data-services/src/services/authService';
import { getAllDailySpecialsWithFullData } from '@repo/data-services/src/services/dailySpecialService';
import { getAllDishesWithFullData } from '@repo/data-services/src/services/dishService';
import { hasPermission } from '@repo/auth/server-permissions';
import { DailySpecialManagerClient } from './DailySpecialManagerClient';
import { upsertDailySpecial, deleteDailySpecials } from '@repo/data-services/src/services/dailySpecialService';
import type { Dictionary } from '@repo/internationalization';

interface DailySpecialManagerServerProps {
    dictionary: Dictionary;
    locale: string;
}

export async function DailySpecialManagerServer({ dictionary, locale }: DailySpecialManagerServerProps) {
    const [user, canEdit, canView] = await Promise.all([
        getCurrentUser(),
        hasPermission('menu:edit'),
        hasPermission('menu:view')
    ]);

    if (!user) {
        return (
            <div className="p-4 text-center text-muted-foreground">
                {dictionary.app?.menu?.dailySpecials?.userNotAuthenticated || 'Usuario no autenticado.'}
            </div>
        );
    }

    if (!canView) {
        return (
            <div className="p-4 text-center text-muted-foreground">
                {dictionary.app?.menu?.dailySpecials?.noPermission || 'No tienes permisos para ver los especiales del día.'}
            </div>
        );
    }

    // Cargar datos en paralelo
    const [dailySpecials, dishes] = await Promise.all([
        getAllDailySpecialsWithFullData(user.id),
        getAllDishesWithFullData(user.id)
    ]);

    return (
        <DailySpecialManagerClient
            dailySpecials={dailySpecials}
            dishes={dishes}
            upsertDailySpecial={upsertDailySpecial}
            deleteDailySpecials={deleteDailySpecials}
            dictionary={dictionary}
            locale={locale}
            canEdit={canEdit}
            canView={canView}
        />
    );
} 