import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { env } from '@/env';
import { updateUserRole, updateUserStripeCustomerId, findUserByStripeCustomerId } from '@repo/data-services';

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
        console.log(`✅ Webhook event constructed successfully: ${event.type}`);
    } catch (err: any) {
        console.error(`🔴 Webhook signature verification failed: ${err.message}`);
        return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
    }

    // Usar un switch para manejar diferentes tipos de eventos
    switch (event.type) {
        case 'checkout.session.completed': {
            const session = event.data.object as Stripe.Checkout.Session;
            const userId = session?.client_reference_id;
            const stripeCustomerId = session?.customer;

            console.log(`Processing checkout.session.completed for user: ${userId}`);
            console.log(`Stripe Customer ID: ${stripeCustomerId}`);

            if (!userId || !stripeCustomerId || typeof stripeCustomerId !== 'string') {
                console.error('🔴 Webhook Error: Missing client_reference_id or customer_id in session.');
                return NextResponse.json({ error: 'Webhook Error: Missing required session data.' }, { status: 400 });
            }

            try {
                // Actualizar el rol del usuario a 'admin' (Profesional)
                await updateUserRole(userId, 'admin');
                // Guardar el ID de cliente de Stripe en nuestro sistema
                await updateUserStripeCustomerId(userId, stripeCustomerId);
                console.log(`✅ User ${userId} upgraded to Pro. Stripe Customer ID ${stripeCustomerId} saved.`);
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
                    // Degradar al usuario de vuelta al rol 'user' (Gratuito)
                    await updateUserRole(user.id, 'user');
                    console.log(`✅ User ${user.id} downgraded to Free due to subscription cancellation/failure.`);
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