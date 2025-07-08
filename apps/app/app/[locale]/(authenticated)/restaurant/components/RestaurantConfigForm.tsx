'use client';

import { useState, useEffect, useRef, useTransition } from 'react';
import { useFormStatus } from 'react-dom';
import { toast } from 'sonner';
import { saveRestaurantConfig } from '../actions';
import type { RestaurantConfigData } from '@repo/data-services/src/services/restaurantConfigService';
import type { Dictionary } from '@repo/internationalization';
import { Input } from '@repo/design-system/components/ui/input';
import { Button } from '@repo/design-system/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/design-system/components/ui/card';
import { Label } from '@repo/design-system/components/ui/label';
import { Textarea } from '@repo/design-system/components/ui/textarea';
import { ImageUpload } from './ImageUploadClient';
import { Loader2, Save, QrCode, Download, Copy, ExternalLink, Clock } from 'lucide-react';
import { OpeningHoursManager } from './OpeningHoursManager';
import { toDataURL } from 'qrcode';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@repo/design-system/components/ui/accordion";

const initialState: {
    success: boolean;
    message: string;
    errors?: Record<string, string[] | undefined>;
    config?: any;
} = {
    success: false,
    message: '',
    errors: undefined,
    config: undefined,
};

function SubmitButton({ dictionary }: { dictionary: Dictionary }) {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending}>
            {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            {dictionary.app.admin.menu.dishes.form.update}
        </Button>
    );
}

export function RestaurantConfigForm({
    config,
    dictionary,
    appUrl,
}: {
    config: RestaurantConfigData | null;
    dictionary: Dictionary;
    appUrl: string;
}) {
    const [state, setState] = useState(initialState);
    const [isPending, startTransition] = useTransition();
    const [slug, setSlug] = useState(config?.slug || '');
    const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);
    const [themeColor, setThemeColor] = useState(config?.themeColor || '#16a34a'); // Default to a nice green
    const menuUrl = `${appUrl}/es/menu/${slug || 'tu-restaurante'}`;

    useEffect(() => {
        toDataURL(menuUrl, { errorCorrectionLevel: 'H', width: 256, margin: 2 }, (err, dataUrl) => {
            if (err) {
                console.error("QR Code Generation Error:", err);
                return;
            }
            setQrCodeDataUrl(dataUrl);
        });
    }, [menuUrl]);

    const handleCopyToClipboard = () => {
        navigator.clipboard.writeText(menuUrl);
        toast.success("Enlace del menú copiado al portapapeles.");
    };

    const handleDownloadQR = () => {
        if (!qrCodeDataUrl) return;
        const link = document.createElement('a');
        link.href = qrCodeDataUrl;
        link.download = `qr-codigo-${slug || 'menu'}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const formRef = useRef<HTMLFormElement>(null);

    const handleSubmit = async () => {
        if (!formRef.current) return;
        const formData = new FormData(formRef.current);

        startTransition(() => {
            toast.promise(saveRestaurantConfig(state, formData), {
                loading: 'Guardando configuración...',
                success: (result) => {
                    setState(result);
                    if (!result.success) throw new Error(result.message);
                    return result.message;
                },
                error: (err) => {
                    // Si el error viene de la promesa (e.g. !res.success), ya tenemos un mensaje.
                    if (err.message) return err.message;
                    // Si es otro tipo de error.
                    setState({ success: false, message: 'Ocurrió un error inesperado.' });
                    return 'Ocurrió un error inesperado.';
                },
            });
        });
    };

    const firstRender = useRef(true);
    useEffect(() => {
        if (firstRender.current) {
            firstRender.current = false;
            return;
        }
        if (state.message) {
            if (state.success) {
                toast.success(state.message);
            } else {
                toast.error(state.message || 'Ocurrió un error.');
            }
        }
    }, [state]);

    return (
        <form ref={formRef} action={handleSubmit}>
            <div className="space-y-8 pb-24">
                {/* General Info Section */}
                <Card>
                    <CardHeader>
                        <CardTitle>Información General</CardTitle>
                        <CardDescription>
                            Logo, nombre y descripción de tu restaurante.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="md:col-span-1">
                            <Label>Logo del Restaurante</Label>
                            <ImageUpload name="logoUrl" initialUrl={config?.logoUrl} />
                            {state?.errors?.logoUrl && <p className="text-sm text-red-500 mt-2">{state.errors.logoUrl[0]}</p>}
                        </div>
                        <div className="md:col-span-2 space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Nombre del Restaurante</Label>
                                <Input id="name" name="name" defaultValue={config?.name} />
                                {state?.errors?.name && <p className="text-sm text-red-500">{state.errors.name[0]}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description">Descripción</Label>
                                <Textarea id="description" name="description" defaultValue={config?.description || ''} />
                                {state?.errors?.description && <p className="text-sm text-red-500">{state.errors.description[0]}</p>}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Customer Access Section */}
                <Card>
                    <CardHeader>
                        <CardTitle>Acceso de Clientes</CardTitle>
                        <CardDescription>
                            Configura cómo tus clientes accederán al menú digital. Este enlace y QR son los que debes compartir.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
                        <div className="md:col-span-2 space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="slug">Enlace Personalizado (URL)</Label>
                                <div className="flex items-center">
                                    <span className="flex-shrink-0 text-sm text-muted-foreground p-2 bg-muted rounded-l-md border border-r-0">
                                        {`${appUrl}/es/menu/`}
                                    </span>
                                    <Input id="slug" name="slug" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="tu-restaurante" className="rounded-l-none min-w-0" />
                                </div>
                                <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
                                    <Button type="button" variant="outline" onClick={handleCopyToClipboard} className="w-full">
                                        <Copy className="mr-2 h-4 w-4" />
                                        Copiar Enlace
                                    </Button>
                                    <a href={menuUrl} target="_blank" rel="noopener noreferrer" className="w-full">
                                        <Button type="button" variant="outline" className="w-full">
                                            <ExternalLink className="mr-2 h-4 w-4" />
                                            Vista previa
                                        </Button>
                                    </a>
                                </div>
                                {state?.errors?.slug && <p className="text-sm text-red-500">{state.errors.slug[0]}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="themeColor">Color Principal del Sitio</Label>
                                <div className="flex items-center gap-2">
                                    <div
                                        className="w-8 h-8 rounded-md border"
                                        style={{ backgroundColor: themeColor }}
                                    />
                                    <Input
                                        id="themeColor"
                                        name="themeColor"
                                        type="color"
                                        value={themeColor}
                                        onChange={(e) => setThemeColor(e.target.value)}
                                        className="p-1 h-8 w-12"
                                    />
                                    <Input
                                        type="text"
                                        value={themeColor}
                                        onChange={(e) => setThemeColor(e.target.value)}
                                        placeholder="#16a34a"
                                        className="w-28"
                                    />
                                </div>
                                <p className="text-xs text-muted-foreground">Este será el color predominante en la página que ven tus clientes.</p>
                                {state?.errors?.themeColor && <p className="text-sm text-red-500">{state.errors.themeColor[0]}</p>}
                            </div>
                        </div>
                        <div className="md:col-span-1 flex flex-col items-center justify-center text-center space-y-4 p-4 border rounded-lg">
                            <Label>Código QR del Menú</Label>
                            <div className="relative group">
                                {qrCodeDataUrl ? (
                                    <img src={qrCodeDataUrl} alt="Código QR del Menú" width={128} height={128} />
                                ) : (
                                    <div className="w-32 h-32 bg-muted rounded-md flex items-center justify-center"><QrCode className="w-16 h-16 text-muted-foreground" /></div>
                                )}
                            </div>
                            {qrCodeDataUrl && (
                                <Button type="button" variant="outline" size="sm" onClick={handleDownloadQR}>
                                    <Download className="mr-2 h-4 w-4" />
                                    Descargar QR
                                </Button>
                            )}
                            <p className="text-xs text-muted-foreground">Tus clientes pueden escanear este código para ver el menú.</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Contact Info Section */}
                <Card>
                    <CardHeader>
                        <CardTitle>Información de Contacto</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="address">Dirección</Label>
                                <Input id="address" name="address" defaultValue={config?.address || ''} />
                                {state?.errors?.address && <p className="text-sm text-red-500">{state.errors.address[0]}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">Teléfono</Label>
                                <Input id="phone" name="phone" defaultValue={config?.phone || ''} />
                                {state?.errors?.phone && <p className="text-sm text-red-500">{state.errors.phone[0]}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email de Contacto</Label>
                                <Input id="email" name="email" type="email" defaultValue={config?.email || ''} />
                                {state?.errors?.email && <p className="text-sm text-red-500">{state.errors.email[0]}</p>}
                            </div>
                            {/* <div className="space-y-2">
                                <Label htmlFor="socialMedia.instagram">Instagram</Label>
                                <Input id="socialMedia.instagram" name="socialMedia.instagram" defaultValue={config?.socialMedia?.instagram || ''} placeholder="https://instagram.com/tu-restaurante" />
                                {state?.errors?.['socialMedia.instagram'] && <p className="text-sm text-red-500">{state.errors['socialMedia.instagram'][0]}</p>}
                            </div> */}
                        </div>
                    </CardContent>
                </Card>

                {/* Opening Hours Section */}
                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1">
                        <AccordionTrigger className="text-lg font-medium">
                            <div className="flex items-center gap-2">
                                <Clock className="h-5 w-5" />
                                Horarios de Apertura
                            </div>
                        </AccordionTrigger>
                        <AccordionContent>
                            <Card className="border-none">
                                <CardHeader>
                                    <CardDescription>
                                        Define los días y horas en que tu restaurante está abierto.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <OpeningHoursManager initialHours={config?.hours || undefined} />
                                    {state?.errors?.hours && <p className="text-sm text-red-500 mt-2">{state.errors.hours[0]}</p>}
                                </CardContent>
                            </Card>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </div>

            {/* Sticky Footer for Submit Button */}
            <div className="fixed bottom-0 left-0 md:left-64 right-0 z-50">
                <div className="bg-background/95 backdrop-blur-sm supports-[backdrop-filter]:bg-background/60 border-t p-4">
                    <div className="max-w-6xl mx-auto flex justify-end">
                        <SubmitButton dictionary={dictionary} />
                    </div>
                </div>
            </div>
        </form>
    );
} 