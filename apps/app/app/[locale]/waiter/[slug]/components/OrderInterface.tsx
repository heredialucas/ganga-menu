'use client';

import React, { useState, useEffect } from 'react';
import { Dictionary } from '@repo/internationalization';
import { RestaurantConfigData } from '@repo/data-services/src/services/restaurantConfigService';
import { createOrderAction, updateOrderStatusAction, markTableAsPaidAction } from '../actions';
import { toast } from 'sonner';
import { useSocket } from '@/hooks/useSocket';
import {
    Plus,
    Minus,
    Search,
    Filter,
    User,
    MapPin,
    ChefHat,
    CheckCircle,
    Clock,
    ChevronDown,
    ChevronUp,
    Wifi,
    WifiOff,
    X
} from 'lucide-react';
import { Card, CardHeader, CardContent, CardFooter } from '@repo/design-system/components/ui/card';
import { Badge } from '@repo/design-system/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@repo/design-system/components/ui/dialog';
import { Button } from '@repo/design-system/components/ui/button';
import { env } from '@/env';

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

interface DailySpecial {
    id: string;
    date: Date;
    isActive: boolean;
    dish: Dish;
}

interface OrderItem {
    dish: Dish;
    quantity: number;
    notes?: string;
}

interface SubmittedOrder {
    id: string;
    table: { id: string; label: string; } | null;
    waiterName?: string | null;
    notes?: string | null;
    total: number;
    items: {
        id: string;
        quantity: number;
        price: number;
        notes?: string | null;
        dish: {
            id: string;
            name: string;
            description: string;
            price: number;
            imageUrl?: string | null;
        };
    }[];
    createdAt: Date;
    status: 'ACTIVE' | 'READY' | 'CANCELLED' | 'PAID';
}

interface OrderInterfaceProps {
    restaurantConfig: RestaurantConfigData;
    categories: Category[];
    dailySpecials: DailySpecial[];
    dictionary: Dictionary;
    existingOrders: SubmittedOrder[];
    tables: { id: string; label: string; }[];
    onOrdersUpdate?: (orders: SubmittedOrder[]) => void;
    isConnected?: boolean;
}

export default function OrderInterface({
    restaurantConfig,
    categories,
    dailySpecials,
    dictionary,
    existingOrders,
    tables,
    onOrdersUpdate,
    isConnected = false,
}: OrderInterfaceProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
    const [tableId, setTableId] = useState(tables[0]?.id || '');

    // Asegurar que siempre haya una mesa seleccionada si hay mesas disponibles
    useEffect(() => {
        if (tables.length > 0 && (!tableId || !tables.find(t => t.id === tableId))) {
            setTableId(tables[0].id);
        }
    }, [tables, tableId]);
    const [waiterName, setWaiterName] = useState('');
    const [orderNotes, setOrderNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submittedOrders, setSubmittedOrders] = useState<SubmittedOrder[]>(existingOrders);
    const [showOrderConfirmation, setShowOrderConfirmation] = useState(false);
    const [isOrdersExpanded, setIsOrdersExpanded] = useState(true); // Default to expanded
    const [isTakingOrderExpanded, setIsTakingOrderExpanded] = useState(false);
    const [isTablesExpanded, setIsTablesExpanded] = useState(false);
    const [expandedTables, setExpandedTables] = useState<Set<string>>(new Set());
    const [addingToOrderId, setAddingToOrderId] = useState<string | null>(null);
    const [orderFilter, setOrderFilter] = useState<'all' | 'active' | 'ready' | 'delivered'>('all');
    const [isUpdatingStatus, setIsUpdatingStatus] = useState<string | null>(null);
    const [isMarkingAsPaid, setIsMarkingAsPaid] = useState<string | null>(null);
    const [showPaymentDialog, setShowPaymentDialog] = useState(false);
    const [pendingTableId, setPendingTableId] = useState<string | null>(null);

    const waiterDict = dictionary.web?.waiter?.order || {};

    // Estado para sincronizar con el componente padre
    const [pendingOrdersUpdate, setPendingOrdersUpdate] = useState<SubmittedOrder[] | null>(null);

    // WebSocket connection para tiempo real
    const { updateOrderStatus, socket, isConnected: socketConnected } = useSocket({
        restaurantSlug: restaurantConfig.slug,
        roomType: 'waiter',
        onOrderEvent: (event) => {
            if (event.type === 'ORDER_CREATED') {
                const newOrder = event.order;
                setSubmittedOrders(prev => {
                    // Verificar si la orden ya existe para evitar duplicados
                    const orderExists = prev.some(order => order.id === newOrder.id);
                    if (orderExists) {
                        return prev;
                    }
                    const updatedOrders = [newOrder, ...prev];
                    setPendingOrdersUpdate(updatedOrders);
                    return updatedOrders;
                });
            } else if (event.type === 'ORDER_STATUS_CHANGED') {
                setSubmittedOrders(prev => {
                    const updatedOrders = prev.map(order =>
                        order.id === event.order.id ? { ...order, status: event.order.status, updatedAt: event.order.updatedAt } : order
                    );
                    setPendingOrdersUpdate(updatedOrders);
                    return updatedOrders;
                });
            } else if (event.type === 'ORDER_DELETED') {
                setSubmittedOrders(prev => {
                    const updatedOrders = prev.filter(order => order.id !== event.orderId);
                    setPendingOrdersUpdate(updatedOrders);
                    return updatedOrders;
                });
            }
        },
        onError: (error) => {
            console.error('Error de WebSocket en waiter:', error);
        }
    });

    // Efecto para sincronizar con el componente padre de manera asíncrona
    useEffect(() => {
        if (pendingOrdersUpdate && onOrdersUpdate) {
            onOrdersUpdate(pendingOrdersUpdate);
            setPendingOrdersUpdate(null);
        }
    }, [pendingOrdersUpdate, onOrdersUpdate]);



    // Efecto para limpiar el carrito cuando se cierra el acordeón de tomar orden
    useEffect(() => {
        if (!isTakingOrderExpanded) {
            // Limpiar el carrito cuando se cierra el acordeón
            setOrderItems([]);
            setAddingToOrderId(null);
            setTableId(tables[0]?.id || '');
            setWaiterName('');
            setOrderNotes('');
        }
    }, [isTakingOrderExpanded, tables]);

    const getOrderConfig = (status: SubmittedOrder['status']) => {
        switch (status) {
            case 'ACTIVE':
                return {
                    bg: 'bg-yellow-50', blob: 'bg-yellow-200', accent: 'bg-yellow-500',
                    text: waiterDict.active || 'Activa', borderColor: 'border-yellow-200'
                };
            case 'READY':
                return {
                    bg: 'bg-green-50', blob: 'bg-green-200', accent: 'bg-green-500',
                    text: waiterDict.readyDelivered || 'Lista/Entregada', borderColor: 'border-green-200'
                };
            case 'CANCELLED':
                return {
                    bg: 'bg-red-50', blob: 'bg-red-200', accent: 'bg-red-700',
                    text: waiterDict.cancelled || 'Cancelada', borderColor: 'border-red-300'
                };
            case 'PAID':
                return {
                    bg: 'bg-blue-50', blob: 'bg-blue-200', accent: 'bg-blue-500',
                    text: waiterDict.paid || 'Pagada', borderColor: 'border-blue-200'
                };
            default:
                return {
                    bg: 'bg-gray-50', blob: 'bg-gray-200', accent: 'bg-gray-500',
                    text: status, borderColor: 'border-gray-200'
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
        return `${diffHours}h ${diffMinutes % 60}m`;
    };

    // Función para obtener el precio correcto (promocional solo si es especial del día HOY)
    const getCorrectPrice = (dish: Dish): number => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const isSpecialToday = dailySpecials.some(special => {
            const specialDate = new Date(special.date);
            specialDate.setHours(0, 0, 0, 0);
            return special.dish.id === dish.id &&
                specialDate.getTime() === today.getTime() &&
                special.isActive;
        });

        if (isSpecialToday && dish.promotionalPrice && dish.promotionalPrice > 0) {
            return dish.promotionalPrice;
        }
        return dish.price;
    };

    const isSpecialToday = (dish: Dish): boolean => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return dailySpecials.some(special => {
            const specialDate = new Date(special.date);
            specialDate.setHours(0, 0, 0, 0);
            return special.dish.id === dish.id &&
                specialDate.getTime() === today.getTime() &&
                special.isActive;
        });
    };

    // Filtrar platos
    const filteredCategories = categories.filter(category => {
        const filteredDishes = category.dishes.filter(dish =>
            dish.status === 'ACTIVE' &&
            (!searchTerm || dish.name.toLowerCase().includes(searchTerm.toLowerCase()) || dish.description.toLowerCase().includes(searchTerm.toLowerCase()))
        );
        return filteredDishes.length > 0 && (selectedCategory === 'all' || category.id === selectedCategory);
    }).map(category => ({
        ...category,
        dishes: category.dishes.filter(dish =>
            dish.status === 'ACTIVE' &&
            (!searchTerm || dish.name.toLowerCase().includes(searchTerm.toLowerCase()) || dish.description.toLowerCase().includes(searchTerm.toLowerCase()))
        )
    }));

    const updateQuantity = (dish: Dish, quantity: number) => {
        setOrderItems(prev => {
            if (quantity <= 0) return prev.filter(item => item.dish.id !== dish.id);
            const existingItem = prev.find(item => item.dish.id === dish.id);
            if (existingItem) return prev.map(item => item.dish.id === dish.id ? { ...item, quantity } : item);
            return [...prev, { dish, quantity }];
        });
    };

    const updateItemNotes = (dishId: string, notes: string) => {
        setOrderItems(prev => prev.map(item => item.dish.id === dishId ? { ...item, notes } : item));
    };

    const total = orderItems.reduce((sum, item) => sum + (getCorrectPrice(item.dish) * item.quantity), 0);

    const submitOrder = async () => {
        if (orderItems.length === 0 || !tableId.trim()) return;
        setIsSubmitting(true);

        const orderData = {
            tableId,
            waiterName: waiterName.trim() || undefined,
            notes: orderNotes.trim() || undefined,
            restaurantConfigId: restaurantConfig.id,
            items: orderItems.map(item => ({
                dishId: item.dish.id,
                quantity: item.quantity,
                notes: item.notes?.trim() || undefined
            }))
        };

        console.log('Enviando orden:', orderData);

        try {
            const result = await createOrderAction(orderData);
            console.log('Resultado de createOrderAction:', result);
            if (result.success && result.order) {
                setSubmittedOrders(prev => [result.order, ...prev]);
                setOrderItems([]);
                setTableId(tables[0]?.id || '');
                setWaiterName('');
                setOrderNotes('');
                setAddingToOrderId(null);
                setShowOrderConfirmation(true);
                setTimeout(() => setShowOrderConfirmation(false), 3000);

                // Sincronizar con WebSocket server
                try {
                    const response = await fetch(`${env.NEXT_PUBLIC_SOCKET_IO_URL}/sync-orders`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            restaurantSlug: restaurantConfig.slug,
                            orders: [result.order]
                        })
                    });

                    if (!response.ok) {
                        console.warn('No se pudo sincronizar con WebSocket server');
                    }
                } catch (error) {
                    console.warn('Error sincronizando con WebSocket:', error);
                }
            } else {
                alert(result.error || waiterDict.error || 'Error al enviar la orden');
            }
        } catch (error) {
            console.error('Error enviando orden:', error);
            alert(waiterDict.error || 'Error al enviar la orden');
        } finally {
            setIsSubmitting(false);
        }
    };

    const addToExistingOrder = (orderId: string) => {
        const order = submittedOrders.find(o => o.id === orderId);
        if (order && order.table) {
            setTableId(order.table.id);
            setWaiterName(order.waiterName || '');
            setAddingToOrderId(orderId);
            setOrderNotes(`${waiterDict.addToOrder || 'Nueva orden'} para ${order.table.label}`);
            // Abrir el acordeón de "Tomar Orden" para que el mozo pueda agregar nuevos platos
            setIsTakingOrderExpanded(true);
        }
    };

    const getQuantityForDish = (dish: Dish): number => orderItems.find(item => item.dish.id === dish.id)?.quantity || 0;

    const filteredOrders = submittedOrders.filter(order => {
        // Excluir órdenes pagadas y canceladas del acordeón de órdenes
        if (order.status === 'PAID' || order.status === 'CANCELLED') return false;

        if (orderFilter === 'all') return true;
        if (orderFilter === 'active') return order.status === 'ACTIVE';
        if (orderFilter === 'ready') return order.status === 'READY';
        if (orderFilter === 'delivered') return order.status === 'READY';
        return false;
    });

    // Agrupar órdenes por mesa (todas las órdenes de cada mesa)
    const ordersByTable = tables.map(table => {
        const tableOrders = submittedOrders.filter(order =>
            order.table?.id === table.id
        );
        return {
            table,
            orders: tableOrders,
            totalAmount: tableOrders.reduce((sum, order) => sum + order.total, 0)
        };
    }).filter(tableData => tableData.orders.length > 0);

    const updateOrderState = async (orderId: string, newStatus: 'READY') => {
        setIsUpdatingStatus(orderId);
        try {
            const result = await updateOrderStatusAction(orderId, newStatus);
            if (result.success && result.order) {
                setSubmittedOrders(prev => prev.map(order => order.id === orderId ? { ...order, status: newStatus } : order));

                // Emitir evento al WebSocket para sincronizar con otras vistas
                if (socket && socketConnected) {
                    socket.emit('order_status_changed', {
                        restaurantSlug: restaurantConfig.slug,
                        order: result.order
                    });
                }

                toast.success(waiterDict.markDelivered || 'Orden marcada como entregada correctamente');
            } else {
                toast.error(result.error || (waiterDict.updating || 'Error al actualizar estado'));
            }
        } catch (error) {
            console.error('Error updating order:', error);
            toast.error(waiterDict.updating || 'Error al actualizar estado');
        } finally {
            setIsUpdatingStatus(null);
        }
    };

    const markTableAsPaid = async (tableId: string) => {
        setIsMarkingAsPaid(tableId);
        try {
            const result = await markTableAsPaidAction(tableId);
            if (result.success && result.orders) {
                // Actualizar todas las órdenes de esa mesa a PAID
                setSubmittedOrders(prev => prev.map(order =>
                    order.table?.id === tableId && (order.status === 'ACTIVE' || order.status === 'READY')
                        ? { ...order, status: 'PAID' }
                        : order
                ));

                // Emitir eventos al WebSocket para cada orden actualizada con datos completos
                result.orders.forEach(order => {
                    if (socket && socketConnected) {
                        socket.emit('order_status_changed', {
                            restaurantSlug: restaurantConfig.slug,
                            order: order
                        });
                    }
                });

                toast.success(result.message || (waiterDict.releaseTable || 'Mesa marcada como pagada correctamente'));
            } else {
                toast.error(result.error || (waiterDict.releaseTable || 'Error al marcar mesa como pagada'));
            }
        } catch (error) {
            console.error('Error marking table as paid:', error);
            toast.error(waiterDict.releaseTable || 'Error al marcar mesa como pagada');
        } finally {
            setIsMarkingAsPaid(null);
            setShowPaymentDialog(false);
            setPendingTableId(null);
        }
    };

    const toggleTableExpanded = (tableId: string) => {
        setExpandedTables(prev => {
            const newSet = new Set(prev);
            if (newSet.has(tableId)) {
                newSet.delete(tableId);
            } else {
                newSet.add(tableId);
            }
            return newSet;
        });
    };

    const handleMarkTableAsPaid = (tableId: string) => {
        setPendingTableId(tableId);
        setShowPaymentDialog(true);
    };

    const confirmMarkTableAsPaid = () => {
        if (pendingTableId) {
            markTableAsPaid(pendingTableId);
        }
    };

    const FilterButton = ({ filter, label, count }: { filter: typeof orderFilter, label: string, count: number }) => (
        <button
            onClick={() => setOrderFilter(filter)}
            className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${orderFilter === filter
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
        >
            <span className="hidden sm:inline">{label}</span>
            <span className="sm:hidden">{label.charAt(0)}</span> ({count})
        </button>
    );

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow-sm border-b">
                <div className="max-w-4xl mx-auto px-4 py-3 sm:py-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
                        <div className="flex items-center gap-2 sm:gap-3">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                                <ChefHat className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <h1 className="text-lg sm:text-xl font-bold text-gray-900 truncate">{waiterDict.title || 'Tomar Orden'}</h1>
                                <p className="text-xs sm:text-sm text-gray-600 truncate">{restaurantConfig.name}</p>
                            </div>
                        </div>

                        {/* Estado de conexión WebSocket */}
                        <div className="flex items-center gap-2">
                            {isConnected ? (
                                <Badge variant="default" className="bg-green-500 text-xs sm:text-sm">
                                    <Wifi className="w-3 h-3 mr-1" />
                                    <span className="hidden sm:inline">{dictionary.web?.orders?.connection?.connected || 'Conectado'}</span>
                                </Badge>
                            ) : (
                                <Badge variant="destructive" className="text-xs sm:text-sm">
                                    <WifiOff className="w-3 h-3 mr-1" />
                                    <span className="hidden sm:inline">{dictionary.web?.orders?.connection?.disconnected || 'Desconectado'}</span>
                                </Badge>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {showOrderConfirmation && (
                <div className="fixed bottom-4 right-4 bg-green-600 text-white p-4 rounded-lg shadow-lg z-50 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    <span>{waiterDict.orderSent || '¡Orden enviada a la cocina!'}</span>
                </div>
            )}

            <div className="max-w-4xl mx-auto px-4 py-4 sm:py-6">
                {submittedOrders.length > 0 && (
                    <Card className="bg-white rounded-lg shadow-sm mb-6">
                        <button
                            onClick={() => setIsOrdersExpanded(!isOrdersExpanded)}
                            className="w-full p-3 sm:p-4 flex items-center justify-between hover:bg-gray-50"
                        >
                            <div className="flex items-center gap-2 sm:gap-3">
                                <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                                <h3 className="text-base sm:text-lg font-semibold text-gray-900">{waiterDict.submittedOrders || 'Órdenes'}</h3>
                            </div>
                            {isOrdersExpanded ? <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" /> : <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />}
                        </button>

                        {isOrdersExpanded && (
                            <div className="border-t">
                                <div className="p-3 sm:p-4 border-b bg-gray-50">
                                    <div className="flex gap-1 sm:gap-2 flex-wrap">
                                        <FilterButton filter="all" label={dictionary.web?.orders?.filters?.all || "Todas"} count={submittedOrders.filter(o => o.status !== 'PAID' && o.status !== 'CANCELLED').length} />
                                        <FilterButton filter="active" label={dictionary.web?.orders?.filters?.active || "Activas"} count={submittedOrders.filter(o => o.status === 'ACTIVE').length} />
                                        <FilterButton filter="ready" label={dictionary.web?.orders?.filters?.ready || "Listas"} count={submittedOrders.filter(o => o.status === 'READY').length} />
                                        <FilterButton filter="delivered" label={dictionary.web?.orders?.filters?.ready || "Entregadas"} count={submittedOrders.filter(o => o.status === 'READY').length} />

                                    </div>
                                </div>
                                <div className="max-h-96 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4">
                                    {filteredOrders.length === 0 ? (
                                        <div className="text-center py-8 text-gray-500">{waiterDict.noOrdersFound || 'No se encontraron órdenes'}</div>
                                    ) : (
                                        filteredOrders.map(order => {
                                            const config = getOrderConfig(order.status);
                                            return (
                                                <Card key={order.id} className={`${config.bg} ${config.borderColor} border-2 relative overflow-hidden`}>
                                                    <div className={`absolute -top-4 -right-4 w-20 h-16 ${config.blob} opacity-20 r-blob`}></div>
                                                    <div className={`absolute -bottom-2 -left-2 w-12 h-10 ${config.blob} opacity-15 r-blob`}></div>
                                                    <CardHeader className="pb-3 relative z-10">
                                                        <div className="flex items-center justify-between">
                                                            <div className={`${config.accent} text-white px-3 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm font-medium r-blob-b`}>{config.text}</div>
                                                            <span className="text-xs sm:text-sm font-mono bg-white px-2 py-1 rounded-full border">#{order.id.substring(0, 5)}</span>
                                                        </div>
                                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0 mt-2">
                                                            <h3 className="font-bold text-lg sm:text-xl text-gray-800">{waiterDict.table || 'Mesa'} {order.table?.label || (waiterDict.counter || 'Mostrador')}</h3>
                                                            <span className="text-xs sm:text-sm text-gray-500">{waiterDict.timeElapsed || 'hace'} {getTimeElapsedString(order.createdAt)}</span>
                                                        </div>
                                                        {order.waiterName && <p className="text-xs text-gray-600 mt-1">{waiterDict.by || 'Por:'} {order.waiterName}</p>}
                                                    </CardHeader>
                                                    <CardContent className="relative z-10">
                                                        <div className="space-y-2">
                                                            {order.items.map((item, index) => (
                                                                <div key={item.id || `item-${index}`} className="flex justify-between items-start text-xs sm:text-sm">
                                                                    <div className="flex-1 min-w-0">
                                                                        <span className="font-medium text-gray-800">
                                                                            {item.quantity}x {item.dish?.name || (dictionary.web?.orders?.table?.dishNotAvailable || 'Plato no disponible')}
                                                                        </span>
                                                                        {item.notes && <p className="text-xs text-gray-600 mt-1 italic">"{item.notes}"</p>}
                                                                    </div>
                                                                    <span className="text-gray-700 ml-2 font-mono flex-shrink-0">${(item.price * item.quantity).toFixed(2)}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </CardContent>
                                                    <CardFooter className="relative z-10 flex-col items-start gap-3 pt-4 border-t">
                                                        <div className="w-full flex justify-between items-center"><p className="text-base sm:text-lg font-bold text-green-700">{waiterDict.total || 'Total'}: ${(order.total || 0).toFixed(2)}</p></div>
                                                        <div className="w-full flex flex-col sm:flex-row gap-2 pt-2 border-t">
                                                            {(order.status === 'ACTIVE' || order.status === 'READY') && (
                                                                <button onClick={() => addToExistingOrder(order.id)} className="flex-1 text-xs bg-blue-100 text-blue-700 px-2 sm:px-3 py-2 rounded hover:bg-blue-200 font-medium">+ {waiterDict.addDishes || 'Agregar platos'}</button>
                                                            )}
                                                            {(order.status === 'READY' || order.status === 'ACTIVE') && (
                                                                <button onClick={() => updateOrderState(order.id, 'READY')} disabled={isUpdatingStatus === order.id} className="flex-1 text-xs bg-green-100 text-green-700 px-2 sm:px-3 py-2 rounded hover:bg-green-200 font-medium disabled:opacity-50">{isUpdatingStatus === order.id ? (waiterDict.updating || '...') : (waiterDict.markDelivered || 'Marcar Entregado')}</button>
                                                            )}
                                                            {(order.status === 'ACTIVE' || order.status === 'READY') && order.table && (
                                                                <button
                                                                    onClick={() => handleMarkTableAsPaid(order.table!.id)}
                                                                    disabled={isMarkingAsPaid === order.table!.id}
                                                                    className="flex-1 text-xs bg-purple-100 text-purple-700 px-2 sm:px-3 py-2 rounded hover:bg-purple-200 font-medium disabled:opacity-50"
                                                                >
                                                                    {isMarkingAsPaid === order.table!.id ? (waiterDict.marking || 'Marcando...') : <span className="hidden sm:inline">{waiterDict.releaseTable || 'Marcar toda la mesa como pagada'}</span>}
                                                                </button>
                                                            )}
                                                        </div>
                                                    </CardFooter>
                                                </Card>
                                            )
                                        })
                                    )}
                                </div>
                            </div>
                        )}
                    </Card>
                )}

                {/* Acordeón para tomar órdenes */}
                <Card className="bg-white rounded-lg shadow-sm mb-6">
                    <button
                        onClick={() => setIsTakingOrderExpanded(!isTakingOrderExpanded)}
                        className="w-full p-3 sm:p-4 flex items-center justify-between hover:bg-gray-50"
                    >
                        <div className="flex items-center gap-2 sm:gap-3">
                            <ChefHat className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                            <h3 className="text-base sm:text-lg font-semibold text-gray-900">{waiterDict.title || 'Tomar Orden'}</h3>
                        </div>
                        {isTakingOrderExpanded ? <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" /> : <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />}
                    </button>

                    {isTakingOrderExpanded && (
                        <div className="border-t">
                            <div className="p-3 sm:p-4">
                                <Card className="relative overflow-hidden border-2 border-gray-200 bg-white/50 shadow-sm mb-6">
                                    <div className={`absolute -top-8 -left-8 w-40 h-32 bg-blue-200 opacity-15 r-blob`}></div>
                                    <CardContent className="p-4 sm:p-6 relative z-10">
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mb-4">
                                            <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                                                {addingToOrderId ? `${waiterDict.addToOrder || 'Nueva Orden'} - ${tables.find(t => t.id === tableId)?.label}` : (waiterDict.orderInfo || 'Nueva Orden')}
                                            </h3>
                                            {addingToOrderId && (
                                                <button
                                                    onClick={() => {
                                                        setAddingToOrderId(null);
                                                        setTableId(tables[0]?.id || '');
                                                        setWaiterName('');
                                                        setOrderNotes('');
                                                        setOrderItems([]);
                                                    }}
                                                    className="text-xs sm:text-sm text-gray-500 hover:text-gray-700 self-start sm:self-center"
                                                >
                                                    {waiterDict.cancel || 'Cancelar'}
                                                </button>
                                            )}
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-4">
                                            <div>
                                                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">{waiterDict.table || 'Mesa'} *</label>
                                                <div className="relative"><MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" /><select value={tableId} onChange={(e) => setTableId(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm" required disabled={!!addingToOrderId}>{tables.map(table => <option key={table.id} value={table.id}>{waiterDict.table || 'Mesa'} {table.label}</option>)}</select></div>
                                            </div>
                                            <div>
                                                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">{waiterDict.waiterName || 'Nombre Mozo'}</label>
                                                <div className="relative"><User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" /><input type="text" value={waiterName} onChange={(e) => setWaiterName(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm" placeholder={waiterDict.optional || "Opcional"} /></div>
                                            </div>
                                            <div className="sm:col-span-2 lg:col-span-1">
                                                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">{waiterDict.total || 'Total'}</label>
                                                <div className="text-xl sm:text-2xl font-bold text-green-600 py-1">${total.toFixed(2)}</div>
                                            </div>
                                        </div>

                                        {/* Cantidades de platos seleccionados */}
                                        {orderItems.length > 0 && (
                                            <div className="mb-4">
                                                <h4 className="text-xs sm:text-sm font-medium text-gray-700 mb-3">{waiterDict.quantitiesAndNotes || 'Cantidades y Notas:'}</h4>
                                                <div className="space-y-2 max-h-40 overflow-y-auto">
                                                    {orderItems.map((item) => {
                                                        const price = getCorrectPrice(item.dish);
                                                        const isSpecial = isSpecialToday(item.dish);
                                                        const hasPromotion = isSpecial && item.dish.promotionalPrice && item.dish.promotionalPrice > 0;
                                                        const finalPrice = hasPromotion ? item.dish.promotionalPrice! : item.dish.price;

                                                        return (
                                                            <div key={item.dish.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-2 bg-gray-50 rounded-lg border gap-2">
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="flex items-center gap-2">
                                                                        <h5 className="font-medium text-gray-900 text-xs sm:text-sm truncate">{item.dish.name}</h5>
                                                                        {isSpecial && (
                                                                            <span className="bg-yellow-100 text-yellow-800 text-xs px-1 py-0.5 rounded-full shrink-0">
                                                                                {waiterDict.special || 'Especial'}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    <div className="flex items-center gap-2 mt-1">
                                                                        <span className="text-xs text-gray-600">${finalPrice.toFixed(2)} {waiterDict.perUnit || 'c/u'}</span>
                                                                        <span className="text-xs font-bold text-green-600">{waiterDict.totalLabel || 'Total:'} ${(finalPrice * item.quantity).toFixed(2)}</span>
                                                                    </div>
                                                                </div>

                                                                <div className="flex items-center gap-2 shrink-0">
                                                                    <div className="flex items-center gap-1">
                                                                        <button
                                                                            onClick={() => updateQuantity(item.dish, item.quantity - 1)}
                                                                            disabled={item.quantity <= 1}
                                                                            className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 disabled:opacity-50"
                                                                        >
                                                                            <Minus className="w-3 h-3" />
                                                                        </button>
                                                                        <span className="font-medium text-xs sm:text-sm w-6 text-center">{item.quantity}</span>
                                                                        <button
                                                                            onClick={() => updateQuantity(item.dish, item.quantity + 1)}
                                                                            className="w-5 h-5 rounded-full bg-blue-200 flex items-center justify-center hover:bg-blue-300"
                                                                        >
                                                                            <Plus className="w-3 h-3" />
                                                                        </button>
                                                                    </div>

                                                                    <input
                                                                        type="text"
                                                                        placeholder={waiterDict.notes || "Notas..."}
                                                                        value={item.notes || ''}
                                                                        onChange={(e) => updateItemNotes(item.dish.id, e.target.value)}
                                                                        className="px-2 py-1 border border-gray-300 rounded text-xs w-16 sm:w-20"
                                                                    />

                                                                    <button
                                                                        onClick={() => updateQuantity(item.dish, 0)}
                                                                        className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center hover:bg-red-200 text-red-600"
                                                                    >
                                                                        <X className="w-3 h-3" />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}

                                        {orderNotes.trim() && (
                                            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-sm font-medium text-blue-800">{waiterDict.generalNotes || 'Notas generales:'}</span>
                                                </div>
                                                <p className="text-sm text-blue-700 italic">"{orderNotes}"</p>
                                            </div>
                                        )}

                                        {orderItems.length > 0 ? (
                                            <button
                                                onClick={submitOrder}
                                                disabled={isSubmitting || !tableId.trim()}
                                                className="w-full bg-green-600 text-white py-2 sm:py-3 px-4 rounded-lg font-medium hover:bg-green-700 focus:ring-2 focus:ring-green-500 disabled:opacity-50 text-sm sm:text-base"
                                            >
                                                {isSubmitting ? (waiterDict.marking || 'Marcando...') : addingToOrderId ? (waiterDict.addToOrder || 'Agregar a Orden') : (waiterDict.submit || 'Enviar Orden')}
                                            </button>
                                        ) : (
                                            <div className="text-center py-4 text-gray-500">
                                                <p className="text-xs sm:text-sm">{waiterDict.addToCart || 'Agrega platos al carrito para crear una orden'}</p>
                                            </div>
                                        )}
                                        {orderItems.length > 0 && !tableId.trim() && (
                                            <div className="text-center py-2 text-red-500">
                                                <p className="text-sm">{waiterDict.selectTable || 'Selecciona una mesa para continuar'}</p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Configuración de la orden */}
                                <Card className="relative overflow-hidden border-2 border-gray-200 bg-white/50 shadow-sm p-3 sm:p-4 mb-6">
                                    <div className={`absolute top-4 right-4 w-12 h-10 bg-blue-200 opacity-15 r-blob`}></div>
                                    <div className="flex flex-col gap-3 sm:gap-4 relative z-10">
                                        <div className="relative flex-1">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                            <input
                                                type="text"
                                                placeholder={waiterDict.search || 'Buscar platos...'}
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                                            />
                                        </div>
                                        <div className="flex flex-col sm:flex-row gap-2">
                                            <input
                                                type="text"
                                                placeholder={waiterDict.generalNotesPlaceholder || "Notas generales..."}
                                                value={orderNotes}
                                                onChange={(e) => setOrderNotes(e.target.value)}
                                                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 flex-1 min-w-0 text-sm"
                                            />
                                            <select
                                                value={selectedCategory}
                                                onChange={(e) => setSelectedCategory(e.target.value)}
                                                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white text-sm"
                                            >
                                                <option value="all">{waiterDict.all || 'Todas las categorías'}</option>
                                                {categories.map(category => (
                                                    <option key={category.id} value={category.id}>{category.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </Card>

                                {/* Lista simple de platos - Solo selección */}
                                <Card className="relative overflow-hidden border-2 border-gray-200 bg-white/50 shadow-sm mb-8">
                                    <div className={`absolute bottom-0 -right-4 w-20 h-20 bg-blue-200 opacity-10 r-blob`}></div>
                                    <CardHeader className="p-3 sm:p-4 border-b">
                                        <h3 className="text-base sm:text-lg font-semibold text-gray-900">{waiterDict.selectDishes || 'Seleccionar Platos'}</h3>
                                    </CardHeader>
                                    <CardContent className="p-3 sm:p-4">
                                        <div className="space-y-2">
                                            {filteredCategories.flatMap(category => category.dishes).map(dish => {
                                                const quantity = getQuantityForDish(dish);
                                                const price = getCorrectPrice(dish);
                                                const isSpecial = isSpecialToday(dish);
                                                const hasPromotion = isSpecial && dish.promotionalPrice && dish.promotionalPrice > 0;
                                                const isSelected = quantity > 0;

                                                return (
                                                    <div
                                                        key={dish.id}
                                                        className={`flex items-center justify-between p-2 sm:p-3 rounded-lg border transition-colors cursor-pointer ${isSelected
                                                            ? 'bg-blue-50 border-blue-300'
                                                            : 'bg-white/70 border-gray-200 hover:bg-gray-50'
                                                            }`}
                                                        onClick={() => updateQuantity(dish, isSelected ? 0 : 1)}
                                                    >
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-1 sm:gap-2">
                                                                <h4 className="font-medium text-gray-900 truncate text-sm sm:text-base">{dish.name}</h4>
                                                                {isSpecial && (
                                                                    <span className="bg-yellow-100 text-yellow-800 text-xs px-1 sm:px-2 py-0.5 sm:py-1 rounded-full shrink-0">
                                                                        {waiterDict.special || 'Especial'}
                                                                    </span>
                                                                )}
                                                                {isSelected && (
                                                                    <span className="bg-blue-100 text-blue-800 text-xs px-1 sm:px-2 py-0.5 sm:py-1 rounded-full shrink-0">
                                                                        {waiterDict.selected || 'Seleccionado'}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="text-xs sm:text-sm text-gray-600 truncate">{dish.description}</p>
                                                        </div>

                                                        <div className="flex items-center gap-2 sm:gap-3 ml-2 sm:ml-4 shrink-0">
                                                            <div className="text-right">
                                                                {hasPromotion ? (
                                                                    <>
                                                                        <p className="text-xs sm:text-sm font-bold text-green-600">${dish.promotionalPrice?.toFixed(2)}</p>
                                                                        <p className="text-xs text-gray-500 line-through">${dish.price.toFixed(2)}</p>
                                                                    </>
                                                                ) : (
                                                                    <p className="text-xs sm:text-sm font-bold text-gray-900">${dish.price.toFixed(2)}</p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    )}
                </Card>

                {/* Acordeón para Mesas y Pagos */}
                <Card className="bg-white rounded-lg shadow-sm mb-6">
                    <button
                        onClick={() => setIsTablesExpanded(!isTablesExpanded)}
                        className="w-full p-3 sm:p-4 flex items-center justify-between hover:bg-gray-50"
                    >
                        <div className="flex items-center gap-2 sm:gap-3">
                            <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                            <h3 className="text-base sm:text-lg font-semibold text-gray-900">{waiterDict.tablesAndOrders || 'Mesas y Órdenes Finalizadas'}</h3>
                            {ordersByTable.length > 0 && (
                                <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs sm:text-sm">
                                    {ordersByTable.length} {ordersByTable.length === 1 ? (waiterDict.tablesWithOrders || 'mesa con órdenes finalizadas') : (waiterDict.tablesWithOrdersPlural || 'mesas con órdenes finalizadas')}
                                </Badge>
                            )}
                        </div>
                        {isTablesExpanded ? <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" /> : <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />}
                    </button>

                    {isTablesExpanded && (
                        <div className="border-t">
                            <div className="p-3 sm:p-4">
                                {ordersByTable.length === 0 ? (
                                    <div className="text-center py-6 sm:py-8 text-gray-500">
                                        <MapPin className="w-10 h-10 sm:w-12 sm:h-12 mx-auto text-gray-300 mb-3 sm:mb-4" />
                                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">{waiterDict.noTablesWithOrders || 'No hay mesas con órdenes finalizadas'}</h3>
                                        <p className="text-xs sm:text-sm">{waiterDict.noTablesWithOrdersDesc || 'Las mesas con órdenes pagadas o canceladas aparecerán aquí para liberarlas.'}</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {ordersByTable.map(({ table, orders, totalAmount }) => {
                                            const isTableExpanded = expandedTables.has(table.id);

                                            return (
                                                <Card key={table.id} className="border-2 border-blue-200 bg-blue-50/30 relative overflow-hidden">
                                                    <div className="absolute -top-4 -right-4 w-20 h-16 bg-blue-200 opacity-20 rounded-full"></div>
                                                    <div className="absolute -bottom-2 -left-2 w-12 h-10 bg-blue-200 opacity-15 rounded-full"></div>

                                                    <button
                                                        onClick={() => toggleTableExpanded(table.id)}
                                                        className="w-full p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-blue-50/50 transition-colors gap-3"
                                                    >
                                                        <div className="flex items-center gap-2 sm:gap-3">
                                                            <div className="bg-blue-500 text-white px-3 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm font-medium rounded-lg">
                                                                {waiterDict.table || 'Mesa'} {table.label}
                                                            </div>
                                                            <Badge variant="outline" className="bg-blue-100 text-blue-800 text-xs sm:text-sm">
                                                                {orders.length} {orders.length === 1 ? (waiterDict.order || 'orden') : (waiterDict.orderPlural || 'órdenes')}
                                                            </Badge>
                                                        </div>
                                                        <div className="flex items-center gap-2 sm:gap-3">
                                                            <div className="text-right">
                                                                <p className="text-xs sm:text-sm text-gray-600">{waiterDict.totalFinalized || 'Total Finalizado'}</p>
                                                                <p className="text-base sm:text-lg lg:text-2xl font-bold text-blue-600">${totalAmount.toFixed(2)}</p>
                                                            </div>
                                                            {isTableExpanded ? <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" /> : <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />}
                                                        </div>
                                                    </button>

                                                    {isTableExpanded && (
                                                        <div className="border-t border-blue-200">
                                                            <CardContent className="p-4 relative z-10">
                                                                <div className="space-y-3 mb-4">
                                                                    {orders.map((order) => {
                                                                        const isPaid = order.status === 'PAID';
                                                                        const isCancelled = order.status === 'CANCELLED';

                                                                        return (
                                                                            <div key={order.id} className={`bg-white/70 rounded-lg p-3 border ${isPaid ? 'border-blue-200' : 'border-red-200'}`}>
                                                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-2">
                                                                                    <div className="flex items-center gap-2 flex-wrap">
                                                                                        <span className={`text-sm font-mono px-2 py-1 rounded ${isPaid ? 'bg-blue-100' : 'bg-red-100'}`}>
                                                                                            #{order.id.substring(0, 6)}
                                                                                        </span>
                                                                                        <span className="text-sm text-gray-600">{waiterDict.timeElapsed || 'hace'} {getTimeElapsedString(order.createdAt)}</span>
                                                                                        {isPaid && (
                                                                                            <Badge variant="outline" className="bg-green-100 text-green-800 text-xs">
                                                                                                {waiterDict.paid || 'Pagada'}
                                                                                            </Badge>
                                                                                        )}
                                                                                        {isCancelled && (
                                                                                            <Badge variant="outline" className="bg-red-100 text-red-800 text-xs">
                                                                                                {waiterDict.cancelled || 'Cancelada'}
                                                                                            </Badge>
                                                                                        )}
                                                                                    </div>
                                                                                    <span className={`font-bold ${isPaid ? 'text-green-600' : 'text-red-600'} text-right`}>${order.total.toFixed(2)}</span>
                                                                                </div>

                                                                                <div className="space-y-1">
                                                                                    {order.items.map((item, index) => (
                                                                                        <div key={item.id || `item-${index}`} className="flex justify-between items-center text-sm">
                                                                                            <span className="text-gray-700">
                                                                                                {item.quantity}x {item.dish?.name || (dictionary.web?.orders?.table?.dishNotAvailable || 'Plato no disponible')}
                                                                                            </span>
                                                                                            <span className="text-gray-600 font-mono">${(item.price * item.quantity).toFixed(2)}</span>
                                                                                        </div>
                                                                                    ))}
                                                                                </div>

                                                                                {order.notes && (
                                                                                    <div className="mt-2 pt-2 border-t border-gray-200">
                                                                                        <p className="text-xs text-gray-600 italic">"{order.notes}"</p>
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>

                                                                <div className="flex gap-2 pt-3 border-t border-blue-200">
                                                                    <button
                                                                        onClick={() => handleMarkTableAsPaid(table.id)}
                                                                        disabled={isMarkingAsPaid === table.id}
                                                                        className="flex-1 bg-blue-600 text-white py-2 px-3 sm:px-4 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 disabled:opacity-50 flex items-center justify-center gap-2 text-xs sm:text-sm"
                                                                    >
                                                                        {isMarkingAsPaid === table.id ? (
                                                                            <>
                                                                                <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                                                <span className="hidden sm:inline">{waiterDict.releasingTable || 'Liberando...'}</span>
                                                                                <span className="sm:hidden">{waiterDict.releasingTableMobile || '...'}</span>
                                                                            </>
                                                                        ) : (
                                                                            <>
                                                                                <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                                                                                <span className="hidden sm:inline">{waiterDict.releaseTable || 'Liberar Mesa'}</span>
                                                                                <span className="sm:hidden">{waiterDict.releaseTableMobile || 'Liberar'}</span>
                                                                            </>
                                                                        )}
                                                                    </button>
                                                                </div>
                                                            </CardContent>
                                                        </div>
                                                    )}
                                                </Card>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </Card>

                {/* Dialog de confirmación para marcar mesa como pagada */}
                <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>{waiterDict.confirmPayment || 'Confirmar pago de mesa'}</DialogTitle>
                            <DialogDescription>
                                {waiterDict.confirmPaymentDesc || '¿Estás seguro de que quieres marcar toda la mesa como pagada? Esta acción marcará todas las órdenes activas y listas de esta mesa como pagadas.'}
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="flex flex-col sm:flex-row gap-2">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setShowPaymentDialog(false);
                                    setPendingTableId(null);
                                }}
                                className="w-full sm:w-auto"
                            >
                                {waiterDict.cancel || 'Cancelar'}
                            </Button>
                            <Button
                                onClick={confirmMarkTableAsPaid}
                                disabled={isMarkingAsPaid === pendingTableId}
                                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
                            >
                                {isMarkingAsPaid === pendingTableId ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                        {waiterDict.marking || 'Marcando...'}
                                    </>
                                ) : (
                                    waiterDict.confirmPaymentButton || 'Confirmar Pago'
                                )}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}