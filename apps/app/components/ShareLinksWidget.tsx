import { isPremium, isAdmin } from '@repo/auth/server-permissions';
import type { Dictionary } from '@repo/internationalization';
import { ShareLinksWidgetClient } from './ShareLinksWidgetClient';

interface ShareLinksWidgetProps {
    dictionary: Dictionary;
}

export async function ShareLinksWidget({ dictionary }: ShareLinksWidgetProps) {
    const [isUserPremium, isUserAdmin] = await Promise.all([
        isPremium(),
        isAdmin()
    ]);

    // Los enlaces premium (kitchen y waiter) solo son visibles para usuarios premium o admin
    const canViewPremiumLinks = isUserPremium || isUserAdmin;

    return (
        <ShareLinksWidgetClient
            dictionary={dictionary}
            canViewPremiumLinks={canViewPremiumLinks}
        />
    );
} 