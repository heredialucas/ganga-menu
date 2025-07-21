import React from 'react';
import Image from 'next/image';
import DishCard from './DishCard';
import { Dictionary } from '@repo/internationalization';
import { Category } from './types';

interface Dish {
    id: string;
    name: string;
    description: string;
    price: number;
    imageUrl?: string | null;
    status: string;
    order: number;
    category?: {
        name: string;
    } | null;
}

interface CategorySectionProps {
    category: Category;
    dictionary: Dictionary;
    restaurantName: string;
    restaurantPhone?: string | null;
    specialDishIds: Set<string>;
    restaurantConfigId: string;
    onAddToOrder?: (dishId: string, quantity: number) => void;
}

export default function CategorySection({ category, dictionary, restaurantName, restaurantPhone, specialDishIds, restaurantConfigId, onAddToOrder }: CategorySectionProps) {
    if (category.dishes.length === 0) return null;

    return (
        <section className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-white/20 relative">
            {/* Category Header con gradientes temáticos */}
            <div className={`p-6 relative overflow-hidden`} style={{ background: 'var(--gradient-category)', color: 'var(--theme-text)' }}>
                {/* Gradientes animados de fondo */}
                <div className="absolute inset-0">
                    {/* Gradiente base con movimiento */}
                    <div className={`absolute inset-0 animate-pulse`} style={{ background: 'var(--gradient-overlay)' }}></div>

                    {/* Gradientes animados múltiples */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"></div>
                    <div className="absolute inset-0 bg-gradient-to-l from-transparent via-white/5 to-transparent animate-shimmer" style={{ animationDelay: '1s', animationDuration: '3s' }}></div>

                    {/* Gradiente de brillo superior */}
                    <div className="absolute inset-0 bg-gradient-to-b from-white/15 via-transparent to-black/10"></div>
                </div>

                <div className="flex items-center gap-4 relative z-10">
                    {category.imageUrl && (
                        <div className="w-16 h-16 relative rounded-xl overflow-hidden shadow-lg ring-2 ring-white/30">
                            <Image
                                src={category.imageUrl}
                                alt={category.name}
                                fill
                                className="object-cover"
                                sizes="64px"
                            />
                        </div>
                    )}
                    <div>
                        <h3 className="text-2xl font-bold drop-shadow-lg">{category.name}</h3>
                        {category.description && (
                            <p className="text-lg opacity-90 drop-shadow-md">{category.description}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Dishes Grid */}
            <div className="p-4 sm:p-6">
                {category.dishes.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                        {category.dishes.map((dish) => (
                            <DishCard
                                key={dish.id}
                                dish={dish}
                                dictionary={dictionary}
                                restaurantName={restaurantName}
                                restaurantPhone={restaurantPhone}
                                specialDishIds={specialDishIds}
                                restaurantConfigId={restaurantConfigId}
                                onAddToOrder={onAddToOrder}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <p className="text-gray-500">
                            {dictionary.web?.menu?.categories?.noDishes || 'No hay platos disponibles en esta categoría'}
                        </p>
                    </div>
                )}
            </div>
        </section>
    );
} 