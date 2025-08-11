'use client';

import { Check, X } from 'lucide-react';

interface PasswordRequirement {
    label: string;
    test: (password: string) => boolean;
}

interface PasswordStrengthIndicatorProps {
    password: string;
    dictionary?: any;
}

const requirements: PasswordRequirement[] = [
    {
        label: 'Al menos 8 caracteres',
        test: (password: string) => password.length >= 8,
    },
    {
        label: 'Al menos una letra mayúscula',
        test: (password: string) => /[A-Z]/.test(password),
    },
    {
        label: 'Al menos una letra minúscula',
        test: (password: string) => /[a-z]/.test(password),
    },
    {
        label: 'Al menos un número',
        test: (password: string) => /\d/.test(password),
    },
    {
        label: 'Al menos un carácter especial',
        test: (password: string) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    },
];

export function PasswordStrengthIndicator({ password, dictionary }: PasswordStrengthIndicatorProps) {
    if (!password) return null;

    const metRequirements = requirements.map(req => ({
        ...req,
        met: req.test(password),
    }));

    const strength = metRequirements.filter(req => req.met).length;
    const strengthPercentage = (strength / requirements.length) * 100;

    const getStrengthColor = () => {
        if (strengthPercentage <= 20) return 'bg-red-500';
        if (strengthPercentage <= 40) return 'bg-orange-500';
        if (strengthPercentage <= 60) return 'bg-yellow-500';
        if (strengthPercentage <= 80) return 'bg-blue-500';
        return 'bg-green-500';
    };

    const getStrengthText = () => {
        if (strengthPercentage <= 20) return 'Muy débil';
        if (strengthPercentage <= 40) return 'Débil';
        if (strengthPercentage <= 60) return 'Media';
        if (strengthPercentage <= 80) return 'Fuerte';
        return 'Muy fuerte';
    };

    return (
        <div className="space-y-3">
            {/* Barra de fortaleza */}
            <div className="space-y-2">
                <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                        {dictionary?.app?.auth?.passwordStrength || 'Fortaleza de la contraseña'}:
                    </span>
                    <span className={`font-medium ${getStrengthColor().replace('bg-', 'text-')}`}>
                        {getStrengthText()}
                    </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                        className={`h-2 rounded-full transition-all duration-300 ${getStrengthColor()}`}
                        style={{ width: `${strengthPercentage}%` }}
                    />
                </div>
            </div>

            {/* Lista de requisitos */}
            <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {dictionary?.app?.auth?.passwordRequirements || 'Requisitos de la contraseña'}:
                </p>
                <ul className="space-y-1">
                    {metRequirements.map((requirement, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm">
                            {requirement.met ? (
                                <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                            ) : (
                                <X className="h-4 w-4 text-red-500 flex-shrink-0" />
                            )}
                            <span className={requirement.met ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}>
                                {requirement.label}
                            </span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
