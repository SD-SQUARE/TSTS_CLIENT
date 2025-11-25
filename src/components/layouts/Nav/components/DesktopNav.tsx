// Desktop Nav 
import NavPanel from "./NavPanel";
import style from "./navbar_item.module.css"

const DesktopNav = ({ children }) => {
    return (
        <div style={{ flex: 1, marginLeft: 32 }} className={style.dark_mode}>
            <NavPanel>{children}</NavPanel>
        </div>
    );
};

export default DesktopNav;
