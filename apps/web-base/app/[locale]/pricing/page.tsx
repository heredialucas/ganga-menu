import { getDictionary } from '@repo/internationalization';
import { createMetadata } from '@repo/seo/metadata';
import type { Metadata } from 'next';
import { PricingClient } from '../../../components/PricingClient';

type PricingProps = {
  params: Promise<{
    locale: string;
  }>;
};

export const generateMetadata = async ({
  params,
}: PricingProps): Promise<Metadata> => {
  const { locale } = await params;
  const dictionary = await getDictionary(locale);

  return createMetadata({
    title: `${dictionary.web.pricing.title} - Ganga-Menú`,
    description: `${dictionary.web.pricing.description} Choose the perfect plan for your restaurant.`
  });
};

const Pricing = async ({ params }: PricingProps) => {
  const { locale } = await params;
  const dictionary = await getDictionary(locale);

  return (
    <PricingClient
      dictionary={dictionary}
      locale={locale}
      stripeProLink="" // Ya no se usa, pero mantener por compatibilidad
    />
  );
};

export default Pricing;
