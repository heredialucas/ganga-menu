'use client';

import dynamic from 'next/dynamic';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@repo/design-system/components/ui/tabs';
import { RestaurantConfigForm } from './RestaurantConfigForm';
import type { RestaurantConfigData } from '@repo/data-services/src/services/restaurantConfigService';
import type { Dictionary } from '@repo/internationalization';
import { Settings, LayoutDashboard } from 'lucide-react';
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
    design: { elements: any[] } | null;
    dictionary: Dictionary;
    appUrl: string;
}

export function RestaurantViewManager({ config, design, dictionary, appUrl }: RestaurantViewManagerProps) {
    return (
        <Tabs defaultValue="config" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="config" className="gap-2">
                    <Settings className="h-4 w-4" />
                    Configuración
                </TabsTrigger>
                <TabsTrigger value="design" className="gap-2">
                    <LayoutDashboard className="h-4 w-4" />
                    Diseño
                </TabsTrigger>
            </TabsList>
            <TabsContent value="config" className="mt-6">
                <RestaurantConfigForm
                    dictionary={dictionary}
                    config={config}
                    appUrl={appUrl}
                />
            </TabsContent>
            <TabsContent value="design" className="mt-6">
                <RestaurantDesignView
                    config={config}
                    design={design}
                />
            </TabsContent>
        </Tabs>
    );
} 