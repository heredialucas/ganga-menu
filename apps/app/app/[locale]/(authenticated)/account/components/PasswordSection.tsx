'use client';

import { useTransition } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/design-system/components/ui/card';
import { Button } from '@repo/design-system/components/ui/button';
import { Input } from '@repo/design-system/components/ui/input';
import { Label } from '@repo/design-system/components/ui/label';
import { toast } from 'sonner';
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
        const promise = async () => {
            const formData = new FormData();
            formData.append('currentPassword', data.currentPassword);
            formData.append('newPassword', data.newPassword);
            formData.append('confirmPassword', data.confirmPassword);

            const result = await changePassword(currentUser.id, formData);

            if (!result.success) {
                throw new Error(result.message);
            }
            form.reset();
            return result;
        };

        startTransition(() => {
            toast.promise(promise(), {
                loading: dictionary.app?.account?.password?.toast?.updating || 'Actualizando contraseña...',
                success: (data) => `${data.message || (dictionary.app?.account?.password?.toast?.success || 'Contraseña actualizada exitosamente.')}`,
                error: (err) => err.message,
            });
        });
    };

    if (!canChange) {
        return null;
    }

    return (
        <Card>
            <CardHeader className="p-3 sm:p-6">
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                    <Shield className="h-4 w-4 sm:h-5 sm:w-5" />
                    {dictionary.app?.account?.password?.title || 'Seguridad'}
                </CardTitle>
                <CardDescription className="text-sm sm:text-base">
                    {dictionary.app?.account?.password?.description || 'Gestiona tu contraseña y configuración de seguridad'}
                </CardDescription>
            </CardHeader>
            <CardContent className="p-3 sm:p-6">
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3 sm:space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="current-password" className="text-sm sm:text-base">{dictionary.app?.account?.password?.currentPassword || 'Contraseña Actual'}</Label>
                        <Input
                            id="current-password"
                            type="password"
                            {...form.register('currentPassword')}
                            disabled={isPending}
                            className="text-sm sm:text-base"
                        />
                        {form.formState.errors.currentPassword && (
                            <p className="text-xs sm:text-sm text-red-500">{form.formState.errors.currentPassword.message}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="new-password" className="text-sm sm:text-base">{dictionary.app?.account?.password?.newPassword || 'Nueva Contraseña'}</Label>
                        <Input
                            id="new-password"
                            type="password"
                            {...form.register('newPassword')}
                            disabled={isPending}
                            className="text-sm sm:text-base"
                        />
                        {form.formState.errors.newPassword && (
                            <p className="text-xs sm:text-sm text-red-500">{form.formState.errors.newPassword.message}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="confirm-password" className="text-sm sm:text-base">{dictionary.app?.account?.password?.confirmPassword || 'Confirmar Nueva Contraseña'}</Label>
                        <Input
                            id="confirm-password"
                            type="password"
                            {...form.register('confirmPassword')}
                            disabled={isPending}
                            className="text-sm sm:text-base"
                        />
                        {form.formState.errors.confirmPassword && (
                            <p className="text-xs sm:text-sm text-red-500">{form.formState.errors.confirmPassword.message}</p>
                        )}
                    </div>
                    <Button
                        type="submit"
                        className="w-full text-sm sm:text-base"
                        disabled={isPending}
                    >
                        <span className="hidden sm:inline">{isPending ? (dictionary.app?.account?.password?.updating || "Actualizando...") : (dictionary.app?.account?.password?.updatePassword?.desktop || "Actualizar Contraseña")}</span>
                        <span className="sm:hidden">{isPending ? (dictionary.app?.account?.password?.updating || "Actualizando...") : (dictionary.app?.account?.password?.updatePassword?.mobile || "Actualizar")}</span>
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
} 