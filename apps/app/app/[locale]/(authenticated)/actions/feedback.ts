'use server';

import { env } from '@/env';
import resend from '@repo/email';
import { ContactTemplate } from '@repo/email/templates/contact';
import { z } from 'zod';
import type { Dictionary } from '@repo/internationalization';

const feedbackSchema = z.object({
    name: z.string().min(1, 'El nombre es requerido'),
    email: z.string().email('Email inválido'),
    message: z.string().min(1, 'El mensaje es requerido'),
});

export async function sendFeedback(
    name: string,
    message: string,
    dictionary?: Dictionary
): Promise<{ success: boolean; error?: string }> {
    try {
        const validatedData = feedbackSchema.parse({ name, email: 'feedback@ganga-menu.com', message });

        if (!resend) {
            return { success: false, error: dictionary?.app?.feedback?.serviceUnavailable || 'Servicio de email no disponible' };
        }

        if (!env.RESEND_FROM) {
            return { success: false, error: dictionary?.app?.feedback?.configError || 'Configuración de email incompleta' };
        }

        await resend.emails.send({
            from: 'Ganga-Menú Feedback <onboarding@resend.dev>',
            to: 'heredialucasfac22@gmail.com',
            subject: `Nuevo feedback de ${validatedData.name}`,
            replyTo: 'heredialucasfac22@gmail.com',
            react: ContactTemplate({
                name: validatedData.name,
                email: 'heredialucasfac22@gmail.com',
                message: validatedData.message,
            }),
        });

        return { success: true };
    } catch (error) {
        if (error instanceof z.ZodError) {
            return { success: false, error: dictionary?.app?.feedback?.validationError || 'Datos inválidos' };
        }

        return { success: false, error: dictionary?.app?.feedback?.serverError || 'Error interno del servidor' };
    }
} 