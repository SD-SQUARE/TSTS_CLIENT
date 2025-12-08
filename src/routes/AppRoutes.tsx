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
import GroupViewPage from "../features/Groups/GroupViewPage.tsx";
import UserViewPage from "../features/Users/Components/UsersViewPage.tsx";
import MainLayout from "../components/MainLayout";
import UniversitiesPage from "../features/universities/components/Universities";
import DomainsPage from "../features/domains/components/Domains";
import DepartmentsPage from "../features/departments/components/Departments";
import SpecializationsPage from "../features/specializations/components/Specializations";
import WorkHoursPage from "../features/work-hours/components/WorkHours";
import PermissionsPage from "../features/permissions/components/Permissions";

import {
    ClockCircleOutlined,
    BankOutlined,
    ApartmentOutlined,
    ProjectOutlined,
    ExperimentOutlined,
    SafetyOutlined,
    TeamOutlined,
    UserOutlined,
    ToolOutlined,
    IdcardOutlined
} from '@ant-design/icons';

export const AppRoutes = () => {

    const IdentitiesMenuItems = [
        {
            key: "/identities/groups",
            label: 'Groups',
            icon: <TeamOutlined />,
        },
        {
            key: "/identities/users",
            label: 'Users',
            icon: <UserOutlined />,
            children: [
                {
                    key: "/identities/users/admins",
                    label: 'Admins',
                    icon: <SafetyOutlined />,
                },
                {
                    key: "/identities/users/technicians",
                    label: 'Technicians',
                    icon: <ToolOutlined />,
                },
                {
                    key: "/identities/users/requesters",
                    label: 'Requesters',
                    icon: <IdcardOutlined />,
                },
            ],
        },
    ];
    const SettingsMenuItems = [
        { key: "/settings/work-hours", label: 'Work Hours', icon: <ClockCircleOutlined /> },
        { key: "/settings/universities", label: 'Universities', icon: <BankOutlined /> },
        { key: "/settings/domains", label: 'Domains', icon: <ProjectOutlined /> },
        { key: "/settings/departments", label: 'Departments', icon: <ApartmentOutlined /> },
        { key: "/settings/specializations", label: 'Specializations', icon: <ExperimentOutlined /> },
        { key: "/settings/permissions", label: 'Permissions', icon: <SafetyOutlined /> },
    ];
    return (
        <Routes>
            
            <Route index path={`${APP_BASE_PATH}/`} element={<Home/>} />

            <Route path={`${APP_BASE_PATH}/auth`}>
                <Route index element={<LoginPage />} />
                <Route path="login" element={<LoginPage />} />
                <Route path="forgot-password" element={<ForgotPasswordForm />} />
            </Route>

            {/* Super/admin routes */}
            {/* TODO: Add Protection */}
            <Route path={`${APP_BASE_PATH}/identities`} element={<MainLayout menuItems={IdentitiesMenuItems}  />}>
                <Route index path="groups" element={<GroupsList />} />
                <Route path="groups" element={<GroupsList />} />
                <Route path="groups/:id" element={<GroupViewPage />} />

                <Route path="users/technicians" element={<UserList role={'technicians'} />} />
                <Route path="users/requesters" element={<UserList role={'requesters'} />} />
                <Route path="users/admins" element={<UserList role={'admins'} />} />
                <Route path="users/:role/:id" element={<UserViewPage />} />

            </Route>
            {/* Routes that use MainLayout */}
            <Route path={`${APP_BASE_PATH}/settings`} element={<MainLayout menuItems={SettingsMenuItems}  />}>

                <Route path="work-hours" element={<WorkHoursPage />} />
                <Route path="universities" element={<UniversitiesPage />} />
                <Route path="domains" element={<DomainsPage />} />
                <Route path="departments" element={<DepartmentsPage />} />
                <Route path="specializations" element={<SpecializationsPage />} />
                <Route path="permissions" element={<PermissionsPage />} />

            </Route>
            
            {/* Complmentary Paths */}
            <Route path={`${APP_BASE_PATH}/server-error`} element={<ServerError />} />
            <Route path={`${APP_BASE_PATH}/not-allowed`} element={<NotAllowed />} />
            <Route path={`${APP_BASE_PATH}/*`} element={<NotFound />} />
        </Routes>
    );
};
