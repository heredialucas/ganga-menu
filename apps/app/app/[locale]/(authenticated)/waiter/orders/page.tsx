import { requirePermission } from '@repo/auth/server-permissions';
import { getDictionary } from '@repo/internationalization';

export default async function OrdersPage({
    params
}: {
    params: Promise<{ locale: string }>;
}) {
    // Verificar permisos
    await requirePermission('orders:view');

    const paramsData = await params;
    const dictionary = await getDictionary(paramsData.locale);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">
                    Gestión de Órdenes
                </h1>
                <p className="text-muted-foreground">
                    Gestiona las órdenes de tu restaurante
                </p>
            </div>

            <div className="border rounded-lg p-6 text-center text-muted-foreground">
                Sistema de órdenes próximamente
            </div>
        </div>
    );
} 