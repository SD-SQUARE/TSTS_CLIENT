import { Tour } from "antd";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useCookies } from 'react-cookie';

const TrustedDeviceTour = () => {
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);
    const [skip, setSkip] = useState(false);
    const [cookie , setCookie, removeCookie ] = useCookies(['showTrustedDeviceTour', 'skipTrustedDeviceTour-for-week']);

    useEffect(() => {

        if (cookie["skipTrustedDeviceTour-for-week"]) {
            setSkip(true);
        }
        if (cookie["showTrustedDeviceTour"]) {
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
                setCookie("showTrustedDeviceTour", "0");
                setCookie("skipTrustedDeviceTour-for-week", "1",{ expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) });
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
