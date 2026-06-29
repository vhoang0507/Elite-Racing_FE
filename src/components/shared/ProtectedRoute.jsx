import { Navigate, useLocation } from 'react-router-dom';
import { getAuthToken, getAuthUser } from '../../utils/tokenStorage';

/**
 * Route guard — only allows access if the user has a valid token and matching role.
 * @param {string|string[]} role  - allowed role(s), e.g. "Admin" or ["Admin","HorseOwner"]
 * @param {React.ReactNode} children
 */
export default function ProtectedRoute({ role, children }) {
    const location = useLocation();
    const token = getAuthToken();
    const user = getAuthUser();

    // Not logged in → redirect to login, remembering where we came from
    if (!token || !user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Check role if specified
    if (role) {
        const allowed = Array.isArray(role) ? role : [role];
        const userRole = user.role ?? user.Role ?? '';
        if (!allowed.includes(userRole)) {
            // Logged in but wrong role → redirect to home
            return <Navigate to="/" replace />;
        }
    }

    return children;
}
