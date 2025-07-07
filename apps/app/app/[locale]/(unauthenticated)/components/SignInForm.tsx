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
import { signInSchema, type SignInSchema } from '../lib/schemas';
import { SignInButton } from './SignInButton';
import { useActionState, useTransition } from 'react';
import { useRef, useEffect } from 'react';

interface SignInFormProps {
    dictionary?: Dictionary;
    handleSignIn: (prevState: any, payload: FormData) => Promise<any>;
}

export const SignInForm = ({ dictionary, handleSignIn }: SignInFormProps) => {
    const [formState, formAction, isPending] = useActionState(handleSignIn, {
        success: false,
        fields: {},
        errors: {},
    });
    const [isPendingTransition, startTransition] = useTransition();
    const formRef = useRef<HTMLFormElement>(null);

    const form = useForm<SignInSchema>({
        resolver: zodResolver(signInSchema),
        defaultValues: {
            email: formState?.fields?.email || '',
            password: formState?.fields?.password || '',
        },
    });

    const { handleSubmit, reset, formState: { isSubmitSuccessful } } = form;

    useEffect(() => {
        if (isSubmitSuccessful && formState.success) {
            reset();
        }
    }, [reset, isSubmitSuccessful, formState.success]);

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
                {formState?.errors?.error && (
                    <div className="p-3 rounded-md bg-red-50 border border-red-200">
                        <p className="text-sm text-red-600">{formState.errors.error[0]}</p>
                    </div>
                )}

                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-sm font-medium text-gray-900 dark:text-white">
                                {dictionary?.app?.auth?.signIn?.email || 'Correo Electrónico'}
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
                                {dictionary?.app?.auth?.signIn?.password || 'Contraseña'}
                            </FormLabel>
                            <FormControl>
                                <Input
                                    type="password"
                                    placeholder="••••••••"
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                    defaultValue={formState?.fields?.password}
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <SignInButton dictionary={dictionary} isPending={isFormPending} />
            </form>
        </Form>
    );
}; 