'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@repo/design-system/components/ui/card';
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
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                    <AlertTriangle className="h-5 w-5" />
                    {dictionary.app?.menu?.access?.error?.title || 'Error al cargar configuración de acceso'}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                    {dictionary.app?.menu?.access?.error?.description || 'Ocurrió un error al cargar la configuración de acceso. Por favor, intenta de nuevo.'}
                </p>
                <Button onClick={reset} variant="outline">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    {dictionary.app?.menu?.access?.error?.retry || 'Reintentar'}
                </Button>
            </CardContent>
        </Card>
    );
} 