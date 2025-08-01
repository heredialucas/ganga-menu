'use client';

import { useTransition } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/design-system/components/ui/card';
import { Button } from '@repo/design-system/components/ui/button';
import { Input } from '@repo/design-system/components/ui/input';
import { Label } from '@repo/design-system/components/ui/label';
import { Badge } from '@repo/design-system/components/ui/badge';
import { toast } from 'sonner';
import { Eye, Edit } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { updateProfile } from '../../actions';

const profileSchema = z.object({
    name: z.string().min(1),
    lastName: z.string().min(1),
    email: z.string().email(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

interface ProfileManagerClientProps {
    currentUser: any;
    dictionary: any;
    canEdit: boolean;
    canView: boolean;
}

export function ProfileManagerClient({ currentUser, dictionary, canEdit, canView }: ProfileManagerClientProps) {
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
                loading: dictionary.app?.account?.profile?.toast?.updating || 'Actualizando perfil...',
                success: (data) => `${data.message || (dictionary.app?.account?.profile?.toast?.success || 'Perfil actualizado exitosamente.')}`,
                error: (err) => err.message,
            });
        });
    };

    return (
        <Card>
            <CardHeader className="p-3 sm:p-6">
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                    {canEdit ? (
                        <Edit className="h-4 w-4 sm:h-5 sm:w-5" />
                    ) : (
                        <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
                    )}
                    {canEdit
                        ? (dictionary.app?.account?.profile?.title || 'Información Personal')
                        : (dictionary.app?.account?.profile?.titleReadOnly || 'Información Personal (Solo Lectura)')
                    }
                </CardTitle>
                <CardDescription className="text-sm sm:text-base">
                    {canEdit
                        ? (dictionary.app?.account?.profile?.description || 'Actualiza tu información personal y configuración de cuenta')
                        : (dictionary.app?.account?.profile?.descriptionReadOnly || 'Información personal de la cuenta (modo solo lectura)')
                    }
                </CardDescription>
            </CardHeader>
            <CardContent className="p-3 sm:p-6">
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
                    <div className="grid gap-3 sm:gap-4 grid-cols-1 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-sm sm:text-base">{dictionary.app?.account?.profile?.name || 'Nombre'}</Label>
                            <Input
                                id="name"
                                {...form.register('name')}
                                disabled={isPending || !canEdit}
                                className={`text-sm sm:text-base ${!canEdit ? 'opacity-60 cursor-not-allowed' : ''}`}
                                readOnly={!canEdit}
                            />
                            {form.formState.errors.name && canEdit && (
                                <p className="text-xs sm:text-sm text-red-500">{form.formState.errors.name.message}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="lastName" className="text-sm sm:text-base">{dictionary.app?.account?.profile?.lastName || 'Apellido'}</Label>
                            <Input
                                id="lastName"
                                {...form.register('lastName')}
                                disabled={isPending || !canEdit}
                                className={`text-sm sm:text-base ${!canEdit ? 'opacity-60 cursor-not-allowed' : ''}`}
                                readOnly={!canEdit}
                            />
                            {form.formState.errors.lastName && canEdit && (
                                <p className="text-xs sm:text-sm text-red-500">{form.formState.errors.lastName.message}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-sm sm:text-base">{dictionary.app?.account?.profile?.email || 'Email'}</Label>
                            <Input
                                id="email"
                                type="email"
                                {...form.register('email')}
                                disabled={isPending || !canEdit}
                                className={`text-sm sm:text-base ${!canEdit ? 'opacity-60 cursor-not-allowed' : ''}`}
                                readOnly={!canEdit}
                            />
                            {form.formState.errors.email && canEdit && (
                                <p className="text-xs sm:text-sm text-red-500">{form.formState.errors.email.message}</p>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-3 sm:pt-4 border-t gap-3 sm:gap-4">
                        <div className="space-y-1">
                            <p className="text-sm sm:text-base font-medium">{dictionary.app?.account?.profile?.currentRole || 'Rol actual'}</p>
                            <Badge variant="default" className="capitalize text-xs sm:text-sm">
                                {currentUser?.role === 'admin' ? (dictionary.app?.account?.profile?.admin || 'Administrador') :
                                    currentUser?.role === 'premium' ? 'Premium' :
                                        (dictionary.app?.account?.profile?.user || 'Usuario')}
                            </Badge>
                        </div>
                        {canEdit && (
                            <Button
                                type="submit"
                                className="w-full sm:w-auto text-sm sm:text-base"
                                disabled={isPending}
                            >
                                <span className="hidden sm:inline">{isPending ? (dictionary.app?.account?.profile?.saving || 'Guardando...') : (dictionary.app?.account?.profile?.saveChanges?.desktop || 'Guardar Cambios')}</span>
                                <span className="sm:hidden">{isPending ? (dictionary.app?.account?.profile?.saving || 'Guardando...') : (dictionary.app?.account?.profile?.saveChanges?.mobile || 'Guardar')}</span>
                            </Button>
                        )}
                    </div>
                </form>
            </CardContent>
        </Card>
    );
} 