'use client';

import { Button } from '@repo/design-system/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/design-system/components/ui/card';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import type { Dictionary } from '@repo/internationalization';

interface ErrorProps {
    error: Error & { digest?: string };
    reset: () => void;
    dictionary: Dictionary;
}

export default function Error({ error, reset, dictionary }: ErrorProps) {
    return (
        <div className="flex items-center justify-center min-h-[400px] p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
                        <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
                    </div>
                    <CardTitle className="text-lg sm:text-xl">
                        {dictionary.app.restaurant.design.toast.error}
                    </CardTitle>
                    <CardDescription className="text-sm sm:text-base">
                        {dictionary.app.restaurant.design.toast.error}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="rounded-lg bg-red-50 dark:bg-red-900/10 p-3 text-sm">
                        <strong>Error:</strong> {error.message || dictionary.app.restaurant.design.toast.error}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                        <Button
                            onClick={reset}
                            variant="outline"
                            className="flex items-center gap-2"
                        >
                            <RefreshCw className="h-4 w-4" />
                            Intentar de nuevo
                        </Button>

                        <Button
                            onClick={() => window.location.reload()}
                            variant="outline"
                            className="flex items-center gap-2"
                        >
                            <Home className="h-4 w-4" />
                            Recargar página
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
} 