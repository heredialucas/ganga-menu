import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/design-system/components/ui/card';
import { Skeleton } from '@repo/design-system/components/ui/skeleton';

export default function QRLoading() {
    return (
        <div className="space-y-3 sm:space-y-4 md:space-y-6">
            {/* Información explicativa Skeleton */}
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-96" />
                </CardHeader>
                <CardContent className="p-1 sm:p-2 md:p-6">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                            <Skeleton className="h-5 w-5 flex-shrink-0" />
                            <div className="space-y-2 flex-1">
                                <Skeleton className="h-4 w-32" />
                                <div className="space-y-1">
                                    <Skeleton className="h-3 w-full" />
                                    <Skeleton className="h-3 w-3/4" />
                                    <Skeleton className="h-3 w-5/6" />
                                    <Skeleton className="h-3 w-2/3" />
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
                {/* Lista de mesas Skeleton */}
                <Card>
                    <CardHeader>
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-4 w-64" />
                    </CardHeader>
                    <CardContent className="p-1 sm:p-2 md:p-6">
                        <div className="text-center py-8">
                            <Skeleton className="h-8 w-8 mx-auto mb-4" />
                            <Skeleton className="h-4 w-48 mx-auto" />
                            <Skeleton className="h-3 w-32 mx-auto mt-2" />
                        </div>
                    </CardContent>
                </Card>

                {/* Preview del QR Skeleton */}
                <Card>
                    <CardHeader>
                        <Skeleton className="h-5 w-24" />
                        <Skeleton className="h-4 w-56" />
                    </CardHeader>
                    <CardContent className="p-1 sm:p-2 md:p-6">
                        <div className="text-center py-12">
                            <Skeleton className="h-16 w-16 mx-auto mb-4" />
                            <Skeleton className="h-4 w-48 mx-auto" />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
} 