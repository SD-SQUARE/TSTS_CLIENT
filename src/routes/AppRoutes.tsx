import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LoginPage } from "../features/login/pages/LoginPage";
import { PAGES_ROUTES_PATHS, PATH_NAMES } from "../app/route.helper.ts"
import GroupsList from "../features/Groups/GroupsList.tsx";
import UserList from "../features/Users/Components/UsersList.tsx";
import ForgotPasswordForm from "../features/ForgotPasswordForm/ForgotPasswordForm.tsx";
import GroupViewPage from "../features/Groups/GroupViewPage.tsx";
import UserViewPage from "../features/Users/Components/UsersViewPage.tsx";

export const AppRoutes = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route index path={PAGES_ROUTES_PATHS[PATH_NAMES.LOGIN]} element={<LoginPage />} />
                {/* forget password, etc */}
                <Route path="/forgot-password" element={<ForgotPasswordForm />} />
                <Route path="/groups" element={<GroupsList />} />
                <Route path="/groups/:id" element={<GroupViewPage />} />
                <Route path="/users/technicians" element={<UserList role={'technicians'} />} />
                <Route path="/users/requesters" element={<UserList role={'requesters'} />} />
                <Route path="/users/admins" element={<UserList role={'admins'} />} />
                <Route path="/users/:role/:id" element={<UserViewPage />} />
            </Routes>
        </BrowserRouter>
    );
};
