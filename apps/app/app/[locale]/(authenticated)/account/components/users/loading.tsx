import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/design-system/components/ui/card';
import { Skeleton } from '@repo/design-system/components/ui/skeleton';
import { User } from 'lucide-react';

export default function UsersLoading() {
    return (
        <Card>
            <CardHeader className="p-3 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
                    <div className="flex-1">
                        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                            <User className="h-4 w-4 sm:h-5 sm:w-5" />
                            <Skeleton className="h-6 w-48" />
                        </CardTitle>
                        <CardDescription className="text-sm sm:text-base">
                            <Skeleton className="h-4 w-64" />
                        </CardDescription>
                    </div>
                    <Skeleton className="h-10 w-32" />
                </div>
            </CardHeader>
            <CardContent className="p-3 sm:p-6">
                <div className="space-y-3 sm:space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 border rounded-lg gap-3 sm:gap-4">
                            <div className="flex items-center gap-3 sm:gap-4">
                                <div className="flex flex-col">
                                    <Skeleton className="h-4 w-32" />
                                    <Skeleton className="h-3 w-48" />
                                    <Skeleton className="h-5 w-16 mt-1" />
                                </div>
                            </div>
                            <div className="flex items-center gap-1 sm:gap-2">
                                <Skeleton className="h-8 w-8 sm:h-10 sm:w-10" />
                                <Skeleton className="h-8 w-8 sm:h-10 sm:w-10" />
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
} 