import { createMetadata } from '@repo/seo/metadata';
import type { Metadata } from 'next';
import { SignIn } from '../../components/sign-in';
import { getDictionary } from '@repo/internationalization';

const title = 'Iniciar Sesión';
const description = 'Ingresa tus datos para acceder a tu cuenta.';

export const metadata: Metadata = createMetadata({ title, description });

const SignInPage = async ({ params }: { params: Promise<{ locale: string }> }) => {
  const { locale } = await params;
  const dictionary = await getDictionary(locale);

  return (
    <SignIn dictionary={dictionary} />
  );
};

export default SignInPage;
