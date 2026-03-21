import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { store } from "./app/store";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./app/queryClient";
import "./index.css";
import App from './App';
import "./i18n"

import { CookiesProvider } from "react-cookie";
import I18nProvider from "./i18n/I18nProvider";

ReactDOM.createRoot(document.getElementById("root")).render(
    <CookiesProvider>
        <Provider store={store}>
            <QueryClientProvider client={queryClient}>
                <I18nProvider>
                    <App />
                </I18nProvider>
            </QueryClientProvider>
        </Provider>
    </CookiesProvider>
);

