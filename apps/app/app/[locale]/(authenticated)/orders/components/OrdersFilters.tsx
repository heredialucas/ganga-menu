import React from 'react';
import { Dictionary } from '@repo/internationalization';
import { Button } from '@repo/design-system/components/ui/button';
import { Badge } from '@repo/design-system/components/ui/badge';
import {
    Clock,
    ChefHat,
    CheckCircle,
    Truck,
    XCircle,
    Filter
} from 'lucide-react';

type OrderStatus = 'ACTIVE' | 'READY' | 'CANCELLED' | 'PAID';

interface OrdersFiltersProps {
    selectedStatus: OrderStatus | 'ALL';
    onStatusChange: (status: OrderStatus | 'ALL') => void;
    dictionary: Dictionary;
}

export function OrdersFilters({ selectedStatus, onStatusChange, dictionary }: OrdersFiltersProps) {
    const statusFilters = [
        {
            value: 'ALL' as const,
            label: 'Todas',
            icon: Filter,
            color: 'bg-gray-100 text-gray-800',
            activeColor: 'bg-gray-800 text-white',
        },
        {
            value: 'ACTIVE' as const,
            label: 'Activas',
            icon: Clock,
            color: 'bg-yellow-100 text-yellow-800',
            activeColor: 'bg-yellow-600 text-white',
        },
        {
            value: 'READY' as const,
            label: 'Listas/Entregadas',
            icon: CheckCircle,
            color: 'bg-green-100 text-green-800',
            activeColor: 'bg-green-600 text-white',
        },
        {
            value: 'CANCELLED' as const,
            label: 'Canceladas',
            icon: XCircle,
            color: 'bg-red-100 text-red-800',
            activeColor: 'bg-red-600 text-white',
        },
        {
            value: 'PAID' as const,
            label: 'Pagadas',
            icon: CheckCircle,
            color: 'bg-blue-100 text-blue-800',
            activeColor: 'bg-blue-600 text-white',
        },
    ];

    return (
        <div className="flex flex-wrap gap-2">
            {statusFilters.map((filter) => {
                const Icon = filter.icon;
                const isActive = selectedStatus === filter.value;

                return (
                    <Button
                        key={filter.value}
                        variant="outline"
                        size="sm"
                        onClick={() => onStatusChange(filter.value)}
                        className={`flex items-center gap-2 transition-colors ${isActive
                            ? filter.activeColor
                            : filter.color
                            }`}
                    >
                        <Icon className="h-4 w-4" />
                        {filter.label}
                    </Button>
                );
            })}
        </div>
    );
} 