'use client';

import { useState } from 'react';
import { Button } from '@repo/design-system/components/ui/button';
import { Input } from '@repo/design-system/components/ui/input';
import { Label } from '@repo/design-system/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@repo/design-system/components/ui/dialog';
import { MoveRight } from 'lucide-react';
import type { Dictionary } from '@repo/internationalization';
import { getAppUrl } from '@/lib/utils';


interface MercadoPagoEmailFormProps {
    dictionary: Dictionary;
    className?: string;
}

export function MercadoPagoEmailForm({
    dictionary,
    className = ""
}: MercadoPagoEmailFormProps) {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        console.log('🔍 Formulario enviado con email:', email);

        if (!email || !email.includes('@')) {
            alert('Por favor ingresa un email válido');
            return;
        }

        setIsLoading(true);

        try {
            console.log('🔍 Llamando al endpoint:', getAppUrl() + '/api/mercadopago');
            console.log('🔍 Email enviado:', email);

            const response = await fetch(getAppUrl() + '/api/mercadopago', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            console.log('🔍 Response status:', response.status);
            const data = await response.json();
            console.log('🔍 Response data:', data);

            if (data.url) {
                console.log('🔍 Redirigiendo a:', data.url);
                window.location.href = data.url;
            } else {
                console.error('🔍 Error en response:', data);
                alert('Error al crear el enlace de pago. Inténtalo de nuevo.');
            }
        } catch (error) {
            console.error('🔍 Error en fetch:', error);
            alert('Error al procesar el pago. Inténtalo de nuevo.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button
                    onClick={() => {
                        console.log('🔍 Botón clickeado, abriendo modal...');
                        setIsOpen(true);
                    }}
                    className={`bg-gradient-to-r from-[#0d4b3d] to-[#7dd3c8] hover:from-[#0d4b3d]/90 hover:to-[#7dd3c8]/90 text-white font-black ${className}`}
                >
                    {dictionary?.web?.pricing?.buyNow || "Comprar Ahora"} <MoveRight className="h-3 w-3 sm:h-4 sm:w-4 ml-2" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Completa tu información</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="tu@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-gradient-to-r from-[#0d4b3d] to-[#7dd3c8] hover:from-[#0d4b3d]/90 hover:to-[#7dd3c8]/90 text-white font-black"
                    >
                        {isLoading ? 'Procesando...' : 'Continuar con MercadoPago'}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
} 