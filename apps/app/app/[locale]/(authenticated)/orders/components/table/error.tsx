'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/design-system/components/ui/card';
import { Button } from '@repo/design-system/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Dictionary } from '@repo/internationalization';

interface OrdersTableErrorProps {
    error: Error & { digest?: string };
    reset: () => void;
    dictionary?: Dictionary;
}

export default function OrdersTableError({ error, reset, dictionary }: OrdersTableErrorProps) {
    return (
        <Card>
            <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                    <AlertTriangle className="h-8 w-8 text-red-500" />
                </div>
                <CardTitle className="text-lg">
                    {dictionary?.web?.orders?.errors?.table?.title || 'Error al cargar órdenes'}
                </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-3">
                <p className="text-sm text-muted-foreground">
                    {dictionary?.web?.orders?.errors?.table?.description || 'No se pudieron cargar las órdenes.'}
                </p>
                <Button onClick={reset} size="sm" className="flex items-center gap-2">
                    <RefreshCw className="h-3 w-3" />
                    {dictionary?.web?.orders?.errors?.retry || 'Reintentar'}
                </Button>
            </CardContent>
        </Card>
    );
} 