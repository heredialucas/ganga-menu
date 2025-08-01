import { Suspense } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@repo/design-system/components/ui/tabs';
import { ConfigManagerServer } from './config/ConfigManagerServer';
import { DesignManagerServer } from './design/DesignManagerServer';
import { QRManagerServer } from './qr-codes/QRManagerServer';
import type { Dictionary } from '@repo/internationalization';
import { Settings, LayoutDashboard, QrCode } from 'lucide-react';
import ConfigLoading from './config/loading';
import DesignLoading from './design/loading';
import QRLoading from './qr-codes/loading';

interface RestaurantViewManagerProps {
    dictionary: Dictionary;
    appUrl: string;
    showDesignTab: boolean;
    showQRTab: boolean;
    canEdit: boolean;
    canView: boolean;
}

export function RestaurantViewManager({
    dictionary,
    appUrl,
    showDesignTab,
    showQRTab,
    canEdit,
    canView
}: RestaurantViewManagerProps) {
    // Calcular el número de columnas para el grid
    const tabCount = 1 + (showDesignTab ? 1 : 0) + (showQRTab ? 1 : 0);
    const gridCols = tabCount === 1 ? 'grid-cols-1' : tabCount === 2 ? 'grid-cols-2' : 'grid-cols-3';

    return (
        <Tabs defaultValue="config" className="w-full">
            <TabsList className={`grid w-full ${gridCols} h-auto sm:h-10`}>
                <TabsTrigger value="config" className="gap-1 sm:gap-2 text-xs sm:text-sm py-2 sm:py-0">
                    <Settings className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">
                        {canEdit
                            ? dictionary.app.restaurant.view.configTab
                            : dictionary.app.restaurant.view.configTab + ' (' + (dictionary.app.restaurant.config.readOnlyTitle || 'Solo Lectura') + ')'
                        }
                    </span>
                    <span className="sm:hidden">
                        {canEdit
                            ? dictionary.app.restaurant.view.configTab
                            : dictionary.app.restaurant.view.configTab + ' (' + (dictionary.app.restaurant.config.readOnlyTitle || 'Solo Lectura') + ')'
                        }
                    </span>
                </TabsTrigger>
                {showDesignTab && (
                    <TabsTrigger value="design" className="gap-1 sm:gap-2 text-xs sm:text-sm py-2 sm:py-0">
                        <LayoutDashboard className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="hidden sm:inline">
                            {canEdit
                                ? dictionary.app.restaurant.view.designTab
                                : dictionary.app.restaurant.view.designTab + ' (' + (dictionary.app.restaurant.design.readOnlyTitle || 'Solo Lectura') + ')'
                            }
                        </span>
                        <span className="sm:hidden">
                            {canEdit
                                ? dictionary.app.restaurant.view.designTab
                                : dictionary.app.restaurant.view.designTab + ' (' + (dictionary.app.restaurant.design.readOnlyTitle || 'Solo Lectura') + ')'
                            }
                        </span>
                    </TabsTrigger>
                )}
                {showQRTab && (
                    <TabsTrigger value="qr" className="gap-1 sm:gap-2 text-xs sm:text-sm py-2 sm:py-0">
                        <QrCode className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="hidden sm:inline">
                            {canEdit
                                ? dictionary.app.restaurant.view.qrTab
                                : dictionary.app.restaurant.view.qrTab + ' (' + (dictionary.app.restaurant.config.readOnlyTitle || 'Solo Lectura') + ')'
                            }
                        </span>
                        <span className="sm:hidden">
                            {canEdit
                                ? dictionary.app.restaurant.view.qrTab
                                : dictionary.app.restaurant.view.qrTab + ' (' + (dictionary.app.restaurant.config.readOnlyTitle || 'Solo Lectura') + ')'
                            }
                        </span>
                    </TabsTrigger>
                )}
            </TabsList>

            <TabsContent value="config" className="mt-4 sm:mt-6">
                <Suspense fallback={<ConfigLoading />}>
                    <ConfigManagerServer
                        dictionary={dictionary}
                        appUrl={appUrl}
                    />
                </Suspense>
            </TabsContent>

            {showDesignTab && (
                <TabsContent value="design" className="mt-4 sm:mt-6">
                    <Suspense fallback={<DesignLoading />}>
                        <DesignManagerServer
                            dictionary={dictionary}
                        />
                    </Suspense>
                </TabsContent>
            )}

            {showQRTab && (
                <TabsContent value="qr" className="mt-4 sm:mt-6">
                    <Suspense fallback={<QRLoading />}>
                        <QRManagerServer
                            dictionary={dictionary}
                            appUrl={appUrl}
                        />
                    </Suspense>
                </TabsContent>
            )}
        </Tabs>
    );
} 