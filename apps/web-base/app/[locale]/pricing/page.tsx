import { env } from '@/env';
import { Button } from '@repo/design-system/components/ui/button';
import { Check, MoveRight, PhoneCall, Crown, Zap } from 'lucide-react';
import Link from 'next/link';
import { getDictionary } from '@repo/internationalization';
import { createMetadata } from '@repo/seo/metadata';
import type { Metadata } from 'next';

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
    title: dictionary.web.pricing.title,
    description: dictionary.web.pricing.description
  });
};

const Pricing = async ({ params }: PricingProps) => {
  const { locale } = await params;
  const dictionary = await getDictionary(locale);

  return (
    <div className="w-full py-20 lg:py-40 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto">
        <div className="flex flex-col items-center justify-center gap-8 text-center">
          <div className="flex flex-col gap-4">
            <h2 className="max-w-4xl text-center font-black text-3xl tracking-tighter md:text-5xl var(--font-nunito) bg-gradient-to-r from-[#0d4b3d] to-[#7dd3c8] inline-block text-transparent bg-clip-text">
              {dictionary.web.pricing.title}
            </h2>
            <p className="max-w-2xl text-center text-lg text-muted-foreground leading-relaxed tracking-tight var(--font-nunito) mx-auto">
              {dictionary.web.pricing.description}
            </p>
          </div>

          <div className="grid w-full grid-cols-1 md:grid-cols-3 gap-8 pt-10 max-w-7xl">
            {/* Plan Gratis */}
            <div className="flex flex-col justify-between bg-white rounded-2xl shadow-lg border-2 border-gray-200 overflow-hidden transform transition-all hover:scale-105 hover:shadow-xl">
              <div className="p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Zap className="w-6 h-6 text-green-600" />
                  </div>
                  <p className="text-2xl font-black var(--font-nunito) text-[#0d4b3d]">{dictionary.web.pricing.plans[0].name}</p>
                </div>

                <p className="text-muted-foreground text-sm mb-6 var(--font-nunito) leading-relaxed">
                  {dictionary.web.pricing.plans[0].description}
                </p>

                <div className="mb-8 flex items-baseline gap-2">
                  <span className="text-5xl font-black var(--font-nunito) bg-gradient-to-r from-green-600 to-green-400 inline-block text-transparent bg-clip-text">
                    ${dictionary.web.pricing.plans[0].price}
                  </span>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-green-600 var(--font-nunito)">{(dictionary.web.pricing as any)?.free}</span>
                    <span className="text-xs text-muted-foreground var(--font-nunito)">{(dictionary.web.pricing as any)?.forever}</span>
                  </div>
                </div>

                <div className="space-y-4">
                  {(dictionary.web.pricing.plans[0] as any)?.features?.map((feature: string, index: number) => (
                    <div key={index} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="var(--font-nunito) text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-8 pt-0">
                <Button variant="outline" className="w-full gap-4 var(--font-nunito) font-bold border-green-600 text-green-600 hover:bg-green-50" asChild>
                  {env.NEXT_PUBLIC_APP_URL && (
                    <Link href={`${env.NEXT_PUBLIC_APP_URL}/${locale}/sign-in`}>
                      {dictionary.web.pricing.tryIt} <MoveRight className="h-4 w-4" />
                    </Link>
                  )}
                </Button>
              </div>
            </div>

            {/* Plan Profesional - Featured */}
            <div className="flex flex-col justify-between bg-white rounded-2xl shadow-2xl border-2 border-[#0d4b3d] overflow-hidden transform transition-all hover:scale-105 relative">
              <div className="absolute top-0 right-0 bg-gradient-to-r from-[#0d4b3d] to-[#7dd3c8] text-white px-6 py-2 rounded-bl-2xl var(--font-nunito) font-bold text-sm flex items-center gap-2">
                <Crown className="w-4 h-4" />
                {dictionary.web.pricing.popular}
              </div>

              <div className="p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-[#0d4b3d]/10 rounded-full flex items-center justify-center">
                    <Crown className="w-6 h-6 text-[#0d4b3d]" />
                  </div>
                  <p className="text-2xl font-black var(--font-nunito) text-[#0d4b3d]">{dictionary.web.pricing.plans[1].name}</p>
                </div>

                <p className="text-muted-foreground text-sm mb-6 var(--font-nunito) leading-relaxed">
                  {dictionary.web.pricing.plans[1].description}
                </p>

                <div className="mb-8 flex items-baseline gap-2">
                  <span className="text-5xl font-black var(--font-nunito) bg-gradient-to-r from-[#0d4b3d] to-[#7dd3c8] inline-block text-transparent bg-clip-text">
                    ${dictionary.web.pricing.plans[1].price}
                  </span>
                  <span className="text-muted-foreground text-sm var(--font-nunito)">/ {dictionary.web.pricing.monthly}</span>
                </div>

                <div className="space-y-4">
                  {(dictionary.web.pricing.plans[1] as any)?.features?.map((feature: string, index: number) => (
                    <div key={index} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-[#7dd3c8] flex-shrink-0 mt-0.5" />
                      <span className="var(--font-nunito) text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-8 pt-0">
                <Button className="w-full gap-4 bg-gradient-to-r from-[#0d4b3d] to-[#7dd3c8] hover:from-[#0d4b3d]/90 hover:to-[#7dd3c8]/90 text-white var(--font-nunito) font-black" asChild>
                  {env.NEXT_PUBLIC_APP_URL && (
                    <Link href={`${env.NEXT_PUBLIC_APP_URL}/${locale}/sign-in`}>
                      {dictionary.web.pricing.tryIt} <MoveRight className="h-4 w-4" />
                    </Link>
                  )}
                </Button>
              </div>
            </div>

            {/* Plan Empresarial */}
            <div className="flex flex-col justify-between bg-white rounded-2xl shadow-lg border-2 border-gray-200 overflow-hidden transform transition-all hover:scale-105 hover:shadow-xl">
              <div className="p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <Crown className="w-6 h-6 text-purple-600" />
                  </div>
                  <p className="text-2xl font-black var(--font-nunito) text-[#0d4b3d]">{dictionary.web.pricing.plans[2].name}</p>
                </div>

                <p className="text-muted-foreground text-sm mb-6 var(--font-nunito) leading-relaxed">
                  {dictionary.web.pricing.plans[2].description}
                </p>

                <div className="mb-8 flex items-baseline gap-2">
                  <span className="text-5xl font-black var(--font-nunito) bg-gradient-to-r from-purple-600 to-purple-400 inline-block text-transparent bg-clip-text">
                    ${dictionary.web.pricing.plans[2].price}
                  </span>
                  <span className="text-muted-foreground text-sm var(--font-nunito)">/ {dictionary.web.pricing.monthly}</span>
                </div>

                <div className="space-y-4">
                  {(dictionary.web.pricing.plans[2] as any)?.features?.map((feature: string, index: number) => (
                    <div key={index} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                      <span className="var(--font-nunito) text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-8 pt-0">
                <Button variant="outline" className="w-full gap-4 var(--font-nunito) font-bold border-purple-600 text-purple-600 hover:bg-purple-50" asChild>
                  <Link href={`/${locale}/contact`}>
                    {dictionary.web.pricing.contactUs} <PhoneCall className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          {/* Trust indicators */}
          <div className="mt-16 text-center">
            <p className="text-sm text-muted-foreground var(--font-nunito) mb-4">
              Más de 500 restaurantes ya están transformando su operación con Ganga-Menú
            </p>
            <div className="flex justify-center items-center gap-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center">
                    <span className="text-xs text-yellow-900">★</span>
                  </div>
                ))}
              </div>
              <span className="text-sm font-bold text-gray-700">4.9/5 • Sin compromiso • Cancela cuando quieras</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
