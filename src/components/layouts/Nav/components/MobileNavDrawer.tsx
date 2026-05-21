// Mobile Nav Drawer
import { Button, Drawer, Space } from "antd";
import NavTail from "./NavTail";
import NavPanel from "./NavPanel";
import i18n from "../../../../i18n";
import { useTranslation } from "react-i18next";
import styles from './navbar_item.module.css';
import Logo from "./Logo";
import { CloseOutlined } from "@ant-design/icons";

const MobileNavDrawer = ({ open, setOpen, children }) => {
    const { t } = useTranslation();
    const drawerSide = i18n.language === "en" ? "right" : "left";

    return (
        <Drawer
            placement={drawerSide}
            width={320}
            open={open}
            closeIcon={null}
            onClose={() => setOpen(false)}
            title={
                <div className={styles.mobileDrawerTitle}>
                    <Space size={10}>
                        <Logo onClick={() => setOpen(false)} />
                        <span>{t("NAVIGATION_TITLE")}</span>
                    </Space>
                    <Button
                        type="text"
                        shape="circle"
                        icon={<CloseOutlined />}
                        onClick={() => setOpen(false)}
                    />
                </div>
            }
            className={styles.mobile_drawer_bg}
            styles={{
                header: { padding: "14px 16px" },
                body: { padding: "10px 12px 16px" },
            }}
        >
            <div className={styles.mobileNavItems}>
                <NavPanel closeDrawer={() => setOpen(false)}>
                    {children}
                </NavPanel>
            </div>

            <div className={styles.mobileNavTail}>
                <NavTail />
            </div>
        </Drawer>
    );
};

export default MobileNavDrawer;
