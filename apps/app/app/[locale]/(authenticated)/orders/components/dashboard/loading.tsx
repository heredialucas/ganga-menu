import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/design-system/components/ui/card';
import { Badge } from '@repo/design-system/components/ui/badge';
import { Button } from '@repo/design-system/components/ui/button';
import { Skeleton } from '@repo/design-system/components/ui/skeleton';
import { Wifi } from 'lucide-react';

export default function OrdersDashboardLoading() {
    return (
        <div className="space-y-3 sm:space-y-4 md:space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="text-center sm:text-left flex-1">
                    <Skeleton className="h-8 sm:h-10 w-64 sm:w-80" />
                    <Skeleton className="h-4 sm:h-5 w-96 sm:w-[500px] mt-2" />
                </div>

                {/* Estado de conexión */}
                <div className="flex items-center gap-2">
                    <Badge variant="default" className="bg-green-500 text-xs sm:text-sm">
                        <Wifi className="w-3 h-3 mr-1" />
                        <span className="hidden sm:inline">Conectado</span>
                        <span className="sm:hidden">OK</span>
                    </Badge>
                </div>
            </div>

            {/* Estadísticas */}
            <div className="grid gap-2 sm:gap-3 md:gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                {Array.from({ length: 4 }).map((_, index) => (
                    <Card key={index}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2">
                            <Skeleton className="h-4 w-16" />
                            <Skeleton className="h-8 w-8 rounded-lg" />
                        </CardHeader>
                        <CardContent className="p-2 sm:p-4">
                            <Skeleton className="h-6 w-12" />
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Filtros */}
            <div className="flex flex-wrap gap-1 sm:gap-2">
                {Array.from({ length: 5 }).map((_, index) => (
                    <Skeleton key={index} className="h-8 w-20 sm:w-24" />
                ))}
            </div>

            {/* Tabs */}
            <div className="space-y-3 sm:space-y-4">
                <div className="grid w-full grid-cols-3 h-auto sm:h-10">
                    {Array.from({ length: 3 }).map((_, index) => (
                        <Skeleton key={index} className="h-8 w-full" />
                    ))}
                </div>

                {/* Tabla */}
                <Card>
                    <CardHeader className="p-3 sm:p-6">
                        <Skeleton className="h-6 w-32" />
                    </CardHeader>
                    <CardContent className="p-0 sm:p-6">
                        <div className="space-y-3">
                            {Array.from({ length: 5 }).map((_, index) => (
                                <div key={index} className="flex items-center space-x-4 p-4 border rounded-lg">
                                    <Skeleton className="h-4 w-16" />
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-4 w-20" />
                                    <Skeleton className="h-4 w-16" />
                                    <Skeleton className="h-4 w-20" />
                                    <Skeleton className="h-4 w-24" />
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
} 