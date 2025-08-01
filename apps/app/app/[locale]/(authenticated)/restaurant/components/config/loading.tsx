import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/design-system/components/ui/card';
import { Skeleton } from '@repo/design-system/components/ui/skeleton';

export default function ConfigLoading() {
    return (
        <div className="space-y-4 sm:space-y-6 md:space-y-8 md:pb-24">
            {/* General Info Section Skeleton */}
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-96" />
                </CardHeader>
                <CardContent className="p-1 sm:p-2 md:p-6 grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                    <div className="lg:col-span-1 space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-32 sm:h-40 lg:h-48 w-full rounded-lg" />
                    </div>
                    <div className="lg:col-span-2 space-y-4">
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-40" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-20 w-full" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Contact Info Section Skeleton */}
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-96" />
                </CardHeader>
                <CardContent className="p-1 sm:p-2 md:p-6 space-y-4 sm:space-y-6">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-16" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                        <div className="space-y-2 sm:col-span-2 lg:col-span-1">
                            <Skeleton className="h-4 w-28" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Opening Hours Section Skeleton */}
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-96" />
                </CardHeader>
                <CardContent className="p-1 sm:p-2 md:p-6">
                    <div className="space-y-4">
                        {Array.from({ length: 7 }).map((_, i) => (
                            <div key={i} className="p-3 border rounded-lg space-y-3">
                                <div className="flex justify-between items-center">
                                    <Skeleton className="h-5 w-20" />
                                    <Skeleton className="h-6 w-16" />
                                </div>
                                <div className="pl-4 space-y-2">
                                    <div className="flex items-center gap-2">
                                        <Skeleton className="h-10 w-24" />
                                        <Skeleton className="h-4 w-4" />
                                        <Skeleton className="h-10 w-24" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Sticky Footer Skeleton */}
            <div className="static md:fixed bottom-0 left-0 md:left-64 right-0 z-50">
                <div className="bg-background/95 backdrop-blur-sm supports-[backdrop-filter]:bg-background/60 border-t p-3 sm:p-4">
                    <div className="max-w-6xl mx-auto flex justify-center sm:justify-end">
                        <Skeleton className="h-10 w-32" />
                    </div>
                </div>
            </div>
        </div>
    );
} 