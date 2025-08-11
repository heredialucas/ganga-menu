'use client';

import { Button } from '@repo/design-system/components/ui/button';
import { Check, MoveRight, PhoneCall, Crown, Zap } from 'lucide-react';
import Link from 'next/link';
import { MercadoPagoEmailForm } from './MercadoPagoEmailForm';
import { useLocation } from '../hooks/useLocation';
import type { Dictionary } from '@repo/internationalization';
import { getAppUrl } from '@/lib/utils';


interface PricingClientProps {
    dictionary: Dictionary;
    locale: string;
    stripeProLink: string; // Mantener por compatibilidad, pero usar el dinámico
}

export const PricingClient = ({ dictionary, locale, stripeProLink }: PricingClientProps) => {
    const { locationData, isLoading } = useLocation();

    // Función para obtener el símbolo de moneda según el locale como fallback
    const getCurrencySymbol = (locale: string) => {
        switch (locale) {
            case 'es':
                return 'AR$';
            case 'en':
                return 'USD$';
            case 'de':
                return '€';
            default:
                return '$';
        }
    };

    // Usar la ubicación detectada o fallback al locale
    const currencySymbol = isLoading ? getCurrencySymbol(locale) : locationData.symbol;
    const price = isLoading ? '39.99' : locationData.price;
    const paymentLink = isLoading ? stripeProLink : locationData.paymentLink;

    if (isLoading) {
        return (
            <div className="w-full py-12 sm:py-16 lg:py-20 xl:py-32 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
                <div className="w-full sm:container sm:mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col items-center justify-center gap-6 sm:gap-8 text-center">
                        <div className="animate-pulse">
                            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mx-auto"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full py-12 sm:py-16 lg:py-20 xl:py-32 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
            <div className="w-full sm:container sm:mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col items-center justify-center gap-6 sm:gap-8 text-center">
                    <div className="flex flex-col gap-3 sm:gap-4">
                        <h2 className="max-w-4xl text-center font-black text-2xl sm:text-3xl md:text-4xl lg:text-5xl tracking-tighter var(--font-nunito) bg-gradient-to-r from-[#0d4b3d] to-[#7dd3c8] inline-block text-transparent bg-clip-text">
                            {dictionary.web.pricing.title}
                        </h2>
                        <p className="max-w-2xl text-center text-sm sm:text-base lg:text-lg text-muted-foreground leading-relaxed tracking-tight var(--font-nunito) mx-auto px-4">
                            {dictionary.web.pricing.description}
                        </p>
                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mt-4 max-w-2xl mx-auto">
                            <p className="text-sm sm:text-base text-blue-800 dark:text-blue-200 var(--font-nunito) font-medium">
                                🚀 <strong>{dictionary.web.pricing.beta.title}</strong> {dictionary.web.pricing.beta.description}
                            </p>
                        </div>
                    </div>

                    <div className="grid w-full grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 pt-6 sm:pt-10 max-w-5xl mx-auto">
                        {/* Plan Gratis */}
                        <div className="flex flex-col justify-between bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg border-2 border-gray-200 dark:border-gray-700 overflow-hidden transform transition-all hover:scale-105 hover:shadow-xl">
                            <div className="p-6 sm:p-8">
                                <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                                        <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 dark:text-green-400" />
                                    </div>
                                    <p className="text-xl sm:text-2xl font-black var(--font-nunito) text-[#0d4b3d] dark:text-white">{dictionary.web.pricing.plans[0].name}</p>
                                </div>

                                <p className="text-muted-foreground text-xs sm:text-sm mb-4 sm:mb-6 var(--font-nunito) leading-relaxed">
                                    {dictionary.web.pricing.plans[0].description}
                                </p>

                                <div className="mb-6 sm:mb-8 flex items-baseline gap-2">
                                    <span className="text-3xl sm:text-4xl lg:text-5xl font-black var(--font-nunito) bg-gradient-to-r from-green-600 to-green-400 inline-block text-transparent bg-clip-text">
                                        {currencySymbol}0
                                    </span>
                                    <div className="flex flex-col">
                                        <span className="text-xs sm:text-sm font-bold text-green-600 dark:text-green-400 var(--font-nunito)">{dictionary.web.pricing.free}</span>
                                        <span className="text-xs text-muted-foreground var(--font-nunito)">{dictionary.web.pricing.forever}</span>
                                    </div>
                                </div>

                                <div className="space-y-3 sm:space-y-4">
                                    {dictionary.web.pricing.plans[0].features.map((feature: string, index: number) => (
                                        <div key={index} className="flex items-start gap-2 sm:gap-3">
                                            <Check className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                                            <span className="var(--font-nunito) text-xs sm:text-sm">{feature}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="p-6 sm:p-8 pt-0">
                                <Button variant="outline" className="w-full gap-2 sm:gap-4 var(--font-nunito) font-bold border-green-600 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 text-sm sm:text-base" asChild>
                                    <Link href={`${getAppUrl()}/${locale}/sign-in`}>
                                        {dictionary.web.pricing.tryIt} <MoveRight className="h-3 w-3 sm:h-4 sm:w-4" />
                                    </Link>
                                </Button>
                            </div>
                        </div>

                        {/* Plan Premium - Featured */}
                        <div className="flex flex-col justify-between bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-2xl border-2 border-[#0d4b3d] overflow-hidden transform transition-all hover:scale-105 relative">
                            <div className="absolute top-0 right-0 bg-gradient-to-r from-[#0d4b3d] to-[#7dd3c8] text-white px-4 sm:px-6 py-1 sm:py-2 rounded-bl-xl sm:rounded-bl-2xl var(--font-nunito) font-bold text-xs sm:text-sm flex items-center gap-1 sm:gap-2">
                                <Crown className="w-3 h-3 sm:w-4 sm:h-4" />
                                {dictionary.web.pricing.beta.badge}
                            </div>

                            <div className="p-6 sm:p-8">
                                <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#0d4b3d]/10 dark:bg-[#0d4b3d]/20 rounded-full flex items-center justify-center">
                                        <Crown className="w-5 h-5 sm:w-6 sm:h-6 text-[#0d4b3d] dark:text-white" />
                                    </div>
                                    <p className="text-xl sm:text-2xl font-black var(--font-nunito) text-[#0d4b3d] dark:text-white">{dictionary.web.pricing.plans[1].name}</p>
                                </div>

                                <p className="text-muted-foreground text-xs sm:text-sm mb-4 sm:mb-6 var(--font-nunito) leading-relaxed">
                                    {dictionary.web.pricing.plans[1].description}
                                </p>

                                <div className="mb-6 sm:mb-8 flex items-baseline gap-2">
                                    <span className="text-3xl sm:text-4xl lg:text-5xl font-black var(--font-nunito) bg-gradient-to-r from-[#0d4b3d] to-[#7dd3c8] inline-block text-transparent bg-clip-text">
                                        {currencySymbol}0
                                    </span>
                                    <span className="text-muted-foreground text-xs sm:text-sm var(--font-nunito)">/ Beta</span>
                                </div>

                                <div className="space-y-3 sm:space-y-4">
                                    {dictionary.web.pricing.plans[1].features.map((feature: string, index: number) => (
                                        <div key={index} className="flex items-start gap-2 sm:gap-3">
                                            <Check className="h-4 w-4 sm:h-5 sm:w-5 text-[#7dd3c8] flex-shrink-0 mt-0.5" />
                                            <span className="var(--font-nunito) text-xs sm:text-sm">{feature}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="p-6 sm:p-8 pt-0">
                                <Button className="w-full gap-2 sm:gap-4 bg-gradient-to-r from-[#0d4b3d] to-[#7dd3c8] hover:from-[#0d4b3d]/90 hover:to-[#7dd3c8]/90 text-white var(--font-nunito) font-black text-sm sm:text-base" asChild>
                                    <Link href={`/${locale}/contact`}>
                                        {dictionary.web.pricing.beta.requestAccess} <MoveRight className="h-3 w-3 sm:h-4 sm:w-4" />
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Trust indicators */}
                    <div className="mt-12 sm:mt-16 text-center">
                        <p className="text-xs sm:text-sm text-muted-foreground var(--font-nunito) mb-3 sm:mb-4">
                            {dictionary.web.pricing.trust?.description || "Trusted by thousands of restaurants worldwide"}
                        </p>
                        <div className="flex justify-center items-center gap-2">
                            <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className="w-4 h-4 sm:w-5 sm:h-5 bg-yellow-400 rounded-full flex items-center justify-center">
                                        <span className="text-xs text-yellow-900">★</span>
                                    </div>
                                ))}
                            </div>
                            <span className="text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-300">{dictionary.web.pricing.trust?.rating || "4.9/5"}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}; 