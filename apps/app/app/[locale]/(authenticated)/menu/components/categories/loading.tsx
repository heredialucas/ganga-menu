import { Skeleton } from '@repo/design-system/components/ui/skeleton';

export default function Loading() {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-6 p-1 sm:p-2">
            <div className="space-y-3">
                <Skeleton className="h-6 w-32" />
                <div className="flex items-stretch gap-2">
                    <Skeleton className="h-10 flex-1" />
                    <Skeleton className="h-10 w-20" />
                </div>
            </div>
            <div className="space-y-3">
                <Skeleton className="h-6 w-40" />
                <div className="border rounded-md p-4">
                    <div className="space-y-2">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <Skeleton key={i} className="h-12 w-full" />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
} 