import { Card, CardContent, CardHeader } from '@repo/design-system/components/ui/card';
import { Skeleton } from '@repo/design-system/components/ui/skeleton';

export default function MenuAccessLoading() {
    return (
        <Card>
            <CardHeader>
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-96" />
            </CardHeader>
            <CardContent className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 items-start p-3 sm:p-4 md:p-6">
                <div className="lg:col-span-2 space-y-4 sm:space-y-6">
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center">
                            <Skeleton className="h-10 w-32" />
                            <Skeleton className="h-10 flex-1" />
                        </div>
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-2">
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-40" />
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                            <Skeleton className="h-8 w-8" />
                            <div className="flex items-center gap-2 flex-1">
                                <Skeleton className="h-8 w-12" />
                                <Skeleton className="h-8 w-28" />
                            </div>
                        </div>
                        <Skeleton className="h-3 w-64" />
                    </div>
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <div className="grid grid-cols-2 gap-2">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <Skeleton key={i} className="h-20 w-full" />
                            ))}
                        </div>
                        <Skeleton className="h-3 w-48" />
                    </div>
                    <Skeleton className="h-10 w-full" />
                </div>
                <div className="lg:col-span-1 flex flex-col items-center justify-center text-center space-y-3 sm:space-y-4 p-3 sm:p-4 border rounded-lg">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="w-24 h-24 sm:w-32 sm:h-32 rounded-md" />
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-3 w-48" />
                </div>
            </CardContent>
        </Card>
    );
} 