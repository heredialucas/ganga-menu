import React from 'react';
import { Dictionary } from '@repo/internationalization';
import { Button } from '@repo/design-system/components/ui/button';
import {
    Clock,
    CheckCircle,
    XCircle,
    Filter
} from 'lucide-react';

type OrderStatus = 'ACTIVE' | 'READY' | 'CANCELLED' | 'PAID';

interface OrdersFiltersClientProps {
    selectedStatus: OrderStatus | 'ALL';
    onStatusChange: (status: OrderStatus | 'ALL') => void;
    dictionary: Dictionary;
}

export function OrdersFiltersClient({ selectedStatus, onStatusChange, dictionary }: OrdersFiltersClientProps) {
    const statusFilters = [
        {
            value: 'ALL' as const,
            label: dictionary.web?.orders?.filters?.all || 'Todas',
            icon: Filter,
            color: 'bg-gray-100 text-gray-800',
            activeColor: 'bg-gray-800 text-white',
        },
        {
            value: 'ACTIVE' as const,
            label: dictionary.web?.orders?.filters?.active || 'Activas',
            icon: Clock,
            color: 'bg-yellow-100 text-yellow-800',
            activeColor: 'bg-yellow-600 text-white',
        },
        {
            value: 'READY' as const,
            label: dictionary.web?.orders?.filters?.ready || 'Listas/Entregadas',
            icon: CheckCircle,
            color: 'bg-green-100 text-green-800',
            activeColor: 'bg-green-600 text-white',
        },
        {
            value: 'CANCELLED' as const,
            label: dictionary.web?.orders?.filters?.cancelled || 'Canceladas',
            icon: XCircle,
            color: 'bg-red-100 text-red-800',
            activeColor: 'bg-red-600 text-white',
        },
        {
            value: 'PAID' as const,
            label: dictionary.web?.orders?.filters?.paid || 'Pagadas',
            icon: CheckCircle,
            color: 'bg-blue-100 text-blue-800',
            activeColor: 'bg-blue-600 text-white',
        },
    ];

    return (
        <div className="flex flex-wrap gap-1 sm:gap-2">
            {statusFilters.map((filter) => {
                const Icon = filter.icon;
                const isActive = selectedStatus === filter.value;

                return (
                    <Button
                        key={filter.value}
                        variant="outline"
                        size="sm"
                        onClick={() => onStatusChange(filter.value)}
                        className={`flex items-center gap-1 sm:gap-2 transition-colors text-xs sm:text-sm ${isActive
                            ? filter.activeColor
                            : filter.color
                            }`}
                    >
                        <Icon className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="hidden sm:inline">{filter.label}</span>
                        <span className="sm:hidden">
                            {filter.value === 'ALL' ? (dictionary.web?.orders?.filters?.allShort || 'Todas') :
                                filter.value === 'ACTIVE' ? (dictionary.web?.orders?.filters?.activeShort || 'Activas') :
                                    filter.value === 'READY' ? (dictionary.web?.orders?.filters?.readyShort || 'Lista') :
                                        filter.value === 'CANCELLED' ? (dictionary.web?.orders?.filters?.cancelledShort || 'Cancel') :
                                            filter.value === 'PAID' ? (dictionary.web?.orders?.filters?.paidShort || 'Paga') : 'Otro'}
                        </span>
                    </Button>
                );
            })}
        </div>
    );
} 