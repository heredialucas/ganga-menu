import { NextResponse } from 'next/server';
import { mercadopagoService } from '../../../lib/mercadopago';

export async function POST(req: Request) {
    // Configurar CORS para permitir requests desde web-base
    if (req.method === 'OPTIONS') {
        return new Response(null, {
            status: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
            },
        });
    }

    try {
        // Obtener el email del body
        const body = await req.json();
        const userEmail = body.email;

        if (!userEmail) {
            return NextResponse.json({
                success: false,
                error: 'Email is required'
            }, {
                status: 400,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'POST, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type',
                },
            });
        }

        // Usar el servicio unificado
        const url = await mercadopagoService.createSubscription(userEmail);

        return NextResponse.json({
            success: true,
            url: url
        }, {
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
            },
        });

    } catch (error) {
        console.error('Error creating MercadoPago subscription:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to create subscription'
        }, {
            status: 500,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
            },
        });
    }
} 