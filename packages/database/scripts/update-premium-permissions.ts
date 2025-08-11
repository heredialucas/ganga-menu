import { database } from '../index';

async function main() {
    const email = process.argv[2];
    if (!email) {
        console.log('Uso: npx tsx scripts/update-premium-permissions.ts <email>');
        process.exit(1);
    }

    // Obtener todos los permisos de la base de datos, menos los de admin
    const allPermissions = await database.permission.findMany();
    const premiumPermissions = allPermissions.filter(p => !p.name.startsWith('admin:'));
    const permMap = Object.fromEntries(allPermissions.map(p => [p.name, p.id]));

    // Buscar el usuario por email
    const user = await database.user.findUnique({ where: { email }, include: { permissions: true } });
    if (!user) {
        console.log(`No se encontró el usuario ${email}`);
        return;
    }

    // Cambiar el rol a premium si es necesario
    if (user.role !== 'premium') {
        await database.user.update({ where: { id: user.id }, data: { role: 'premium' } });
        console.log(`Usuario ${user.email} actualizado a premium.`);
    }

    // Asignar permisos de premium (todos menos admin)
    const currentPerms = new Set(user.permissions.map(up => up.permissionId));
    const missingPerms = premiumPermissions.filter(p => !currentPerms.has(p.id));
    if (missingPerms.length > 0) {
        await database.userPermission.createMany({
            data: missingPerms.map(p => ({ userId: user.id, permissionId: p.id })),
            skipDuplicates: true,
        });
        console.log(`Actualizado premium ${user.email}: +${missingPerms.length} permisos`);
    } else {
        console.log(`Premium ${user.email} ya tiene todos los permisos.`);
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        if (typeof database.$disconnect === 'function') {
            await database.$disconnect();
        }
    });
