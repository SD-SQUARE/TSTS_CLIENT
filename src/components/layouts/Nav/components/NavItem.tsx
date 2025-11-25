// NavItem 
import { NavLink } from "react-router-dom";
import { APP_BASE_PATH } from "../../../../app/config";
import Text from "antd/es/typography/Text"
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
const NavItem = ({ children, to = "/" }) => {
    return <NavLink
        to={`${APP_BASE_PATH}${to}`}
        className={({ isActive }) =>
            `${styles.navItem} ${isActive ? styles.activeNavItem : ""}`
        }>
        {children}
    </NavLink>
};

export default NavItem;
