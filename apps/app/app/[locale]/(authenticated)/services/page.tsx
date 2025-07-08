import { requirePermission } from '@repo/auth/server-permissions';
import { getDictionary } from '@repo/internationalization';
import Link from 'next/link';
import { ShoppingCart, Users, ClipboardList, QrCode } from 'lucide-react';

export default async function WaiterPage({
    params
}: {
    params: Promise<{ locale: string }>;
}) {
    // Verificar permisos básicos para mozos
    await requirePermission('waiter:view_orders');

    const paramsData = await params;
    const dictionary = await getDictionary(paramsData.locale);

    const waiterSections = [
        {
            title: 'Gestión de Órdenes',
            description: 'Administra las órdenes del restaurante',
            href: '/waiter/orders',
            icon: ShoppingCart,
            color: 'bg-blue-500'
        },
        {
            title: 'Mesa Virtual',
            description: 'Acceso directo a la interfaz de mesas',
            href: '/waiter/mi-restaurante', // Este será el slug dinámico
            icon: QrCode,
            color: 'bg-green-500'
        },
        {
            title: 'Historial',
            description: 'Revisa el historial de órdenes',
            href: '/waiter/history',
            icon: ClipboardList,
            color: 'bg-purple-500'
        }
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">
                    Gestión de Mozos
                </h1>
                <p className="text-muted-foreground">
                    Herramientas para el personal de servicio
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {waiterSections.map((section) => (
                    <Link
                        key={section.href}
                        href={section.href}
                        className="group block p-6 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-3 rounded-lg ${section.color} text-white`}>
                                <section.icon className="h-6 w-6" />
                            </div>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                            {section.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                            {section.description}
                        </p>
                    </Link>
                ))}
            </div>

            {/* Información rápida */}
            <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-4 text-blue-900">Información para Mozos</h3>
                <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-lg">
                        <h4 className="font-medium text-blue-900 mb-2">Código de Acceso</h4>
                        <p className="text-sm text-gray-600">
                            Los mozos pueden usar el código configurado en la sección Restaurante para acceder a las mesas.
                        </p>
                    </div>
                    <div className="bg-white p-4 rounded-lg">
                        <h4 className="font-medium text-blue-900 mb-2">Gestión de Órdenes</h4>
                        <p className="text-sm text-gray-600">
                            Administra todas las órdenes activas, pendientes y completadas del restaurante.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
} 