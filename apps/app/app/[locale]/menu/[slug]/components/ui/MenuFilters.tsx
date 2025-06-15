import React from 'react';
import { Search } from 'lucide-react';
import { Dictionary } from '@repo/internationalization';

interface Category {
    id: string;
    name: string;
}

interface MenuFiltersProps {
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    selectedCategory: string;
    setSelectedCategory: (category: string) => void;
    showSpecialOnly: boolean;
    setShowSpecialOnly: (show: boolean) => void;
    categories: Category[];
    hasSpecial: boolean;
    dictionary: Dictionary;
}

export default function MenuFilters({
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    showSpecialOnly,
    setShowSpecialOnly,
    categories,
    hasSpecial,
    dictionary
}: MenuFiltersProps) {
    return (
        <section className="bg-white/95 backdrop-blur-md border-b sticky top-0 z-50 shadow-sm transition-all duration-300">
            <div className="max-w-6xl mx-auto px-4 py-4 md:py-6">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    <h2 className="text-xl md:text-2xl font-bold text-gray-900">
                        {dictionary.web?.menu?.title || 'Nuestro Menú'}
                    </h2>

                    <div className="flex flex-col sm:flex-row gap-2 md:gap-3 w-full md:w-auto">
                        {/* Buscador */}
                        <div className="relative">
                            <input
                                type="text"
                                placeholder={dictionary.web?.menu?.searchPlaceholder || 'Buscar platos...'}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full sm:w-48 md:w-64 px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white/80 backdrop-blur-sm"
                            />
                            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                        </div>

                        {/* Filtro por categoría */}
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white/80 backdrop-blur-sm"
                        >
                            <option value="all">
                                {dictionary.web?.menu?.allCategories || 'Todas las categorías'}
                            </option>
                            {categories.map((category) => (
                                <option key={category.id} value={category.id}>
                                    {category.name}
                                </option>
                            ))}
                        </select>

                        {/* Filtro solo especiales */}
                        {hasSpecial && (
                            <button
                                onClick={() => setShowSpecialOnly(!showSpecialOnly)}
                                className={`px-4 py-2 rounded-lg border transition-colors backdrop-blur-sm ${showSpecialOnly
                                    ? 'bg-orange-500 text-white border-orange-500'
                                    : 'bg-white/80 text-gray-700 border-gray-300 hover:bg-gray-50/80'
                                    }`}
                            >
                                {dictionary.web?.menu?.specialsOnly || 'Solo platos del día'}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
} 