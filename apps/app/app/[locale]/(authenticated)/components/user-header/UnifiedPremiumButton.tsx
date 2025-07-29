'use client';

import { useState } from 'react';
import { Button } from '@repo/design-system/components/ui/button';
import Link from 'next/link';
import { env } from '@/env';

interface UnifiedPremiumButtonProps {
    userId: string;
    price: number;
    locale?: string;
    dictionary?: any;
}

export function UnifiedPremiumButton({
    userId,
    price,
    locale = 'en',
    dictionary
}: UnifiedPremiumButtonProps) {

    // Usar MercadoPago para español, Stripe para otros idiomas
    const useMercadoPago = locale === 'es';

    const stripeProLink = (process.env.NODE_ENV === 'development'
        ? env.NEXT_PUBLIC_STRIPE_PRO_LINK_TEST
        : env.NEXT_PUBLIC_STRIPE_PRO_LINK_LIVE);

    if (useMercadoPago) {
        return (
            <Button asChild className="bg-gradient-to-r from-blue-500 to-green-500 text-white font-bold hover:from-blue-600 hover:to-green-600">
                <Link href={env.NEXT_PUBLIC_WEB_BASE_URL + '/es/pricing'} rel="noopener noreferrer">
                    {dictionary?.app?.header?.upgradeToPro || "Pasar a Profesional"}
                </Link>
            </Button>
        );
    }

    return (
        <Link href={stripeProLink} target="_blank" rel="noopener noreferrer">
            <Button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold">
                {dictionary?.app?.header?.upgradeToPro || "Upgrade to Pro"}
            </Button>
        </Link>
    );
} 