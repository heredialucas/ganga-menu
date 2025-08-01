import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/design-system/components/ui/card';
import { Skeleton } from '@repo/design-system/components/ui/skeleton';

export default function DesignLoading() {
    return (
        <Card>
            <CardHeader>
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-96" />
            </CardHeader>
            <CardContent className="p-1 sm:p-2 md:p-6">
                {/* Toolbar Skeleton */}
                <div className="flex flex-wrap gap-2 items-center p-3 border rounded-lg mb-4">
                    <Skeleton className="h-8 w-20" />
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-8 w-24" />
                    <Skeleton className="h-8 w-20" />
                    <Skeleton className="h-8 w-16" />
                </div>

                {/* Canvas Skeleton */}
                <div className="bg-gray-50 border rounded-lg p-8">
                    <div className="flex items-center justify-center">
                        <div className="text-center space-y-4">
                            <Skeleton className="h-12 w-12 mx-auto" />
                            <Skeleton className="h-4 w-48" />
                            <Skeleton className="h-4 w-32" />
                        </div>
                    </div>
                </div>

                {/* Footer Skeleton */}
                <div className="flex justify-center sm:justify-end mt-4">
                    <Skeleton className="h-10 w-32" />
                </div>
            </CardContent>
        </Card>
    );
} 