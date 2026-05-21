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
import { BrowserRouter, HashRouter } from "react-router-dom";
import { MsalProvider } from "@azure/msal-react";
import { msalInstance } from "./features/login/config/msalConfig";

const Router = window.electronAPI?.isElectron ? HashRouter : BrowserRouter;

const app = (
    <CookiesProvider>
        <Provider store={store}>
            <QueryClientProvider client={queryClient}>
                <I18nProvider>
                    <Router>
                        <App />
                    </Router>
                </I18nProvider>
            </QueryClientProvider>
        </Provider>
    </CookiesProvider>
);

ReactDOM.createRoot(document.getElementById("root")!).render(
    msalInstance ? (
        <MsalProvider instance={msalInstance}>
            {app}
        </MsalProvider>
    ) : (
        app
    )
);

