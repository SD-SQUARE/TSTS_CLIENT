import { Navigate, useLocation } from "react-router-dom";
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
    children: React.ReactNode;
}

export default function GuardedRoute({
    roles = [],
    permissions = [],
    allowNavigation = true,
    children,
}: GuardedRouteProps) {
    const { t } = useTranslation();
    const notificationDirection = i18next.language === "ar" ? "topLeft" : "topRight";
    const { user, initialized } = useSelector((state: any) => state.auth);
    const location = useLocation();

    if (location.pathname === `${APP_BASE_PATH}/auth/login` || location.pathname === `${APP_BASE_PATH}/not-allowed`)
        return children;

    if (!initialized) {
        return <Spin fullscreen size="large" />;
    }
    
    // console.log(user);
    // console.log(roles);
    const role = user?.role?.toLowerCase();
    const userPermissions = user?.permissions || [];

    const isRoleAllowed = () => roles.includes("*") || roles.includes(role) ;

    const isPermissionsAllowed = () =>
        permissions.length === 0 ||
        permissions.every(p => userPermissions.includes(p));

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
    else if ((!isRoleAllowed() || !isPermissionsAllowed()) && allowNavigation) {
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
    else if (!allowNavigation && (!isRoleAllowed() || !isPermissionsAllowed())) {
        return null;
    }

    
    return children;
}
