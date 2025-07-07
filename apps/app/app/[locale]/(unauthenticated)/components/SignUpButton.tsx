'use client';

import { Dictionary } from '@repo/internationalization';

interface SignUpButtonProps {
    dictionary?: Dictionary;
    isPending?: boolean;
}

export function SignUpButton({ dictionary, isPending = false }: SignUpButtonProps) {
    return (
        <button
            type="submit"
            disabled={isPending}
            className={`w-full py-2 px-4 rounded-md transition-colors ${isPending
                ? 'bg-gray-400 cursor-not-allowed opacity-60'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
        >
            {isPending ? (
                <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    {dictionary?.app?.auth?.signUp?.creating || 'Creando cuenta...'}
                </div>
            ) : (
                dictionary?.app?.auth?.signUp?.button || 'Crear Cuenta'
            )}
        </button>
    );
} 