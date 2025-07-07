import { redirect } from 'next/navigation';
import { getCurrentUserWithPermissions } from '@repo/auth/server-permissions';

export default async function AuthenticatedRootPage({
    params
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    const user = await getCurrentUserWithPermissions();

    if (!user) {
        return redirect(`/${locale}/sign-in`);
    }

    // Redirigir según el rol del usuario
    if (user.isAdmin || user.isPremium) {
        return redirect(`/${locale}/menu`);
    }

    // Para usuarios regulares, redirigir a su cuenta
    return redirect(`/${locale}/account`);
} 