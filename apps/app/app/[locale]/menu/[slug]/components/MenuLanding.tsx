'use client';

import React, { useState } from 'react';
import { Dictionary } from '@repo/internationalization';
import { RestaurantConfigData } from '@repo/data-services/src/services/restaurantConfigService';

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
    getThemeColors,
    type Category,
    type Dish
} from './ui';

interface TodaySpecialType {
    id: string;
    date: Date;
    isActive: boolean;
    dish: Dish;
}

interface MenuLandingProps {
    locale: string;
    slug: string;
    restaurantConfig: RestaurantConfigData;
    categories: Category[];
    todaySpecial: TodaySpecialType | null;
    todaySpecials: TodaySpecialType[];
    dictionary: Dictionary;
}

export default function MenuLanding({
    locale,
    slug,
    restaurantConfig,
    categories,
    todaySpecial,
    todaySpecials,
    dictionary
}: MenuLandingProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [showSpecialOnly, setShowSpecialOnly] = useState(false);

    const themeColors = getThemeColors(restaurantConfig.themeColor || '#16a34a');

    // Crear Set de IDs de platos especiales para identificar cuáles mostrar con precio promocional
    const specialDishIds = new Set(todaySpecials.map(special => special.dish.id));

    // Función para limpiar filtros
    const clearFilters = () => {
        setSearchTerm('');
        setSelectedCategory('all');
        setShowSpecialOnly(false);
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
            </div>
        </div>
    );
} 