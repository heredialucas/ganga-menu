// Tipos centralizados para templates
export type TemplateType = 'neomorphic' | 'retro-vintage' | 'luxury-premium' | 'playful-fun' | 'zen-minimal' | 'artistic-creative';

// Configuración de templates disponibles
export interface TemplateConfig {
    id: TemplateType;
    name: string;
    description: string;
    preview: string;
    className: string;
}

export const AVAILABLE_TEMPLATES: TemplateConfig[] = [
    {
        id: 'neomorphic',
        name: 'Neomórfico',
        description: 'Diseño moderno con efectos de sombras suaves y profundidad',
        preview: '/templates/neomorphic-preview.png',
        className: 'template-neomorphic'
    },
    {
        id: 'retro-vintage',
        name: 'Retro Vintage',
        description: 'Estilo clásico con colores cálidos y elementos vintage',
        preview: '/templates/retro-vintage-preview.png',
        className: 'template-retro-vintage'
    },
    {
        id: 'luxury-premium',
        name: 'Luxury Premium',
        description: 'Diseño exclusivo con elementos dorados y premium',
        preview: '/templates/luxury-premium-preview.png',
        className: 'template-luxury-premium'
    },
    {
        id: 'playful-fun',
        name: 'Playful Fun',
        description: 'Diseño divertido y colorido con elementos lúdicos',
        preview: '/templates/playful-fun-preview.png',
        className: 'template-playful-fun'
    },
    {
        id: 'zen-minimal',
        name: 'Zen Minimal',
        description: 'Diseño minimalista zen con elementos japoneses',
        preview: '/templates/zen-minimal-preview.png',
        className: 'template-zen-minimal'
    },
    {
        id: 'artistic-creative',
        name: 'Artistic Creative',
        description: 'Diseño artístico y creativo con elementos visuales únicos',
        preview: '/templates/artistic-creative-preview.png',
        className: 'template-artistic-creative'
    }
];

// Función para obtener templates según el idioma
export const getTemplatesByLanguage = (locale: string) => {
    const templates = {
        'es': [
            {
                id: 'neomorphic' as TemplateType,
                name: 'Neomórfico',
                description: 'Diseño moderno con efectos de sombras suaves y profundidad'
            },
            {
                id: 'retro-vintage' as TemplateType,
                name: 'Retro Vintage',
                description: 'Estilo clásico con colores cálidos y elementos vintage'
            },
            {
                id: 'luxury-premium' as TemplateType,
                name: 'Luxury Premium',
                description: 'Diseño exclusivo con elementos dorados y premium'
            },
            {
                id: 'playful-fun' as TemplateType,
                name: 'Playful Fun',
                description: 'Diseño divertido y colorido con elementos lúdicos'
            },
            {
                id: 'zen-minimal' as TemplateType,
                name: 'Zen Minimal',
                description: 'Diseño minimalista zen con elementos japoneses'
            },
            {
                id: 'artistic-creative' as TemplateType,
                name: 'Artistic Creative',
                description: 'Diseño artístico y creativo con elementos visuales únicos'
            }
        ],
        'en': [
            {
                id: 'neomorphic' as TemplateType,
                name: 'Neomorphic',
                description: 'Modern design with soft shadows and depth effects'
            },
            {
                id: 'retro-vintage' as TemplateType,
                name: 'Retro Vintage',
                description: 'Classic style with warm colors and vintage elements'
            },
            {
                id: 'luxury-premium' as TemplateType,
                name: 'Luxury Premium',
                description: 'Exclusive design with golden and premium elements'
            },
            {
                id: 'playful-fun' as TemplateType,
                name: 'Playful Fun',
                description: 'Fun and colorful design with playful elements'
            },
            {
                id: 'zen-minimal' as TemplateType,
                name: 'Zen Minimal',
                description: 'Minimalist zen design with Japanese elements'
            },
            {
                id: 'artistic-creative' as TemplateType,
                name: 'Artistic Creative',
                description: 'Artistic and creative design with unique visual elements'
            }
        ],
        'de': [
            {
                id: 'neomorphic' as TemplateType,
                name: 'Neomorphisch',
                description: 'Modernes Design mit weichen Schatten und Tiefeneffekten'
            },
            {
                id: 'retro-vintage' as TemplateType,
                name: 'Retro Vintage',
                description: 'Klassischer Stil mit warmen Farben und Vintage-Elementen'
            },
            {
                id: 'luxury-premium' as TemplateType,
                name: 'Luxus Premium',
                description: 'Exklusives Design mit goldenen und Premium-Elementen'
            },
            {
                id: 'playful-fun' as TemplateType,
                name: 'Verspielter Spaß',
                description: 'Spaßiges und farbenfrohes Design mit verspielten Elementen'
            },
            {
                id: 'zen-minimal' as TemplateType,
                name: 'Zen Minimal',
                description: 'Minimalistisches Zen-Design mit japanischen Elementen'
            },
            {
                id: 'artistic-creative' as TemplateType,
                name: 'Künstlerisch Kreativ',
                description: 'Künstlerisches und kreatives Design mit einzigartigen visuellen Elementen'
            }
        ]
    };

    return templates[locale as keyof typeof templates] || templates['en'];
};

// Estilos de templates
export interface TemplateStyles {
    container: string;
    header: string;
    headerContent: string;
    logo: string;
    title: string;
    subtitle: string;
    infoCard: string;
    button: string;
    buttonPrimary: string;
    buttonSecondary: string;
    section: string;
    card: string;
    cardHeader: string;
    cardContent: string;
    badge: string;
    price: string;
    promotionalPrice: string;
    footer: string;
    footerCard: string;
    imageContainer: string;
    cardImageContainer: string;
    expandButton: string;
    quantityButton: string;
    quantityContainer: string;
    hoursContainer: string;
    hoursItem: string;
    hoursDay: string;
    hoursTime: string;
    specialOffer: string;
    decorativeElement: string;
}

// Props base para componentes que usan templates
export interface BaseTemplateProps {
    template?: TemplateType;
    themeColor?: string;
}

// Props específicas para cada componente
export interface MenuHeaderProps extends BaseTemplateProps {
    restaurantConfig: any; // RestaurantConfigData
    dictionary: any; // Dictionary
    isTableSpecificView?: boolean;
}

export interface TodaySpecialProps extends BaseTemplateProps {
    todaySpecial: any; // TodaySpecialData
    dictionary: any; // Dictionary
    restaurantName: string;
    restaurantPhone?: string | null;
    isTableSpecificView?: boolean;
}

export interface CategorySectionProps extends BaseTemplateProps {
    category: any; // Category
    dictionary: any; // Dictionary
    restaurantName: string;
    restaurantPhone?: string | null;
    specialDishIds: Set<string>;
    restaurantConfigId: string;
    onAddToOrder?: (dishId: string, quantity: number) => void;
    isTableSpecificView?: boolean;
}

export interface MenuFooterProps extends BaseTemplateProps {
    restaurantConfig: any; // RestaurantConfigData
    dictionary: any; // Dictionary
}

export interface DishCardProps extends BaseTemplateProps {
    dish: any; // Dish
    dictionary: any; // Dictionary
    restaurantName: string;
    restaurantPhone?: string | null;
    specialDishIds: Set<string>;
    restaurantConfigId: string;
    onAddToOrder?: (dishId: string, quantity: number) => void;
    isTableSpecificView?: boolean;
}

export interface ImageModalProps extends BaseTemplateProps {
    isOpen: boolean;
    onClose: () => void;
    imageUrl: string;
    imageName: string;
    description?: string;
    price: number;
    promotionalPrice?: number;
    isSpecialDish?: boolean;
}

export interface OrderCartProps extends BaseTemplateProps {
    items: any[]; // CartItem[]
    onRemoveItem: (dishId: string) => void;
    onUpdateQuantity: (dishId: string, quantity: number) => void;
    onPlaceOrder: (notes?: string) => void;
    dictionary: any; // Dictionary
    restaurantConfigId: string;
    table?: any; // TableData
    todaySpecials?: any[]; // TodaySpecial[]
}

export interface OrderStatusBarProps extends BaseTemplateProps {
    table: any; // TableData
    restaurantSlug: string;
    restaurantConfigId: string;
}

export interface MenuFiltersProps extends BaseTemplateProps {
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    selectedCategory: string;
    setSelectedCategory: (category: string) => void;
    showSpecialOnly: boolean;
    setShowSpecialOnly: (show: boolean) => void;
    categories: any[]; // Category[]
    hasSpecial: boolean;
    dictionary: any; // Dictionary
}

export interface EmptyStateProps extends BaseTemplateProps {
    searchTerm: string;
    selectedCategory: string;
    showSpecialOnly: boolean;
    onClearFilters: () => void;
    dictionary: any; // Dictionary
}

// Función helper para obtener el template por defecto
export const getDefaultTemplate = (): TemplateType => 'neomorphic';

// Función helper para validar si un template es válido
export const isValidTemplate = (template: string): template is TemplateType => {
    return AVAILABLE_TEMPLATES.some(t => t.id === template);
} 