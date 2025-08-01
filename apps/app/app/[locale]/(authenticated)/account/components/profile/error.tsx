'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/design-system/components/ui/card';
import { Button } from '@repo/design-system/components/ui/button';
import { AlertCircle } from 'lucide-react';
import type { Dictionary } from '@repo/internationalization';

interface ProfileErrorProps {
    error: Error & { digest?: string };
    reset: () => void;
    dictionary: Dictionary;
}

export default function ProfileError({ error, reset, dictionary }: ProfileErrorProps) {
    return (
        <Card>
            <CardHeader className="p-3 sm:p-6">
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl text-destructive">
                    <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                    {dictionary.app?.account?.profile?.error?.title || 'Error al cargar el perfil'}
                </CardTitle>
                <CardDescription className="text-sm sm:text-base">
                    {dictionary.app?.account?.profile?.error?.description || 'Ocurrió un error al cargar la información del perfil'}
                </CardDescription>
            </CardHeader>
            <CardContent className="p-3 sm:p-6">
                <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                        {error.message || (dictionary.app?.account?.profile?.error?.details || 'Error desconocido al cargar el perfil')}
                    </p>
                    <Button onClick={reset} variant="outline" className="text-sm sm:text-base">
                        {dictionary.app?.account?.profile?.error?.retry || 'Intentar de nuevo'}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
} 