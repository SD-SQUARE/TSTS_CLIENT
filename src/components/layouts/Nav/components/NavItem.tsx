// NavItem 
import { NavLink, useLocation } from "react-router-dom";
import { APP_BASE_PATH } from "../../../../app/config";
import styles from "./navbar_item.module.css";
/**
 * A reusable React component for creating a navigation item.
 * It uses the `NavLink` component from `react-router-dom` to create a link to the specified path.
 * The path is prefixed with the `APP_BASE_PATH` from the app config.
 *
 * @param {string} to - the path to link to
 * @param {ReactNode} children - the content of the navigation item
 * @example
 * <NavItem to="/about">About</NavItem>
 */
const normalizePath = (path: string) => {
    if (!path) {
        return APP_BASE_PATH || "/";
    }

    if (APP_BASE_PATH && path.startsWith(APP_BASE_PATH)) {
        return path;
    }

    return `${APP_BASE_PATH}${path}`;
};

const NavItem = ({ children, to = "/", activePrefixes = [] as string[] }) => {
    const location = useLocation();
    const resolvedTo = normalizePath(to);
    const resolvedPrefixes = activePrefixes.map(normalizePath);

    const isPrefixActive = resolvedPrefixes.some((prefix) => (
        location.pathname === prefix || location.pathname.startsWith(`${prefix}/`)
    ));

    return <NavLink
        to={resolvedTo}
        className={({ isActive }) =>
            `${styles.navItem} ${isActive || isPrefixActive ? styles.activeNavItem : ""}`
        }>
        {children}
    </NavLink>
};

export default NavItem;
