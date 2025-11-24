import { Navigate } from "react-router-dom";

export default function GuardedRoute({ roles = [], permissions = [], children }) {
    const role = sessionStorage.getItem("role");
    const saved = sessionStorage.getItem("permissions");
    const userPermissions = saved ? JSON.parse(saved) : [];

    if (!role) return <Navigate to="/login" replace />;

    const roleAllowed = roles.length === 0 || roles.includes(role);
    const permissionsAllowed =
        permissions.length === 0 ||
        permissions.every(p => userPermissions.includes(p));

    if (!roleAllowed || !permissionsAllowed)
        return <Navigate to="/unauthorized" replace />;

    return children;
}
