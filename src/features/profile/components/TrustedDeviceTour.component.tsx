import { Tour } from "antd";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

const TrustedDeviceTour = () => {
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);

    useEffect(() => {
        if (localStorage.getItem("showTrustedDeviceTour")) {
            setOpen(true);
            localStorage.removeItem("showTrustedDeviceTour");
        }
    }, []);

    return (
        <Tour
            open={open}
            onClose={() => setOpen(false)}
            steps={[
                {
                    title: t("tour.trustedDevice.title"),
                    description: t("tour.trustedDevice.desc"),
                    target: () => document.querySelector("#trusted-devices-tab"),
                },
            ]}
        />
    );
};

export default TrustedDeviceTour;
