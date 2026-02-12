import { useAuthContext } from '../providers/AuthProvider';
import { UserRole } from '../types/auth.types';

export const useAuth = () => {
    const { isAuthenticated, userRoles, initialized, login, logout } = useAuthContext();

    const hasRole = (role: UserRole) => {
        return userRoles.includes(role);
    };

    return {
        isAuthenticated,
        userRoles: userRoles as UserRole[],
        initialized,
        login,
        logout,
        hasRole,
    };
};

export default useAuth;