import React from 'react';
import { Dictionary } from '@repo/internationalization';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/design-system/components/ui/card';
import {
    Clock,
    ChefHat,
    CheckCircle,
    Truck,
    XCircle,
    ShoppingCart
} from 'lucide-react';

interface OrdersStatsProps {
    stats: {
        total: number;
        active: number;
        ready: number;
        cancelled: number;
    };
    dictionary: Dictionary;
}

export function OrdersStats({ stats, dictionary }: OrdersStatsProps) {
    const statCards = [
        {
            title: 'Total',
            value: stats.total,
            icon: ShoppingCart,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50',
        },
        {
            title: 'Activas',
            value: stats.active,
            icon: Clock,
            color: 'text-yellow-600',
            bgColor: 'bg-yellow-50',
        },
        {
            title: 'Listas/Entregadas',
            value: stats.ready,
            icon: CheckCircle,
            color: 'text-green-600',
            bgColor: 'bg-green-50',
        },
        {
            title: 'Canceladas',
            value: stats.cancelled,
            icon: XCircle,
            color: 'text-red-600',
            bgColor: 'bg-red-50',
        },
    ];

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {statCards.map((stat) => {
                const Icon = stat.icon;
                return (
                    <Card key={stat.title}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {stat.title}
                            </CardTitle>
                            <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                                <Icon className={`h-4 w-4 ${stat.color}`} />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stat.value}</div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
} 