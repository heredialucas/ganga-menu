'use client';

import { useState, useTransition } from 'react';
import type { RestaurantConfigData } from '@repo/data-services/src/services/restaurantConfigService';
import { Button } from '@repo/design-system/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@repo/design-system/components/ui/card';
import { Input } from '@repo/design-system/components/ui/input';
import { UtensilsCrossed, Save } from 'lucide-react';
import type { Dictionary } from '@repo/internationalization';
import { toast } from 'sonner';
import { updateWaiterCode } from '../../actions';
import { ShareableLinkClient } from '../shared/ShareableLinkClient';

interface WaiterManagerClientProps {
    restaurantConfig: RestaurantConfigData;
    dictionary: Dictionary;
    locale: string;
    waiterLink: string;
    canView: boolean;
    canEdit: boolean;
}

export function WaiterManagerClient({
    restaurantConfig,
    dictionary,
    locale,
    waiterLink,
    canView,
    canEdit
}: WaiterManagerClientProps) {
    const [isPending, startTransition] = useTransition();
    const [waiterCode, setWaiterCode] = useState(restaurantConfig.waiterCode);

    const handleUpdateWaiterCode = () => {
        if (!canEdit) return;

        startTransition(async () => {
            const promise = async () => {
                const formData = new FormData();
                formData.append('code', waiterCode);
                const result = await updateWaiterCode(formData);
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
                    <UtensilsCrossed className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500 flex-shrink-0" />
                    <div className="text-center sm:text-left">
                        <CardTitle className="text-lg sm:text-xl">
                            {canEdit
                                ? dictionary.web.services.waiter.title
                                : dictionary.web.services.waiter.readOnly.title
                            }
                        </CardTitle>
                        <CardDescription className="text-sm sm:text-base">
                            {canEdit
                                ? dictionary.web.services.waiter.description
                                : dictionary.web.services.waiter.readOnly.description
                            }
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col p-3 sm:p-4 md:p-6">
                <div>
                    <label className="text-sm sm:text-base font-medium">
                        {dictionary.web.services.waiter.accessCode}
                    </label>
                    <p className="text-xs sm:text-sm text-muted-foreground mb-2">
                        {dictionary.web.services.waiter.accessCodeDescription}
                    </p>
                    <div className="flex flex-col sm:flex-row w-full items-stretch sm:items-center gap-2">
                        <Input
                            type="text"
                            placeholder={dictionary.web.services.waiter.placeholder}
                            value={waiterCode}
                            onChange={(e) => setWaiterCode(e.target.value)}
                            className="flex-grow"
                            disabled={!canEdit}
                        />
                        {canEdit && (
                            <Button type="button" onClick={handleUpdateWaiterCode} disabled={isPending} className="flex-shrink-0">
                                <Save className="mr-2 h-4 w-4" />
                                <span className="hidden sm:inline">
                                    {isPending ? dictionary.web.services.waiter.saving : dictionary.web.services.waiter.save}
                                </span>
                                <span className="sm:hidden">
                                    {isPending ? dictionary.web.services.waiter.savingShort : dictionary.web.services.waiter.saveShort}
                                </span>
                            </Button>
                        )}
                    </div>
                </div>
                <div className="mt-auto pt-6 sm:pt-8">
                    <label className="text-sm font-medium">
                        {dictionary.web.services.waiter.accessLink}
                    </label>
                    <ShareableLinkClient
                        link={waiterLink}
                        linkName="Mozos"
                        dictionary={dictionary}
                        canView={canView}
                    />
                </div>
            </CardContent>
            <CardFooter>
                <p className="text-xs text-muted-foreground">
                    {dictionary.web.services.waiter.footer}
                </p>
            </CardFooter>
        </Card>
    );
} 