import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@repo/design-system/components/ui/card';
import { Skeleton } from '@repo/design-system/components/ui/skeleton';
import { ChefHat } from 'lucide-react';

export default function KitchenManagerLoading() {
    return (
        <Card className="flex flex-col">
            <CardHeader>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                    <ChefHat className="h-6 w-6 sm:h-8 sm:w-8 text-orange-500 flex-shrink-0" />
                    <div className="text-center sm:text-left">
                        <CardTitle className="text-lg sm:text-xl">
                            <Skeleton className="h-6 w-32" />
                        </CardTitle>
                        <CardDescription className="text-sm sm:text-base">
                            <Skeleton className="h-4 w-48 mt-2" />
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col p-3 sm:p-4 md:p-6">
                <div>
                    <Skeleton className="h-4 w-48 mb-2" />
                    <Skeleton className="h-3 w-64 mb-4" />
                    <div className="flex flex-col sm:flex-row w-full items-stretch sm:items-center gap-2">
                        <Skeleton className="h-10 flex-grow" />
                        <Skeleton className="h-10 w-20 flex-shrink-0" />
                    </div>
                </div>
                <div className="mt-auto pt-4 sm:pt-6">
                    <Skeleton className="h-4 w-48 mb-4" />
                    <div className="space-y-2 sm:space-y-3">
                        <div className="flex items-center gap-2">
                            <Skeleton className="h-8 flex-grow" />
                            <Skeleton className="h-8 w-8 flex-shrink-0" />
                        </div>
                        <Skeleton className="h-32 w-32 mx-auto" />
                        <div className="flex flex-col sm:flex-row w-full items-stretch sm:items-center gap-2">
                            <Skeleton className="h-10 flex-1" />
                            <Skeleton className="h-10 flex-1" />
                        </div>
                    </div>
                </div>
            </CardContent>
            <CardFooter>
                <Skeleton className="h-3 w-64" />
            </CardFooter>
        </Card>
    );
} 