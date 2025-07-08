'use client';

import { useState, useRef } from 'react';
import { Button } from '@repo/design-system/components/ui/button';
import { Image as ImageIcon, Trash2, UploadCloud } from 'lucide-react';
import Image from 'next/image';

interface ImageUploadProps {
    name: string;
    initialUrl?: string | null;
}

export function ImageUpload({ name, initialUrl }: ImageUploadProps) {
    const [preview, setPreview] = useState<string | null>(initialUrl || null);
    const [urlValue, setUrlValue] = useState(initialUrl || ''); // For the hidden input
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
            // An empty string in urlValue while there's a file means "replace"
            setUrlValue('');
        }
    };

    const handleRemove = () => {
        setPreview(null);
        setUrlValue(''); // This empty value now consistently signals removal or replacement
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="w-full space-y-4 text-center">
            <div className="w-full h-48 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center relative overflow-hidden">
                {preview ? (
                    <Image src={preview} alt="Vista previa del logo" layout="fill" objectFit="contain" />
                ) : (
                    <div className="text-gray-400 flex flex-col items-center">
                        <ImageIcon className="h-16 w-16" />
                        <p className="mt-2 text-sm">No hay logo</p>
                    </div>
                )}
            </div>

            <div className="flex justify-center items-center gap-4">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                >
                    <UploadCloud className="mr-2 h-4 w-4" />
                    Subir imagen
                </Button>
                <input
                    type="file"
                    name={`${name}File`} // Use a different name for the file to avoid conflict
                    ref={fileInputRef}
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                />
                <input
                    type="hidden"
                    name={name}
                    value={urlValue}
                />
                {preview && (
                    <Button type="button" variant="destructive" size="icon" onClick={handleRemove}>
                        <Trash2 className="h-4 w-4" />
                    </Button>
                )}
            </div>
        </div>
    );
} 