import { getCurrentUser } from '@repo/data-services/src/services/authService';
import { UserHeaderClient } from "./userHeaderClient";

type User = {
    id: string;
    name: string;
    email: string;
    role: string;
};

export async function UserHeaderServer() {
    const user = await getCurrentUser();
    return <UserHeaderClient user={user as User} />;
}