import React from 'react';
import Image from 'next/image';
import DishCard from './DishCard';
import { Dictionary } from '@repo/internationalization';
import { Category } from './types';
import { getTemplateStyles } from './templateStyles';
import { CategorySectionProps, getDefaultTemplate } from '../../types/templates';

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

export default function CategorySection({ category, dictionary, restaurantName, restaurantPhone, specialDishIds, restaurantConfigId, onAddToOrder, isTableSpecificView = false, themeColor = '#16a34a', template = getDefaultTemplate() }: CategorySectionProps) {
    if (category.dishes.length === 0) return null;
    const styles = getTemplateStyles(template);

    return (
        <section className={styles.section}>
            <div className="w-full max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        {category.imageUrl && (
                            <div className={styles.logo}>
                                <Image
                                    src={category.imageUrl}
                                    alt={category.name}
                                    width={48}
                                    height={48}
                                    className="object-cover rounded-xl"
                                />
                            </div>
                        )}
                        <div>
                            <h3 className={styles.title}>{category.name}</h3>
                            {category.description && (
                                <p className={styles.subtitle}>{category.description}</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Dishes Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {category.dishes.length > 0 ? (
                        category.dishes.map((dish: Dish) => (
                            <DishCard
                                key={dish.id}
                                dish={dish}
                                dictionary={dictionary}
                                restaurantName={restaurantName}
                                restaurantPhone={restaurantPhone}
                                specialDishIds={specialDishIds}
                                restaurantConfigId={restaurantConfigId}
                                onAddToOrder={onAddToOrder}
                                isTableSpecificView={isTableSpecificView}
                                themeColor={themeColor}
                                template={template}
                            />
                        ))
                    ) : (
                        <div className="col-span-full text-center py-8">
                            <p className="text-gray-500">
                                {dictionary.web?.menu?.categories?.noDishes || 'No hay platos disponibles en esta categoría'}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
} 