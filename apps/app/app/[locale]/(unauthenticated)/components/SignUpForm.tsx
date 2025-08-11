'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@repo/design-system/components/ui/form';
import { Input } from '@repo/design-system/components/ui/input';
import { Dictionary } from '@repo/internationalization';
import { signUpSchema, type SignUpSchema } from '../lib/schemas';
import { SignUpButton } from './SignUpButton';
import { PasswordInput } from './PasswordInput';
import { PasswordStrengthIndicator } from './PasswordStrengthIndicator';
import { useActionState, useTransition } from 'react';
import { useRef, useState } from 'react';

interface SignUpFormProps {
    dictionary?: Dictionary;
    handleSignUp: (prevState: any, payload: FormData) => Promise<any>;
    error?: string;
}

export const SignUpForm = ({ dictionary, handleSignUp, error: initialError }: SignUpFormProps) => {
    const [formState, formAction, isPending] = useActionState(handleSignUp, {
        success: false,
        fields: {},
        errors: {},
    });
    const [isPendingTransition, startTransition] = useTransition();
    const formRef = useRef<HTMLFormElement>(null);
    const [password, setPassword] = useState('');

    const form = useForm<SignUpSchema>({
        resolver: zodResolver(signUpSchema),
        defaultValues: {
            name: formState?.fields?.name || '',
            lastName: formState?.fields?.lastName || '',
            email: formState?.fields?.email || '',
            password: formState?.fields?.password || '',
            confirmPassword: formState?.fields?.confirmPassword || '',
        },
    });

    const { handleSubmit, watch } = form;
    const watchedPassword = watch('password');

    const isFormPending = isPending || isPendingTransition;

    return (
        <Form {...form}>
            <form
                ref={formRef}
                action={formAction}
                onSubmit={(evt) => {
                    evt.preventDefault();
                    handleSubmit(() => {
                        startTransition(() => formAction(new FormData(formRef.current!)));
                    })(evt);
                }}
                className="space-y-4"
            >
                {(initialError || formState?.errors?.error) && (
                    <div className="p-3 rounded-md bg-red-50 border border-red-200">
                        <p className="text-sm text-red-600">
                            {initialError || formState?.errors?.error?.[0]}
                        </p>
                    </div>
                )}

                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-sm font-medium text-gray-900 dark:text-white">
                                {dictionary?.app?.auth?.signUp?.firstName || 'Nombre'}
                            </FormLabel>
                            <FormControl>
                                <Input
                                    type="text"
                                    placeholder={dictionary?.app?.auth?.signUp?.firstName || 'Nombre'}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                    defaultValue={formState?.fields?.name}
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-sm font-medium text-gray-900 dark:text-white">
                                {dictionary?.app?.auth?.signUp?.lastName || 'Apellido'}
                            </FormLabel>
                            <FormControl>
                                <Input
                                    type="text"
                                    placeholder={dictionary?.app?.auth?.signUp?.lastName || 'Apellido'}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                    defaultValue={formState?.fields?.lastName}
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-sm font-medium text-gray-900 dark:text-white">
                                {dictionary?.app?.auth?.signUp?.email || 'Correo Electrónico'}
                            </FormLabel>
                            <FormControl>
                                <Input
                                    type="email"
                                    placeholder="correo@ejemplo.com"
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                    defaultValue={formState?.fields?.email}
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-sm font-medium text-gray-900 dark:text-white">
                                {dictionary?.app?.auth?.signUp?.password || 'Contraseña'}
                            </FormLabel>
                            <FormControl>
                                <PasswordInput
                                    placeholder="••••••••"
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                    dictionary={dictionary}
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                            <PasswordStrengthIndicator
                                password={watchedPassword || ''}
                                dictionary={dictionary}
                            />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-sm font-medium text-gray-900 dark:text-white">
                                {dictionary?.app?.auth?.signUp?.confirmPassword || 'Confirmar Contraseña'}
                            </FormLabel>
                            <FormControl>
                                <PasswordInput
                                    placeholder="••••••••"
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                    dictionary={dictionary}
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                            {formState?.errors?.confirmPassword && (
                                <p className="text-sm text-red-600">{formState.errors.confirmPassword[0]}</p>
                            )}
                        </FormItem>
                    )}
                />

                <SignUpButton dictionary={dictionary} isPending={isFormPending} />
            </form>
        </Form>
    );
}; 