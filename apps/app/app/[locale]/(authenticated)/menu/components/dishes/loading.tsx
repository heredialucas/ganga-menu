import { Card, CardContent, CardHeader } from '@repo/design-system/components/ui/card';
import { Skeleton } from '@repo/design-system/components/ui/skeleton';
import { UtensilsCrossed } from 'lucide-react';

export default function Loading() {
    return (
        <Card>
            <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex-1 text-center sm:text-left">
                        <div className="flex items-center gap-2 justify-center sm:justify-start">
                            <UtensilsCrossed className="h-5 w-5" />
                            <Skeleton className="h-6 w-32" />
                        </div>
                        <Skeleton className="h-4 w-64 mt-2" />
                    </div>
                    <Skeleton className="h-10 w-32" />
                </div>
            </CardHeader>
            <CardContent className="p-2 sm:p-3 md:p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <Card key={i} className="overflow-hidden">
                            <Skeleton className="h-24 sm:h-32 w-full" />
                            <CardContent className="p-2 sm:p-3">
                                <Skeleton className="h-3 w-16 mb-2" />
                                <Skeleton className="h-4 w-full mb-1" />
                                <Skeleton className="h-3 w-3/4 mb-2" />
                                <Skeleton className="h-5 w-16" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
} 