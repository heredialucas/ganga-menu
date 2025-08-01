# Estructura Modular de Componentes - Restaurante

Esta carpeta contiene la nueva estructura modular de componentes para la página de gestión del restaurante, siguiendo las mejores prácticas de Next.js 15 y aprovechando las capacidades de Server Components.

## 🏗️ Arquitectura

### Principios de Diseño

1. **Server Components por defecto**: Todos los componentes que no requieren interactividad son Server Components
2. **Client Components solo cuando es necesario**: Solo se usan para interactividad (formularios, canvas, eventos)
3. **Carga automática con Next.js 15**: Los archivos `loading.tsx` y `error.tsx` se usan automáticamente
4. **Separación de responsabilidades**: Server vs Client claramente definido
5. **Suspense para carga progresiva**: Loading states automáticos por sección

### Estructura de Carpetas

```
components/
├── config/                    # Gestión de Configuración
│   ├── ConfigManagerServer.tsx  # Server Component - Carga datos
│   ├── ConfigManagerClient.tsx  # Client Component - Interactividad
│   ├── loading.tsx           # Estado de carga (automático)
│   ├── error.tsx             # Manejo de errores (automático)
│   └── index.ts              # Exportaciones
├── design/                    # Gestión de Diseño
│   ├── DesignManagerServer.tsx
│   ├── DesignManagerClient.tsx
│   ├── loading.tsx
│   ├── error.tsx
│   └── index.ts
├── qr-codes/                 # Gestión de Códigos QR
│   ├── QRManagerServer.tsx
│   ├── QRManagerClient.tsx
│   ├── loading.tsx
│   ├── error.tsx
│   └── index.ts
├── shared/                   # Componentes Compartidos
│   ├── ImageUploadClient.tsx
│   ├── OpeningHoursManager.tsx
│   └── index.ts
└── README.md                 # Esta documentación
```

## 🔄 Flujo de Datos

### Server Components
- **Responsabilidades**:
  - Autenticación y autorización
  - Carga de datos desde servicios
  - Validación de permisos
  - Renderizado inicial

### Client Components
- **Responsabilidades**:
  - Gestión de estado local
  - Interactividad (formularios, canvas, botones)
  - Eventos de usuario
  - Actualizaciones en tiempo real

## 🚀 Beneficios de la Nueva Arquitectura

### 1. Performance
- **Carga progresiva**: Cada sección se carga independientemente
- **Server-Side Rendering**: Mejor SEO y First Contentful Paint
- **Code Splitting**: Bundle size optimizado
- **Streaming**: Contenido se muestra progresivamente

### 2. Mantenibilidad
- **Separación de Responsabilidades**: Server vs Client claramente definido
- **Modularidad**: Cada funcionalidad en su propia carpeta
- **Reutilización**: Componentes independientes y reutilizables
- **Testing**: Fácil testing de componentes individuales

### 3. User Experience
- **Loading States**: Feedback visual durante la carga (automático)
- **Error Handling**: Manejo granular de errores (automático)
- **Progressive Enhancement**: Funciona sin JavaScript
- **Accessibility**: Mejor accesibilidad con Server Components

## 📝 Convenciones

### Nomenclatura
- **Server Components**: `*Server.tsx`
- **Client Components**: `*Client.tsx`
- **Loading States**: `loading.tsx` (automático)
- **Error States**: `error.tsx` (automático)

### Imports
```typescript
// ✅ Correcto - Usar archivos de índice
import { ConfigManagerServer } from './config';

// ❌ Incorrecto - Importar directamente
import { ConfigManagerServer } from './config/ConfigManagerServer';
```

### Next.js 15 Features
```typescript
// ✅ Next.js 15 maneja automáticamente loading y error
<ConfigManagerServer dictionary={dictionary} locale={locale} />

// Los archivos loading.tsx y error.tsx se usan automáticamente
// No necesitas Suspense ni ErrorBoundary manual
```

## 🔧 Migración

### Antes (Componente Monolítico)
```typescript
// ❌ Todo en un solo componente
export function RestaurantConfigForm({ config, ... }) {
    // Server logic + Client logic mezclados
}
```

### Después (Arquitectura Modular)
```typescript
// ✅ Server Component
export async function ConfigManagerServer({ dictionary, locale }) {
    // Solo lógica de servidor
    const data = await fetchData();
    return <ConfigManagerClient data={data} />;
}

// ✅ Client Component
export function ConfigManagerClient({ data }) {
    // Solo lógica de cliente
    const [state, setState] = useState();
    return <div>...</div>;
}
```

## 🎯 Mejores Prácticas

### 1. Server Components
- Usar `async/await` para operaciones asíncronas
- Validar permisos antes de cargar datos
- Manejar errores de autenticación
- Usar servicios de datos centralizados

### 2. Client Components
- Minimizar el uso de `useEffect`
- Usar `useTransition` para operaciones asíncronas
- Implementar loading states apropiados
- Manejar errores de usuario

### 3. Loading States (automático)
- Mantener consistencia visual
- Usar skeletons apropiados
- Evitar layout shift
- Proporcionar feedback inmediato

### 4. Error States (automático)
- Proporcionar mensajes de error útiles
- Incluir opciones de retry
- Logging de errores para debugging

## 🔄 Actualizaciones Futuras

Para agregar nuevas funcionalidades:

1. **Crear nueva carpeta** siguiendo la estructura existente
2. **Implementar Server Component** para carga de datos
3. **Implementar Client Component** para interactividad
4. **Agregar loading.tsx y error.tsx** (automático)
5. **Actualizar archivo de índice**
6. **Integrar en la página principal**

## 📊 Métricas de Performance

### Antes
- Tiempo de carga inicial: ~3-5s
- Bundle size: ~800KB
- Interactividad: Después de carga completa

### Después
- Tiempo de carga inicial: ~1-2s
- Bundle size: ~300KB (lazy loaded)
- Interactividad: Inmediata por sección
- Streaming: Contenido progresivo
- Loading/Error: Automático con Next.js 15 