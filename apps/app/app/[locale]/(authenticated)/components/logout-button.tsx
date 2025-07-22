'use client';

import { Avatar, AvatarFallback } from '@repo/design-system/components/ui/avatar';
import { Button } from '@repo/design-system/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@repo/design-system/components/ui/dropdown-menu';
import { LogOut } from 'lucide-react';
import { useTransition } from 'react';
import { Dictionary } from '@repo/internationalization';
import { signOut } from '@repo/data-services/src/services/authService';
import { useRouter } from 'next/navigation';

interface LogoutButtonProps {
    userName?: string;
    dictionary?: Dictionary;
    locale?: string;
}

export function LogoutButton({ userName, dictionary, locale }: LogoutButtonProps) {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();
    const handleLogout = () => {
        startTransition(async () => {
            await signOut();
            router.push(`/${locale}/sign-in`);
        });
    };

    // Get user initials from name
    const getInitials = () => {
        if (!userName) return '?';

        const parts = userName.split(' ');
        if (parts.length === 1) return parts[0].charAt(0).toUpperCase();

        return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    };

    const logoutText = dictionary?.app?.auth?.logout || 'Cerrar sesión';
    const loggingOutText = dictionary?.app?.auth?.loggingOut || 'Cerrando sesión...';

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full"
                    aria-label="Usuario"
                >
                    <Avatar>
                        <AvatarFallback>{getInitials()}</AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {userName && (
                    <DropdownMenuItem disabled className="font-medium">
                        {userName}
                    </DropdownMenuItem>
                )}
                <DropdownMenuItem
                    onClick={handleLogout}
                    disabled={isPending}
                    className="text-destructive dark:text-red-400 focus:text-destructive dark:focus:text-red-300"
                >
                    <LogOut className="mr-2 h-4 w-4" />
                    {isPending ? loggingOutText : logoutText}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
} 