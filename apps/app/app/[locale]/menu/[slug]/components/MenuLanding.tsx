'use client';

import React, { useState, useEffect } from 'react';
import { Dictionary } from '@repo/internationalization';
import { RestaurantConfigData } from '@repo/data-services/src/services/restaurantConfigService';
import { TableData } from '@repo/data-services/src/services/tableService';
import { useSocket } from '@/hooks/useSocket';
import { Clock } from 'lucide-react';
import { createOrderFromMenuAction } from '../actions';

// Componentes modulares
import {
    MenuHeader,
    TodaySpecial,
    MenuFilters,
    CategorySection,
    EmptyState,
    MenuFooter,
    DecorativeElements,
    SnowParticlesWrapper,
    OrderCart,
    getThemeColors,
    type Category,
    type Dish
} from './ui';
import OrderStatusBar from './ui/OrderStatusBar';

interface TodaySpecialType {
    id: string;
    date: Date;
    isActive: boolean;
    dish: Dish;
}

interface CartItem {
    dish: Dish;
    quantity: number;
}

interface MenuLandingProps {
    locale: string;
    slug: string;
    restaurantConfig: RestaurantConfigData;
    categories: Category[];
    todaySpecial: TodaySpecialType | null;
    todaySpecials: TodaySpecialType[];
    dictionary: Dictionary;
    table?: TableData; // Mesa específica (opcional para compatibilidad)
}

export default function MenuLanding({
    locale,
    slug,
    restaurantConfig,
    categories,
    todaySpecial,
    todaySpecials,
    dictionary,
    table
}: MenuLandingProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [showSpecialOnly, setShowSpecialOnly] = useState(false);
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [orderStatus, setOrderStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

    // WebSocket connection
    const { isConnected, createOrder } = useSocket({
        restaurantSlug: slug,
        roomType: 'menu',
        onOrderEvent: (event) => {
            console.log('Orden actualizada en tiempo real:', event);
        },
        onError: (error) => {
            console.error('Error de WebSocket:', error);
            setOrderStatus('error');
        }
    });

    const themeColors = getThemeColors(restaurantConfig.themeColor || '#16a34a');

    // Crear Set de IDs de platos especiales para identificar cuáles mostrar con precio promocional
    const specialDishIds = new Set(todaySpecials.map(special => special.dish.id));

    // Función para limpiar filtros
    const clearFilters = () => {
        setSearchTerm('');
        setSelectedCategory('all');
        setShowSpecialOnly(false);
    };

    // Funciones del carrito
    const addToCart = (dishId: string, quantity: number) => {
        const dish = categories
            .flatMap(cat => cat.dishes)
            .find(d => d.id === dishId);

        if (!dish) return;

        setCartItems(prev => {
            const existingItem = prev.find(item => item.dish.id === dishId);
            if (existingItem) {
                return prev.map(item =>
                    item.dish.id === dishId
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            } else {
                return [...prev, { dish, quantity }];
            }
        });
    };

    const removeFromCart = (dishId: string) => {
        setCartItems(prev => prev.filter(item => item.dish.id !== dishId));
    };

    const updateCartQuantity = (dishId: string, quantity: number) => {
        if (quantity <= 0) {
            removeFromCart(dishId);
            return;
        }

        setCartItems(prev => prev.map(item =>
            item.dish.id === dishId ? { ...item, quantity } : item
        ));
    };

    const placeOrder = async (notes?: string) => {
        if (!table) {
            alert('No se ha especificado una mesa para el pedido.');
            return;
        }

        setOrderStatus('loading');

        try {
            const orderData = {
                tableId: table.id,
                waiterName: undefined,
                notes,
                restaurantConfigId: restaurantConfig.id,
                items: cartItems.map(item => ({
                    dishId: item.dish.id,
                    quantity: item.quantity,
                    notes: undefined
                }))
            };

            // Crear orden en la base de datos
            const result = await createOrderFromMenuAction(orderData);

            if (result.success && result.order) {
                // Sincronizar con WebSocket server
                try {
                    const response = await fetch(`${process.env.NEXT_PUBLIC_SOCKET_IO_URL || 'http://localhost:3001'}/sync-orders`, {
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
                } catch (syncError) {
                    console.warn('Error sincronizando con WebSocket:', syncError);
                }

                setCartItems([]); // Limpiar carrito
                setOrderStatus('success');

                // Mostrar mensaje de éxito
                setTimeout(() => {
                    setOrderStatus('idle');
                }, 3000);
            } else {
                console.error('Error al crear orden:', result.error);
                setOrderStatus('error');
            }
        } catch (error) {
            console.error('Error al crear orden:', error);
            setOrderStatus('error');
        }
    };



    // Filtrar categorías y platos
    const filteredCategories = categories.filter(category => {
        if (selectedCategory !== 'all' && category.id !== selectedCategory) return false;

        const filteredDishes = category.dishes.filter(dish => {
            if (showSpecialOnly) {
                return todaySpecial && dish.id === todaySpecial.dish.id;
            }
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
            if (showSpecialOnly) {
                return todaySpecial && dish.id === todaySpecial.dish.id;
            }
            if (searchTerm) {
                return dish.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    dish.description.toLowerCase().includes(searchTerm.toLowerCase());
            }
            return true;
        })
    }));

    return (
        <div className="min-h-screen bg-gray-50 relative" style={themeColors.cssVariables}>
            {/* Elementos decorativos de fondo como en web-base */}
            <DecorativeElements
                variant="background"
                className="fixed inset-0 z-0 pointer-events-none"
            />

            {/* Partículas de nieve animadas */}
            <SnowParticlesWrapper
                count={70}
            />

            {/* Contenido principal */}
            <div className="relative z-10">
                {/* Header */}
                <MenuHeader
                    restaurantConfig={restaurantConfig}
                    dictionary={dictionary}
                />

                {/* Filters */}
                <MenuFilters
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    selectedCategory={selectedCategory}
                    setSelectedCategory={setSelectedCategory}
                    showSpecialOnly={showSpecialOnly}
                    setShowSpecialOnly={setShowSpecialOnly}
                    categories={categories}
                    hasSpecial={!!todaySpecial}
                    dictionary={dictionary}
                />

                {/* Today's Special */}
                {todaySpecial && (
                    <TodaySpecial
                        todaySpecial={todaySpecial}
                        dictionary={dictionary}
                        restaurantName={restaurantConfig.name}
                        restaurantPhone={restaurantConfig.phone}
                    />
                )}



                {/* Menu Categories */}
                <main className="max-w-6xl mx-auto px-4 py-8 relative">
                    <DecorativeElements
                        variant="section"
                    />

                    {/* Estado de órdenes en tiempo real */}
                    {table && (
                        <OrderStatusBar
                            table={table}
                            restaurantSlug={slug}
                            restaurantConfigId={restaurantConfig.id}
                        />
                    )}

                    {filteredCategories.length === 0 ? (
                        <EmptyState
                            searchTerm={searchTerm}
                            selectedCategory={selectedCategory}
                            showSpecialOnly={showSpecialOnly}
                            onClearFilters={clearFilters}
                            dictionary={dictionary}
                        />
                    ) : (
                        <div className="space-y-12">
                            {filteredCategories.map((category, index) => (
                                <div key={category.id} className="relative">
                                    {/* Elementos decorativos alternados para cada categoría */}
                                    {index % 2 === 0 && (
                                        <DecorativeElements
                                            variant="minimal"
                                        />
                                    )}
                                    <CategorySection
                                        category={category}
                                        dictionary={dictionary}
                                        restaurantName={restaurantConfig.name}
                                        restaurantPhone={restaurantConfig.phone}
                                        specialDishIds={specialDishIds}
                                        restaurantConfigId={restaurantConfig.id}
                                        onAddToOrder={addToCart}
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </main>

                {/* Footer */}
                <MenuFooter
                    restaurantConfig={restaurantConfig}
                    dictionary={dictionary}
                />

                {/* Carrito de compras */}
                <OrderCart
                    items={cartItems}
                    onRemoveItem={removeFromCart}
                    onUpdateQuantity={updateCartQuantity}
                    onPlaceOrder={placeOrder}
                    dictionary={dictionary}
                    restaurantConfigId={restaurantConfig.id}
                    table={table}
                    todaySpecials={todaySpecials}
                />

                {/* Indicador de estado de conexión */}
                {!isConnected && (
                    <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
                        Sin conexión
                    </div>
                )}

                {/* Indicador de estado de orden */}
                {orderStatus === 'loading' && (
                    <div className="fixed bottom-4 left-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
                        Enviando pedido...
                    </div>
                )}

                {orderStatus === 'success' && (
                    <div className="fixed bottom-4 left-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
                        ¡Pedido enviado con éxito!
                    </div>
                )}

                {orderStatus === 'error' && (
                    <div className="fixed bottom-4 left-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
                        Error al enviar pedido
                    </div>
                )}
            </div>
        </div>
    );
} 