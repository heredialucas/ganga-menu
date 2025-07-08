import React from 'react';
import { Dictionary } from '@repo/internationalization';

interface EmptyStateProps {
    searchTerm: string;
    selectedCategory: string;
    showSpecialOnly: boolean;
    onClearFilters: () => void;
    dictionary: Dictionary;
}

export default function EmptyState({
    searchTerm,
    selectedCategory,
    showSpecialOnly,
    onClearFilters,
    dictionary
}: EmptyStateProps) {
    const hasFilters = searchTerm || selectedCategory !== 'all' || showSpecialOnly;

    return (
        <div className="flex items-center justify-center min-h-[60vh] text-center py-12">
            <div>
                <p className="text-gray-500 text-lg">
                    {hasFilters
                        ? (dictionary.web?.menu?.noResults || 'No se encontraron platos con los filtros aplicados.')
                        : (dictionary.web?.menu?.comingSoon || 'Próximamente... Estamos preparando nuestro menú.')
                    }
                </p>
                {hasFilters && (
                    <button
                        onClick={onClearFilters}
                        className="mt-4 px-4 py-2 text-white rounded-lg hover:opacity-90 transition-colors"
                        style={{ backgroundColor: 'var(--theme-bg)', color: 'var(--theme-text)' }}
                    >
                        {dictionary.web?.menu?.clearFilters || 'Limpiar filtros'}
                    </button>
                )}
            </div>
        </div>
    );
} 