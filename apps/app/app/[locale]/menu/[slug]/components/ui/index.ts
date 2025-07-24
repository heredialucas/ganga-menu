// Componentes
export { default as MenuHeader } from './MenuHeader';
export { default as TodaySpecial } from './TodaySpecial';
export { default as MenuFilters } from './MenuFilters';
export { default as CategorySection } from './CategorySection';
export { default as DishCard } from './DishCard';
export { default as EmptyState } from './EmptyState';
export { default as MenuFooter } from './MenuFooter';
export { default as DecorativeElements } from './DecorativeElements';
export { default as ImageModal } from './ImageModal';
export { default as OrderCart } from './OrderCart';

// Tipos
export type { Category, Dish, ThemeColors } from './types';

// Tipos de templates centralizados
export type {
    TemplateType,
    TemplateConfig,
    TemplateStyles,
    BaseTemplateProps,
    MenuHeaderProps,
    TodaySpecialProps,
    CategorySectionProps,
    MenuFooterProps,
    DishCardProps,
    ImageModalProps,
    OrderCartProps,
    OrderStatusBarProps,
    MenuFiltersProps,
    EmptyStateProps,
    getDefaultTemplate,
    isValidTemplate
} from '../../types/templates';

// Utilidades
export { getThemeColors } from './utils'; 