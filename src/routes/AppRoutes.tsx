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
import KnowledgeBasePage from "../features/knowledge-base/components/KnowledgeBasePage.tsx";


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
    IdcardOutlined,
    IssuesCloseOutlined
} from '@ant-design/icons';
import TicketList from "../features/tickets/Components/ticketsList.tsx";
import TicketForm from "../features/tickets/Components/ticketForm.tsx";
import TicketView from "../features/tickets/Components/ticketDetails.tsx";
import GuardedRoute from "./GuardedRoute.tsx";
import PageLayout from "../components/PageLayout.tsx";
import Profile from './../features/profile/Profile.page';
import { useTranslation } from "react-i18next";
import ProblemsPage from "../features/Problems/components/ProblemsPage.tsx";
import TrustedDevicesPage from "../features/trusted-devices/pages/TrustedDevicesPage.tsx";
import AuditLogList from "../features/AuditLogs/Components/AuditLogsList.tsx";
import AuditLogView from "../features/AuditLogs/Components/AuditLogView.tsx";
import DashboardPage from "../features/Reports/Components/DashboardPage.tsx";
import ReportViewPage from "../features/Reports/Components/ReportPage.tsx";

export const AppRoutes = () => {
    const { t } = useTranslation();

    const IdentitiesMenuItems = [
        {
            key: "/identities/groups",
            label: t('Groups'),
            icon: <TeamOutlined />,
        },
        {
            key: "/identities/users",
            label: t('Users'),
            icon: <UserOutlined />,
            children: [
                {
                    key: "/identities/users/admins",
                    label: t('Admins'),
                    icon: <SafetyOutlined />,
                },
                {
                    key: "/identities/users/technicians",
                    label: t('Technicians'),
                    icon: <ToolOutlined />,
                },
                {
                    key: "/identities/users/requesters",
                    label: t('Requesters'),
                    icon: <IdcardOutlined />,
                },
            ],
        },
    ];
    const SettingsMenuItems = [
        // { key: "/settings/work-hours", label: t('Work Hours'), icon: <ClockCircleOutlined /> },
        { key: "/settings/universities", label: t('Universities'), icon: <BankOutlined /> },
        { key: "/settings/domains", label: t('Domains'), icon: <ProjectOutlined /> },
        { key: "/settings/departments", label: t('Departments'), icon: <ApartmentOutlined /> },
        { key: "/settings/specializations", label: t('Specializations'), icon: <ExperimentOutlined /> },
        { key: "/settings/problems", label: t('problems'), icon: <IssuesCloseOutlined /> },

        { key: "/settings/trusted-devices", label: t("trusted_devices.Trusted Devices"), icon: <SafetyOutlined /> },
        // { key: "/settings/permissions", label: t('Permissions'), icon: <SafetyOutlined /> },
        { key: "/settings/logs", label: t('Audit Logs'), icon: <ClockCircleOutlined /> },
    ];
    return (
        <Routes>

            <Route index path={`${APP_BASE_PATH}/`} element={<Home />} />
            {/* TODO: Add protection  */}

            <Route index path={`${APP_BASE_PATH}/profile`} element={

                <GuardedRoute roles={["*"]}>
                    <PageLayout> <Profile /></PageLayout>
                </GuardedRoute> 
                } />
            

            <Route path={`${APP_BASE_PATH}/auth`}>
                <Route index element={<LoginPage />} />
                <Route path="login" element={<LoginPage />} />
                <Route path="forgot-password" element={<ForgotPasswordForm />} />
                <Route path="first-time/login" element={<ForgotPasswordForm />} />
            </Route>

                {/* Super/admin routes */}
            <Route path={`${APP_BASE_PATH}/identities`} element={
                <GuardedRoute roles={["superadmin", "admin"]}>
                    <MainLayout menuItems={IdentitiesMenuItems} />
                </GuardedRoute>
            }>
                <Route index  element={
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
                <Route path="problems" element={
                    <GuardedRoute roles={["superadmin", "admin"]}>
                        <ProblemsPage />
                    </GuardedRoute>
                } />
                
                <Route path="trusted-devices" element={
                    <GuardedRoute roles={["superadmin", "admin"]}>
                        <TrustedDevicesPage />
                    </GuardedRoute>
                } />
                {/* TODO:connect pages later */}
                {/* <Route path="permissions" element={<PermissionsPage />} /> */}
                {/* <Route path="work-hours" element={<WorkHoursPage />} /> */}
                <Route path="logs" element={
                    <GuardedRoute roles={["superadmin", "admin"]}>
                        <AuditLogList />
                    </GuardedRoute>
                } />
                <Route path="logs/:id" element={
                    <GuardedRoute roles={["superadmin", "admin"]}>
                        <AuditLogView />
                    </GuardedRoute>
                } />

            </Route>
            {/* Tickets routes */}
            <Route path={`${APP_BASE_PATH}/:role/tickets`}>
                <Route index element={<PageLayout ><TicketList /></PageLayout>} />
                <Route path="new-ticket" element={<PageLayout><TicketForm /></PageLayout>} />
                <Route path=":id/*" element={<PageLayout><TicketView /></PageLayout>} />
                <Route path=":id/edit" element={<PageLayout><TicketForm /></PageLayout>} />
            </Route>

            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/reports/:id" element={<ReportViewPage />} />

            <Route path="knowledge-base" element={<PageLayout><KnowledgeBasePage /> </PageLayout>} />

            {/* Complmentary Paths */}
            <Route path={`${APP_BASE_PATH}/server-error`} element={<PageLayout><ServerError /> </PageLayout>} />
            <Route path={`${APP_BASE_PATH}/not-allowed`} element={<PageLayout><NotAllowed /> </PageLayout>} />
            <Route path={`${APP_BASE_PATH}/*`} element={<PageLayout><NotFound /> </PageLayout>} />
        </Routes>
    );
};
