'use client';

import React, { useState } from 'react';
import { Dictionary } from '@repo/internationalization';
import { RestaurantConfigData } from '@repo/data-services/src/services/restaurantConfigService';
import { OrderData } from '@repo/data-services';
import {
    ChefHat,
    Clock,
    Filter,
    User,
    StickyNote,
    XCircle,
    HelpCircle,
} from 'lucide-react';
import { Card, CardHeader, CardContent } from '@repo/design-system/components/ui/card';

interface KitchenInterfaceProps {
    restaurantConfig: RestaurantConfigData;
    orders: OrderData[];
    dictionary: Dictionary;
}

export default function KitchenInterface({
    restaurantConfig,
    orders,
    dictionary
}: KitchenInterfaceProps) {
    const [orderFilter, setOrderFilter] = useState<'all' | 'in_progress' | 'ready'>('all');

    const getOrderConfig = (status: OrderData['status']) => {
        switch (status) {
            case 'PENDING':
                return {
                    bg: 'bg-red-50',
                    blob: 'bg-red-200',
                    accent: 'bg-red-500',
                    text: 'Pendiente',
                    borderColor: 'border-red-200'
                };
            case 'IN_PROGRESS':
                return {
                    bg: 'bg-blue-50',
                    blob: 'bg-blue-200',
                    accent: 'bg-blue-500',
                    text: 'En preparación',
                    borderColor: 'border-blue-200'
                };
            case 'READY':
                return {
                    bg: 'bg-green-50',
                    blob: 'bg-green-200',
                    accent: 'bg-green-500',
                    text: 'Listo',
                    borderColor: 'border-green-200'
                };
            default:
                return {
                    bg: 'bg-gray-50',
                    blob: 'bg-gray-200',
                    accent: 'bg-gray-500',
                    text: 'Completado',
                    borderColor: 'border-gray-200'
                };
        }
    };

    const getTimeElapsedString = (date: string | Date) => {
        const orderTime = new Date(date).getTime();
        const now = new Date().getTime();
        const diffMinutes = Math.round((now - orderTime) / (1000 * 60));

        if (diffMinutes < 1) return '<1m';
        if (diffMinutes < 60) return `${diffMinutes}m`;

        const diffHours = Math.floor(diffMinutes / 60);
        const remainingMinutes = diffMinutes % 60;
        return `${diffHours}h ${remainingMinutes}m`;
    };

    const kitchenOrders = orders.filter(order =>
        ['PENDING', 'IN_PROGRESS', 'READY'].includes(order.status)
    );

    const filteredOrders = kitchenOrders.filter(order => {
        if (orderFilter === 'all') {
            return true;
        }
        if (orderFilter === 'in_progress') {
            return order.status === 'PENDING' || order.status === 'IN_PROGRESS';
        }
        if (orderFilter === 'ready') {
            return order.status === 'READY';
        }
        return false;
    });

    // Obtener órdenes por prioridad (pendientes primero, luego en proceso, etc.)
    const sortedOrders = [...filteredOrders].sort((a, b) => {
        const priority = { 'PENDING': 1, 'IN_PROGRESS': 2, 'READY': 3, 'DELIVERED': 4, 'CANCELLED': 5 };
        const aPriority = priority[a.status as keyof typeof priority] || 6;
        const bPriority = priority[b.status as keyof typeof priority] || 6;

        if (aPriority !== bPriority) {
            return aPriority - bPriority;
        }

        // Si tienen la misma prioridad, ordenar por fecha de creación (más recientes primero)
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
                                <ChefHat className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">
                                    Panel de Cocina
                                </h1>
                                <p className="text-sm text-gray-600">{restaurantConfig.name}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-right">
                                <p className="text-sm text-gray-600">Órdenes activas</p>
                                <p className="text-2xl font-bold text-orange-600">{kitchenOrders.length}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Filtros */}
                <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
                    <div className="flex items-center gap-3 mb-4">
                        <Filter className="w-5 h-5 text-gray-600" />
                        <h3 className="text-lg font-semibold text-gray-900">
                            Filtros
                        </h3>
                    </div>
                    <div className="grid grid-cols-2 sm:flex gap-2 flex-wrap">
                        <button
                            onClick={() => setOrderFilter('all')}
                            className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${orderFilter === 'all'
                                ? 'bg-orange-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            Todas ({kitchenOrders.length})
                        </button>
                        <button
                            onClick={() => setOrderFilter('in_progress')}
                            className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${orderFilter === 'in_progress'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            En Proceso ({kitchenOrders.filter(o => o.status === 'PENDING' || o.status === 'IN_PROGRESS').length})
                        </button>
                        <button
                            onClick={() => setOrderFilter('ready')}
                            className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${orderFilter === 'ready'
                                ? 'bg-green-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            Listos ({kitchenOrders.filter(o => o.status === 'READY').length})
                        </button>
                    </div>
                </div>

                {/* Lista de órdenes */}
                {sortedOrders.length === 0 ? (
                    <div className="text-center py-24 text-gray-500 bg-white rounded-lg shadow-sm">
                        <ChefHat className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                        <h3 className="text-xl font-semibold">No hay órdenes para mostrar</h3>
                        <p className="text-sm">Cuando lleguen nuevas órdenes, aparecerán aquí.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {sortedOrders.map((order) => {
                            const config = getOrderConfig(order.status);
                            const timeElapsed = getTimeElapsedString(order.createdAt);

                            return (
                                <Card
                                    key={order.id}
                                    className={`${config.bg} ${config.borderColor} border-2 relative overflow-hidden transition-all hover:shadow-xl pb-4`}
                                >
                                    {/* Blobs decorativos */}
                                    <div
                                        className={`absolute -top-4 -right-4 w-20 h-16 ${config.blob} opacity-20 rounded-full`}
                                        style={{ borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%" }}
                                    ></div>
                                    <div
                                        className={`absolute -bottom-2 -left-2 w-12 h-10 ${config.blob} opacity-15 rounded-full`}
                                        style={{ borderRadius: "40% 60% 70% 30% / 40% 70% 30% 60%" }}
                                    ></div>
                                    <div
                                        className={`absolute top-1/2 left-1/2 w-6 h-8 ${config.blob} opacity-10 rounded-full animate-pulse`}
                                        style={{ borderRadius: "70% 30% 60% 40% / 30% 60% 40% 70%" }}
                                    ></div>

                                    <CardHeader className="pb-3 relative z-10">
                                        <div className="flex items-center justify-between">
                                            <div
                                                className={`${config.accent} text-white px-4 py-2 text-sm font-medium`}
                                                style={{ borderRadius: "50% 20% 80% 30% / 60% 70% 30% 40%" }}
                                            >
                                                {config.text}
                                            </div>
                                            <span className="text-sm font-mono bg-white px-2 py-1 rounded-full border">#{order.id.substring(0, 5)}</span>
                                        </div>
                                        <div className="flex items-center justify-between mt-2">
                                            <h3 className="font-bold text-xl text-gray-800">Mesa {order.table?.label || 'Mostrador'}</h3>
                                            <span className="text-sm text-gray-500">hace {timeElapsed}</span>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="relative z-10">
                                        <div className="space-y-2">
                                            {order.items.map((item) => (
                                                <div key={item.id} className="flex items-center gap-3">
                                                    <div
                                                        className={`w-3 h-3 ${config.blob} opacity-60 flex-shrink-0`}
                                                        style={{ borderRadius: "60% 40% 30% 70%" }}
                                                    ></div>
                                                    <p className="text-sm text-gray-700">
                                                        <span className='font-bold'>{item.quantity}x</span> {item.dish.name}
                                                    </p>
                                                </div>
                                            ))}
                                            {order.notes && (
                                                <div className="pt-2 mt-2 border-t border-gray-200">
                                                    <div className="flex items-start gap-2 bg-yellow-50/50 p-2 rounded-lg">
                                                        <StickyNote className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                                                        <p className="text-sm text-yellow-800">{order.notes}</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
} 