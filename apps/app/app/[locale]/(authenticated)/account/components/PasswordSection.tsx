'use client';

import { useTransition } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/design-system/components/ui/card';
import { Button } from '@repo/design-system/components/ui/button';
import { Input } from '@repo/design-system/components/ui/input';
import { Label } from '@repo/design-system/components/ui/label';
import { useToast } from '@repo/design-system/hooks/use-toast';
import { Shield } from 'lucide-react';
import type { Dictionary } from '@repo/internationalization';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { changePassword } from '../actions';

const passwordSchema = z.object({
    currentPassword: z.string().min(1, 'La contraseña actual es requerida'),
    newPassword: z.string().min(6, 'La nueva contraseña debe tener al menos 6 caracteres'),
    confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
});

type PasswordFormValues = z.infer<typeof passwordSchema>;

interface PasswordSectionProps {
    currentUser: any;
    dictionary: Dictionary;
    canChange: boolean;
}

export function PasswordSection({ currentUser, dictionary, canChange }: PasswordSectionProps) {
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();

    const form = useForm<PasswordFormValues>({
        resolver: zodResolver(passwordSchema),
        defaultValues: {
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
        },
    });

    const onSubmit = (data: PasswordFormValues) => {
        startTransition(async () => {
            const formData = new FormData();
            formData.append('currentPassword', data.currentPassword);
            formData.append('newPassword', data.newPassword);
            formData.append('confirmPassword', data.confirmPassword);

            const result = await changePassword(currentUser.id, formData);

            if (result.success) {
                toast({
                    title: "Éxito",
                    description: result.message,
                });
                form.reset();
            } else {
                toast({
                    title: "Error",
                    description: result.message,
                    variant: "destructive",
                });
            }
        });
    };

    if (!canChange) {
        return null;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Seguridad
                </CardTitle>
                <CardDescription>
                    Gestiona tu contraseña y configuración de seguridad
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="current-password">Contraseña Actual</Label>
                        <Input
                            id="current-password"
                            type="password"
                            {...form.register('currentPassword')}
                            disabled={isPending}
                        />
                        {form.formState.errors.currentPassword && (
                            <p className="text-sm text-red-500">{form.formState.errors.currentPassword.message}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="new-password">Nueva Contraseña</Label>
                        <Input
                            id="new-password"
                            type="password"
                            {...form.register('newPassword')}
                            disabled={isPending}
                        />
                        {form.formState.errors.newPassword && (
                            <p className="text-sm text-red-500">{form.formState.errors.newPassword.message}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="confirm-password">Confirmar Nueva Contraseña</Label>
                        <Input
                            id="confirm-password"
                            type="password"
                            {...form.register('confirmPassword')}
                            disabled={isPending}
                        />
                        {form.formState.errors.confirmPassword && (
                            <p className="text-sm text-red-500">{form.formState.errors.confirmPassword.message}</p>
                        )}
                    </div>
                    <Button
                        type="submit"
                        className="w-full"
                        disabled={isPending}
                    >
                        {isPending ? "Actualizando..." : "Actualizar Contraseña"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
} 