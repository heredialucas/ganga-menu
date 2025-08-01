'use client';

import { Tabs, TabsList, TabsTrigger } from '@repo/design-system/components/ui/tabs';
import type { Dictionary } from '@repo/internationalization';
import { ReactNode } from 'react';

interface AccountTabsProps {
    dictionary: Dictionary;
    children: ReactNode;
    showUsersTab?: boolean;
}

export function AccountTabs({ dictionary, children, showUsersTab = false }: AccountTabsProps) {
    return (
        <Tabs defaultValue="profile" className="space-y-3 sm:space-y-4">
            <div className="overflow-x-auto">
                <TabsList className="flex w-full h-auto sm:h-10 min-w-[300px] md:min-w-0">
                    <TabsTrigger value="profile" className="text-xs sm:text-sm py-2 sm:py-0 flex-1">
                        <span className="hidden sm:inline">{dictionary.app?.account?.tabs?.profile?.desktop || 'Mi Perfil'}</span>
                        <span className="sm:hidden">{dictionary.app?.account?.tabs?.profile?.mobile || 'Perfil'}</span>
                    </TabsTrigger>
                    {showUsersTab && (
                        <TabsTrigger value="users" className="text-xs sm:text-sm py-2 sm:py-0 flex-1">
                            <span className="hidden sm:inline">{dictionary.app?.account?.tabs?.users?.desktop || 'Gestión de Usuarios'}</span>
                            <span className="sm:hidden">{dictionary.app?.account?.tabs?.users?.mobile || 'Usuarios'}</span>
                        </TabsTrigger>
                    )}
                </TabsList>
            </div>
            {children}
        </Tabs>
    );
} 