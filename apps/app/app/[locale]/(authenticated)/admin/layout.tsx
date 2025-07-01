import type { ReactNode } from 'react';
import { getDictionary } from '@repo/internationalization';
import { AdminSidebar } from '../components/sidebar-components/admin-sidebar';
import { UserHeaderServer } from '../components/user-header/userHeaderServer';

type AdminLayoutProps = {
    readonly children: ReactNode;
    readonly params: Promise<{
        locale: string;
    }>;
};

export default async function AdminLayout({ children, params }: AdminLayoutProps) {
    const { locale } = await params;
    const dictionary = await getDictionary(locale);

    return (
        <div className="flex w-full min-h-screen bg-white dark:bg-black text-gray-900 dark:text-white">
            <UserHeaderServer />

            <div className="pt-16 flex w-full h-full">
                <AdminSidebar dictionary={dictionary} />

                <main className="w-full bg-gray-50 dark:bg-zinc-950 flex-1 md:p-6 min-h-screen pb-20 md:pb-0">
                    <div className="container mx-auto px-4">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
} 