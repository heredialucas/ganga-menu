import { Skeleton } from '@repo/design-system/components/ui/skeleton';
import { Card, CardContent } from '@repo/design-system/components/ui/card';

export default function Loading() {
    return (
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-6 p-1 sm:p-2">
            <div className="xl:col-span-2 space-y-4">
                <Skeleton className="h-6 w-40" />
                <div className="space-y-2">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-10 w-full" />
                </div>
                <div className="flex items-center space-x-2">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 w-32" />
                </div>
                <Skeleton className="h-10 w-full" />
            </div>
            <div className="xl:col-span-3 space-y-4">
                <Skeleton className="h-6 w-40" />
                <div className="space-y-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
                            <Skeleton className="h-4 w-4" />
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-8 w-8 ml-auto" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
} 