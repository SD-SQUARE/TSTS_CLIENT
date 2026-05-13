import { Navigate, useLocation, useParams } from "react-router-dom";
import { APP_BASE_PATH } from "../app/config";
import { useSelector } from "react-redux";
import { notification, Spin } from "antd";
import { useTranslation } from "react-i18next";
import i18next from "i18next";
import { BrokenSecurityShieldIcon, SecurityShieldIcon } from "../assets/icons";

interface GuardedRouteProps {
    roles?: string[];
    permissions?: string[];
    allowNavigation?: boolean;
    matchRoleParam?: boolean;
    strict?: boolean;
    children: React.ReactNode;
}

export default function GuardedRoute({
    roles = [],
    permissions = [],
    allowNavigation = true,
    matchRoleParam = false,
    strict = false,
    children,
}: GuardedRouteProps) {
    const { t } = useTranslation();
    const notificationDirection = i18next.language === "ar" ? "topLeft" : "topRight";
    const { user, initialized } = useSelector((state: any) => state.auth);
    const location = useLocation();
    const params = useParams();

    if (location.pathname === `${APP_BASE_PATH}/auth/login` || location.pathname === `${APP_BASE_PATH}/not-allowed`)
        return children;

    if (!initialized) {
        return <Spin fullscreen size="large" />;
    }
    
    // console.log(user);
    // console.log(roles);
    const role = user?.role?.toLowerCase();
    const routeRole = typeof params.role === "string" ? params.role.toLowerCase() : undefined;
    const userPermissions = user?.permissions || [];
    const isSuperAdmin = role === "superadmin";

    const hasAnyRoleRequirement = roles.length > 0;
    const hasConcreteRoleRequirement = roles.some((requiredRole) => requiredRole !== "*");
    const hasPermissionRequirement = permissions.length > 0;

    const isRoleAllowed = () =>
        !hasAnyRoleRequirement ||
        roles.includes("*") ||
        (!!role && roles.map((requiredRole) => requiredRole.toLowerCase()).includes(role));

    const isPermissionsAllowed = () =>
        !hasPermissionRequirement ||
        userPermissions.includes("*") ||
        permissions.every(p => userPermissions.includes(p));

    const isAccessAllowed = () => {
        if (isSuperAdmin) return true;
        if (!hasAnyRoleRequirement && !hasPermissionRequirement) return true;

        if (strict) {
            const roleAllowed = hasConcreteRoleRequirement ? isRoleAllowed() : true;
            const permissionAllowed = hasPermissionRequirement ? isPermissionsAllowed() : true;
            return roleAllowed && permissionAllowed;
        }

        if (hasConcreteRoleRequirement && hasPermissionRequirement) {
            return isRoleAllowed() || isPermissionsAllowed();
        }

        if (hasPermissionRequirement) {
            return isPermissionsAllowed();
        }

        return isRoleAllowed();
    };

    // console.log(isRoleAllowed());
    // console.log(isPermissionsAllowed());
    // 🚫 Not logged in
    if (!role && allowNavigation) {
        notification.warning({
            title: t("auth.loginRequired"),
            description: t("auth.loginDescription"),
            placement: notificationDirection,
            showProgress: true,
            pauseOnHover: true,
            icon: <SecurityShieldIcon />,
            styles: {
                title: {
                    direction: i18next.language === "ar" ? "rtl" : "ltr",
                },
                description: {
                    direction: i18next.language === "ar" ? "rtl" : "ltr",
                },

            }
        });
        return (
            <Navigate
                to={`${APP_BASE_PATH}/auth/login`}
                replace
                state={{ from: `${location.pathname}${location.search}${location.hash}` }}
            />
        );
    }
    // 🚫 Logged in but unauthorized
    else if (!isAccessAllowed() && allowNavigation) {
        notification.error({
            title: t("auth.unauthorized"),
            description: t("auth.unauthorizedDescription"),
            placement: notificationDirection,
            showProgress: true,
            pauseOnHover: true,
            icon: <BrokenSecurityShieldIcon />,
            styles: {
                title: {
                    direction: i18next.language === "ar" ? "rtl" : "ltr",
                },
                description: {
                    direction: i18next.language === "ar" ? "rtl" : "ltr",
                },

            }
        });
        return <Navigate to={`${APP_BASE_PATH}/not-allowed`} replace />;
    }
    else if (!allowNavigation && !isAccessAllowed()) {
        return null;
    }

    if (matchRoleParam && !isSuperAdmin && role && routeRole && role !== routeRole) {
        notification.error({
            title: t("auth.unauthorized"),
            description: t("auth.roleRouteMismatchDescription", {
                defaultValue: "You cannot access another role's tickets.",
            }),
            placement: notificationDirection,
            showProgress: true,
            pauseOnHover: true,
            icon: <BrokenSecurityShieldIcon />,
            styles: {
                title: {
                    direction: i18next.language === "ar" ? "rtl" : "ltr",
                },
                description: {
                    direction: i18next.language === "ar" ? "rtl" : "ltr",
                },

            }
        });

        const correctedPath = `${location.pathname.replace(`/${routeRole}/`, `/${role}/`)}${location.search}${location.hash}`;
        return <Navigate to={correctedPath} replace />;
    }

    
    return children;
}
