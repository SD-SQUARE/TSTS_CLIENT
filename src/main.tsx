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

ReactDOM.createRoot(document.getElementById("root")).render(
    <Provider store={store}>
        <QueryClientProvider client={queryClient}>
            <ConfigProvider direction={i18n.language === "ar" ? "rtl" : "ltr"}>
                <App />
            </ConfigProvider>
        </QueryClientProvider>
    </Provider>
);

