'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@repo/design-system/components/ui/card';
import { Button } from '@repo/design-system/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import type { Dictionary } from '@repo/internationalization';

interface WaiterManagerErrorProps {
    error: Error & { digest?: string };
    reset: () => void;
    dictionary: Dictionary;
}

export default function WaiterManagerError({ error, reset, dictionary }: WaiterManagerErrorProps) {
    return (
        <Card className="flex flex-col border-destructive">
            <CardHeader>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                    <AlertTriangle className="h-6 w-6 sm:h-8 sm:w-8 text-destructive flex-shrink-0" />
                    <div className="text-center sm:text-left">
                        <CardTitle className="text-lg sm:text-xl text-destructive">
                            {dictionary.web?.services?.waiter?.error?.title || 'Error al cargar gestión de mozos'}
                        </CardTitle>
                        <CardDescription className="text-sm sm:text-base">
                            {dictionary.web?.services?.waiter?.error?.description || 'Hubo un problema al cargar la información de mozos.'}
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col p-3 sm:p-4 md:p-6">
                <div className="space-y-4">
                    <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                        <p className="text-sm text-destructive">
                            <strong>{dictionary.web?.services?.waiter?.error?.details || 'Detalles del error:'}</strong>
                        </p>
                        <p className="text-xs text-muted-foreground mt-1 font-mono">
                            {error.message || 'Error desconocido'}
                        </p>
                        {error.digest && (
                            <p className="text-xs text-muted-foreground mt-1 font-mono">
                                ID: {error.digest}
                            </p>
                        )}
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                        <Button onClick={reset} variant="outline" className="flex-1">
                            <RefreshCw className="mr-2 h-4 w-4" />
                            {dictionary.web?.services?.waiter?.error?.retry || 'Reintentar'}
                        </Button>
                    </div>
                </div>
            </CardContent>
            <CardFooter>
                <p className="text-xs text-muted-foreground">
                    {dictionary.web?.services?.waiter?.error?.help || 'Si el problema persiste, contacta al soporte técnico.'}
                </p>
            </CardFooter>
        </Card>
    );
} 