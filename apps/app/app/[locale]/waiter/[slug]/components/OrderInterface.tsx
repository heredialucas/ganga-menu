'use client';

import React, { useState } from 'react';
import { Dictionary } from '@repo/internationalization';
import { RestaurantConfigData } from '@repo/data-services/src/services/restaurantConfigService';
import { createOrderAction, getRestaurantOrdersAction, updateOrderStatusAction } from '../actions';
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
    ChevronUp
} from 'lucide-react';

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
    tableNumber: string;
    waiterName?: string | null;
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
    status: 'PENDING' | 'IN_PROGRESS' | 'READY' | 'DELIVERED' | 'CANCELLED';
}

interface OrderInterfaceProps {
    restaurantConfig: RestaurantConfigData;
    categories: Category[];
    dailySpecials: DailySpecial[];
    dictionary: Dictionary;
    existingOrders: SubmittedOrder[];
}

export default function OrderInterface({
    restaurantConfig,
    categories,
    dailySpecials,
    dictionary,
    existingOrders
}: OrderInterfaceProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
    const [tableNumber, setTableNumber] = useState('');
    const [waiterName, setWaiterName] = useState('');
    const [orderNotes, setOrderNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submittedOrders, setSubmittedOrders] = useState<SubmittedOrder[]>(existingOrders);
    const [showOrderConfirmation, setShowOrderConfirmation] = useState(false);
    const [isOrdersExpanded, setIsOrdersExpanded] = useState(false);
    const [addingToOrderId, setAddingToOrderId] = useState<string | null>(null);
    const [orderFilter, setOrderFilter] = useState<'all' | 'pending' | 'in_progress' | 'ready' | 'delivered'>('all');
    const [isUpdatingStatus, setIsUpdatingStatus] = useState<string | null>(null);

    const waiterDict = (dictionary as any).waiter?.order || {};

    // Función para obtener el precio correcto (promocional solo si es especial del día HOY)
    const getCorrectPrice = (dish: Dish): number => {
        // Verificar si el plato es especial del día HOY
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const isSpecialToday = dailySpecials.some(special => {
            const specialDate = new Date(special.date);
            specialDate.setHours(0, 0, 0, 0);
            return special.dish.id === dish.id &&
                specialDate.getTime() === today.getTime() &&
                special.isActive;
        });

        // Solo usar precio promocional si es especial del día HOY y tiene precio promocional
        if (isSpecialToday && dish.promotionalPrice && dish.promotionalPrice > 0) {
            return dish.promotionalPrice;
        }

        return dish.price;
    };

    // Verificar si un plato es especial del día HOY
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
        if (selectedCategory !== 'all' && category.id !== selectedCategory) return false;

        const filteredDishes = category.dishes.filter(dish => {
            if (dish.status !== 'ACTIVE') return false;
            if (searchTerm) {
                return dish.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    dish.description.toLowerCase().includes(searchTerm.toLowerCase());
            }
            return true;
        });

        return filteredDishes.length > 0;
    }).map(category => ({
        ...category,
        dishes: category.dishes.filter(dish => {
            if (dish.status !== 'ACTIVE') return false;
            if (searchTerm) {
                return dish.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    dish.description.toLowerCase().includes(searchTerm.toLowerCase());
            }
            return true;
        })
    }));

    // Funciones del pedido
    const updateQuantity = (dish: Dish, quantity: number) => {
        setOrderItems(prev => {
            if (quantity <= 0) {
                return prev.filter(item => item.dish.id !== dish.id);
            }

            const existingItem = prev.find(item => item.dish.id === dish.id);
            if (existingItem) {
                return prev.map(item =>
                    item.dish.id === dish.id
                        ? { ...item, quantity }
                        : item
                );
            } else {
                return [...prev, { dish, quantity }];
            }
        });
    };

    const updateItemNotes = (dishId: string, notes: string) => {
        setOrderItems(prev =>
            prev.map(item =>
                item.dish.id === dishId
                    ? { ...item, notes }
                    : item
            )
        );
    };

    // Calcular total
    const total = orderItems.reduce((sum, item) => {
        const price = getCorrectPrice(item.dish);
        return sum + (price * item.quantity);
    }, 0);

    // Enviar orden
    const submitOrder = async () => {
        if (orderItems.length === 0 || !tableNumber.trim()) return;

        setIsSubmitting(true);

        try {
            const result = await createOrderAction({
                tableNumber: tableNumber.trim(),
                waiterName: waiterName.trim() || undefined,
                notes: orderNotes.trim() || undefined,
                restaurantConfigId: restaurantConfig.id,
                items: orderItems.map(item => ({
                    dishId: item.dish.id,
                    quantity: item.quantity,
                    notes: item.notes?.trim() || undefined
                }))
            });

            if (result.success && result.order) {
                // Usar la orden real devuelta por la base de datos
                setSubmittedOrders(prev => [result.order as SubmittedOrder, ...prev]);

                // Limpiar formulario
                setOrderItems([]);
                setTableNumber('');
                setWaiterName('');
                setOrderNotes('');
                setAddingToOrderId(null);

                // Mostrar confirmación
                setShowOrderConfirmation(true);
                setTimeout(() => setShowOrderConfirmation(false), 3000);

                // Expandir acordeón si había órdenes
                if (submittedOrders.length === 0) {
                    setIsOrdersExpanded(true);
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

    // Agregar a orden existente
    const addToExistingOrder = (orderId: string) => {
        const order = submittedOrders.find(o => o.id === orderId);
        if (order) {
            setTableNumber(order.tableNumber);
            setWaiterName(order.waiterName || '');
            setAddingToOrderId(orderId);
            setOrderNotes(`Agregar a orden existente - ${order.tableNumber}`);
        }
    };

    const getQuantityForDish = (dish: Dish): number => {
        const item = orderItems.find(item => item.dish.id === dish.id);
        return item ? item.quantity : 0;
    };

    // Filtrar órdenes según el filtro seleccionado
    const filteredOrders = submittedOrders.filter(order => {
        if (orderFilter === 'all') return true;
        if (orderFilter === 'pending') return order.status === 'PENDING';
        if (orderFilter === 'in_progress') return order.status === 'IN_PROGRESS';
        if (orderFilter === 'ready') return order.status === 'READY';
        if (orderFilter === 'delivered') return order.status === 'DELIVERED';
        return true;
    });

    // Actualizar estado de orden
    const updateOrderState = async (orderId: string, newStatus: 'DELIVERED') => {
        setIsUpdatingStatus(orderId);
        try {
            const result = await updateOrderStatusAction(orderId, newStatus);
            if (result.success && result.order) {
                setSubmittedOrders(prev =>
                    prev.map(order =>
                        order.id === orderId
                            ? { ...order, status: newStatus }
                            : order
                    )
                );
            } else {
                alert(result.error || 'Error al actualizar estado');
            }
        } catch (error) {
            console.error('Error updating order:', error);
            alert('Error al actualizar estado');
        } finally {
            setIsUpdatingStatus(null);
        }
    };

    // Función para obtener el color del estado
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING': return 'bg-yellow-100 text-yellow-800';
            case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800';
            case 'READY': return 'bg-green-100 text-green-800';
            case 'DELIVERED': return 'bg-gray-100 text-gray-800';
            case 'CANCELLED': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    // Función para obtener el texto del estado
    const getStatusText = (status: string) => {
        switch (status) {
            case 'PENDING': return waiterDict.statusPending || 'Pendiente';
            case 'IN_PROGRESS': return waiterDict.statusInProgress || 'En preparación';
            case 'READY': return waiterDict.statusReady || 'Listo';
            case 'DELIVERED': return waiterDict.statusDelivered || 'Entregado';
            case 'CANCELLED': return waiterDict.statusCancelled || 'Cancelado';
            default: return status;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b">
                <div className="max-w-4xl mx-auto px-4 py-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                            <ChefHat className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">
                                {waiterDict.title || 'Tomar Orden'}
                            </h1>
                            <p className="text-sm text-gray-600">{restaurantConfig.name}</p>
                        </div>
                    </div>
                </div>
            </header>

            {/* Confirmación de orden */}
            {showOrderConfirmation && (
                <div className="fixed top-4 right-4 bg-green-600 text-white p-4 rounded-lg shadow-lg z-50 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    <span>{waiterDict.orderSent || '¡Orden enviada a la cocina!'}</span>
                </div>
            )}

            <div className="max-w-4xl mx-auto px-4 py-6">
                {/* Acordeón de órdenes enviadas - ARRIBA */}
                {submittedOrders.length > 0 && (
                    <div className="bg-white rounded-lg shadow-sm mb-6">
                        <button
                            onClick={() => setIsOrdersExpanded(!isOrdersExpanded)}
                            className="w-full p-4 flex items-center justify-between hover:bg-gray-50"
                        >
                            <div className="flex items-center gap-3">
                                <Clock className="w-5 h-5 text-blue-600" />
                                <h3 className="text-lg font-semibold text-gray-900">
                                    {waiterDict.submittedOrders || 'Historial de Órdenes'} ({filteredOrders.length})
                                </h3>
                            </div>
                            {isOrdersExpanded ? (
                                <ChevronUp className="w-5 h-5 text-gray-400" />
                            ) : (
                                <ChevronDown className="w-5 h-5 text-gray-400" />
                            )}
                        </button>

                        {isOrdersExpanded && (
                            <div className="border-t">
                                {/* Filtros */}
                                <div className="p-4 border-b bg-gray-50">
                                    <div className="flex gap-2 flex-wrap">
                                        <button
                                            onClick={() => setOrderFilter('all')}
                                            className={`px-3 py-1 rounded-full text-xs font-medium ${orderFilter === 'all'
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                                }`}
                                        >
                                            {waiterDict.filterAll || 'Todas'}
                                        </button>
                                        <button
                                            onClick={() => setOrderFilter('pending')}
                                            className={`px-3 py-1 rounded-full text-xs font-medium ${orderFilter === 'pending'
                                                ? 'bg-yellow-600 text-white'
                                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                                }`}
                                        >
                                            {waiterDict.filterPending || 'Pendientes'}
                                        </button>
                                        <button
                                            onClick={() => setOrderFilter('in_progress')}
                                            className={`px-3 py-1 rounded-full text-xs font-medium ${orderFilter === 'in_progress'
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                                }`}
                                        >
                                            {waiterDict.filterInProgress || 'En preparación'}
                                        </button>
                                        <button
                                            onClick={() => setOrderFilter('ready')}
                                            className={`px-3 py-1 rounded-full text-xs font-medium ${orderFilter === 'ready'
                                                ? 'bg-green-600 text-white'
                                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                                }`}
                                        >
                                            {waiterDict.filterReady || 'Listos'}
                                        </button>
                                        <button
                                            onClick={() => setOrderFilter('delivered')}
                                            className={`px-3 py-1 rounded-full text-xs font-medium ${orderFilter === 'delivered'
                                                ? 'bg-gray-600 text-white'
                                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                                }`}
                                        >
                                            {waiterDict.filterDelivered || 'Entregados'}
                                        </button>
                                    </div>
                                </div>

                                {/* Lista de órdenes con scroll */}
                                <div className="max-h-96 overflow-y-auto">
                                    <div className="p-4 space-y-4">
                                        {filteredOrders.length === 0 ? (
                                            <div className="text-center py-8 text-gray-500">
                                                {waiterDict.noOrdersFound || 'No se encontraron órdenes'}
                                            </div>
                                        ) : (
                                            filteredOrders.map(order => (
                                                <div key={order.id} className="border border-gray-200 rounded-lg p-4">
                                                    <div className="flex justify-between items-start mb-3">
                                                        <div className="flex items-center gap-3">
                                                            <span className="font-medium text-lg">{order.tableNumber}</span>
                                                            {order.waiterName && (
                                                                <span className="text-sm text-gray-600">• {order.waiterName}</span>
                                                            )}
                                                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(order.status)}`}>
                                                                {getStatusText(order.status)}
                                                            </span>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="font-bold text-green-600">${order.total.toFixed(2)}</p>
                                                            <p className="text-xs text-gray-500">
                                                                {new Date(order.createdAt).toLocaleString('es-ES', {
                                                                    day: '2-digit',
                                                                    month: '2-digit',
                                                                    year: 'numeric',
                                                                    hour: '2-digit',
                                                                    minute: '2-digit'
                                                                })}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* Items de la orden */}
                                                    <div className="space-y-2 mb-3">
                                                        {order.items.map(item => (
                                                            <div key={item.id} className="flex justify-between items-start text-sm">
                                                                <div className="flex-1">
                                                                    <span className="font-medium">
                                                                        {item.quantity}x {item.dish.name}
                                                                    </span>
                                                                    {item.notes && (
                                                                        <p className="text-xs text-gray-600 mt-1 italic">
                                                                            "{item.notes}"
                                                                        </p>
                                                                    )}
                                                                </div>
                                                                <span className="text-gray-600 ml-2">
                                                                    ${(item.price * item.quantity).toFixed(2)}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    {/* Botones de acción */}
                                                    <div className="flex gap-2 pt-2 border-t">
                                                        <button
                                                            onClick={() => addToExistingOrder(order.id)}
                                                            className="flex-1 text-xs bg-blue-100 text-blue-700 px-3 py-2 rounded hover:bg-blue-200 font-medium"
                                                        >
                                                            + {waiterDict.addDishes || 'Agregar platos'}
                                                        </button>
                                                        {(order.status === 'READY' || order.status === 'PENDING') && (
                                                            <button
                                                                onClick={() => updateOrderState(order.id, 'DELIVERED')}
                                                                disabled={isUpdatingStatus === order.id}
                                                                className="flex-1 text-xs bg-green-100 text-green-700 px-3 py-2 rounded hover:bg-green-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                                            >
                                                                {isUpdatingStatus === order.id
                                                                    ? (waiterDict.updating || 'Actualizando...')
                                                                    : (waiterDict.markDelivered || 'Marcar Entregado')
                                                                }
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Información de la orden */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                            {addingToOrderId ?
                                `${waiterDict.addToOrder || 'Agregar a Orden'} - ${tableNumber}` :
                                (waiterDict.orderInfo || 'Nueva Orden')
                            }
                        </h3>
                        {addingToOrderId && (
                            <button
                                onClick={() => {
                                    setAddingToOrderId(null);
                                    setTableNumber('');
                                    setWaiterName('');
                                    setOrderNotes('');
                                    setOrderItems([]);
                                }}
                                className="text-sm text-gray-500 hover:text-gray-700"
                            >
                                Cancelar
                            </button>
                        )}
                    </div>

                    <div className="grid md:grid-cols-3 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {waiterDict.table || 'Mesa'} *
                            </label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <input
                                    type="text"
                                    value={tableNumber}
                                    onChange={(e) => setTableNumber(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Ej: Mesa 5"
                                    required
                                    disabled={!!addingToOrderId}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {waiterDict.waiterName || 'Nombre del Mozo'}
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <input
                                    type="text"
                                    value={waiterName}
                                    onChange={(e) => setWaiterName(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Nombre opcional"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {waiterDict.total || 'Total'}
                            </label>
                            <div className="text-2xl font-bold text-green-600 py-1">
                                ${total.toFixed(2)}
                            </div>
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {waiterDict.orderNotes || 'Notas de la orden'}
                        </label>
                        <textarea
                            value={orderNotes}
                            onChange={(e) => setOrderNotes(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            rows={2}
                            placeholder="Notas especiales..."
                        />
                    </div>

                    {orderItems.length > 0 && (
                        <button
                            onClick={submitOrder}
                            disabled={isSubmitting || !tableNumber.trim()}
                            className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {isSubmitting ? 'Enviando...' :
                                addingToOrderId ?
                                    (waiterDict.addToOrder || 'Agregar a Orden') :
                                    (waiterDict.submit || 'Enviar Orden')
                            }
                        </button>
                    )}
                </div>

                {/* Filtros */}
                <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder={waiterDict.search || 'Buscar platos...'}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                            >
                                <option value="all">{waiterDict.all || 'Todos'}</option>
                                {categories.map(category => (
                                    <option key={category.id} value={category.id}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Lista de platos */}
                <div className="space-y-6 mb-8">
                    {filteredCategories.map(category => (
                        <div key={category.id} className="bg-white rounded-lg shadow-sm">
                            <div className="p-4 border-b">
                                <h3 className="text-lg font-semibold text-gray-900">
                                    {category.name}
                                </h3>
                                {category.description && (
                                    <p className="text-sm text-gray-600 mt-1">
                                        {category.description}
                                    </p>
                                )}
                            </div>

                            <div className="p-4">
                                <div className="space-y-4">
                                    {category.dishes.map(dish => {
                                        const quantity = getQuantityForDish(dish);
                                        const price = getCorrectPrice(dish);
                                        const isSpecial = isSpecialToday(dish);
                                        const hasPromotion = isSpecial && dish.promotionalPrice && dish.promotionalPrice > 0;

                                        return (
                                            <div key={dish.id} className="border border-gray-200 rounded-lg p-4">
                                                <div className="flex justify-between items-start mb-3">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <h4 className="font-medium text-gray-900">{dish.name}</h4>
                                                            {isSpecial && (
                                                                <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                                                                    Especial del día
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-sm text-gray-600 mb-2">{dish.description}</p>
                                                    </div>

                                                    <div className="text-right ml-4">
                                                        {hasPromotion ? (
                                                            <>
                                                                <p className="text-lg font-bold text-green-600">
                                                                    ${dish.promotionalPrice?.toFixed(2)}
                                                                </p>
                                                                <p className="text-sm text-gray-500 line-through">
                                                                    ${dish.price.toFixed(2)}
                                                                </p>
                                                            </>
                                                        ) : (
                                                            <p className="text-lg font-bold text-gray-900">
                                                                ${dish.price.toFixed(2)}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <button
                                                            onClick={() => updateQuantity(dish, quantity - 1)}
                                                            disabled={quantity === 0}
                                                            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 disabled:opacity-50"
                                                        >
                                                            <Minus className="w-4 h-4" />
                                                        </button>
                                                        <span className="font-medium text-lg w-8 text-center">{quantity}</span>
                                                        <button
                                                            onClick={() => updateQuantity(dish, quantity + 1)}
                                                            className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center hover:bg-blue-200"
                                                        >
                                                            <Plus className="w-4 h-4" />
                                                        </button>
                                                    </div>

                                                    {quantity > 0 && (
                                                        <div className="flex items-center gap-3">
                                                            <input
                                                                type="text"
                                                                placeholder="Notas..."
                                                                value={orderItems.find(item => item.dish.id === dish.id)?.notes || ''}
                                                                onChange={(e) => updateItemNotes(dish.id, e.target.value)}
                                                                className="px-3 py-1 border border-gray-300 rounded text-sm w-32"
                                                            />
                                                            <span className="font-bold text-green-600">
                                                                ${(price * quantity).toFixed(2)}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}