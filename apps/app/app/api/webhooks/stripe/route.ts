import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { env } from '@/env';
import { updateUserStripeCustomerId, findUserByStripeCustomerId, upgradeUserToPremium, downgradeUserFromPremium } from '@repo/data-services';
import { database } from '@repo/database';

const stripe = new Stripe(env.STRIPE_API_KEY);

export async function POST(req: Request) {
    console.log('--- Stripe Webhook Received ---');

    const body = await req.text();
    const signature = req.headers.get('Stripe-Signature') as string;
    console.log('Webhook body and signature obtained.');

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            env.STRIPE_WEBHOOK_SECRET,
        );

    } catch (err: any) {
        console.error(`🔴 Webhook signature verification failed: ${err.message}`);
        return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
    }

    // Usar un switch para manejar diferentes tipos de eventos
    switch (event.type) {
        case 'checkout.session.completed': {
            const session = event.data.object as Stripe.Checkout.Session;
            const stripeCustomerId = session?.customer;
            console.log('session', session);
            const customerEmail = session?.customer_details?.email;
            const customerName = session?.customer_details?.name;

            console.log(`Processing checkout.session.completed`);
            console.log(`Stripe Customer ID: ${stripeCustomerId}`);
            console.log(`Customer Email: ${customerEmail}`);
            console.log(`Customer Name: ${customerName}`);

            if (!customerEmail || !stripeCustomerId || typeof stripeCustomerId !== 'string') {
                console.error('🔴 Webhook Error: Missing customer email or customer_id in session.');
                return NextResponse.json({ error: 'Webhook Error: Missing required session data.' }, { status: 400 });
            }

            try {
                // Buscar usuario por email en nuestra base de datos
                const user = await database.user.findUnique({
                    where: { email: customerEmail }
                });

                if (!user) {
                    console.error(`🔴 User not found with email: ${customerEmail}`);
                    return NextResponse.json({ error: 'User not found with provided email.' }, { status: 404 });
                }

                // Usar la función existente upgradeUserToPremium que ya maneja permisos
                await upgradeUserToPremium(user.id);

                // Guardar el ID de cliente de Stripe en nuestro sistema
                await updateUserStripeCustomerId(user.id, stripeCustomerId);

            } catch (error) {
                console.error(`🔴 Database error during user upgrade:`, error);
                return NextResponse.json({ error: 'Database error: Could not upgrade user.' }, { status: 500 });
            }
            break;
        }

        case 'customer.subscription.deleted':
        case 'invoice.payment_failed': {
            const subscription = event.data.object as Stripe.Subscription;
            const stripeCustomerId = subscription.customer;

            console.log(`Processing subscription cancellation/failure for Stripe Customer ID: ${stripeCustomerId}`);

            if (typeof stripeCustomerId !== 'string') {
                console.error('🔴 Webhook Error: Invalid customer_id in subscription event.');
                return NextResponse.json({ error: 'Webhook Error: Invalid customer_id.' }, { status: 400 });
            }

            try {
                const user = await findUserByStripeCustomerId(stripeCustomerId);
                if (user) {
                    // Usar la nueva función que quita permisos premium y asigna básicos
                    await downgradeUserFromPremium(user.id);
                } else {
                    console.warn(`⚠️ No user found for Stripe Customer ID: ${stripeCustomerId}`);
                }
            } catch (error) {
                console.error(`🔴 Database error during user downgrade:`, error);
                return NextResponse.json({ error: 'Database error: Could not downgrade user.' }, { status: 500 });
            }
            break;
        }

        default:
            console.log(`- Unhandled event type: ${event.type}`);
    }

    console.log('--- Stripe Webhook Handled Successfully ---');
    return NextResponse.json({ received: true }, { status: 200 });
} 