'use client';

import { ReactNode } from 'react';
import { LogoutButton } from '../logout-button';
import { Dictionary } from '@repo/internationalization';
// import { ModeToggle } from '@repo/design-system/components/mode-toggle';
import Link from 'next/link';
import { Button } from '@repo/design-system/components/ui/button';
import { PremiumGate } from '@repo/design-system';
import { env } from '@/env';
import { LanguageSwitcher } from '../language-switcher';

type User = {
    id: string;
    name: string;
    email: string;
    role: string;
};

interface UserHeaderClientProps {
    logo?: ReactNode;
    title?: string;
    extraItems?: ReactNode;
    dictionary?: Dictionary;
    user?: User;
    locale?: string;
}

export function UserHeaderClient({ logo, title = 'Ganga-Menú', extraItems, dictionary, user, locale }: UserHeaderClientProps) {
    const stripeProLink = (process.env.NODE_ENV === 'development'
        ? env.NEXT_PUBLIC_STRIPE_PRO_LINK_TEST
        : env.NEXT_PUBLIC_STRIPE_PRO_LINK_LIVE) + `?client_reference_id=${user?.id}`;

    return (
        <header className="fixed top-0 left-0 right-0 bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 z-10 h-16">
            <div className="h-full mx-auto flex items-center justify-between px-4">
                <div className="flex items-center gap-2">
                    {logo}
                    {title && (
                        <div className="font-bold text-base sm:text-xl text-gray-900 dark:text-white">{title}</div>
                    )}
                </div>
                <div className="flex items-center gap-3">
                    <PremiumGate
                        userRole={user?.role as any}
                        minRole="premium"
                        userId={user?.id}
                        fallback={
                            <Link href={stripeProLink} target="_blank" rel="noopener noreferrer">
                                <Button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold">
                                    {(dictionary as any)?.app?.header?.upgradeToPro || "Pasar a Profesional"}
                                </Button>
                            </Link>
                        }
                    >
                        <div></div>
                    </PremiumGate>
                    {/* <ModeToggle /> */}
                    <LanguageSwitcher />
                    {extraItems}
                    <LogoutButton userName={user?.name} dictionary={dictionary} locale={locale} />
                </div>
            </div>
        </header>
    );
} 