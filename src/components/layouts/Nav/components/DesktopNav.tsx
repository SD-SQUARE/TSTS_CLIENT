// Desktop Nav 
import NavPanel from "./NavPanel";

const DesktopNav = ({ children }) => {
    return (
        <div style={{ flex: 1, marginLeft: 32 }}>
            <NavPanel>{children}</NavPanel>
        </div>
    );
};

export default DesktopNav;
