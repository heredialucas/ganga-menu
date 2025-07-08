'use client';

import { useTransition } from 'react';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { toast } from 'sonner';
import { saveRestaurantConfig } from './actions';
import type { RestaurantConfigData } from '@repo/data-services/src/services/restaurantConfigService';
import type { Dictionary } from '@repo/internationalization';
import { Input } from '@repo/design-system/components/ui/input';
import { Button } from '@repo/design-system/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@repo/design-system/components/ui/card';
import { Label } from '@repo/design-system/components/ui/label';
import { Textarea } from '@repo/design-system/components/ui/textarea';
import { ImageUpload } from './image-upload';
import { Loader2, Save } from 'lucide-react';

const initialState = {
    success: false,
    message: '',
    errors: undefined,
};

function SubmitButton({ dictionary }: { dictionary: Dictionary }) {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending}>
            {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            {dictionary.app.admin.menu.dishes.form.update}
        </Button>
    );
}

export function RestaurantConfigForm({
    config,
    dictionary,
}: {
    config: RestaurantConfigData | null;
    dictionary: Dictionary;
}) {

    const [state, formAction] = useActionState(saveRestaurantConfig, initialState);
    const [isPending, startTransition] = useTransition();

    const handleSubmit = (formData: FormData) => {
        startTransition(() => {
            toast.promise(saveRestaurantConfig(state, formData), {
                loading: 'Guardando configuración...',
                success: (result) => {
                    if (result.success) {
                        return result.message;
                    } else {
                        throw new Error(result.message);
                    }
                },
                error: (error) => error.message,
            });
        });
    };

    return (
        <form action={handleSubmit}>
            <Card>
                <CardHeader>
                    <CardTitle>Configuración General</CardTitle>
                    <CardDescription>
                        Define los detalles de tu restaurante que verán tus clientes.
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nombre del Restaurante</Label>
                            <Input id="name" name="name" defaultValue={config?.name} />
                            {state?.errors?.name && <p className="text-sm text-red-500">{state.errors.name[0]}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="slug">Enlace Personalizado (URL)</Label>
                            <Input id="slug" name="slug" defaultValue={config?.slug} placeholder="ej: mi-restaurante-favorito" />
                            {state?.errors?.slug && <p className="text-sm text-red-500">{state.errors.slug[0]}</p>}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Descripción</Label>
                        <Textarea id="description" name="description" defaultValue={config?.description || ''} />
                        {state?.errors?.description && <p className="text-sm text-red-500">{state.errors.description[0]}</p>}
                    </div>

                    <div className="space-y-4">
                        <Label>Logo del Restaurante</Label>
                        <ImageUpload name="logoUrl" initialUrl={config?.logoUrl} />
                    </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                    <SubmitButton dictionary={dictionary} />
                </CardFooter>
            </Card>
        </form>
    );
} 