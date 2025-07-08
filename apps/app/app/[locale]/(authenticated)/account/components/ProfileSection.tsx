'use client';

import { useTransition } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/design-system/components/ui/card';
import { Button } from '@repo/design-system/components/ui/button';
import { Input } from '@repo/design-system/components/ui/input';
import { Label } from '@repo/design-system/components/ui/label';
import { Badge } from '@repo/design-system/components/ui/badge';
import { toast } from 'sonner';
import { User } from 'lucide-react';
import type { Dictionary } from '@repo/internationalization';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { updateProfile } from '../actions';

const profileSchema = z.object({
    name: z.string().min(1, 'El nombre es requerido'),
    lastName: z.string().min(1, 'El apellido es requerido'),
    email: z.string().email('Email inválido'),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

interface ProfileSectionProps {
    currentUser: any;
    dictionary: Dictionary;
    canEdit: boolean;
}

export function ProfileSection({ currentUser, dictionary, canEdit }: ProfileSectionProps) {
    const [isPending, startTransition] = useTransition();

    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            name: currentUser?.name || '',
            lastName: currentUser?.lastName || '',
            email: currentUser?.email || '',
        },
    });

    const onSubmit = (data: ProfileFormValues) => {
        if (!canEdit) return;

        const promise = async () => {
            const formData = new FormData();
            formData.append('name', data.name);
            formData.append('lastName', data.lastName);
            formData.append('email', data.email);

            const result = await updateProfile(currentUser.id, formData);
            if (!result.success) {
                throw new Error(result.message);
            }
            return result;
        };

        startTransition(() => {
            toast.promise(promise(), {
                loading: 'Actualizando perfil...',
                success: (data) => `${data.message || 'Perfil actualizado exitosamente.'}`,
                error: (err) => err.message,
            });
        });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Información Personal
                </CardTitle>
                <CardDescription>
                    Actualiza tu información personal y configuración de cuenta
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nombre</Label>
                            <Input
                                id="name"
                                {...form.register('name')}
                                disabled={isPending || !canEdit}
                            />
                            {form.formState.errors.name && (
                                <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="lastName">Apellido</Label>
                            <Input
                                id="lastName"
                                {...form.register('lastName')}
                                disabled={isPending || !canEdit}
                            />
                            {form.formState.errors.lastName && (
                                <p className="text-sm text-red-500">{form.formState.errors.lastName.message}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                {...form.register('email')}
                                disabled={isPending || !canEdit}
                            />
                            {form.formState.errors.email && (
                                <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-4 border-t gap-4">
                        <div className="space-y-1">
                            <p className="text-sm font-medium">Rol actual</p>
                            <Badge variant="default" className="capitalize">
                                {currentUser?.role === 'admin' ? 'Administrador' : 'Usuario'}
                            </Badge>
                        </div>
                        {canEdit && (
                            <Button
                                type="submit"
                                className="w-full sm:w-auto"
                                disabled={isPending}
                            >
                                {isPending ? 'Guardando...' : 'Guardar Cambios'}
                            </Button>
                        )}
                    </div>
                </form>
            </CardContent>
        </Card>
    );
} 