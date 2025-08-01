'use client';

import { useState, useEffect, useRef, useTransition } from 'react';
import { useFormStatus } from 'react-dom';
import { toast } from 'sonner';
import { saveRestaurantConfig } from '../../actions';
import type { RestaurantConfigData } from '@repo/data-services/src/services/restaurantConfigService';
import type { Dictionary } from '@repo/internationalization';
import { Input } from '@repo/design-system/components/ui/input';
import { Button } from '@repo/design-system/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/design-system/components/ui/card';
import { Label } from '@repo/design-system/components/ui/label';
import { Textarea } from '@repo/design-system/components/ui/textarea';
import { ImageUpload } from '../shared/ImageUploadClient';
import { OpeningHoursManager } from '../shared/OpeningHoursManager';
import { Loader2, Save, Clock } from 'lucide-react';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@repo/design-system/components/ui/accordion";

const initialState: {
    success: boolean;
    message: string;
    errors?: Record<string, string[] | undefined>;
    config?: any;
} = {
    success: false,
    message: '',
    errors: undefined,
    config: undefined,
};

function SubmitButton({ dictionary }: { dictionary: Dictionary }) {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending} className="w-full sm:w-auto text-xs sm:text-sm">
            {pending ? <Loader2 className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 animate-spin" /> : <Save className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />}
            <span className="hidden sm:inline">
                {pending ? dictionary.app.restaurant.config.saving : dictionary.app.restaurant.config.save}
            </span>
            <span className="sm:hidden">
                {pending ? dictionary.app.restaurant.config.savingMobile : dictionary.app.restaurant.config.saveMobile}
            </span>
        </Button>
    );
}

interface ConfigManagerClientProps {
    config: RestaurantConfigData | null;
    dictionary: Dictionary;
    appUrl: string;
    canEdit?: boolean;
    canView?: boolean;
}

export function ConfigManagerClient({
    config,
    dictionary,
    appUrl,
    canEdit = true,
    canView = true,
}: ConfigManagerClientProps) {
    const [state, setState] = useState(initialState);
    const [isPending, startTransition] = useTransition();

    const formRef = useRef<HTMLFormElement>(null);

    const handleSubmit = async () => {
        if (!formRef.current || !canEdit) {
            if (!canEdit) {
                toast.error(dictionary.app.restaurant.config.toast.error || 'No tienes permisos para editar la configuración del restaurante');
            }
            return;
        }
        const formData = new FormData(formRef.current);

        startTransition(() => {
            toast.promise(saveRestaurantConfig(state, formData, dictionary), {
                loading: dictionary.app.restaurant.config.toast.saving,
                success: (result) => {
                    setState(result);
                    if (!result.success) throw new Error(result.message);
                    return result.message;
                },
                error: (err) => {
                    // Si el error viene de la promesa (e.g. !res.success), ya tenemos un mensaje.
                    if (err.message) return err.message;
                    // Si es otro tipo de error.
                    setState({ success: false, message: dictionary.app.restaurant.config.toast.unexpectedError });
                    return dictionary.app.restaurant.config.toast.unexpectedError;
                },
            });
        });
    };

    const firstRender = useRef(true);
    useEffect(() => {
        if (firstRender.current) {
            firstRender.current = false;
            return;
        }
        if (state.message) {
            if (state.success) {
                toast.success(state.message);
            } else {
                toast.error(state.message || dictionary.app.restaurant.config.toast.error);
            }
        }
    }, [state, dictionary.app.restaurant.config.toast.error]);

    if (!canView) {
        return (
            <div className="text-center py-8">
                <p className="text-red-600">{dictionary.app.restaurant.config.toast.error}</p>
            </div>
        );
    }

    return (
        <form ref={formRef} action={handleSubmit}>
            <div className="space-y-4 sm:space-y-6 md:space-y-8 md:pb-24">
                {!canEdit && (
                    <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
                        <p className="text-sm text-yellow-800 dark:text-yellow-200">
                            {dictionary.app.restaurant.config.readOnlyMode}: {dictionary.app.restaurant.config.readOnlyDescription}
                        </p>
                    </div>
                )}
                {/* General Info Section */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg sm:text-xl">
                            {canEdit
                                ? dictionary.app.restaurant.config.title
                                : dictionary.app.restaurant.config.title + ' (' + (dictionary.app.restaurant.config.readOnlyTitle || 'Solo Lectura') + ')'
                            }
                        </CardTitle>
                        <CardDescription className="text-sm sm:text-base">
                            {canEdit
                                ? dictionary.app.restaurant.config.description
                                : dictionary.app.restaurant.config.description + ' (' + (dictionary.app.restaurant.config.readOnlySubtitle || 'Modo solo lectura') + ')'
                            }
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-1 sm:p-2 md:p-6 grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                        <div className="lg:col-span-1">
                            <Label className="text-sm sm:text-base">{dictionary.app.restaurant.config.logo}</Label>
                            <ImageUpload name="logoUrl" initialUrl={config?.logoUrl} dictionary={dictionary} canEdit={canEdit} />
                            {state?.errors?.logoUrl && <p className="text-sm text-red-500 mt-2">{state.errors.logoUrl[0]}</p>}
                        </div>
                        <div className="lg:col-span-2 space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-sm sm:text-base">{dictionary.app.restaurant.config.name}</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    defaultValue={config?.name}
                                    placeholder={dictionary.app.restaurant.config.namePlaceholder}
                                    disabled={!canEdit}
                                    readOnly={!canEdit}
                                />
                                {state?.errors?.name && <p className="text-sm text-red-500">{state.errors.name[0]}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description" className="text-sm sm:text-base">{dictionary.app.restaurant.config.description}</Label>
                                <Textarea
                                    id="description"
                                    name="description"
                                    defaultValue={config?.description || ''}
                                    placeholder={dictionary.app.restaurant.config.descriptionPlaceholder}
                                    disabled={!canEdit}
                                    readOnly={!canEdit}
                                />
                                {state?.errors?.description && <p className="text-sm text-red-500">{state.errors.description[0]}</p>}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Contact Info Section */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg sm:text-xl">{dictionary.app.restaurant.config.contactInfo.title}</CardTitle>
                        <CardDescription className="text-sm sm:text-base">
                            {dictionary.app.restaurant.config.contactInfo.description}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-1 sm:p-2 md:p-6 space-y-4 sm:space-y-6">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            <div className="space-y-2">
                                <Label htmlFor="address" className="text-sm sm:text-base">{dictionary.app.restaurant.config.address}</Label>
                                <Input
                                    id="address"
                                    name="address"
                                    defaultValue={config?.address || ''}
                                    placeholder={dictionary.app.restaurant.config.addressPlaceholder}
                                    disabled={!canEdit}
                                    readOnly={!canEdit}
                                />
                                {state?.errors?.address && <p className="text-sm text-red-500">{state.errors.address[0]}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone" className="text-sm sm:text-base">{dictionary.app.restaurant.config.phone}</Label>
                                <Input
                                    id="phone"
                                    name="phone"
                                    defaultValue={config?.phone || ''}
                                    placeholder={dictionary.app.restaurant.config.phonePlaceholder}
                                    disabled={!canEdit}
                                    readOnly={!canEdit}
                                />
                                {state?.errors?.phone && <p className="text-sm text-red-500">{state.errors.phone[0]}</p>}
                            </div>
                            <div className="space-y-2 sm:col-span-2 lg:col-span-1">
                                <Label htmlFor="email" className="text-sm sm:text-base">{dictionary.app.restaurant.config.email}</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    defaultValue={config?.email || ''}
                                    placeholder={dictionary.app.restaurant.config.emailPlaceholder}
                                    disabled={!canEdit}
                                    readOnly={!canEdit}
                                />
                                {state?.errors?.email && <p className="text-sm text-red-500">{state.errors.email[0]}</p>}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Opening Hours Section */}
                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1">
                        <AccordionTrigger className="text-base sm:text-lg font-medium">
                            <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
                                <span className="hidden sm:inline">{dictionary.app.restaurant.openingHours.title}</span>
                                <span className="sm:hidden">{dictionary.app.restaurant.view.hoursTab}</span>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent>
                            <Card className="border-none">
                                <CardHeader>
                                    <CardDescription className="text-sm sm:text-base">
                                        {dictionary.app.restaurant.openingHours.description}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="p-1 sm:p-2 md:p-6">
                                    <OpeningHoursManager initialHours={config?.hours || undefined} dictionary={dictionary} canEdit={canEdit} />
                                    {state?.errors?.hours && <p className="text-sm text-red-500 mt-2">{state.errors.hours[0]}</p>}
                                </CardContent>
                            </Card>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </div>

            {/* Sticky Footer for Submit Button */}
            {canEdit && (
                <div className="static md:fixed bottom-0 left-0 md:left-64 right-0 z-50">
                    <div className="bg-background/95 backdrop-blur-sm supports-[backdrop-filter]:bg-background/60 border-t p-3 sm:p-4">
                        <div className="max-w-6xl mx-auto flex justify-center sm:justify-end">
                            <SubmitButton dictionary={dictionary} />
                        </div>
                    </div>
                </div>
            )}
        </form>
    );
} 