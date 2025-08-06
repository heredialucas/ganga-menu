import { env } from '@/env';
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

  const stripeProLink = process.env.NODE_ENV === 'development'
    ? env.NEXT_PUBLIC_STRIPE_PRO_LINK_TEST
    : env.NEXT_PUBLIC_STRIPE_PRO_LINK_LIVE;

  return (
    <PricingClient 
      dictionary={dictionary} 
      locale={locale} 
      stripeProLink={stripeProLink}
    />
  );
};

export default Pricing;
