'use client';

import { useState } from 'react';
import { Input } from '@repo/design-system/components/ui/input';
import { Button } from '@repo/design-system/components/ui/button';
import { Eye, EyeOff } from 'lucide-react';
import { Dictionary } from '@repo/internationalization';

interface PasswordInputProps {
    value?: string;
    onChange?: (value: string) => void;
    onBlur?: () => void;
    name?: string;
    placeholder?: string;
    className?: string;
    dictionary?: Dictionary;
    showToggle?: boolean;
    disabled?: boolean;
    ref?: any;
}

export function PasswordInput({
    value,
    onChange,
    onBlur,
    name,
    placeholder = "••••••••",
    className = "",
    dictionary,
    showToggle = true,
    disabled,
    ref
}: PasswordInputProps) {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="relative">
            <Input
                ref={ref}
                type={showPassword ? "text" : "password"}
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange?.(e.target.value)}
                onBlur={onBlur}
                name={name}
                disabled={disabled}
                className={`pr-10 ${className}`}
            />
            {showToggle && (
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ?
                        (dictionary?.app?.auth?.hidePassword || 'Ocultar contraseña') :
                        (dictionary?.app?.auth?.showPassword || 'Mostrar contraseña')
                    }
                >
                    {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-500" />
                    ) : (
                        <Eye className="h-4 w-4 text-gray-500" />
                    )}
                </Button>
            )}
        </div>
    );
}
