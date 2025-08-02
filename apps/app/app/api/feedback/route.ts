import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import resend from '@repo/email';
import { ContactTemplate } from '@repo/email/templates/contact';
import { env } from '@/env';

const feedbackSchema = z.object({
    name: z.string().min(1, 'El nombre es requerido'),
    email: z.string().email('Email inválido'),
    message: z.string().min(1, 'El mensaje es requerido'),
});

export async function POST(request: NextRequest) {
    console.log('🚀 Feedback endpoint llamado');

    try {
        const body = await request.json();
        console.log('📨 Datos recibidos:', body);

        const validatedData = feedbackSchema.parse(body);
        console.log('✅ Datos validados:', validatedData);

        console.log('🔧 Resend disponible:', !!resend);
        console.log('📧 RESEND_FROM configurado:', !!env.RESEND_FROM);
        console.log('📧 RESEND_FROM valor:', env.RESEND_FROM);

        if (!resend) {
            console.log('❌ Resend no disponible');
            return NextResponse.json(
                { error: 'Servicio de email no disponible' },
                { status: 500 }
            );
        }

        if (!env.RESEND_FROM) {
            console.log('❌ RESEND_FROM no configurado');
            return NextResponse.json(
                { error: 'Configuración de email incompleta' },
                { status: 500 }
            );
        }

        console.log('📤 Enviando email...');
        await resend.emails.send({
            from: 'Ganga-Menú Feedback <onboarding@resend.dev>',
            to: 'advenature.concepts@gmail.com',
            subject: `Nuevo feedback de ${validatedData.name}`,
            replyTo: validatedData.email,
            react: ContactTemplate({
                name: validatedData.name,
                email: validatedData.email,
                message: validatedData.message,
            }),
        });

        console.log('✅ Email enviado exitosamente');
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error enviando feedback:', error);

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Datos inválidos' },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
} 