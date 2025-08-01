'use client';

import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, ChefHat, ChevronDown, ChevronUp } from 'lucide-react';
import { useSocket } from '@/hooks/useSocket';
import { TableData } from '@repo/data-services/src/services/tableService';
import { OrderData } from '@repo/data-services';
import { getTableOrdersAction } from '../../actions';
import { Card, CardContent, CardHeader } from '@repo/design-system/components/ui/card';
import { Badge } from '@repo/design-system/components/ui/badge';
import { Dictionary } from '@repo/internationalization';

interface OrderStatusBarProps {
    table: TableData;
    restaurantSlug: string;
    restaurantConfigId: string;
    dictionary: Dictionary;
}

export default function OrderStatusBar({
    table,
    restaurantSlug,
    restaurantConfigId,
    dictionary
}: OrderStatusBarProps) {
    const [orders, setOrders] = useState<OrderData[]>([]);
    const [isVisible, setIsVisible] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);

    // Cargar órdenes existentes al montar el componente
    useEffect(() => {
        const loadExistingOrders = async () => {
            try {
                const result = await getTableOrdersAction(table.id, restaurantConfigId);
                if (result.success && result.orders && result.orders.length > 0) {
                    setOrders(result.orders);
                    setIsVisible(true);
                }
            } catch (error) {
                console.error('Error cargando órdenes existentes:', error);
            }
        };

        loadExistingOrders();
    }, [table.id, restaurantConfigId]);

    // WebSocket connection para recibir actualizaciones en tiempo real
    const { isConnected } = useSocket({
        restaurantSlug,
        roomType: 'menu',
        onOrderEvent: (event) => {
            if (event.type === 'ORDER_CREATED' && event.order.table?.id === table.id) {
                setOrders(prev => {
                    // Evitar duplicados
                    const exists = prev.some(order => order.id === event.order.id);
                    if (exists) return prev;
                    return [event.order, ...prev];
                });
                setIsVisible(true);
            } else if (event.type === 'ORDER_STATUS_CHANGED') {
                // Verificar si la orden pertenece a esta mesa
                const orderBelongsToThisTable = event.order.table?.id === table.id;

                if (orderBelongsToThisTable) {
                    setOrders(prev => {
                        const existingOrder = prev.find(order => order.id === event.order.id);
                        if (existingOrder) {
                            // Actualizar orden existente
                            return prev.map(order =>
                                order.id === event.order.id ? { ...order, status: event.order.status, updatedAt: event.order.updatedAt } : order
                            );
                        } else {
                            // Agregar nueva orden si pertenece a esta mesa y tiene datos completos
                            if (event.order.items && event.order.total !== undefined) {
                                return [...prev, event.order];
                            }
                            // Si no tiene datos completos, solo actualizar el estado si ya existe
                            return prev;
                        }
                    });

                    // Ocultar la barra si todas las órdenes están pagadas
                    const updatedOrders = orders.map(order =>
                        order.id === event.order.id ? { ...order, status: event.order.status, updatedAt: event.order.updatedAt } : order
                    );
                    const hasActiveOrders = updatedOrders.some(order => order.status !== 'PAID');
                    if (!hasActiveOrders) {
                        setIsVisible(false);
                    }
                }
            } else if (event.type === 'ORDER_DELETED') {
                setOrders(prev => prev.filter(order => order.id !== event.orderId));
            }
        },
        onError: (error) => {
            console.error('Error de WebSocket en OrderStatusBar:', error);
        }
    });

    // Mostrar automáticamente cuando hay órdenes
    useEffect(() => {
        if (orders.length > 0) {
            setIsVisible(true);
        }
    }, [orders]);

    // Filtrar órdenes activas y listas (no mostrar pagadas)
    const activeOrders = orders.filter(order => order.status === 'ACTIVE');
    const readyOrders = orders.filter(order => order.status === 'READY');
    const totalItems = orders
        .filter(order => order.status !== 'PAID') // Excluir órdenes pagadas
        .reduce((sum, order) =>
            sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0
        );



    // Solo mostrar si hay órdenes activas o listas (no pagadas)
    const relevantOrders = orders.filter(order => order.status !== 'PAID');
    if (relevantOrders.length === 0) {
        return null;
    }

    const getOrderStatusConfig = (status: string) => {
        switch (status) {
            case 'ACTIVE':
                return {
                    bg: 'bg-yellow-100',
                    text: 'text-yellow-800',
                    border: 'border-yellow-200',
                    icon: <ChefHat className="w-4 h-4 text-yellow-600" />
                };
            case 'READY':
                return {
                    bg: 'bg-green-100',
                    text: 'text-green-800',
                    border: 'border-green-200',
                    icon: <CheckCircle className="w-4 h-4 text-green-600" />
                };
            case 'PAID':
                return {
                    bg: 'bg-blue-100',
                    text: 'text-blue-800',
                    border: 'border-blue-200',
                    icon: <CheckCircle className="w-4 h-4 text-blue-600" />
                };
            default:
                return {
                    bg: 'bg-gray-100',
                    text: 'text-gray-800',
                    border: 'border-gray-200',
                    icon: <Clock className="w-4 h-4 text-gray-600" />
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

    return (
        <Card className="mb-4">
            <CardHeader className="pb-2 px-4 py-3">
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="w-full flex items-center justify-between hover:bg-gray-50 p-2 rounded-lg transition-colors"
                >
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                            <ChefHat className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500 flex-shrink-0" />
                            <span className="font-medium text-gray-900 text-sm sm:text-base truncate">
                                {dictionary?.app?.menu?.orderStatus?.title || 'Estado de tu pedido'}
                            </span>
                        </div>

                        <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm flex-wrap">
                            {activeOrders.length > 0 && (
                                <div className="flex items-center gap-1">
                                    <ChefHat className="w-3 h-3 sm:w-4 sm:h-4 text-orange-500 flex-shrink-0" />
                                    <span className="text-orange-600 font-medium">
                                        {activeOrders.length} {dictionary?.app?.menu?.orderStatus?.preparing || 'prep.'}
                                    </span>
                                </div>
                            )}

                            {readyOrders.length > 0 && (
                                <div className="flex items-center gap-1">
                                    <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 flex-shrink-0" />
                                    <span className="text-green-600 font-medium">
                                        {readyOrders.length} {dictionary?.app?.menu?.orderStatus?.ready || 'listo'}
                                    </span>
                                </div>
                            )}

                            <div className="text-gray-500">
                                {totalItems} {dictionary?.app?.menu?.orderStatus?.items || 'items'}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                        {isExpanded ? <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" /> : <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />}
                    </div>
                </button>
            </CardHeader>

            {isExpanded && (
                <CardContent className="pt-0 px-4 pb-4">
                    <div className="space-y-3">
                        {relevantOrders.map((order) => {
                            const statusConfig = getOrderStatusConfig(order.status);
                            const timeElapsed = getTimeElapsedString(order.createdAt);

                            return (
                                <div
                                    key={order.id}
                                    className={`${statusConfig.bg} ${statusConfig.border} border rounded-lg p-3 sm:p-4`}
                                >
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2 sm:mb-3">
                                        <div className="flex items-center gap-2">
                                            {statusConfig.icon}
                                            <span className={`font-medium ${statusConfig.text} text-sm sm:text-base`}>
                                                {order.status === 'ACTIVE' ? (dictionary?.app?.menu?.orderStatus?.inPreparation || 'En preparación') :
                                                    order.status === 'READY' ? (dictionary?.app?.menu?.orderStatus?.readyToPickup || 'Listo para recoger') :
                                                        order.status === 'PAID' ? (dictionary?.app?.menu?.orderStatus?.paid || 'Pagado') : (dictionary?.app?.menu?.orderStatus?.completed || 'Completado')}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline" className="text-xs">
                                                #{order.id.substring(0, 6)}
                                            </Badge>
                                            <span className="text-xs text-gray-500">
                                                {dictionary?.app?.menu?.orderStatus?.ago || 'hace'} {timeElapsed}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="space-y-1.5 sm:space-y-2">
                                        {order.items.map((item, index) => (
                                            <div key={index} className="flex items-center justify-between text-xs sm:text-sm">
                                                <div className="flex items-center gap-2 min-w-0 flex-1">
                                                    <span className="font-medium text-gray-900 flex-shrink-0">
                                                        {item.quantity}x
                                                    </span>
                                                    <span className="text-gray-700 truncate">
                                                        {item.dish.name}
                                                    </span>
                                                </div>
                                                <span className="text-gray-500 flex-shrink-0 ml-2">
                                                    ${(item.quantity * (item.dish.price || 0)).toFixed(2)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-gray-200">
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium text-gray-900 text-sm sm:text-base">{dictionary?.app?.menu?.orderStatus?.total || 'Total'}:</span>
                                            <span className="font-bold text-base sm:text-lg text-gray-900">
                                                ${order.total.toFixed(2)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            )}

            {/* Estado de conexión */}
            {!isConnected && (
                <div className="px-4 pb-3">
                    <div className="p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
                        {dictionary?.app?.menu?.orderStatus?.noConnection || 'Sin conexión - Actualizando estado...'}
                    </div>
                </div>
            )}
        </Card>
    );
} 