import { Tour } from "antd";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

const TrustedDeviceTour = () => {
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);
    const [skip, setSkip] = useState(false);

    useEffect(() => {

        if (localStorage.getItem("skipTrustedDeviceTour-for-week")) {
            setSkip(true);
        }
        if (localStorage.getItem("showTrustedDeviceTour")) {
            setOpen(true);
        }

        const el = document.querySelector("#profile-trusted-devices");

        const handleClick = () => {
            setOpen(false);
            // localStorage.removeItem("showTrustedDeviceTour");
        };

        el?.addEventListener("click", handleClick);

        return () => {
            el?.removeEventListener("click", handleClick);
        };
    }, []);

    if (skip) return null;
    
    return (
        <Tour
            open={open}
            onClose={() => {
                setOpen(false);
                localStorage.removeItem("showTrustedDeviceTour");
                localStorage.addItem("skipTrustedDeviceTour-for-week", "1");
             }}
            steps={[
                {
                    title: t("tour.profile.trustedDevice.title"),
                    description: t("tour.profile.trustedDevice.desc"),
                    target: () =>
                        document.querySelector("#profile-trusted-devices"),
                    nextButtonProps: { style: { display: "none" } },
                    prevButtonProps: { style: { display: "none" } },
                },
            ]}
        />
    );
};

export default TrustedDeviceTour;
