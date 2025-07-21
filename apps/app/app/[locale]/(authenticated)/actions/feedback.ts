'use server';

import { env } from '@/env';
import resend from '@repo/email';
import { ContactTemplate } from '@repo/email/templates/contact';
import { z } from 'zod';

const feedbackSchema = z.object({
    name: z.string().min(1, 'El nombre es requerido'),
    email: z.string().email('Email inválido'),
    message: z.string().min(1, 'El mensaje es requerido'),
});

export async function sendFeedback(
    name: string,
    message: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const validatedData = feedbackSchema.parse({ name, email: 'feedback@ganga-menu.com', message });

        if (!resend) {
            return { success: false, error: 'Servicio de email no disponible' };
        }

        if (!env.RESEND_FROM) {
            return { success: false, error: 'Configuración de email incompleta' };
        }

        await resend.emails.send({
            from: 'Ganga-Menú Feedback <onboarding@resend.dev>',
            to: 'heredialucasfac22@gmail.com',
            subject: `Nuevo feedback de ${validatedData.name}`,
            replyTo: 'feedback@ganga-menu.com',
            react: ContactTemplate({
                name: validatedData.name,
                email: 'feedback@ganga-menu.com',
                message: validatedData.message,
            }),
        });

        return { success: true };
    } catch (error) {
        if (error instanceof z.ZodError) {
            return { success: false, error: 'Datos inválidos' };
        }

        return { success: false, error: 'Error interno del servidor' };
    }
} 