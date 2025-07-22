// import { SignOutButton } from '@repo/auth/client';
import { signOut } from '@repo/data-services/src/services/authService';
import { Button } from '@repo/design-system/components/ui/button';
import { Leaf, ShieldAlert } from 'lucide-react';
import { redirect } from 'next/navigation';
import { getDictionary } from '@repo/internationalization';

type AccessDeniedProps = {
    params: Promise<{
        locale: string;
    }>;
};

export default async function AccessDenied({ params }: AccessDeniedProps) {
    const { locale } = await params;
    const dictionary = await getDictionary(locale);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-zinc-900 p-4">
            <div className="max-w-md w-full mx-auto bg-white dark:bg-zinc-800 rounded-lg shadow-md p-8 text-center">
                <div className="flex justify-center mb-6">
                    <div className="h-20 w-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                        <ShieldAlert className="h-10 w-10 text-red-500 dark:text-red-400" />
                    </div>
                </div>

                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    {dictionary.app?.accessDenied?.title || 'Access Denied'}
                </h1>

                <p className="text-gray-600 dark:text-gray-300 mb-6">
                    {dictionary.app?.accessDenied?.description || 'You don\'t have permission to access this area. This section is reserved for authorized users with the appropriate role.'}
                </p>

                <div className="bg-gray-50 dark:bg-zinc-700/30 p-4 rounded-md text-left mb-6">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        {dictionary.app?.accessDenied?.needAccess?.title || 'Need access?'}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300">
                        {dictionary.app?.accessDenied?.needAccess?.description || 'If you need access to this section, please contact an administrator to request the appropriate authorization.'}
                    </p>
                </div>

                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                        <Leaf className="h-5 w-5" />
                        <span className="font-medium">Ganga-Menú</span>
                    </div>
                    <form action={async () => {
                        'use server';
                        await signOut(locale);
                    }}>
                        <Button variant="outline">
                            {dictionary.app?.auth?.logout || 'Sign Out'}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
} 