// I18nProvider.tsx
import { ConfigProvider } from "antd";
import { useTranslation } from "react-i18next";
import { getCssVar } from "../utils/get_css_var.utils";

const TOKENS = {
    colorPrimary: getCssVar("--color-primary"),           // main brand color
    colorPrimaryBorderHover: getCssVar("--color-secondary"), // hover border / accent
    colorText: getCssVar("--text-black"),
    colorError: getCssVar("--color-red"),
    colorBorder: getCssVar("--color-gray"),
    colorWhite: getCssVar("--color-white"),
    margin: 0,
};

const I18nProvider = ({ children }: { children: React.ReactNode }) => {
    const { i18n } = useTranslation();

    return (
        <ConfigProvider
            direction={i18n.dir()}
            theme={{
                token: TOKENS,
            }}
        >
            {children}
        </ConfigProvider>
    );
};

export default I18nProvider;