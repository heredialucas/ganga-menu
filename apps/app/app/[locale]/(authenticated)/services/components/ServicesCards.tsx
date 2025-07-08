'use client';

import { useState, useTransition, useEffect } from 'react';
import type { RestaurantConfigData } from '@repo/data-services/src/services/restaurantConfigService';
import { Button } from '@repo/design-system/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@repo/design-system/components/ui/card';
import { Input } from '@repo/design-system/components/ui/input';
import { ChefHat, UtensilsCrossed, Copy, ExternalLink, Save, QrCode, Download } from 'lucide-react';
import type { Dictionary } from '@repo/internationalization';
import { toast } from 'sonner';
import { toDataURL } from 'qrcode';
import { updateWaiterCode } from '../actions';

interface ServicesCardsProps {
    restaurantConfig: RestaurantConfigData;
    dictionary: Dictionary;
    locale: string;
}

interface ShareableLinkProps {
    link: string;
    linkName: string;
    onCopy: () => void;
}

const ShareableLink = ({ link, linkName, onCopy }: ShareableLinkProps) => {
    const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);

    useEffect(() => {
        toDataURL(link, { errorCorrectionLevel: 'H', width: 256, margin: 2 }, (err, dataUrl) => {
            if (err) {
                console.error("QR Code Generation Error:", err);
                return;
            }
            setQrCodeDataUrl(dataUrl);
        });
    }, [link]);

    const handleDownloadQR = () => {
        if (!qrCodeDataUrl) return;
        const a = document.createElement('a');
        a.href = qrCodeDataUrl;
        a.download = `qr-code-${linkName.toLowerCase()}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center space-x-2">
                <div className="flex-grow p-2 bg-muted rounded-md font-mono text-sm text-muted-foreground truncate">
                    {link}
                </div>
                <Button variant="outline" size="icon" onClick={onCopy}>
                    <Copy className="h-4 w-4" />
                </Button>
            </div>
            {qrCodeDataUrl && (
                <div className="p-4 bg-white rounded-lg border flex flex-col items-center gap-4">
                    <img src={qrCodeDataUrl} alt={`QR Code for ${linkName}`} className="w-40 h-40 sm:w-48 sm:h-48" />
                </div>
            )}
            <div className="flex w-full items-center justify-center gap-2">
                {qrCodeDataUrl && (
                    <Button variant="outline" onClick={handleDownloadQR} className="flex-1">
                        <Download className="mr-2 h-4 w-4" />
                        Descargar QR
                    </Button>
                )}
                <a href={link} target="_blank" rel="noopener noreferrer" className="flex-1">
                    <Button variant="secondary" className="w-full">
                        Abrir <ExternalLink className="ml-2 h-4 w-4" />
                    </Button>
                </a>
            </div>
        </div>
    );
};


export function ServicesCards({ restaurantConfig, dictionary, locale }: ServicesCardsProps) {
    const [isPending, startTransition] = useTransition();
    const [waiterCode, setWaiterCode] = useState(restaurantConfig.waiterCode);

    const kitchenLink = `${window.location.origin}/${locale}/kitchen/${restaurantConfig.slug}`;
    const waiterLink = `${window.location.origin}/${locale}/waiter/${restaurantConfig.slug}`;

    const handleCopyToClipboard = (link: string, name: string) => {
        navigator.clipboard.writeText(link);
        toast.success(`Enlace para ${name} copiado al portapapeles.`);
    };

    const handleUpdateCode = () => {
        const promise = async () => {
            const formData = new FormData();
            formData.append('code', waiterCode);
            const result = await updateWaiterCode(formData);
            if (!result.success) {
                throw new Error(result.message);
            }
            return result;
        };

        toast.promise(promise(), {
            loading: 'Guardando nuevo código...',
            success: (result) => `${result.message}`,
            error: (err) => `Error: ${err.message}`,
        });
    };

    return (
        <div className="grid gap-8 md:grid-cols-2">
            {/* Card para Mozos */}
            <Card className="flex flex-col">
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <UtensilsCrossed className="h-8 w-8 text-blue-500" />
                        <div>
                            <CardTitle>Gestión de Mozos</CardTitle>
                            <CardDescription>
                                Modifica el código de acceso y comparte el enlace.
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="flex-grow flex flex-col p-6">
                    <div>
                        <label className="text-sm font-medium">Código de Acceso para Mozos</label>
                        <p className="text-sm text-muted-foreground mb-2">
                            Este es el código que los mozos usarán para acceder.
                        </p>
                        <div className="flex flex-col sm:flex-row w-full items-stretch sm:items-center gap-2">
                            <Input
                                type="text"
                                placeholder="4+ dígitos"
                                value={waiterCode}
                                onChange={(e) => setWaiterCode(e.target.value)}
                                className="flex-grow"
                            />
                            <Button type="button" onClick={handleUpdateCode} disabled={isPending} className="flex-shrink-0">
                                <Save className="mr-2 h-4 w-4" />
                                {isPending ? 'Guardando...' : 'Guardar'}
                            </Button>
                        </div>
                    </div>
                    <div className="mt-auto pt-6">
                        <label className="text-sm font-medium">Enlace de Acceso para Mozos</label>
                        <ShareableLink
                            link={waiterLink}
                            linkName="Mozos"
                            onCopy={() => handleCopyToClipboard(waiterLink, 'Mozos')}
                        />
                    </div>
                </CardContent>
                <CardFooter>
                    <p className="text-xs text-muted-foreground">
                        Recuerda guardar los cambios del código antes de compartir el enlace.
                    </p>
                </CardFooter>
            </Card>

            {/* Card para Cocina */}
            <Card className="flex flex-col">
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <ChefHat className="h-8 w-8 text-orange-500" />
                        <div>
                            <CardTitle>Acceso para Cocina</CardTitle>
                            <CardDescription>
                                Comparte el enlace de acceso directo al panel de cocina.
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="flex-grow flex flex-col p-6">
                    <div className="mt-auto">
                        <label className="text-sm font-medium">Enlace de Acceso para Cocina</label>
                        <ShareableLink
                            link={kitchenLink}
                            linkName="Cocina"
                            onCopy={() => handleCopyToClipboard(kitchenLink, 'Cocina')}
                        />
                    </div>
                </CardContent>
                <CardFooter>
                    <p className="text-xs text-muted-foreground">
                        El acceso a la cocina es directo y no requiere código.
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
} 