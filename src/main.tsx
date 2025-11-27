import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { store } from "./app/store";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./app/queryClient";
import { AppRoutes } from "./routes/AppRoutes";
import "./index.css"



ReactDOM.createRoot(document.getElementById("root")).render(
    <Provider store={store}>
        <QueryClientProvider client={queryClient}>
            <AppRoutes />
        </QueryClientProvider>
    </Provider>
);

