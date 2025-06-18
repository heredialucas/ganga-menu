'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Dictionary } from '@repo/internationalization';
import { RestaurantConfigData } from '@repo/data-services/src/services/restaurantConfigService';
import { RestaurantDesignData, RestaurantElement, saveRestaurantDesign } from '@repo/data-services/src/services/restaurantDesignService';

interface RestaurantDesignSectionProps {
    dictionary: Dictionary['app']['admin']['menu']['restaurant'];
    restaurantConfig: RestaurantConfigData | null;
    restaurantDesign: RestaurantDesignData | null;
}

// Dynamic import del canvas para evitar errores de SSR
const RestaurantCanvas = dynamic(() => import('./RestaurantCanvas'), {
    ssr: false,
    loading: () => (
        <div className="flex-1 bg-white min-h-96 flex items-center justify-center">
            <div className="text-gray-500">Cargando canvas...</div>
        </div>
    )
});

export default function RestaurantDesignSection({
    dictionary,
    restaurantConfig,
    restaurantDesign
}: RestaurantDesignSectionProps) {
    // Inicializar con los datos del servidor directamente
    const [elements, setElements] = useState<RestaurantElement[]>(restaurantDesign?.elements || []);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [stageSize, setStageSize] = useState({
        width: restaurantDesign?.canvasWidth || 800,
        height: restaurantDesign?.canvasHeight || 600
    });
    const [isSaving, setIsSaving] = useState(false);

    // Detectar cambios comparando con los datos originales del servidor
    const hasUnsavedChanges = restaurantDesign
        ? JSON.stringify(elements) !== JSON.stringify(restaurantDesign.elements) ||
        stageSize.width !== restaurantDesign.canvasWidth ||
        stageSize.height !== restaurantDesign.canvasHeight
        : elements.length > 0;

    const addElement = (type: 'table' | 'bar' | 'decoration', shape: 'circle' | 'rectangle' | 'square') => {
        const newElement: RestaurantElement = {
            id: `${type}_${Date.now()}`,
            type,
            shape,
            x: 100,
            y: 100,
            // Cajas más pequeñas como solicitado
            width: shape === 'circle' ? 60 : 80,
            height: shape === 'circle' ? 60 : shape === 'square' ? 80 : 50,
            fill: type === 'table' ? '#8B4513' : type === 'bar' ? '#654321' : '#A0A0A0',
            name: `${type === 'table' ? 'Mesa' : type === 'bar' ? 'Barra' : 'Decoración'} ${elements.length + 1}`,
            capacity: type === 'table' ? 4 : undefined
        };

        setElements(prev => [...prev, newElement]);
    };

    const updateElement = (id: string, updates: Partial<RestaurantElement>) => {
        setElements(prev => prev.map(el => el.id === id ? { ...el, ...updates } : el));
    };

    const deleteElement = (id: string) => {
        setElements(prev => prev.filter(el => el.id !== id));
        setSelectedId(null);
    };

    const clearAll = () => {
        setElements([]);
        setSelectedId(null);
    };

    const handleSave = async () => {
        if (!restaurantConfig) {
            alert('No hay configuración de restaurante disponible');
            return;
        }

        setIsSaving(true);
        try {
            await saveRestaurantDesign(
                restaurantConfig.id,
                restaurantConfig.createdById,
                elements,
                stageSize.width,
                stageSize.height
            );
            // Los datos se revalidan automáticamente en el servidor
            alert('Diseño guardado exitosamente');
        } catch (error) {
            console.error('Error al guardar:', error);
            alert('Error al guardar el diseño');
        } finally {
            setIsSaving(false);
        }
    };

    const selectedElement = elements.find(el => el.id === selectedId);

    if (!restaurantConfig) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-xl font-semibold text-gray-700 mb-2">
                        Configuración Requerida
                    </h2>
                    <p className="text-gray-500">
                        Primero debes configurar la información de tu restaurante en la pestaña "Configuración".
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col lg:flex-row">
            {/* Toolbar - responsive */}
            <div className="w-full lg:w-80 bg-gray-50 p-4 border-r lg:border-b-0 border-b overflow-y-auto lg:h-full max-h-64 lg:max-h-none">
                <div className="space-y-4 lg:space-y-6">
                    {/* Herramientas */}
                    <div>
                        <h3 className="font-medium text-gray-900 mb-3">{dictionary.toolbar.addTable}</h3>
                        <div className="grid grid-cols-3 lg:grid-cols-1 gap-2">
                            <button
                                onClick={() => addElement('table', 'circle')}
                                className="p-2 lg:p-3 border rounded-lg hover:bg-gray-100 text-left"
                            >
                                <div className="flex flex-col lg:flex-row items-center lg:space-x-3 space-y-1 lg:space-y-0">
                                    <div className="w-6 h-6 lg:w-8 lg:h-8 bg-amber-600 rounded-full flex-shrink-0"></div>
                                    <span className="text-xs lg:text-sm text-center lg:text-left">{dictionary.tables.round}</span>
                                </div>
                            </button>
                            <button
                                onClick={() => addElement('table', 'square')}
                                className="p-2 lg:p-3 border rounded-lg hover:bg-gray-100 text-left"
                            >
                                <div className="flex flex-col lg:flex-row items-center lg:space-x-3 space-y-1 lg:space-y-0">
                                    <div className="w-6 h-6 lg:w-8 lg:h-8 bg-amber-600 flex-shrink-0"></div>
                                    <span className="text-xs lg:text-sm text-center lg:text-left">{dictionary.tables.square}</span>
                                </div>
                            </button>
                            <button
                                onClick={() => addElement('table', 'rectangle')}
                                className="p-2 lg:p-3 border rounded-lg hover:bg-gray-100 text-left"
                            >
                                <div className="flex flex-col lg:flex-row items-center lg:space-x-3 space-y-1 lg:space-y-0">
                                    <div className="w-6 h-4 lg:w-8 lg:h-6 bg-amber-600 flex-shrink-0"></div>
                                    <span className="text-xs lg:text-sm text-center lg:text-left">{dictionary.tables.rectangle}</span>
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* Propiedades del elemento seleccionado */}
                    <div>
                        <h3 className="font-medium text-gray-900 mb-3">{dictionary.properties.title}</h3>
                        {selectedElement ? (
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        {dictionary.properties.name}
                                    </label>
                                    <input
                                        type="text"
                                        value={selectedElement.name}
                                        onChange={(e) => updateElement(selectedElement.id, { name: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                    />
                                </div>

                                {selectedElement.type === 'table' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            {dictionary.properties.capacity}
                                        </label>
                                        <input
                                            type="number"
                                            value={selectedElement.capacity ?? ''}
                                            onChange={(e) => {
                                                const value = e.target.value === '' ? undefined : parseInt(e.target.value);
                                                updateElement(selectedElement.id, { capacity: value });
                                            }}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                            min="0"
                                            max="12"
                                        />
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        {dictionary.properties.color}
                                    </label>
                                    <input
                                        type="color"
                                        value={selectedElement.fill}
                                        onChange={(e) => updateElement(selectedElement.id, { fill: e.target.value })}
                                        className="w-full h-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <button
                                    onClick={() => deleteElement(selectedElement.id)}
                                    className="w-full px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
                                >
                                    Eliminar
                                </button>
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500">{dictionary.messages.selectElement}</p>
                        )}
                    </div>

                    {/* Acciones */}
                    <div className="space-y-2">
                        <button
                            onClick={handleSave}
                            disabled={!hasUnsavedChanges || isSaving}
                            className={`w-full px-3 py-2 rounded-md text-sm font-medium ${hasUnsavedChanges && !isSaving
                                ? 'bg-blue-600 text-white hover:bg-blue-700'
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                }`}
                        >
                            {isSaving ? 'Guardando...' : dictionary.toolbar.save}
                        </button>

                        <button
                            onClick={clearAll}
                            className="w-full px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm"
                        >
                            {dictionary.toolbar.clear}
                        </button>
                    </div>

                    {/* Indicador de cambios */}
                    {hasUnsavedChanges && (
                        <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded">
                            Tienes cambios sin guardar
                        </div>
                    )}
                </div>
            </div>

            {/* Canvas Component - Cargado dinámicamente */}
            <RestaurantCanvas
                elements={elements}
                selectedId={selectedId}
                onSelectElement={setSelectedId}
                onUpdateElement={updateElement}
                onCanvasResize={setStageSize}
            />
        </div>
    );
}

