import {  Routes, Route } from "react-router-dom";
import { LoginPage } from "../features/login/pages/LoginPage";
import { APP_BASE_PATH } from "../app/config.ts";
import NotFound from "../components/utils/NotFound.tsx";
import Home from "../components/Home.tsx";
import ServerError from './../components/utils/ServerError';
import NotAllowed from './../components/utils/NotAllowed';

export const AppRoutes = () => {

    return (
        <Routes>
            <Route path={`${APP_BASE_PATH}/auth`}>
                <Route index element={<LoginPage />} />
                <Route path="login" element={<LoginPage />} />
            </Route>
            
            <Route index path={`${APP_BASE_PATH}/`} element={<Home/>} />
            <Route path={`${APP_BASE_PATH}/about`} element={<h1>About page</h1>} />
            
            {/* Complmentary Paths */}
            <Route path={`${APP_BASE_PATH}/server-error`} element={<ServerError />} />
            <Route path={`${APP_BASE_PATH}/not-allowed`} element={<NotAllowed />} />
            <Route path={`${APP_BASE_PATH}/*`} element={<NotFound />} />
        </Routes>
    );
};
