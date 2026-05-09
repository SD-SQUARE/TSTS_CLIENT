import { Avatar, Grid } from "antd";
import logo from "../../../../assets/HU-bg-clear.png";
import { useNavigate } from "react-router-dom";
import { useSiteSettings } from "../../../../features/site-settings/hooks/useSiteSettings";

const { useBreakpoint } = Grid;



const Logo = ({ onClick }) => {
    const screens = useBreakpoint();
    const navigate = useNavigate();
    const { data: settings } = useSiteSettings();

    const getLogoSize = (screens) => {
        if (screens.xl) return 48;
        if (screens.lg) return 38;
        if (screens.md) return 32;
        if (screens.sm) return 28;
        return 24; // default for xs
    };


    // Handle click: either prop function or navigate home
    const handleClick = () => {
        if (onClick) onClick();
        else navigate("/"); // default: go to home
    };

    return (
        <Avatar
            shape="square"
            src={settings?.logoUrl || logo}
            size={getLogoSize(screens)}
            onClick={handleClick}
            style={{
                objectFit: "contain",
                cursor: "pointer",
                userSelect: "none",
                transition: "all 0.3s ease", // smooth resizing
            }}

        />
    );
};

export default Logo;
