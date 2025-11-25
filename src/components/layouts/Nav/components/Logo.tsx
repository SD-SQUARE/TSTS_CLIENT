import { Avatar, Grid } from "antd";
import logo from "../../../../assets/HU-bg-clear.png";
import { useNavigate } from "react-router-dom";

const { useBreakpoint } = Grid;



const Logo = ({ onClick }) => {
    const screens = useBreakpoint();
    const navigate = useNavigate();

    const getLogoSize = (screens) => {
        if (screens.xl) return 70;
        if (screens.lg) return 64;
        if (screens.md) return 58;
        if (screens.sm) return 52;
        return 48; // default for xs
    };


    // Handle click: either prop function or navigate home
    const handleClick = () => {
        if (onClick) onClick();
        else navigate("/"); // default: go to home
    };

    return (
        <Avatar
            src={logo}
            size={getLogoSize(screens)}
            onClick={handleClick}
            style={{
                cursor: "pointer",
                userSelect: "none",
                transition: "all 0.3s ease", // smooth resizing
            }}
        />
    );
};

export default Logo;
