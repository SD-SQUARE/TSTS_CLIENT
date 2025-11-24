import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LoginPage } from "../features/login/pages/LoginPage";
import {PAGES_ROUTES_PATHS, PATH_NAMES} from "../app/route.helper.ts"

export const AppRoutes = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route index path={PAGES_ROUTES_PATHS[PATH_NAMES.LOGIN]} element={<LoginPage />} />
                {/* forget password, etc */}
            </Routes>
        </BrowserRouter>
    );
};
