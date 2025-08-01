import { getDictionary } from '@repo/internationalization';
import { requirePermission, hasPermission } from '@repo/auth';
import { TabsContent } from '@repo/design-system/components/ui/tabs';
import { ProfileManagerServer } from './components/profile/ProfileManagerServer';
import { PasswordManagerServer } from './components/password/PasswordManagerServer';
import { UsersManagerServer } from './components/users/UsersManagerServer';
import { AccountTabs } from './components/shared/AccountTabs';
import { ShareLinksWidget } from '@/components/ShareLinksWidget';
import { FeedbackWidget } from '@/components/FeedbackWidget';
import { Suspense } from 'react';
import ProfileLoading from './components/profile/loading';
import PasswordLoading from './components/password/loading';
import UsersLoading from './components/users/loading';

interface AccountPageProps {
    params: Promise<{ locale: string }>;
}

export default async function AccountPage({ params }: AccountPageProps) {
    const { locale } = await params;

    // Verificar permisos básicos con el locale
    await requirePermission('account:view_own', locale);

    // Obtener diccionario
    const dictionary = await getDictionary(locale);



    // Verificar permisos para gestionar usuarios
    const canManageUsers = await hasPermission('admin:manage_users');

    return (
        <div className="space-y-3 sm:space-y-4 md:space-y-6 p-1 sm:p-2 md:p-6">
            <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                <div className="text-center sm:text-left flex-1">
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
                        {dictionary.app?.account?.title || 'Gestión de Cuenta'}
                    </h1>
                    <p className="text-sm sm:text-base text-muted-foreground mt-2">
                        {dictionary.app?.account?.subtitle || 'Configuración y usuarios'}
                    </p>
                </div>
                <div className="flex flex-row items-center gap-2">
                    <ShareLinksWidget dictionary={dictionary} />
                    <FeedbackWidget dictionary={dictionary} />
                </div>
            </div>

            <AccountTabs dictionary={dictionary} showUsersTab={canManageUsers}>
                <TabsContent value="profile" className="space-y-3 sm:space-y-4">
                    <Suspense fallback={<ProfileLoading />}>
                        <ProfileManagerServer dictionary={dictionary} locale={locale} />
                    </Suspense>
                    <Suspense fallback={<PasswordLoading />}>
                        <PasswordManagerServer dictionary={dictionary} locale={locale} />
                    </Suspense>
                </TabsContent>

                {canManageUsers && (
                    <TabsContent value="users" className="space-y-3 sm:space-y-4">
                        <Suspense fallback={<UsersLoading />}>
                            <UsersManagerServer dictionary={dictionary} locale={locale} />
                        </Suspense>
                    </TabsContent>
                )}
            </AccountTabs>
        </div>
    );
} 