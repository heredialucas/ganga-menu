import { redirect } from 'next/navigation';
import { signUp } from '@repo/data-services/src/services/authService';
import { Dictionary } from '@repo/internationalization';
import { SignUpForm } from './SignUpForm';
import Link from 'next/link';

interface SignUpProps {
    dictionary?: Dictionary;
    error?: string;
}

type FormState = {
    success: boolean;
    fields?: Record<string, string>;
    errors?: Record<string, string[]>;
};

async function handleSignUp(
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
    const name = formData.name as string;
    const lastName = formData.lastName as string;
    const email = formData.email as string;
    const password = formData.password as string;
    const confirmPassword = formData.confirmPassword as string;

    if (!name || !lastName || !email || !password || !confirmPassword) {
        return {
            success: false,
            errors: { error: ["Por favor completa todos los campos"] },
            fields: { name, lastName, email, password, confirmPassword },
        };
    }

    if (password !== confirmPassword) {
        return {
            success: false,
            errors: { confirmPassword: ["Las contraseñas no coinciden"] },
            fields: { name, lastName, email, password, confirmPassword },
        };
    }

    try {
        const result = await signUp({
            name,
            lastName,
            email,
            password
        });

        if (result.success) {
            redirect('/sign-in'); // Dejar que el middleware determine la redirección
        } else {
            return {
                success: false,
                errors: { error: [result.message || "Error al crear la cuenta"] },
                fields: { name, lastName, email, password, confirmPassword },
            };
        }
    } catch (err) {
        // No capturar NEXT_REDIRECT como error
        if (err instanceof Error && err.message.includes('NEXT_REDIRECT')) {
            throw err; // Re-throw para que Next.js maneje el redirect
        }
        console.error('Sign up error:', err);
        return {
            success: false,
            errors: { error: ["Error al crear la cuenta"] },
            fields: { name, lastName, email, password, confirmPassword },
        };
    }
}

export const SignUp = ({ dictionary, error }: SignUpProps) => {
    return (
        <div className="grid gap-6">
            <SignUpForm dictionary={dictionary} handleSignUp={handleSignUp} error={error} />

            {/* Navigation to Sign In */}
            <div className="text-center">
                <Link
                    href="/sign-in"
                    className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                >
                    {dictionary?.app?.auth?.signUp?.goToSignIn || '¿Ya tienes cuenta? Inicia sesión'}
                </Link>
            </div>
        </div>
    );
}; 