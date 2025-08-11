import { z } from 'zod';

// Función helper para validar contraseña fuerte
const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])[A-Za-z\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{8,}$/;

export const signInSchema = z.object({
    email: z.string().email({ message: 'Por favor, introduce un email válido.' }),
    password: z.string().min(1, { message: 'La contraseña es requerida.' }),
});

export const signUpSchema = z.object({
    name: z.string().min(2, { message: 'El nombre debe tener al menos 2 caracteres.' }),
    lastName: z.string().min(2, { message: 'El apellido debe tener al menos 2 caracteres.' }),
    email: z.string().email({ message: 'Por favor, introduce un email válido.' }),
    password: z.string()
        .min(8, { message: 'La contraseña debe tener al menos 8 caracteres.' })
        .regex(/[A-Z]/, { message: 'La contraseña debe contener al menos una letra mayúscula.' })
        .regex(/[a-z]/, { message: 'La contraseña debe contener al menos una letra minúscula.' })
        .regex(/\d/, { message: 'La contraseña debe contener al menos un número.' })
        .regex(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, {
            message: 'La contraseña debe contener al menos un carácter especial (!@#$%^&*()_+-=[]{};\':"\\|,.<>/?).'
        }),
    confirmPassword: z.string().min(1, { message: 'Confirma tu contraseña.' }),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
});

export type SignInSchema = z.infer<typeof signInSchema>;
export type SignUpSchema = z.infer<typeof signUpSchema>; 