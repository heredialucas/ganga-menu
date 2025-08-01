'use client';

import { Button } from '@repo/design-system/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { getDictionary } from '@repo/internationalization';

export default async function Error({
    error,
    reset,
    params,
}: {
    error: Error & { digest?: string };
    reset: () => void;
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    const dictionary = await getDictionary(locale);

    return (
        <div className="p-4 space-y-4">
            <div className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                <h3 className="font-semibold">
                    {dictionary.app?.menu?.categories?.error?.title || 'Error al cargar categorías'}
                </h3>
            </div>
            <p className="text-muted-foreground">
                {dictionary.app?.menu?.categories?.error?.description || 'Ocurrió un error al cargar las categorías. Por favor, intenta de nuevo.'}
            </p>
            <Button onClick={reset} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                {dictionary.app?.menu?.categories?.error?.retry || 'Reintentar'}
            </Button>
        </div>
    );
} 