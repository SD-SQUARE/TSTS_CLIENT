import { Navigate, useLocation } from "react-router-dom";
import { APP_BASE_PATH } from "../app/config";
import { useSelector } from "react-redux";
import { notification } from "antd";
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import i18next from "i18next";
import { BrokenSecurityShieldIcon, SecurityShieldIcon } from "../assets/icons";

interface GuardedRouteProps {
    roles?: string[];
    permissions?: string[];
    children: React.ReactNode;
}

export default function GuardedRoute({
    roles = [],
    permissions = [],
    children,
}: GuardedRouteProps) {
    const { t } = useTranslation();
    const notificationDirection = i18next.language === "ar" ? "topLeft" : "topRight";
    const { user } = useSelector((state: any) => state.auth);
    const location = useLocation();

    const role = user?.role?.toLowerCase();
    const userPermissions = user?.permissions || [];

    const hasNotified = useRef(false);

    const isRoleAllowed = () =>
        roles.length === 0 || roles.includes(role) || role === "*";

    const isPermissionsAllowed = () =>
        permissions.length === 0 ||
        permissions.every(p => userPermissions.includes(p));

    useEffect(() => {
        if (!role && !hasNotified.current) {
            notification.warning({
                title: t("auth.loginRequired"),
                description: t("auth.loginDescription"),
                placement: notificationDirection,
                showProgress: true,
                pauseOnHover: true,
                icon: <SecurityShieldIcon/>,
                styles: {
                    title: {
                        direction: i18next.language === "ar" ? "rtl" : "ltr",
                    },
                    description: {
                        direction: i18next.language === "ar" ? "rtl" : "ltr",
                    },

                }
            });
            hasNotified.current = true;
        }

        if (
            role &&
            (!isRoleAllowed() || !isPermissionsAllowed()) &&
            !hasNotified.current
        ) {
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
            hasNotified.current = true;
        }
    }, [role]);

    // 🚫 Not logged in
    if (!role) {
        return (
            <Navigate
                to={`${APP_BASE_PATH}/auth/login`}
                replace
                state={{ from: location }}
            />
        );
    }

    // 🚫 Logged in but unauthorized
    if (!isRoleAllowed() || !isPermissionsAllowed()) {
        return <Navigate to={`${APP_BASE_PATH}/not-allowed`} replace />;
    }

    return children;
}
