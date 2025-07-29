import { MercadoPagoConfig, PreApproval } from 'mercadopago';
import { database } from '@repo/database';
import { env } from '@/env';

export const mercadopago = new MercadoPagoConfig({
    accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
});

export const mercadopagoService = {
    async createSubscription(email: string) {
        try {
            // Verificar si ya existe una suscripción para este email
            const existingSubscription = await database.mercadoPagoSubscription.findFirst({
                where: { email },
                orderBy: { createdAt: 'desc' }
            });

            // Buscar el usuario por email
            const user = await database.user.findUnique({
                where: { email },
                include: {
                    ownedRestaurants: true, // Restaurantes que posee
                    restaurantUsers: {
                        include: {
                            ownedRestaurants: true // Restaurantes de los que es subordinado
                        }
                    }
                }
            });

            let restaurantConfigId: string | null = null;

            if (user) {
                // Usuario existe - buscar su restaurante
                let restaurantConfig = user.ownedRestaurants[0]; // Si es dueño
                if (!restaurantConfig && user.restaurantUsers.length > 0) {
                    restaurantConfig = user.restaurantUsers[0].ownedRestaurants[0]; // Si es subordinado
                }

                if (restaurantConfig) {
                    restaurantConfigId = restaurantConfig.id;
                }
            }

            const subscription = await new PreApproval(mercadopago).create({
                body: {
                    back_url: `${env.NEXT_PUBLIC_APP_URL}/es`,
                    reason: "Suscripción Premium Ganga-Menú",
                    auto_recurring: {
                        frequency: 1,
                        frequency_type: "months",
                        transaction_amount: 100,
                        currency_id: "ARS",
                    },
                    payer_email: email,
                    status: "pending",
                },
            });

            // Guardar la nueva suscripción (permitimos múltiples suscripciones por email)
            await database.mercadoPagoSubscription.create({
                data: {
                    email: email,
                    preapprovalId: subscription.id!,
                    status: 'pending',
                    restaurantConfigId: restaurantConfigId,
                    createdAt: new Date(),
                }
            });



            return subscription.init_point!;
        } catch (error) {
            console.error('Error creating MercadoPago subscription:', error);
            throw error;
        }
    }
}; 