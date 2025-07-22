'use client'

import React, { useActionState } from 'react';
import { Dictionary } from '@repo/internationalization';
import { verifyWaiterCodeAction } from '../actions';
import { Lock, Key, ChefHat } from 'lucide-react';

interface WaiterAuthProps {
    slug: string;
    restaurantName: string;
    dictionary: Dictionary;
    onAuthenticated: () => void;
}

export default function WaiterAuth({
    slug,
    restaurantName,
    dictionary,
    onAuthenticated
}: WaiterAuthProps) {
    async function handleWaiterAuth(prevState: any, formData: FormData) {
        const code = formData.get('code') as string;

        if (!code?.trim()) {
            return {
                success: false,
                error: dictionary.web?.waiter?.auth?.codeRequired || 'Código requerido'
            };
        }

        const result = await verifyWaiterCodeAction(slug, code.trim());

        if (result.success && result.isValid) {
            onAuthenticated();
            return { success: true };
        } else {
            return {
                success: false,
                error: dictionary.web?.waiter?.auth?.invalidCode || 'Código incorrecto'
            };
        }
    }

    const [state, formAction, pending] = useActionState(handleWaiterAuth, { success: false });

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
                        <ChefHat className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        {dictionary.web?.waiter?.auth?.title || 'Acceso de Mozos'}
                    </h1>
                    <p className="text-gray-600">
                        {restaurantName}
                    </p>
                </div>

                {/* Form */}
                <div className="bg-white rounded-xl shadow-lg p-8">
                    <form action={formAction} className="space-y-6">
                        <div>
                            <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
                                {dictionary.web?.waiter?.auth?.code || 'Código de Acceso'}
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Key className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="password"
                                    id="code"
                                    name="code"
                                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center text-lg font-mono"
                                    placeholder={dictionary.web?.waiter?.auth?.placeholder || 'Ingresa el código'}
                                    required
                                    autoComplete="off"
                                    disabled={pending}
                                />
                            </div>
                        </div>

                        {state?.error && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                <p className="text-red-600 text-sm text-center">{state.error}</p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={pending}
                            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                        >
                            {pending ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Verificando...
                                </>
                            ) : (
                                <>
                                    <Lock className="w-4 h-4" />
                                    {dictionary.web?.waiter?.auth?.enter || 'Ingresar'}
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Footer */}
                <div className="text-center mt-8">
                    <p className="text-sm text-gray-500">
                        {dictionary.web?.waiter?.order?.systemOrders || 'Sistema de Órdenes'} · {restaurantName}
                    </p>
                </div>
            </div>
        </div>
    );
} 