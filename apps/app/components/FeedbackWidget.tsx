'use client';

import { useState } from 'react';
import { MessageSquare, X, Send, Loader2 } from 'lucide-react';
import { Button } from '@repo/design-system/components/ui/button';
import { Input } from '@repo/design-system/components/ui/input';
import { Textarea } from '@repo/design-system/components/ui/textarea';
import { Label } from '@repo/design-system/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@repo/design-system/components/ui/dialog';
import { toast } from 'sonner';
import type { Dictionary } from '@repo/internationalization';
import { sendFeedback } from '@/app/[locale]/(authenticated)/actions/feedback';

interface FeedbackWidgetProps {
    dictionary: Dictionary;
}

export function FeedbackWidget({ dictionary }: FeedbackWidgetProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        message: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const result = await sendFeedback(formData.name, formData.message);

            if (result.success) {
                toast.success(dictionary.app?.feedback?.success || '¡Gracias por tu feedback!');
                setFormData({ name: '', message: '' });
                setIsOpen(false);
            } else {
                throw new Error(result.error || dictionary.app?.feedback?.error || 'Error al enviar feedback');
            }
        } catch (error) {
            toast.error(dictionary.app?.feedback?.error || 'Error al enviar feedback. Inténtalo de nuevo.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <>
            {/* Botón inline */}
            <Button
                onClick={() => setIsOpen(true)}
                variant="outline"
                className="flex items-center gap-2"
            >
                <MessageSquare className="h-4 w-4" />
                <span className="hidden sm:inline">{dictionary.app?.feedback?.buttonDesktop || 'Dar feedback'}</span>
                <span className="sm:hidden">{dictionary.app?.feedback?.buttonMobile || 'Para dar feedback'}</span>
            </Button>

            {/* Modal de feedback */}
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <MessageSquare className="w-5 h-5 text-green-600" />
                            {dictionary.app?.feedback?.modalTitle || '¡Ayúdanos a crecer!'}
                        </DialogTitle>
                    </DialogHeader>

                    <p className="text-sm text-gray-600 mb-4">
                        {dictionary.app?.feedback?.modalDescription || 'Tu opinión es muy importante para nosotros. Contanos qué pensas y ayudanos a mejorar Ganga-Menú.'}
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">
                                {dictionary.app?.feedback?.name || 'Nombre'}
                            </Label>
                            <Input
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder={dictionary.app?.feedback?.namePlaceholder || 'Tu nombre'}
                                required
                            />
                        </div>



                        <div className="space-y-2">
                            <Label htmlFor="message">
                                {dictionary.app?.feedback?.message || 'Mensaje'}
                            </Label>
                            <Textarea
                                id="message"
                                name="message"
                                value={formData.message}
                                onChange={handleChange}
                                placeholder={dictionary.app?.feedback?.messagePlaceholder || 'Cuéntanos qué piensas...'}
                                rows={4}
                                required
                            />
                        </div>

                        <div className="flex gap-2 pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsOpen(false)}
                                className="flex-1"
                                disabled={isSubmitting}
                            >
                                <X className="w-4 h-4 mr-2" />
                                {dictionary.app?.feedback?.cancel || 'Cancelar'}
                            </Button>
                            <Button
                                type="submit"
                                className="flex-1"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                ) : (
                                    <Send className="w-4 h-4 mr-2" />
                                )}
                                {isSubmitting
                                    ? (dictionary.app?.feedback?.sending || 'Enviando...')
                                    : (dictionary.app?.feedback?.send || 'Enviar')
                                }
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
} 