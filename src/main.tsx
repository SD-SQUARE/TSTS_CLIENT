import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { store } from "./app/store";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./app/queryClient";
import "./index.css";
import App from './App';
import "./i18n"
import { ConfigProvider } from "antd";
import i18n from "./i18n";

import { getCssVar } from "./utils/get_css_var.utils";
import { CookiesProvider } from "react-cookie";

const TOKENS = {
    colorPrimary: getCssVar("--color-primary"),           // main brand color
    colorPrimaryBorderHover: getCssVar("--color-secondary"), // hover border / accent
    colorText: getCssVar("--text-black"),
    colorError: getCssVar("--color-red"),
    colorBorder: getCssVar("--color-gray"),
    colorWhite: getCssVar("--color-white"),
    margin: 0,
};

ReactDOM.createRoot(document.getElementById("root")).render(
    <CookiesProvider>
        <Provider store={store}>
            <QueryClientProvider client={queryClient}>
                <ConfigProvider direction={i18n.language === "ar" ? "rtl" : "ltr"}
                    theme={{ token: TOKENS }}>
                    <App />
                </ConfigProvider>
            </QueryClientProvider>
        </Provider>
    </CookiesProvider>
);

