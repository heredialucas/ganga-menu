'use client';

import React, { useState } from 'react';
import { Dictionary } from '@repo/internationalization';
import { RestaurantConfigData } from '@repo/data-services/src/services/restaurantConfigService';
import { TableData } from '@repo/data-services/src/services/tableService';
import { useSocket } from '@/hooks/useSocket';
import { createOrderFromMenuAction } from '../actions';
import { env } from '@/env';

// Componentes modulares
import {
    MenuHeader,
    TodaySpecial,
    MenuFilters,
    CategorySection,
    EmptyState,
    MenuFooter,
    OrderCart,
    getThemeColors,
    type Category,
    type Dish
} from './ui';
import { getTemplateStyles } from './ui/templateStyles';
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
    // Determinar si es una vista de mesa específica
    const isTableSpecificView = !!table;
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

    const template = restaurantConfig.template as 'neomorphic' | 'retro-vintage' | 'luxury-premium' | 'playful-fun' | 'zen-minimal' | 'artistic-creative';
    const styles = getTemplateStyles(template);

    return (
        <div className={styles.container}>
            {/* Luxury Background Elements - solo para luxury-premium */}
            {template === 'luxury-premium' && (
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-10 sm:top-20 right-10 sm:right-20 w-48 h-48 sm:w-96 sm:h-96 bg-gradient-to-br from-yellow-600/10 to-amber-600/10 rounded-full blur-2xl sm:blur-3xl"></div>
                    <div className="absolute bottom-10 sm:bottom-20 left-10 sm:left-20 w-40 h-40 sm:w-80 sm:h-80 bg-gradient-to-br from-amber-600/10 to-yellow-600/10 rounded-full blur-2xl sm:blur-3xl"></div>
                </div>
            )}

            {/* Playful Fun Background Elements - solo para playful-fun */}
            {template === 'playful-fun' && (
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-10 sm:top-20 left-10 sm:left-20 text-3xl sm:text-6xl animate-bounce">🎉</div>
                    <div className="absolute top-20 sm:top-40 right-10 sm:right-40 text-2xl sm:text-4xl animate-spin-slow">🌟</div>
                    <div className="absolute bottom-20 sm:bottom-40 left-10 sm:left-40 text-3xl sm:text-5xl animate-pulse">🎈</div>
                    <div className="absolute bottom-10 sm:bottom-20 right-10 sm:right-20 text-2xl sm:text-4xl animate-bounce delay-500">🎊</div>
                    <div className="absolute top-1/2 left-5 sm:left-10 w-12 h-12 sm:w-16 sm:h-16 bg-pink-300 rounded-full animate-bounce"></div>
                    <div className="absolute top-1/3 right-5 sm:right-10 w-8 h-8 sm:w-12 sm:h-12 bg-yellow-300 rounded-full animate-bounce delay-300"></div>
                </div>
            )}

            {/* Zen Minimal Background Elements - solo para zen-minimal */}
            {template === 'zen-minimal' && (
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-20 left-20 w-1 h-16 bg-gray-200"></div>
                    <div className="absolute top-40 right-20 w-1 h-12 bg-gray-200"></div>
                    <div className="absolute bottom-40 left-20 w-1 h-20 bg-gray-200"></div>
                    <div className="absolute bottom-20 right-20 w-1 h-14 bg-gray-200"></div>
                </div>
            )}

            {/* Artistic Creative Background Elements - solo para artistic-creative */}
            {template === 'artistic-creative' && (
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-br from-pink-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-br from-orange-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
                    <div className="absolute top-1/2 left-10 w-2 h-32 bg-gradient-to-b from-pink-400 to-transparent transform rotate-45"></div>
                    <div className="absolute top-1/3 right-20 w-2 h-24 bg-gradient-to-b from-purple-400 to-transparent transform -rotate-12"></div>
                </div>
            )}

            {/* Contenido principal */}
            <div className="relative z-10">
                {/* Header */}
                <MenuHeader
                    restaurantConfig={restaurantConfig}
                    dictionary={dictionary}
                    isTableSpecificView={isTableSpecificView}
                    themeColor={restaurantConfig.themeColor}
                    template={template}
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
                        isTableSpecificView={isTableSpecificView}
                        themeColor={restaurantConfig.themeColor}
                        template={template}
                    />
                )}



                {/* Menu Categories */}
                <main className="px-6 py-8 relative">
                    {/* Estado de órdenes en tiempo real - solo en vista de mesa específica */}
                    {isTableSpecificView && table && (
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
                                    <CategorySection
                                        category={category}
                                        dictionary={dictionary}
                                        restaurantName={restaurantConfig.name}
                                        restaurantPhone={restaurantConfig.phone}
                                        specialDishIds={specialDishIds}
                                        restaurantConfigId={restaurantConfig.id}
                                        onAddToOrder={addToCart}
                                        isTableSpecificView={isTableSpecificView}
                                        themeColor={restaurantConfig.themeColor}
                                        template={template}
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
                    themeColor={restaurantConfig.themeColor}
                    template={template}
                />

                {/* Carrito de compras - solo en vista de mesa específica */}
                {isTableSpecificView && (
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
                )}

                {/* Indicadores de estado - solo en vista de mesa específica */}
                {isTableSpecificView && (
                    <>
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
                    </>
                )}
            </div>
        </div>
    );
} 