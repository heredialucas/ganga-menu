'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/design-system/components/ui/card';
import { Button } from '@repo/design-system/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Dictionary } from '@repo/internationalization';

interface OrdersDashboardErrorProps {
    error: Error & { digest?: string };
    reset: () => void;
    dictionary?: Dictionary;
}

export default function OrdersDashboardError({ error, reset, dictionary }: OrdersDashboardErrorProps) {
    return (
        <div className="space-y-3 sm:space-y-4 md:space-y-6">
            <Card>
                <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                        <AlertTriangle className="h-12 w-12 text-red-500" />
                    </div>
                    <CardTitle className="text-xl sm:text-2xl">
                        {dictionary?.web?.orders?.errors?.dashboard?.title || 'Error al cargar las órdenes'}
                    </CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                    <p className="text-sm sm:text-base text-muted-foreground">
                        {dictionary?.web?.orders?.errors?.dashboard?.description || 'Ha ocurrido un error inesperado al cargar la información de las órdenes.'}
                    </p>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                        {dictionary?.web?.orders?.errors?.errorLabel || 'Error'}: {error.message || (dictionary?.web?.orders?.errors?.unknownError || 'Error desconocido')}
                    </p>
                    <div className="flex justify-center">
                        <Button onClick={reset} className="flex items-center gap-2">
                            <RefreshCw className="h-4 w-4" />
                            {dictionary?.web?.orders?.errors?.retry || 'Intentar de nuevo'}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
} 