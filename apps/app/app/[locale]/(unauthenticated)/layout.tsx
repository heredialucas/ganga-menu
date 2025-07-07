import type { ReactNode } from 'react';
import Image from 'next/image';
import logo from '@/app/public/logo.png';

type AuthLayoutProps = {
  readonly children: ReactNode;
};

const AuthLayout = async ({ children }: AuthLayoutProps) => {
  return (
    <div className="bg-gray-50 dark:bg-zinc-900 min-h-screen flex items-center justify-center">
      <div className="container mx-auto flex flex-col items-center justify-center p-4">
        {/* Logo Section */}
        <Image src={logo} alt="Repartito" width={228} height={228} className="mx-auto" />

        {/* Form Card */}
        <div className="w-full max-w-md bg-white dark:bg-zinc-950/50 p-8 rounded-xl shadow-lg border border-gray-200 dark:border-zinc-800">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
