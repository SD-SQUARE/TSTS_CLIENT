// Mobile Nav Drawer
import { Drawer } from "antd";
import NavTail from "./NavTail";
import NavPanel from "./NavPanel";
import i18n from "../../../../i18n";
import { useTranslation } from "react-i18next";
import styles from './navbar_item.module.css';

const MobileNavDrawer = ({ open, setOpen, children }) => {
    const { t } = useTranslation();
    const drawerSide = i18n.language === "en" ? "right" : "left";

    return (
        <Drawer
            placement={drawerSide}
            size={300}
            open={open}
            closeIcon={null}
            onClose={() => setOpen(false)}
            title={
                <div
                    style={{
                        textAlign: i18n.language === "ar" ? "right" : "left",
                        fontWeight: "bold",
                        fontSize: "1.2em",
                    }}
                >
                    {t("NAVIGATION_TITLE")}
                </div>
            }
            className={styles.mobile_drawer_bg}
        >
            <NavPanel closeDrawer={() => setOpen(false)}>
                {children}
            </NavPanel>

            <div style={{ marginTop: 24 }}>
                <NavTail />
            </div>
        </Drawer>
    );
};

export default MobileNavDrawer;
