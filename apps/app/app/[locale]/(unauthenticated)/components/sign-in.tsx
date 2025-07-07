import { redirect } from 'next/navigation';
import { signIn } from '@repo/data-services/src/services/authService';
import { Dictionary } from '@repo/internationalization';
import { SignInForm } from './SignInForm';
import Link from 'next/link';

interface SignInProps {
    dictionary?: Dictionary;
    locale: string;
}

type FormState = {
    success: boolean;
    fields?: Record<string, string>;
    errors?: Record<string, string[]>;
};

async function handleSignIn(
    locale: string,
    prevState: FormState,
    payload: FormData
): Promise<FormState> {
    'use server';

    if (!(payload instanceof FormData)) {
        return {
            success: false,
            errors: { error: ["Invalid Form Data"] },
        };
    }

    const formData = Object.fromEntries(payload);
    const email = formData.email as string;
    const password = formData.password as string;

    if (!email || !password) {
        return {
            success: false,
            errors: { error: ["Por favor completa todos los campos"] },
        };
    }

    try {
        const result = await signIn({ email, password });

        if (result.success) {
            redirect(`/${locale}/account`); // Dejar que el middleware determine la redirección
        } else {
            return {
                success: false,
                errors: { error: [result.message || "Error al iniciar sesión"] },
                fields: { email, password },
            };
        }
    } catch (err) {
        // No capturar NEXT_REDIRECT como error
        if (err instanceof Error && err.message.includes('NEXT_REDIRECT')) {
            throw err; // Re-throw para que Next.js maneje el redirect
        }
        console.error('Sign in error:', err);
        return {
            success: false,
            errors: { error: ["Error al iniciar sesión"] },
            fields: { email, password },
        };
    }
}

export const SignIn = ({ dictionary, locale }: SignInProps) => {
    const handleSignInWithLocale = handleSignIn.bind(null, locale);
    return (
        <div className="grid gap-6">
            <SignInForm dictionary={dictionary} handleSignIn={handleSignInWithLocale} />

            {/* Navigation to Sign Up */}
            <div className="text-center">
                <Link
                    href="/sign-up"
                    className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                >
                    {dictionary?.app?.auth?.signIn?.goToSignUp || '¿No tienes cuenta? Crear cuenta'}
                </Link>
            </div>
        </div>
    );
}; 