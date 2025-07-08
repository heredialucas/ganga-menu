import { getCurrentUser } from '@repo/data-services/src/services/authService';
import { UserHeaderClient } from "./userHeaderClient";
import { getDictionary } from '@repo/internationalization';
import logo from '@/app/public/logo.png'
import Image from 'next/image';

type User = {
    id: string;
    name: string;
    email: string;
    role: string;
};

export async function UserHeaderServer({ locale }: { locale: string }) {
    const user = await getCurrentUser();
    const dictionary = await getDictionary(locale);
    return <UserHeaderClient user={user as User} dictionary={dictionary} logo={<Image src={logo} alt="Logo" width={32} height={32} />} />;
}