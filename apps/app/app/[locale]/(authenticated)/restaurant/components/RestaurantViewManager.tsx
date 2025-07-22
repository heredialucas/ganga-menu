'use client';

import dynamic from 'next/dynamic';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@repo/design-system/components/ui/tabs';
import { RestaurantConfigForm } from './RestaurantConfigForm';
import { TableQRGenerator } from './TableQRGenerator';
import type { RestaurantConfigData } from '@repo/data-services/src/services/restaurantConfigService';
import type { RestaurantDesignData } from '@repo/data-services/src/services/restaurantDesignService';
import type { Dictionary } from '@repo/internationalization';
import { Settings, LayoutDashboard, QrCode } from 'lucide-react';
import { Skeleton } from '@repo/design-system/components/ui/skeleton';

const RestaurantDesignView = dynamic(
    () => import('./RestaurantDesignView').then(mod => mod.RestaurantDesignView),
    {
        ssr: false,
        loading: () => (
            <div className="space-y-4 p-4">
                <Skeleton className="h-12 w-1/4" />
                <Skeleton className="h-[500px] w-full" />
            </div>
        ),
    }
);

interface RestaurantViewManagerProps {
    config: RestaurantConfigData | null;
    design: RestaurantDesignData | null;
    dictionary: Dictionary;
    appUrl: string;
}

export function RestaurantViewManager({ config, design, dictionary, appUrl }: RestaurantViewManagerProps) {
    return (
        <Tabs defaultValue="config" className="w-full">
            <TabsList className="grid w-full grid-cols-3 h-auto sm:h-10">
                <TabsTrigger value="config" className="gap-1 sm:gap-2 text-xs sm:text-sm py-2 sm:py-0">
                    <Settings className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">{(dictionary as any).app?.restaurant?.view?.configTab || 'Configuración'}</span>
                    <span className="sm:hidden">{(dictionary as any).app?.restaurant?.view?.configTab || 'Config'}</span>
                </TabsTrigger>
                <TabsTrigger value="design" className="gap-1 sm:gap-2 text-xs sm:text-sm py-2 sm:py-0">
                    <LayoutDashboard className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">{(dictionary as any).app?.restaurant?.view?.designTab || 'Diseño'}</span>
                    <span className="sm:hidden">{(dictionary as any).app?.restaurant?.view?.designTab || 'Diseño'}</span>
                </TabsTrigger>
                <TabsTrigger value="qr" className="gap-1 sm:gap-2 text-xs sm:text-sm py-2 sm:py-0">
                    <QrCode className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">{(dictionary as any).app?.restaurant?.view?.qrTab || 'QR por Mesa'}</span>
                    <span className="sm:hidden">{(dictionary as any).app?.restaurant?.view?.qrTab || 'QR'}</span>
                </TabsTrigger>
            </TabsList>
            <TabsContent value="config" className="mt-4 sm:mt-6">
                <RestaurantConfigForm
                    dictionary={dictionary}
                    config={config}
                    appUrl={appUrl}
                />
            </TabsContent>
            <TabsContent value="design" className="mt-4 sm:mt-6">
                <RestaurantDesignView
                    config={config}
                    design={design}
                    dictionary={dictionary}
                />
            </TabsContent>
            <TabsContent value="qr" className="mt-4 sm:mt-6">
                <TableQRGenerator
                    config={config}
                    appUrl={appUrl}
                    dictionary={dictionary}
                />
            </TabsContent>
        </Tabs>
    );
} 