import { getCurrentUser } from '@repo/data-services/src/services/authService';
import { getSubordinateUsers } from '@repo/data-services/src/services/userManagementService';
import { getDictionary } from '@repo/internationalization';
import {
    requirePermission,
    hasPermission,
    ADMIN_PERMISSIONS,
    PermissionGuard,
    SinglePermissionGuard,
    AnyPermissionGuard
} from '@repo/auth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@repo/design-system/components/ui/tabs';
import { ProfileSection } from './components/ProfileSection';
import { PasswordSection } from './components/PasswordSection';
import { UsersSection } from './components/UsersSection';
import { ShareLinksWidget } from '@/components/ShareLinksWidget';
import { FeedbackWidget } from '@/components/FeedbackWidget';

interface AccountPageProps {
    params: Promise<{ locale: string }>;
}

export default async function AccountPage({ params }: AccountPageProps) {
    const { locale } = await params;

    // Verificar permisos básicos con el locale
    await requirePermission('account:view_own', locale);

    // Obtener datos en el servidor
    const [currentUser, dictionary] = await Promise.all([
        getCurrentUser(),
        getDictionary(locale)
    ]);

    if (!currentUser) {
        return (
            <div className="space-y-3 sm:space-y-4 md:space-y-6 p-1 sm:p-2 md:p-6">
                <div className="flex items-center justify-center min-h-[50vh]">
                    <div className="text-center">
                        <p className="text-sm sm:text-base text-muted-foreground">{dictionary.app?.account?.userNotFound || 'Usuario no encontrado'}</p>
                    </div>
                </div>
            </div>
        );
    }

    // Verificar permisos específicos a nivel de servidor
    const [
        canViewOwnAccount,
        canEditOwnAccount,
        canChangePassword,
        canManageUsers
    ] = await Promise.all([
        hasPermission('account:view_own'),
        hasPermission('account:edit_own'),
        hasPermission('account:change_password'),
        hasPermission('admin:manage_users')
    ]);

    // Obtener usuarios solo si tiene permisos para gestionarlos
    const usersResult = canManageUsers ? await getSubordinateUsers(currentUser.id) : { success: true, users: [] };
    const users = usersResult.success ? (usersResult.users || []).filter(user => user.id !== currentUser.id) : [];

    // Filtrar los permisos de administrador para que no se puedan asignar desde la UI
    const assignablePermissions = ADMIN_PERMISSIONS.filter(p => !p.startsWith('admin:'));

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

            <PermissionGuard
                requiredPermissions={['account:view_own']}
                fallback={
                    <div className="flex items-center justify-center min-h-[50vh]">
                        <div className="text-center">
                            <p className="text-sm sm:text-base text-muted-foreground">
                                No tienes permisos para acceder a esta sección
                            </p>
                        </div>
                    </div>
                }
                showFallback={true}
            >
                <Tabs defaultValue="profile" className="space-y-3 sm:space-y-4">
                    <div className="overflow-x-auto">
                        <TabsList className="flex w-full h-auto sm:h-10 min-w-[300px] md:min-w-0">
                            <SinglePermissionGuard permission="account:view_own">
                                <TabsTrigger value="profile" className="text-xs sm:text-sm py-2 sm:py-0 flex-1">
                                    <span className="hidden sm:inline">{dictionary.app?.account?.tabs?.profile?.desktop || 'Mi Perfil'}</span>
                                    <span className="sm:hidden">{dictionary.app?.account?.tabs?.profile?.mobile || 'Perfil'}</span>
                                </TabsTrigger>
                            </SinglePermissionGuard>

                            <SinglePermissionGuard permission="admin:manage_users">
                                <TabsTrigger value="users" className="text-xs sm:text-sm py-2 sm:py-0 flex-1">
                                    <span className="hidden sm:inline">{dictionary.app?.account?.tabs?.users?.desktop || 'Gestión de Usuarios'}</span>
                                    <span className="sm:hidden">{dictionary.app?.account?.tabs?.users?.mobile || 'Usuarios'}</span>
                                </TabsTrigger>
                            </SinglePermissionGuard>
                        </TabsList>
                    </div>

                    <SinglePermissionGuard permission="account:view_own">
                        <TabsContent value="profile" className="space-y-3 sm:space-y-4">
                            {/* ProfileSection - solo uno con el nivel de permisos correcto */}
                            {canViewOwnAccount && (
                                <ProfileSection
                                    currentUser={currentUser}
                                    dictionary={dictionary}
                                    canEdit={canEditOwnAccount}
                                    canView={canViewOwnAccount}
                                />
                            )}

                            <SinglePermissionGuard permission="account:change_password">
                                <PasswordSection
                                    currentUser={currentUser}
                                    dictionary={dictionary}
                                    canChange={true}
                                />
                            </SinglePermissionGuard>
                        </TabsContent>
                    </SinglePermissionGuard>

                    <SinglePermissionGuard permission="admin:manage_users">
                        <TabsContent value="users" className="space-y-3 sm:space-y-4">
                            <UsersSection
                                users={users}
                                currentUser={currentUser}
                                dictionary={dictionary}
                                allPermissions={assignablePermissions}
                                canCreateUsers={canManageUsers}
                                canEditUsers={canManageUsers}
                                canDeleteUsers={canManageUsers}
                                canManageUsers={canManageUsers}
                            />
                        </TabsContent>
                    </SinglePermissionGuard>
                </Tabs>
            </PermissionGuard>
        </div>
    );
} 