import { Routes, Route } from "react-router-dom";
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
import TicketList from "../features/tickets/Components/ticketsList.tsx";
import TicketForm from "../features/tickets/Components/ticketForm.tsx";
import TicketView from "../features/tickets/Components/ticketDetails.tsx";
import GuardedRoute from "./GuardedRoute.tsx";
import PageLayout from "../components/PageLayout.tsx";

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

            <Route index path={`${APP_BASE_PATH}/`} element={<Home />} />

            <Route path={`${APP_BASE_PATH}/auth`}>
                <Route index element={<LoginPage />} />
                <Route path="login" element={<LoginPage />} />
                <Route path="forgot-password" element={<ForgotPasswordForm />} />
            </Route>

                {/* Super/admin routes */}
                {/* TODO: Add Protection */}
            <Route path={`${APP_BASE_PATH}/identities`} element={
                <GuardedRoute roles={["superadmin", "admin"]}>
                    <MainLayout menuItems={IdentitiesMenuItems} />
                </GuardedRoute>
            }>
                <Route index path="groups" element={
                    <GuardedRoute roles={["superadmin", "admin"]}>
                        <GroupsList />
                    </GuardedRoute>
                } />
                
                <Route path="groups" element={
                    <GuardedRoute roles={["superadmin", "admin"]}>
                        <GroupsList />
                    </GuardedRoute>
                } />
                <Route path="groups/:id" element={
                    <GuardedRoute roles={["superadmin", "admin"]}>
                        <GroupViewPage />
                    </GuardedRoute>
                } />

                <Route path="users/technicians" element={
                    <GuardedRoute roles={["superadmin", "admin"]}>
                        <UserList role={'technicians'} />
                    </GuardedRoute>
                } />
                <Route path="users/requesters" element={
                    <GuardedRoute roles={["superadmin", "admin"]}>
                        <UserList role={'requesters'} />
                    </GuardedRoute>
                } />
                <Route path="users/admins" element={
                    <GuardedRoute roles={["superadmin", "admin"]}>
                        <UserList role={'admins'} />
                    </GuardedRoute>
                } />
                <Route path="users/:role/:id" element={
                    <GuardedRoute roles={["superadmin", "admin"]}>
                        <UserViewPage />
                    </GuardedRoute>
                } />

                </Route>
            {/* Routes that use MainLayout */}
            <Route path={`${APP_BASE_PATH}/settings`} element={
                <GuardedRoute roles={["superadmin", "admin"]}>
                    <MainLayout menuItems={SettingsMenuItems} />
                </GuardedRoute>
                }>

                <Route path="universities" element={
                    <GuardedRoute roles={["superadmin", "admin"]}>
                    <UniversitiesPage />
                    </GuardedRoute>
                } />
                
                <Route path="domains" element={
                    <GuardedRoute roles={["superadmin", "admin"]}>
                        <DomainsPage />
                    </GuardedRoute>
                } />
                <Route path="departments" element={
                    <GuardedRoute roles={["superadmin", "admin"]}>
                        <DepartmentsPage />
                    </GuardedRoute>
                } />
                <Route path="specializations" element={
                    <GuardedRoute roles={["superadmin", "admin"]}>
                        <SpecializationsPage />
                    </GuardedRoute>
                } />

                {/* TODO:connect pages later */}
                {/* <Route path="permissions" element={<PermissionsPage />} /> */}
                {/* <Route path="work-hours" element={<WorkHoursPage />} /> */}

            </Route>
            {/* Tickets routes */}
            <Route path={`${APP_BASE_PATH}/:role/tickets`}>
                <Route index element={<PageLayout ><TicketList /></PageLayout>} />
                <Route path="new-ticket" element={<PageLayout><TicketForm /></PageLayout>} />
                <Route path=":id/*" element={<PageLayout><TicketView /></PageLayout>} />
                <Route path=":id/edit" element={<PageLayout><TicketForm /></PageLayout>} />
            </Route>

            {/* Complmentary Paths */}
            <Route path={`${APP_BASE_PATH}/server-error`} element={<ServerError />} />
            <Route path={`${APP_BASE_PATH}/not-allowed`} element={<NotAllowed />} />
            <Route path={`${APP_BASE_PATH}/*`} element={<NotFound />} />
        </Routes>
    );
};
