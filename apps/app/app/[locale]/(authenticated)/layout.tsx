import { redirect } from 'next/navigation';
import { SidebarProvider } from '@repo/design-system/components/ui/sidebar';
import { getAuthorizedSidebarItems } from '@repo/auth/server-permissions';
import { getDictionary } from '@repo/internationalization';
import type { Locale } from '@repo/internationalization';
import { AdminSidebar } from './components/sidebar-components/admin-sidebar';
import { UserHeaderServer } from './components/user-header/userHeaderServer';
import { getRestaurantConfig } from '@repo/data-services/src/services/restaurantConfigService';
import { RestaurantConfigProvider } from '@/store/restaurant-config-context';
import { Toaster } from 'sonner';
import { getCurrentUser } from '@repo/data-services/src/services/authService';

export default async function AuthenticatedLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;

  try {
    const [dictionary, authorizedSidebarItems, restaurantConfig, currentUser] = await Promise.all([
      getDictionary(locale),
      getAuthorizedSidebarItems(),
      getRestaurantConfig().catch((error) => {
        return null;
      }),
      getCurrentUser()
    ]);

    return (
      <SidebarProvider>
        <RestaurantConfigProvider config={restaurantConfig}>
          <div className="flex w-full min-h-screen bg-white dark:bg-black text-gray-900 dark:text-white">
            <UserHeaderServer locale={locale} />

            <div className="pt-16 flex w-full h-full">
              <AdminSidebar dictionary={dictionary} menuItems={authorizedSidebarItems} />

              <main className="bg-gray-50 dark:bg-zinc-950 flex-1 md:py-6 min-h-screen pb-20 md:pb-0">
                <div className="w-full p-1 sm:p-2 md:p-4">
                  {children}
                </div>
              </main>
            </div>
          </div>
          <Toaster />
        </RestaurantConfigProvider>
      </SidebarProvider>
    );
  } catch (error) {
    console.error('❌ Layout error:', error);
    return redirect(`/${locale}/sign-in`);
  }
}
