import { createMetadata } from '@repo/seo/metadata';
import type { Metadata } from 'next';
import { SignUp } from '../../components/sign-up';
import { getDictionary } from '@repo/internationalization';

const title = 'Crear Cuenta';
const description = 'Ingresa tus datos para comenzar.';

export const metadata: Metadata = createMetadata({ title, description });

const SignUpPage = async ({ params }: { params: Promise<{ locale: string }> }) => {
  const { locale } = await params;
  const dictionary = await getDictionary(locale);

  return (
    <SignUp dictionary={dictionary} />
  );
};

export default SignUpPage;
