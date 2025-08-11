# Scripts de gestión de permisos

## Actualizar usuario a premium y asignar permisos

Este script te permite actualizar el rol de un usuario a `premium` y asignarle todos los permisos correspondientes (todos excepto los de admin), usando su email.

### Uso

```sh
npx tsx packages/database/scripts/update-premium-permissions.ts <email>
```

**Ejemplo:**

```sh
npx tsx packages/database/scripts/update-premium-permissions.ts ganga@gmail.com
```

- Si el usuario no existe, verás un mensaje de error.
- Si ya es premium y tiene todos los permisos, el script lo indicará.
- Si le faltan permisos, se los asigna automáticamente.

---

> Puedes modificar el script para aceptar varios emails si lo necesitas.
