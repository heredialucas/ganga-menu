'use client';

import { useState, useEffect } from 'react';
import { Button } from '@repo/design-system/components/ui/button';
import { Copy, ExternalLink, Download } from 'lucide-react';
import type { Dictionary } from '@repo/internationalization';
import { toast } from 'sonner';
import { toDataURL } from 'qrcode';

interface ShareableLinkClientProps {
    link: string;
    linkName: string;
    dictionary: Dictionary;
    canView: boolean;
}

export function ShareableLinkClient({ link, linkName, dictionary, canView }: ShareableLinkClientProps) {
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

    const handleCopyToClipboard = () => {
        if (!canView) {
            toast.error(dictionary.web?.services?.shared?.codeError || 'No tienes permisos para copiar enlaces');
            return;
        }
        navigator.clipboard.writeText(link);
        toast.success(dictionary.web?.services?.shared?.copySuccess?.replace('{name}', linkName) || `Enlace para ${linkName} copiado al portapapeles.`);
    };

    const handleDownloadQR = () => {
        if (!canView) {
            toast.error(dictionary.web?.services?.shared?.codeError || 'No tienes permisos para descargar códigos QR');
            return;
        }
        if (!qrCodeDataUrl) return;
        const a = document.createElement('a');
        a.href = qrCodeDataUrl;
        a.download = `qr-code-${linkName.toLowerCase()}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    return (
        <div className="space-y-2 sm:space-y-3">
            <div className="flex items-center gap-2">
                <div className="flex-grow p-2 bg-muted rounded-md font-mono text-xs sm:text-sm text-muted-foreground truncate">
                    {link}
                </div>
                {canView && (
                    <Button variant="outline" size="icon" onClick={handleCopyToClipboard} className="flex-shrink-0">
                        <Copy className="h-4 w-4" />
                    </Button>
                )}
            </div>
            {qrCodeDataUrl && (
                <div className="p-2 sm:p-4 bg-white rounded-lg border flex flex-col items-center gap-2 sm:gap-4">
                    <img src={qrCodeDataUrl} alt={`QR Code for ${linkName}`} className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48" />
                </div>
            )}
            {canView && (
                <div className="flex flex-col sm:flex-row w-full items-stretch sm:items-center gap-2">
                    {qrCodeDataUrl && (
                        <Button variant="outline" onClick={handleDownloadQR} className="flex-1">
                            <Download className="mr-2 h-4 w-4" />
                            <span className="hidden sm:inline">{dictionary.web?.services?.shared?.downloadQR || 'Descargar QR'}</span>
                            <span className="sm:hidden">{dictionary.web?.services?.shared?.downloadQRShort || 'Descargar'}</span>
                        </Button>
                    )}
                    <a href={link} target="_blank" rel="noopener noreferrer" className="flex-1">
                        <Button variant="secondary" className="w-full">
                            <span className="hidden sm:inline">{dictionary.web?.services?.shared?.open || 'Abrir'}</span>
                            <span className="sm:hidden">{dictionary.web?.services?.shared?.openShort || 'Abrir'}</span>
                            <ExternalLink className="ml-2 h-4 w-4" />
                        </Button>
                    </a>
                </div>
            )}
        </div>
    );
} 