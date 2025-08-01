import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/design-system/components/ui/card';
import { Skeleton } from '@repo/design-system/components/ui/skeleton';
import { Edit } from 'lucide-react';

export default function ProfileLoading() {
    return (
        <Card>
            <CardHeader className="p-3 sm:p-6">
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                    <Edit className="h-4 w-4 sm:h-5 sm:w-5" />
                    <Skeleton className="h-6 w-48" />
                </CardTitle>
                <CardDescription className="text-sm sm:text-base">
                    <Skeleton className="h-4 w-64" />
                </CardDescription>
            </CardHeader>
            <CardContent className="p-3 sm:p-6">
                <div className="space-y-4 sm:space-y-6">
                    <div className="grid gap-3 sm:gap-4 grid-cols-1 md:grid-cols-2">
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-16" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-12" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-3 sm:pt-4 border-t gap-3 sm:gap-4">
                        <div className="space-y-1">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-6 w-20" />
                        </div>
                        <Skeleton className="h-10 w-32" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
} 