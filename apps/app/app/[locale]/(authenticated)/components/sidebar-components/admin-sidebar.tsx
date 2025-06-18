'use client';

import { cn } from '@repo/design-system/lib/utils';
import {
    LayoutDashboard,
    Users as UsersIcon,
    Settings,
    FolderOpen,
    UtensilsCrossed,
    Star,
    Layout
} from 'lucide-react';
import Link from 'next/link';
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuItem
} from '@repo/design-system/components/ui/sidebar';
import { usePathname, useSearchParams } from 'next/navigation';
import { Dictionary } from '@repo/internationalization';

type MenuItemProps = {
    title: string;
    icon: any;
    href: string;
    mobileTitle?: string;
};

type AdminSidebarProps = {
    dictionary: Dictionary;
};

export function AdminSidebar({ dictionary }: AdminSidebarProps) {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const activeTab = searchParams.get('tab') || 'config';

    const menuItems: MenuItemProps[] = [
        {
            title: 'Inicio',
            mobileTitle: 'Inicio',
            icon: Settings,
            href: '/admin/dashboard?tab=config',
        },
        {
            title: 'Categorías',
            mobileTitle: 'Categorías',
            icon: FolderOpen,
            href: '/admin/dashboard?tab=categories',
        },
        {
            title: 'Platos',
            mobileTitle: 'Platos',
            icon: UtensilsCrossed,
            href: '/admin/dashboard?tab=dishes',
        },
        {
            title: 'Especiales del Día',
            mobileTitle: 'Especiales',
            icon: Star,
            href: '/admin/dashboard?tab=dailySpecials',
        },
        {
            title: 'Restaurante',
            mobileTitle: 'Restaurante',
            icon: Layout,
            href: '/admin/dashboard?tab=restaurant',
        },
    ];

    const isActivePath = (path: string) => {
        if (path.includes('?tab=')) {
            const [basePath, tab] = path.split('?tab=');
            return pathname.startsWith(basePath) && activeTab === tab;
        }
        return pathname.startsWith(path);
    };

    return (
        <>
            {/* Desktop Sidebar */}
            <Sidebar variant="inset" className="hidden md:block border-r border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 fixed left-0 top-16 bottom-0 w-64 overflow-y-auto">
                <SidebarContent>
                    <SidebarMenu>
                        {menuItems.map((item) => (
                            <SidebarMenuItem
                                key={item.title}
                                className={cn(
                                    isActivePath(item.href) && "text-green-500 bg-green-500/10",
                                    !isActivePath(item.href) && "text-gray-600 dark:text-zinc-400"
                                )}
                            >
                                <Link href={item.href} className="flex items-center gap-3 px-3 py-2 rounded-lg w-full hover:bg-gray-100 dark:hover:bg-zinc-800">
                                    <item.icon className="h-5 w-5" />
                                    <span>{item.title}</span>
                                </Link>
                            </SidebarMenuItem>
                        ))}
                    </SidebarMenu>
                </SidebarContent>
            </Sidebar>

            {/* Mobile Bottom Navigation */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-zinc-900 border-t border-gray-200 dark:border-zinc-800 z-50">
                <div className="flex items-center justify-around px-2 py-2">
                    {menuItems.map((item) => {
                        const isActive = isActivePath(item.href);
                        return (
                            <Link
                                key={item.title}
                                href={item.href}
                                className={cn(
                                    "flex flex-col items-center gap-1 px-3 py-2 rounded-lg min-w-0 flex-1 transition-colors",
                                    isActive
                                        ? "text-green-600 bg-green-50 dark:bg-green-950 dark:text-green-400"
                                        : "text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-200 hover:bg-gray-50 dark:hover:bg-zinc-800"
                                )}
                            >
                                <item.icon className={cn("h-5 w-5 shrink-0", isActive && "text-green-600 dark:text-green-400")} />
                                <span className={cn(
                                    "text-xs font-medium truncate text-center leading-tight",
                                    isActive && "text-green-600 dark:text-green-400"
                                )}>
                                    {item.mobileTitle || item.title}
                                </span>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </>
    );
} 