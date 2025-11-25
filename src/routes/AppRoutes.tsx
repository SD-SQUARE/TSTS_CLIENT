import {  Routes, Route } from "react-router-dom";
import { LoginPage } from "../features/login/pages/LoginPage";
import { APP_BASE_PATH } from "../app/config.ts";
import NotFound from "../components/utils/NotFound.tsx";
import Home from "../components/Home.tsx";
import ServerError from './../components/utils/ServerError';
import NotAllowed from './../components/utils/NotAllowed';
import GroupsList from "../features/Groups/GroupsList.tsx";
import UserList from "../features/Users/Components/UsersList.tsx";
import ForgotPasswordForm from "../features/ForgotPasswordForm/ForgotPasswordForm.tsx";
import Identities from "../components/pages/identity/Identities.tsx";


export const AppRoutes = () => {

    return (
        <Routes>
            <Route path={`${APP_BASE_PATH}/auth`}>
                <Route index element={<LoginPage />} />
                <Route path="login" element={<LoginPage />} />
                <Route path="forgot-password" element={<ForgotPasswordForm />} />
            </Route>
            
            <Route index path={`${APP_BASE_PATH}/`} element={<Home/>} />
            <Route path={`${APP_BASE_PATH}/about`} element={<h1>About page</h1>} />

            {/* Super/admin routes */}
            {/* TODO: Add Protection */}
            <Route path={`${APP_BASE_PATH}/identities`} element={<Identities/>}>
                
                <Route  path="groups" element={<GroupsList />} />
                <Route path="users/technicians" element={<UserList role={'technicians'} />} />
                <Route path="users/requesters" element={<UserList role={'requesters'} />} />
                <Route path="users/admins" element={<UserList role={'admins'} />} />
            </Route>
            
            {/* Complmentary Paths */}
            <Route path={`${APP_BASE_PATH}/server-error`} element={<ServerError />} />
            <Route path={`${APP_BASE_PATH}/not-allowed`} element={<NotAllowed />} />
            <Route path={`${APP_BASE_PATH}/*`} element={<NotFound />} />
        </Routes>
    );
};
