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
    const dictionary = await getDictionary(locale) as any;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                    <AlertTriangle className="h-5 w-5" />
                    {dictionary.app?.menu?.dishes?.error?.title || 'Error al cargar platos'}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                    {dictionary.app?.menu?.dishes?.error?.description || 'Ocurrió un error al cargar los platos. Por favor, intenta de nuevo.'}
                </p>
                <div className="flex gap-2">
                    <Button onClick={reset} variant="outline">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        {dictionary.app?.menu?.dishes?.error?.retry || 'Reintentar'}
                    </Button>
                </div>
                {process.env.NODE_ENV === 'development' && (
                    <details className="mt-4 p-4 bg-muted rounded-md">
                        <summary className="cursor-pointer font-medium">
                            {dictionary.app?.menu?.dishes?.error?.details || 'Detalles del error (solo desarrollo)'}
                        </summary>
                        <pre className="mt-2 text-xs overflow-auto">
                            {error.message}
                        </pre>
                    </details>
                )}
            </CardContent>
        </Card>
    );
} 