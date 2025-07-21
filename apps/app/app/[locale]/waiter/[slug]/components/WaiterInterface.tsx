'use client';

import React, { useState, useEffect } from 'react';
import { Dictionary } from '@repo/internationalization';
import { RestaurantConfigData } from '@repo/data-services/src/services/restaurantConfigService';
import { DailySpecialData } from '@repo/data-services/src/services/dailySpecialService';
import { OrderData } from '@repo/data-services';
import { useSocket } from '@/hooks/useSocket';
import { Badge } from '@repo/design-system/components/ui/badge';
import { Wifi, WifiOff } from 'lucide-react';
import WaiterAuth from './WaiterAuth';
import OrderInterface from './OrderInterface';

interface Category {
    id: string;
    name: string;
    description?: string | null;
    imageUrl?: string | null;
    order: number;
    isActive: boolean;
    dishes: Dish[];
}

interface Dish {
    id: string;
    name: string;
    description: string;
    price: number;
    promotionalPrice?: number | null;
    imageUrl?: string | null;
    status: string;
    order: number;
    category?: {
        name: string;
    } | null;
}

interface WaiterInterfaceProps {
    locale: string;
    slug: string;
    restaurantConfig: RestaurantConfigData;
    categories: Category[];
    dailySpecials: DailySpecialData[];
    dictionary: Dictionary;
    existingOrders: OrderData[];
    tables: { id: string; label: string; }[];
}

export default function WaiterInterface({
    locale,
    slug,
    restaurantConfig,
    categories,
    dailySpecials,
    dictionary,
    existingOrders,
    tables
}: WaiterInterfaceProps) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [orders, setOrders] = useState<OrderData[]>(existingOrders as OrderData[]);


    const [isConnected, setIsConnected] = useState(false);

    // WebSocket connection para waiter
    const { isConnected: socketConnected } = useSocket({
        restaurantSlug: slug,
        roomType: 'waiter',
        onOrderEvent: (event) => {
            if (event.type === 'ORDER_CREATED') {
                setOrders(prev => {
                    // Verificar si la orden ya existe para evitar duplicados
                    const orderExists = prev.some(order => order.id === event.order.id);
                    if (orderExists) {
                        return prev;
                    }
                    return [event.order, ...prev];
                });
            } else if (event.type === 'ORDER_STATUS_CHANGED') {
                setOrders(prev => prev.map(order =>
                    order.id === event.order.id ? { ...order, status: event.order.status, updatedAt: event.order.updatedAt } : order
                ));
            } else if (event.type === 'ORDER_DELETED') {
                setOrders(prev => prev.filter(order => order.id !== event.orderId));
            }
        },
        onError: (error) => {
            console.error('Error de WebSocket en waiter:', error);
        }
    });

    // Actualizar estado de conexión
    useEffect(() => {
        setIsConnected(socketConnected);
    }, [socketConnected]);

    if (!isAuthenticated) {
        return (
            <WaiterAuth
                slug={slug}
                restaurantName={restaurantConfig.name}
                dictionary={dictionary}
                onAuthenticated={() => setIsAuthenticated(true)}
            />
        );
    }

    return (
        <OrderInterface
            restaurantConfig={restaurantConfig}
            categories={categories}
            dailySpecials={dailySpecials}
            dictionary={dictionary}
            existingOrders={orders}
            tables={tables}
            onOrdersUpdate={(newOrders) => setOrders(newOrders as OrderData[])}
            isConnected={isConnected}
        />
    );
}