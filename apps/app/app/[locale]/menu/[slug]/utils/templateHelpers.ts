import { TemplateType, TemplateConfig, AVAILABLE_TEMPLATES, isValidTemplate, getDefaultTemplate } from '../types/templates';

/**
 * Helper para obtener información de un template
 */
export const getTemplateInfo = (templateId: TemplateType): TemplateConfig | undefined => {
    return AVAILABLE_TEMPLATES.find(t => t.id === templateId);
};

/**
 * Helper para obtener todos los templates disponibles
 */
export const getAllTemplates = (): TemplateConfig[] => {
    return AVAILABLE_TEMPLATES;
};

/**
 * Helper para validar y obtener un template válido
 */
export const getValidTemplate = (template: string | undefined): TemplateType => {
    if (!template || !isValidTemplate(template)) {
        return getDefaultTemplate();
    }
    return template;
};

/**
 * Helper para obtener el nombre legible de un template
 */
export const getTemplateDisplayName = (templateId: TemplateType): string => {
    const template = getTemplateInfo(templateId);
    return template?.name || templateId;
};

/**
 * Helper para obtener la descripción de un template
 */
export const getTemplateDescription = (templateId: TemplateType): string => {
    const template = getTemplateInfo(templateId);
    return template?.description || '';
};

/**
 * Helper para verificar si un template tiene características específicas
 */
export const hasTemplateFeature = (templateId: TemplateType, feature: string): boolean => {
    switch (feature) {
        case 'dark-theme':
            return templateId === 'luxury-premium';
        case 'glassmorphism':
            return templateId === 'luxury-premium';
        case 'gradients':
            return templateId === 'luxury-premium' || templateId === 'retro-vintage';
        case 'shadows':
            return templateId === 'neomorphic';
        case 'borders':
            return templateId === 'retro-vintage';
        default:
            return false;
    }
};

/**
 * Helper para obtener la clase CSS de un template
 */
export const getTemplateClassName = (templateId: TemplateType): string => {
    const template = getTemplateInfo(templateId);
    return template?.className || `template-${templateId}`;
};

/**
 * Helper para obtener el preview de un template
 */
export const getTemplatePreview = (templateId: TemplateType): string => {
    const template = getTemplateInfo(templateId);
    return template?.preview || `/templates/${templateId}-preview.png`;
}; 