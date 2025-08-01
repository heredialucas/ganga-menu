import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/design-system/components/ui/card';
import { Skeleton } from '@repo/design-system/components/ui/skeleton';
import { Shield } from 'lucide-react';

export default function PasswordLoading() {
    return (
        <Card>
            <CardHeader className="p-3 sm:p-6">
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                    <Shield className="h-4 w-4 sm:h-5 sm:w-5" />
                    <Skeleton className="h-6 w-32" />
                </CardTitle>
                <CardDescription className="text-sm sm:text-base">
                    <Skeleton className="h-4 w-64" />
                </CardDescription>
            </CardHeader>
            <CardContent className="p-3 sm:p-6">
                <div className="space-y-3 sm:space-y-4">
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-28" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-40" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                    <Skeleton className="h-10 w-full" />
                </div>
            </CardContent>
        </Card>
    );
} 