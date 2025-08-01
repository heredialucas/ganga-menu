'use client';

import { cn } from '@repo/design-system/lib/utils';
import {
    LayoutDashboard,
    Users as UsersIcon,
    Settings,
    FolderOpen,
    UtensilsCrossed,
    Star,
    Layout,
    ClipboardList
} from 'lucide-react';
import Link from 'next/link';
import {
    Sidebar,
    SidebarContent,
    SidebarMenu,
    SidebarMenuItem
} from '@repo/design-system/components/ui/sidebar';
import { usePathname } from 'next/navigation';
import { Dictionary } from '@repo/internationalization';
import { SidebarItem } from '@repo/auth/server-permissions';

// Map string names to icon components
const iconMap: { [key: string]: React.ElementType } = {
    LayoutDashboard,
    UsersIcon,
    Settings,
    FolderOpen,
    UtensilsCrossed,
    Star,
    Layout,
    ClipboardList,
};

type AdminSidebarProps = {
    dictionary: Dictionary;
    menuItems: SidebarItem[];
};

export function AdminSidebar({ dictionary, menuItems }: AdminSidebarProps) {
    const pathname = usePathname();

    const isActivePath = (path: string) => {
        // Remove locale from pathname for comparison
        const currentPath = pathname.replace(/^\/[a-z]{2}/, '');

        if (path === '/' && currentPath === '') {
            return true;
        }
        return currentPath === path;
    };

    const getLocaleFromPathname = () => {
        const localeMatch = pathname.match(/^\/([a-z]{2})/);
        return localeMatch ? localeMatch[1] : 'es';
    };

    const buildLocalizedUrl = (href: string) => {
        const locale = getLocaleFromPathname();
        return `/${locale}${href}`;
    };

    const getTranslatedLabel = (label: string, isMobile: boolean = false) => {
        const keys = label.split('.');
        let current: any = dictionary.app;
        for (const key of keys) {
            if (current && typeof current === 'object' && key in current) {
                current = current[key];
            } else {
                return label; // Return the key itself as a fallback
            }
        }

        const fullText = typeof current === 'string' ? current : label;

        // Para móvil, usar versiones más cortas basadas en el locale actual
        if (isMobile) {
            const currentLocale = getLocaleFromPathname();

            // Definir versiones móviles por locale
            const mobileTexts: { [locale: string]: { [key: string]: string } } = {
                'es': {
                    'Cuenta': 'Cuenta',
                    'Menú': 'Menú',
                    'Órdenes': 'Pedidos',
                    'Servicios': 'Serv',
                    'Restaurante': 'Rest'
                },
                'en': {
                    'Account': 'Account',
                    'Menu': 'Menu',
                    'Orders': 'Orders',
                    'Services': 'Serv',
                    'Restaurant': 'Rest'
                },
                'de': {
                    'Konto': 'Konto',
                    'Menü': 'Menü',
                    'Bestellungen': 'Best',
                    'Dienste': 'Dien',
                    'Restaurant': 'Rest'
                }
            };

            const localeTexts = mobileTexts[currentLocale] || mobileTexts['es'];
            const mobileText = localeTexts[fullText];

            // Si no hay versión móvil específica, usar el texto completo
            return mobileText || fullText;
        }

        return fullText;
    }

    return (
        <>
            {/* Desktop Sidebar */}
            <Sidebar variant="inset" className="hidden md:block border-r border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 fixed left-0 top-16 bottom-0 w-64 overflow-y-auto">
                <SidebarContent>
                    <SidebarMenu>
                        {menuItems.map((item) => {
                            const Icon = iconMap[item.icon];
                            const title = getTranslatedLabel(item.label, false); // Desktop
                            return (
                                <SidebarMenuItem
                                    key={item.href}
                                    className={cn(
                                        isActivePath(item.href) && "text-green-500 bg-green-500/10",
                                        !isActivePath(item.href) && "text-gray-600 dark:text-zinc-400"
                                    )}
                                >
                                    <Link href={buildLocalizedUrl(item.href)} className="flex items-center gap-3 px-3 py-2 rounded-lg w-full hover:bg-gray-100 dark:hover:bg-zinc-800">
                                        {Icon && <Icon className="h-5 w-5" />}
                                        <span>{title}</span>
                                    </Link>
                                </SidebarMenuItem>
                            )
                        })}
                    </SidebarMenu>
                </SidebarContent>
            </Sidebar>

            {/* Mobile Bottom Navigation */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-zinc-900 border-t border-gray-200 dark:border-zinc-800 z-50">
                <div className="flex items-center justify-around px-1 py-1">
                    {menuItems.map((item) => {
                        const Icon = iconMap[item.icon];
                        const title = getTranslatedLabel(item.mobileLabel, true); // Mobile
                        const isActive = isActivePath(item.href);
                        return (
                            <Link
                                key={item.href}
                                href={buildLocalizedUrl(item.href)}
                                className={cn(
                                    "flex flex-col items-center gap-0.5 px-1 py-1 rounded-lg min-w-0 flex-1 transition-colors",
                                    isActive
                                        ? "text-green-600 bg-green-50 dark:bg-green-950 dark:text-green-400"
                                        : "text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-200 hover:bg-gray-50 dark:hover:bg-zinc-800"
                                )}
                            >
                                {Icon && <Icon className={cn("h-4 w-4 sm:h-5 sm:w-5 shrink-0", isActive && "text-green-600 dark:text-green-400")} />}
                                <span className={cn(
                                    "text-[8px] sm:text-xs font-medium truncate text-center leading-tight",
                                    isActive && "text-green-600 dark:text-green-400"
                                )}>
                                    {title}
                                </span>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </>
    );
} 