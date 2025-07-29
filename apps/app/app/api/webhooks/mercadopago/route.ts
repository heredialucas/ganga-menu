import { NextResponse } from 'next/server';
import { MercadoPagoConfig, PreApproval } from 'mercadopago';
import { database } from '@repo/database';
import { upgradeUserToPremium, downgradeUserFromPremium } from '@repo/data-services';

export async function POST(request: Request) {
    try {
        const body: { data: { id: string }; type: string } = await request.json();

        const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
        if (!accessToken) {
            console.error('MERCADOPAGO_ACCESS_TOKEN no está configurado');
            return NextResponse.json({ error: 'Token not configured' }, { status: 500 });
        }

        const mercadopago = new MercadoPagoConfig({
            accessToken,
        });

        if (body.type === "subscription_preapproval") {
            const preapproval = await new PreApproval(mercadopago).get({ id: body.data.id });

            // Buscar la suscripción en nuestra base de datos
            const subscription = await database.mercadoPagoSubscription.findUnique({
                where: { preapprovalId: body.data.id },
                include: {
                    restaurantConfig: {
                        include: {
                            owner: true,
                            createdBy: true
                        }
                    }
                }
            });

            // Si no se encuentra por preapprovalId, buscar por email (caso de re-suscripción)
            let subscriptionToUpdate = subscription;
            if (!subscription) {
                const preapprovalEmail = preapproval.payer_email;
                if (preapprovalEmail) {
                    const subscriptionByEmail = await database.mercadoPagoSubscription.findFirst({
                        where: {
                            email: preapprovalEmail,
                            preapprovalId: body.data.id
                        },
                        include: {
                            restaurantConfig: {
                                include: {
                                    owner: true,
                                    createdBy: true
                                }
                            }
                        }
                    });

                    if (subscriptionByEmail) {
                        subscriptionToUpdate = subscriptionByEmail;
                    }
                }
            }

            if (!subscriptionToUpdate) {
                return new Response(null, { status: 200 });
            }

            // Actualizar el status de la suscripción
            await database.mercadoPagoSubscription.update({
                where: { id: subscriptionToUpdate.id },
                data: { status: preapproval.status }
            });

            // Procesar según el status
            if (preapproval.status === "authorized") {
                // Buscar usuarios por email (caso más general)
                const usersToUpdate = await database.user.findMany({
                    where: { email: subscriptionToUpdate.email }
                });

                // Actualizar a todos los usuarios con ese email
                for (const user of usersToUpdate) {
                    try {
                        await upgradeUserToPremium(user.id);
                    } catch (error) {
                        console.error(`Error actualizando usuario ${user.email}:`, error);
                    }
                }

                // También buscar por restaurante si existe
                if (subscriptionToUpdate.restaurantConfigId) {
                    const restaurantUsers = await database.user.findMany({
                        where: {
                            OR: [
                                { id: subscriptionToUpdate.restaurantConfig!.ownerId }, // Dueño
                                { restaurantOwnerId: subscriptionToUpdate.restaurantConfig!.ownerId } // Subordinados
                            ]
                        }
                    });

                    // Actualizar a todos los usuarios del restaurante
                    for (const user of restaurantUsers) {
                        try {
                            await upgradeUserToPremium(user.id);
                        } catch (error) {
                            console.error(`Error actualizando usuario ${user.email}:`, error);
                        }
                    }
                }
            }

            if (preapproval.status === "cancelled") {
                // Buscar usuarios por email (caso más general)
                const usersToDowngrade = await database.user.findMany({
                    where: { email: subscriptionToUpdate.email }
                });

                // Downgradear a todos los usuarios con ese email
                for (const user of usersToDowngrade) {
                    try {
                        await downgradeUserFromPremium(user.id);
                    } catch (error) {
                        console.error(`Error downgradeando usuario ${user.email}:`, error);
                    }
                }

                // También buscar por restaurante si existe
                if (subscriptionToUpdate.restaurantConfigId) {
                    const restaurantUsers = await database.user.findMany({
                        where: {
                            OR: [
                                { id: subscriptionToUpdate.restaurantConfig!.ownerId },
                                { restaurantOwnerId: subscriptionToUpdate.restaurantConfig!.ownerId }
                            ]
                        }
                    });

                    // Downgradear a todos los usuarios del restaurante
                    for (const user of restaurantUsers) {
                        try {
                            await downgradeUserFromPremium(user.id);
                        } catch (error) {
                            console.error(`Error downgradeando usuario ${user.email}:`, error);
                        }
                    }
                }
            }
        }

        return new Response(null, { status: 200 });

    } catch (error) {
        console.error('Webhook Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
} 