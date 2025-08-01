import React from 'react';
import { Dictionary } from '@repo/internationalization';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/design-system/components/ui/card';
import {
    Clock,
    CheckCircle,
    XCircle,
    ShoppingCart
} from 'lucide-react';

interface OrdersStatsClientProps {
    stats: {
        total: number;
        active: number;
        ready: number;
        cancelled: number;
    };
    dictionary: Dictionary;
}

export function OrdersStatsClient({ stats, dictionary }: OrdersStatsClientProps) {
    const statCards = [
        {
            title: dictionary.web?.orders?.stats?.total || 'Total',
            value: stats.total,
            icon: ShoppingCart,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50',
        },
        {
            title: dictionary.web?.orders?.stats?.active || 'Activas',
            value: stats.active,
            icon: Clock,
            color: 'text-yellow-600',
            bgColor: 'bg-yellow-50',
        },
        {
            title: dictionary.web?.orders?.stats?.ready || 'Listas',
            value: stats.ready,
            icon: CheckCircle,
            color: 'text-green-600',
            bgColor: 'bg-green-50',
        },
        {
            title: dictionary.web?.orders?.stats?.cancelled || 'Cancel',
            value: stats.cancelled,
            icon: XCircle,
            color: 'text-red-600',
            bgColor: 'bg-red-50',
        },
    ];

    return (
        <div className="grid gap-2 sm:gap-3 md:gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {statCards.map((stat) => {
                const Icon = stat.icon;
                return (
                    <Card key={stat.title}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2">
                            <CardTitle className="text-xs sm:text-sm font-medium">
                                {stat.title}
                            </CardTitle>
                            <div className={`p-1 sm:p-2 rounded-lg ${stat.bgColor}`}>
                                <Icon className={`h-3 w-3 sm:h-4 sm:w-4 ${stat.color}`} />
                            </div>
                        </CardHeader>
                        <CardContent className="p-2 sm:p-4">
                            <div className="text-lg sm:text-xl md:text-2xl font-bold">{stat.value}</div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
} 