'use client';

import { useState, useTransition } from 'react';
import type { RestaurantConfigData } from '@repo/data-services/src/services/restaurantConfigService';
import { Button } from '@repo/design-system/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@repo/design-system/components/ui/card';
import { Input } from '@repo/design-system/components/ui/input';
import { ChefHat, Save } from 'lucide-react';
import type { Dictionary } from '@repo/internationalization';
import { toast } from 'sonner';
import { updateKitchenCode } from '../../actions';
import { ShareableLinkClient } from '../shared/ShareableLinkClient';

interface KitchenManagerClientProps {
    restaurantConfig: RestaurantConfigData;
    dictionary: Dictionary;
    locale: string;
    kitchenLink: string;
    canView: boolean;
    canEdit: boolean;
}

export function KitchenManagerClient({
    restaurantConfig,
    dictionary,
    locale,
    kitchenLink,
    canView,
    canEdit
}: KitchenManagerClientProps) {
    const [isPending, startTransition] = useTransition();
    const [kitchenCode, setKitchenCode] = useState(restaurantConfig.kitchenCode || '5678');

    const handleUpdateKitchenCode = () => {
        if (!canEdit) {
            toast.error(dictionary.web.services.shared.codeError || 'No tienes permisos para editar el código de cocina');
            return;
        }

        startTransition(async () => {
            const promise = async () => {
                const formData = new FormData();
                formData.append('code', kitchenCode);
                const result = await updateKitchenCode(formData);
                if (!result.success) {
                    throw new Error(result.message);
                }
                return result;
            };

            toast.promise(promise(), {
                loading: dictionary.web.services.shared.savingCode,
                success: (result) => `${result.message || dictionary.web.services.shared.codeSaved}`,
                error: (err) => `${dictionary.web.services.shared.codeError}: ${err.message}`,
            });
        });
    };

    return (
        <Card className="flex flex-col">
            <CardHeader>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                    <ChefHat className="h-6 w-6 sm:h-8 sm:w-8 text-orange-500 flex-shrink-0" />
                    <div className="text-center sm:text-left">
                        <CardTitle className="text-lg sm:text-xl">
                            {canEdit
                                ? dictionary.web.services.kitchen.title
                                : dictionary.web.services.kitchen.readOnly.title
                            }
                        </CardTitle>
                        <CardDescription className="text-sm sm:text-base">
                            {canEdit
                                ? dictionary.web.services.kitchen.description
                                : dictionary.web.services.kitchen.readOnly.description
                            }
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col p-3 sm:p-4 md:p-6">
                <div>
                    <label className="text-sm sm:text-base font-medium">
                        {dictionary.web.services.kitchen.accessCode}
                    </label>
                    <p className="text-xs sm:text-sm text-muted-foreground mb-2">
                        {dictionary.web.services.kitchen.accessCodeDescription}
                    </p>
                    <div className="flex flex-col sm:flex-row w-full items-stretch sm:items-center gap-2">
                        <Input
                            type="text"
                            placeholder={dictionary.web.services.kitchen.placeholder}
                            value={kitchenCode}
                            onChange={(e) => setKitchenCode(e.target.value)}
                            className="flex-grow"
                            disabled={!canEdit}
                        />
                        {canEdit && (
                            <Button type="button" onClick={handleUpdateKitchenCode} disabled={isPending} className="flex-shrink-0">
                                <Save className="mr-2 h-4 w-4" />
                                <span className="hidden sm:inline">
                                    {isPending ? dictionary.web.services.kitchen.saving : dictionary.web.services.kitchen.save}
                                </span>
                                <span className="sm:hidden">
                                    {isPending ? dictionary.web.services.kitchen.savingShort : dictionary.web.services.kitchen.saveShort}
                                </span>
                            </Button>
                        )}
                    </div>
                </div>
                <div className="mt-auto pt-4 sm:pt-6">
                    <label className="text-sm sm:text-base font-medium">
                        {dictionary.web.services.kitchen.accessLink}
                    </label>
                    <ShareableLinkClient
                        link={kitchenLink}
                        linkName="Cocina"
                        dictionary={dictionary}
                        canView={canView}
                    />
                </div>
            </CardContent>
            <CardFooter>
                <p className="text-xs text-muted-foreground">
                    {dictionary.web.services.kitchen.footer}
                </p>
            </CardFooter>
        </Card>
    );
} 